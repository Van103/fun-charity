import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

interface CharityChannel {
  id: string;
  name: string;
  description: string | null;
  cover_image_url: string | null;
  category: string | null;
  member_count: number;
  is_official: boolean;
  is_active: boolean;
  created_by: string | null;
  created_at: string;
  is_member?: boolean;
}

export function useCharityChannels() {
  const [channels, setChannels] = useState<CharityChannel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchChannels = useCallback(async () => {
    try {
      setIsLoading(true);
      const { data: { user } } = await supabase.auth.getUser();

      // Fetch active channels
      const { data: channelsData, error: channelsError } = await supabase
        .from("charity_channels")
        .select("*")
        .eq("is_active", true)
        .order("is_official", { ascending: false })
        .order("member_count", { ascending: false });

      if (channelsError) throw channelsError;

      // If user is logged in, check which channels they're a member of
      let memberChannelIds: Set<string> = new Set();
      if (user) {
        const { data: memberships } = await supabase
          .from("charity_channel_members")
          .select("channel_id")
          .eq("user_id", user.id);

        memberChannelIds = new Set(memberships?.map(m => m.channel_id) || []);
      }

      const enrichedChannels = channelsData?.map(channel => ({
        ...channel,
        is_member: memberChannelIds.has(channel.id),
      })) || [];

      setChannels(enrichedChannels);
    } catch (err) {
      console.error("Error fetching channels:", err);
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchChannels();
  }, [fetchChannels]);

  const joinChannel = async (channelId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    const { error } = await supabase
      .from("charity_channel_members")
      .insert({
        channel_id: channelId,
        user_id: user.id,
        role: "member"
      });

    if (error) throw error;
    await fetchChannels();
  };

  const leaveChannel = async (channelId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    const { error } = await supabase
      .from("charity_channel_members")
      .delete()
      .eq("channel_id", channelId)
      .eq("user_id", user.id);

    if (error) throw error;
    await fetchChannels();
  };

  return {
    channels,
    isLoading,
    error,
    refetchChannels: fetchChannels,
    joinChannel,
    leaveChannel,
  };
}
