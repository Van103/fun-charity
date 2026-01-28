import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

interface Story {
  id: string;
  user_id: string;
  media_url: string;
  media_type: string;
  caption: string | null;
  background_color: string | null;
  text_overlay: string | null;
  text_position: any;
  duration: number;
  view_count: number;
  expires_at: string;
  created_at: string;
  profile?: {
    full_name: string | null;
    avatar_url: string | null;
  };
  is_viewed?: boolean;
}

interface UserWithStories {
  user_id: string;
  full_name: string | null;
  avatar_url: string | null;
  stories: Story[];
  has_unviewed: boolean;
}

export function useStories() {
  const [stories, setStories] = useState<Story[]>([]);
  const [usersWithStories, setUsersWithStories] = useState<UserWithStories[]>([]);
  const [myStories, setMyStories] = useState<Story[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchStories = useCallback(async () => {
    try {
      setIsLoading(true);
      const { data: { user } } = await supabase.auth.getUser();

      // Fetch all non-expired stories
      const { data: storiesData, error: storiesError } = await supabase
        .from("chat_stories")
        .select("*")
        .gt("expires_at", new Date().toISOString())
        .order("created_at", { ascending: false });

      if (storiesError) throw storiesError;

      if (!storiesData || storiesData.length === 0) {
        setStories([]);
        setUsersWithStories([]);
        setMyStories([]);
        setIsLoading(false);
        return;
      }

      // Fetch profiles for story owners
      const userIds = [...new Set(storiesData.map(s => s.user_id))];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, full_name, avatar_url")
        .in("user_id", userIds);

      // Fetch views for current user
      let viewedStoryIds: Set<string> = new Set();
      if (user) {
        const { data: views } = await supabase
          .from("chat_story_views")
          .select("story_id")
          .eq("viewer_id", user.id);

        viewedStoryIds = new Set(views?.map(v => v.story_id) || []);
      }

      // Map profiles and views to stories
      const profileMap = new Map(profiles?.map(p => [p.user_id, p]));
      
      const enrichedStories = storiesData.map(story => ({
        ...story,
        profile: profileMap.get(story.user_id),
        is_viewed: viewedStoryIds.has(story.id),
      }));

      // Group stories by user
      const userStoriesMap = new Map<string, Story[]>();
      enrichedStories.forEach(story => {
        const existing = userStoriesMap.get(story.user_id) || [];
        userStoriesMap.set(story.user_id, [...existing, story]);
      });

      const usersWithStoriesData: UserWithStories[] = [];
      userStoriesMap.forEach((userStories, userId) => {
        const profile = profileMap.get(userId);
        usersWithStoriesData.push({
          user_id: userId,
          full_name: profile?.full_name || null,
          avatar_url: profile?.avatar_url || null,
          stories: userStories,
          has_unviewed: userStories.some(s => !s.is_viewed),
        });
      });

      // Sort: current user first, then unviewed, then by latest story
      usersWithStoriesData.sort((a, b) => {
        if (user && a.user_id === user.id) return -1;
        if (user && b.user_id === user.id) return 1;
        if (a.has_unviewed && !b.has_unviewed) return -1;
        if (!a.has_unviewed && b.has_unviewed) return 1;
        return new Date(b.stories[0].created_at).getTime() - new Date(a.stories[0].created_at).getTime();
      });

      setStories(enrichedStories);
      setUsersWithStories(usersWithStoriesData);
      
      // Set my stories
      if (user) {
        setMyStories(enrichedStories.filter(s => s.user_id === user.id));
      }
    } catch (err) {
      console.error("Error fetching stories:", err);
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStories();

    // Subscribe to realtime changes
    const channel = supabase
      .channel("stories-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "chat_stories" },
        () => {
          fetchStories();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchStories]);

  const createStory = async (
    mediaUrl: string, 
    mediaType: 'image' | 'video', 
    caption?: string,
    duration: number = 5
  ) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    // Story expires in 24 hours
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    const { error } = await supabase.from("chat_stories").insert({
      user_id: user.id,
      media_url: mediaUrl,
      media_type: mediaType,
      caption: caption || null,
      duration,
      expires_at: expiresAt.toISOString(),
    });

    if (error) throw error;
    await fetchStories();
  };

  const viewStory = async (storyId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase
      .from("chat_story_views")
      .upsert({
        story_id: storyId,
        viewer_id: user.id,
      }, { onConflict: 'story_id,viewer_id' });
  };

  const deleteStory = async (storyId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    const { error } = await supabase
      .from("chat_stories")
      .delete()
      .eq("id", storyId)
      .eq("user_id", user.id);

    if (error) throw error;
    await fetchStories();
  };

  return {
    stories,
    usersWithStories,
    myStories,
    isLoading,
    error,
    refetchStories: fetchStories,
    createStory,
    viewStory,
    deleteStory,
  };
}
