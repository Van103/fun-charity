import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

interface Deed {
  id: string;
  user_id: string;
  title: string;
  content: string | null;
  image_url: string | null;
  video_url: string | null;
  category: string | null;
  location: string | null;
  light_points: number;
  is_verified: boolean;
  visibility: string;
  created_at: string;
  profile?: {
    full_name: string | null;
    avatar_url: string | null;
  };
  reactions_count?: number;
  comments_count?: number;
  user_reaction?: string | null;
}

export function useDeeds() {
  const [deeds, setDeeds] = useState<Deed[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchDeeds = useCallback(async () => {
    try {
      setIsLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      // Fetch public deeds
      const { data: deedsData, error: deedsError } = await supabase
        .from("deeds")
        .select("*")
        .eq("visibility", "public")
        .order("created_at", { ascending: false })
        .limit(50);

      if (deedsError) throw deedsError;

      // Fetch profiles for deeds
      const userIds = [...new Set(deedsData?.map(d => d.user_id) || [])];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, full_name, avatar_url")
        .in("user_id", userIds);

      // Fetch reaction counts
      const deedIds = deedsData?.map(d => d.id) || [];
      const { data: reactionsData } = await supabase
        .from("deed_reactions")
        .select("deed_id, reaction_type, user_id")
        .in("deed_id", deedIds);

      // Fetch comment counts
      const { data: commentsData } = await supabase
        .from("deed_comments")
        .select("deed_id")
        .in("deed_id", deedIds);

      // Map profiles, reactions, and comments to deeds
      const profileMap = new Map(profiles?.map(p => [p.user_id, p]));
      
      const reactionCounts = new Map<string, number>();
      const userReactions = new Map<string, string>();
      
      reactionsData?.forEach(r => {
        reactionCounts.set(r.deed_id, (reactionCounts.get(r.deed_id) || 0) + 1);
        if (user && r.user_id === user.id) {
          userReactions.set(r.deed_id, r.reaction_type);
        }
      });

      const commentCounts = new Map<string, number>();
      commentsData?.forEach(c => {
        commentCounts.set(c.deed_id, (commentCounts.get(c.deed_id) || 0) + 1);
      });

      const enrichedDeeds = deedsData?.map(deed => ({
        ...deed,
        profile: profileMap.get(deed.user_id),
        reactions_count: reactionCounts.get(deed.id) || 0,
        comments_count: commentCounts.get(deed.id) || 0,
        user_reaction: userReactions.get(deed.id) || null,
      })) || [];

      setDeeds(enrichedDeeds);
    } catch (err) {
      console.error("Error fetching deeds:", err);
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDeeds();

    // Subscribe to realtime changes
    const channel = supabase
      .channel("deeds-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "deeds" },
        () => {
          fetchDeeds();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchDeeds]);

  const createDeed = async (deed: { 
    title: string; 
    content?: string; 
    category?: string;
    image_url?: string;
    video_url?: string;
    location?: string;
    visibility?: string;
    light_points?: number;
  }) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    const { error } = await supabase.from("deeds").insert({
      title: deed.title,
      content: deed.content || null,
      category: deed.category || 'other',
      image_url: deed.image_url || null,
      video_url: deed.video_url || null,
      location: deed.location || null,
      visibility: deed.visibility || 'public',
      light_points: deed.light_points || 10,
      user_id: user.id,
    });

    if (error) throw error;
    await fetchDeeds();
  };

  return {
    deeds,
    isLoading,
    error,
    refetchDeeds: fetchDeeds,
    createDeed,
  };
}
