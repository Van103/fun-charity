import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface UnifiedNotificationState {
  unreadCount: number;
  friendRequestCount: number;
  reactionCount: number;
  commentCount: number;
  donationCount: number;
}

export function useUnifiedNotifications(userId: string | null) {
  const [state, setState] = useState<UnifiedNotificationState>({
    unreadCount: 0,
    friendRequestCount: 0,
    reactionCount: 0,
    commentCount: 0,
    donationCount: 0,
  });
  const { toast } = useToast();

  const fetchInitialCounts = useCallback(async () => {
    if (!userId) return;

    try {
      // Fetch pending friend requests
      const { count: friendCount } = await supabase
        .from("friendships")
        .select("*", { count: "exact", head: true })
        .eq("friend_id", userId)
        .eq("status", "pending");

      const fc = friendCount || 0;
      setState(prev => ({
        ...prev,
        friendRequestCount: fc,
        unreadCount: fc,
      }));
    } catch (e) {
      console.error("Error fetching notification counts:", e);
    }
  }, [userId]);

  useEffect(() => {
    if (!userId) {
      setState({ unreadCount: 0, friendRequestCount: 0, reactionCount: 0, commentCount: 0, donationCount: 0 });
      return;
    }

    fetchInitialCounts();

    // Single channel for all notification subscriptions
    const channel = supabase
      .channel(`unified-notifs-${userId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "friendships", filter: `friend_id=eq.${userId}` },
        (payload) => {
          if (payload.new && (payload.new as any).status === "pending") {
            setState(prev => ({
              ...prev,
              friendRequestCount: prev.friendRequestCount + 1,
              unreadCount: prev.unreadCount + 1,
            }));
            toast({ title: "👋 Lời mời kết bạn mới", description: "Bạn có lời mời kết bạn mới!" });
            try {
              const audio = new Audio("/sounds/notification.mp3");
              audio.volume = 0.3;
              audio.play().catch(() => {});
            } catch {}
          }
        }
      )
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "feed_reactions" },
        (payload) => {
          const reaction = payload.new as any;
          if (reaction.user_id !== userId) {
            setState(prev => ({
              ...prev,
              reactionCount: prev.reactionCount + 1,
              unreadCount: prev.unreadCount + 1,
            }));
          }
        }
      )
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "feed_comments" },
        (payload) => {
          const comment = payload.new as any;
          if (comment.user_id !== userId) {
            setState(prev => ({
              ...prev,
              commentCount: prev.commentCount + 1,
              unreadCount: prev.unreadCount + 1,
            }));
          }
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "donations" },
        (payload) => {
          const donation = payload.new as any;
          if (donation.status === "completed" && donation.donor_id !== userId) {
            setState(prev => ({
              ...prev,
              donationCount: prev.donationCount + 1,
              unreadCount: prev.unreadCount + 1,
            }));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, fetchInitialCounts, toast]);

  const clearCount = useCallback(() => {
    setState(prev => ({ ...prev, unreadCount: 0 }));
  }, []);

  return {
    ...state,
    clearCount,
  };
}
