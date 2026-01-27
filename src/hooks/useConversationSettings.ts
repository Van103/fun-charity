import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface ConversationSettings {
  id: string;
  conversation_id: string;
  user_id: string;
  nickname: string | null;
  theme_color: string;
  notifications_enabled: boolean;
  created_at: string;
  updated_at: string;
}

const DEFAULT_SETTINGS: Partial<ConversationSettings> = {
  nickname: null,
  theme_color: "#8B5CF6",
  notifications_enabled: true,
};

const THEME_COLORS = [
  { name: "Purple", value: "#8B5CF6" },
  { name: "Pink", value: "#EC4899" },
  { name: "Blue", value: "#3B82F6" },
  { name: "Cyan", value: "#06B6D4" },
  { name: "Green", value: "#10B981" },
  { name: "Yellow", value: "#F59E0B" },
  { name: "Orange", value: "#F97316" },
  { name: "Red", value: "#EF4444" },
  { name: "Indigo", value: "#6366F1" },
  { name: "Teal", value: "#14B8A6" },
  { name: "Rose", value: "#F43F5E" },
  { name: "Amber", value: "#FBBF24" },
];

export function useConversationSettings(
  conversationId: string | null,
  userId: string | null
) {
  const [settings, setSettings] = useState<ConversationSettings | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  // Load settings
  const loadSettings = useCallback(async () => {
    if (!conversationId || !userId) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("conversation_settings")
        .select("*")
        .eq("conversation_id", conversationId)
        .eq("user_id", userId)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setSettings(data as ConversationSettings);
      } else {
        // Return default settings if none exist
        setSettings({
          id: "",
          conversation_id: conversationId,
          user_id: userId,
          nickname: DEFAULT_SETTINGS.nickname!,
          theme_color: DEFAULT_SETTINGS.theme_color!,
          notifications_enabled: DEFAULT_SETTINGS.notifications_enabled!,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
      }
    } catch (error: any) {
      console.error("Error loading conversation settings:", error);
    } finally {
      setIsLoading(false);
    }
  }, [conversationId, userId]);

  // Update a setting
  const updateSetting = useCallback(
    async <K extends keyof ConversationSettings>(
      key: K,
      value: ConversationSettings[K]
    ) => {
      if (!conversationId || !userId) return;

      setIsSaving(true);
      try {
        const updateData = {
          conversation_id: conversationId,
          user_id: userId,
          [key]: value,
          updated_at: new Date().toISOString(),
        };

        const { data, error } = await supabase
          .from("conversation_settings")
          .upsert(updateData, {
            onConflict: "conversation_id,user_id",
          })
          .select()
          .single();

        if (error) throw error;

        setSettings((prev) =>
          prev ? { ...prev, [key]: value } : (data as ConversationSettings)
        );

        return true;
      } catch (error: any) {
        console.error("Error updating setting:", error);
        toast({
          title: "Lỗi",
          description: "Không thể cập nhật cài đặt",
          variant: "destructive",
        });
        return false;
      } finally {
        setIsSaving(false);
      }
    },
    [conversationId, userId, toast]
  );

  // Toggle notifications
  const toggleNotifications = useCallback(async () => {
    const newValue = !settings?.notifications_enabled;
    const success = await updateSetting("notifications_enabled", newValue);
    if (success) {
      toast({
        title: newValue ? "Đã bật thông báo" : "Đã tắt thông báo",
        description: newValue
          ? "Bạn sẽ nhận thông báo từ cuộc trò chuyện này"
          : "Bạn sẽ không nhận thông báo từ cuộc trò chuyện này",
      });
    }
    return success;
  }, [settings?.notifications_enabled, updateSetting, toast]);

  // Update theme color
  const updateThemeColor = useCallback(
    async (color: string) => {
      const success = await updateSetting("theme_color", color);
      if (success) {
        toast({
          title: "Đã thay đổi màu sắc",
          description: "Màu chủ đề của cuộc trò chuyện đã được cập nhật",
        });
      }
      return success;
    },
    [updateSetting, toast]
  );

  // Update nickname
  const updateNickname = useCallback(
    async (nickname: string | null) => {
      const success = await updateSetting("nickname", nickname);
      if (success) {
        toast({
          title: nickname ? "Đã đặt biệt danh" : "Đã xóa biệt danh",
          description: nickname
            ? `Biệt danh mới: ${nickname}`
            : "Biệt danh đã được xóa",
        });
      }
      return success;
    },
    [updateSetting, toast]
  );

  // Load settings when conversation changes
  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  // Subscribe to realtime updates
  useEffect(() => {
    if (!conversationId || !userId) return;

    const channel = supabase
      .channel(`conversation-settings-${conversationId}-${userId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "conversation_settings",
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          if (
            payload.new &&
            (payload.new as ConversationSettings).user_id === userId
          ) {
            setSettings(payload.new as ConversationSettings);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId, userId]);

  return {
    settings,
    isLoading,
    isSaving,
    toggleNotifications,
    updateThemeColor,
    updateNickname,
    themeColors: THEME_COLORS,
    reload: loadSettings,
  };
}

// Hook to get nickname for display
export function useConversationNickname(
  conversationId: string | null,
  userId: string | null,
  targetUserId: string | null
) {
  const [nickname, setNickname] = useState<string | null>(null);

  useEffect(() => {
    if (!conversationId || !userId || !targetUserId) {
      setNickname(null);
      return;
    }

    const loadNickname = async () => {
      // Get the current user's settings for this conversation
      const { data } = await supabase
        .from("conversation_settings")
        .select("nickname")
        .eq("conversation_id", conversationId)
        .eq("user_id", userId)
        .maybeSingle();

      setNickname(data?.nickname || null);
    };

    loadNickname();

    // Subscribe to changes
    const channel = supabase
      .channel(`nickname-${conversationId}-${userId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "conversation_settings",
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          if (
            payload.new &&
            (payload.new as ConversationSettings).user_id === userId
          ) {
            setNickname((payload.new as ConversationSettings).nickname);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId, userId, targetUserId]);

  return nickname;
}
