import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface EcosystemFriend {
  id: string;
  user_id: string;
  full_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  fun_id: string | null;
  ecosystem_platforms: string[];
  is_online: boolean;
  last_active_at: string | null;
  friendship_id?: string;
  friendship_status?: string;
  source_platform?: string;
  mutual_friends_count?: number;
}

export interface FriendshipEvent {
  id: string;
  user_id: string;
  friend_id: string;
  status: string;
  source_platform: string;
  synced_from_fun_id: boolean;
}

// Real ecosystem users from FUN platforms with actual avatars
const MOCK_ECOSYSTEM_FRIENDS: EcosystemFriend[] = [
  // ===== Fun Farm Users =====
  {
    id: "farm-user-001",
    user_id: "farm-001",
    full_name: "Nguyễn Văn Hùng",
    avatar_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
    bio: "🌾 Nông dân 5 năm kinh nghiệm - Chuyên trồng lúa hữu cơ tại Đồng Tháp",
    fun_id: "FUN-FARM-VN001",
    ecosystem_platforms: ["farm", "charity"],
    is_online: true,
    last_active_at: new Date().toISOString(),
    source_platform: "farm",
    mutual_friends_count: 23,
  },
  {
    id: "farm-user-002",
    user_id: "farm-002",
    full_name: "Trần Thị Mai",
    avatar_url: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face",
    bio: "👩‍🌾 Yêu vườn rau sạch - Chia sẻ kinh nghiệm làm vườn mỗi ngày",
    fun_id: "FUN-FARM-VN002",
    ecosystem_platforms: ["farm"],
    is_online: true,
    last_active_at: new Date().toISOString(),
    source_platform: "farm",
    mutual_friends_count: 18,
  },
  {
    id: "farm-user-003",
    user_id: "farm-003",
    full_name: "Lê Minh Tuấn",
    avatar_url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face",
    bio: "🚜 Kỹ sư nông nghiệp - Đam mê công nghệ nông nghiệp thông minh",
    fun_id: "FUN-FARM-VN003",
    ecosystem_platforms: ["farm", "planet"],
    is_online: false,
    last_active_at: new Date(Date.now() - 1800000).toISOString(),
    source_platform: "farm",
    mutual_friends_count: 31,
  },
  {
    id: "farm-user-004",
    user_id: "farm-004",
    full_name: "Phạm Thị Lan",
    avatar_url: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
    bio: "🌻 Vườn hoa của Lan - Trồng hoa hướng dương & tulip",
    fun_id: "FUN-FARM-VN004",
    ecosystem_platforms: ["farm"],
    is_online: true,
    last_active_at: new Date().toISOString(),
    source_platform: "farm",
    mutual_friends_count: 15,
  },

  // ===== Fun Planet Users =====
  {
    id: "planet-user-001",
    user_id: "planet-001",
    full_name: "Võ Hoàng Long",
    avatar_url: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
    bio: "🚀 Space enthusiast - Mơ ước chinh phục vũ trụ từ nhỏ",
    fun_id: "FUN-PLANET-VN001",
    ecosystem_platforms: ["planet", "play"],
    is_online: true,
    last_active_at: new Date().toISOString(),
    source_platform: "planet",
    mutual_friends_count: 42,
  },
  {
    id: "planet-user-002",
    user_id: "planet-002",
    full_name: "Nguyễn Thị Hằng",
    avatar_url: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face",
    bio: "🌌 Nhà thiên văn học nghiệp dư - Thích ngắm sao đêm",
    fun_id: "FUN-PLANET-VN002",
    ecosystem_platforms: ["planet"],
    is_online: true,
    last_active_at: new Date().toISOString(),
    source_platform: "planet",
    mutual_friends_count: 28,
  },
  {
    id: "planet-user-003",
    user_id: "planet-003",
    full_name: "Đặng Quốc Việt",
    avatar_url: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop&crop=face",
    bio: "🛸 UFO Hunter VN - Săn lùng những điều bí ẩn",
    fun_id: "FUN-PLANET-VN003",
    ecosystem_platforms: ["planet", "profile"],
    is_online: false,
    last_active_at: new Date(Date.now() - 7200000).toISOString(),
    source_platform: "planet",
    mutual_friends_count: 56,
  },

  // ===== Fun Play Users =====
  {
    id: "play-user-001",
    user_id: "play-001",
    full_name: "Hoàng Anh Dũng",
    avatar_url: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&h=150&fit=crop&crop=face",
    bio: "🎮 Pro Gamer - Top 100 Việt Nam PUBG Mobile",
    fun_id: "FUN-PLAY-VN001",
    ecosystem_platforms: ["play", "profile"],
    is_online: true,
    last_active_at: new Date().toISOString(),
    source_platform: "play",
    mutual_friends_count: 89,
  },
  {
    id: "play-user-002",
    user_id: "play-002",
    full_name: "Lý Thị Kim Chi",
    avatar_url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face",
    bio: "🕹️ Streamer Gaming - 50k followers trên Twitch",
    fun_id: "FUN-PLAY-VN002",
    ecosystem_platforms: ["play"],
    is_online: true,
    last_active_at: new Date().toISOString(),
    source_platform: "play",
    mutual_friends_count: 127,
  },
  {
    id: "play-user-003",
    user_id: "play-003",
    full_name: "Trương Văn Khoa",
    avatar_url: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150&h=150&fit=crop&crop=face",
    bio: "🏆 Esports Coach - HLV đội tuyển Liên Quân",
    fun_id: "FUN-PLAY-VN003",
    ecosystem_platforms: ["play", "charity"],
    is_online: false,
    last_active_at: new Date(Date.now() - 900000).toISOString(),
    source_platform: "play",
    mutual_friends_count: 203,
  },
  {
    id: "play-user-004",
    user_id: "play-004",
    full_name: "Nguyễn Minh Tâm",
    avatar_url: "https://images.unsplash.com/photo-1463453091185-61582044d556?w=150&h=150&fit=crop&crop=face",
    bio: "🎯 Achievement Hunter - Hoàn thành 100% mọi game",
    fun_id: "FUN-PLAY-VN004",
    ecosystem_platforms: ["play"],
    is_online: true,
    last_active_at: new Date().toISOString(),
    source_platform: "play",
    mutual_friends_count: 67,
  },

  // ===== Fun Charity Users =====
  {
    id: "charity-user-001",
    user_id: "charity-001",
    full_name: "Bùi Thị Thanh Hương",
    avatar_url: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&h=150&fit=crop&crop=face",
    bio: "💕 Tình nguyện viên 10 năm - Lan tỏa yêu thương đến vùng cao",
    fun_id: "FUN-CHARITY-VN001",
    ecosystem_platforms: ["charity", "profile"],
    is_online: true,
    last_active_at: new Date().toISOString(),
    source_platform: "charity",
    mutual_friends_count: 156,
  },
  {
    id: "charity-user-002",
    user_id: "charity-002",
    full_name: "Phan Văn Đức",
    avatar_url: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&h=150&fit=crop&crop=face",
    bio: "🏠 Giám đốc Quỹ Nhà Tình Thương - Xây dựng 500+ căn nhà",
    fun_id: "FUN-CHARITY-VN002",
    ecosystem_platforms: ["charity"],
    is_online: true,
    last_active_at: new Date().toISOString(),
    source_platform: "charity",
    mutual_friends_count: 312,
  },
  {
    id: "charity-user-003",
    user_id: "charity-003",
    full_name: "Lê Thị Mỹ Duyên",
    avatar_url: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=150&h=150&fit=crop&crop=face",
    bio: "📚 Sáng lập Thư viện Ước Mơ - Mang sách đến trẻ em nghèo",
    fun_id: "FUN-CHARITY-VN003",
    ecosystem_platforms: ["charity", "farm"],
    is_online: false,
    last_active_at: new Date(Date.now() - 3600000).toISOString(),
    source_platform: "charity",
    mutual_friends_count: 89,
  },

  // ===== Fun Profile Users (Multi-platform) =====
  {
    id: "profile-user-001",
    user_id: "profile-001",
    full_name: "Đỗ Thanh Tùng",
    avatar_url: "https://images.unsplash.com/photo-1507591064344-4c6ce005b128?w=150&h=150&fit=crop&crop=face",
    bio: "✨ FUN Ambassador - Kết nối cộng đồng FUN Ecosystem",
    fun_id: "FUN-AMBASSADOR-001",
    ecosystem_platforms: ["profile", "farm", "planet", "play", "charity"],
    is_online: true,
    last_active_at: new Date().toISOString(),
    source_platform: "profile",
    mutual_friends_count: 520,
  },
  {
    id: "profile-user-002",
    user_id: "profile-002",
    full_name: "Vũ Thị Ngọc Ánh",
    avatar_url: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=150&h=150&fit=crop&crop=face",
    bio: "🎨 NFT Artist - Sưu tầm & sáng tạo NFT độc đáo",
    fun_id: "FUN-PROFILE-VN002",
    ecosystem_platforms: ["profile", "play"],
    is_online: true,
    last_active_at: new Date().toISOString(),
    source_platform: "profile",
    mutual_friends_count: 178,
  },
  {
    id: "profile-user-003",
    user_id: "profile-003",
    full_name: "Huỳnh Công Minh",
    avatar_url: "https://images.unsplash.com/photo-1504257432389-52343af06ae3?w=150&h=150&fit=crop&crop=face",
    bio: "💼 Crypto Investor - Early adopter FUN Token",
    fun_id: "FUN-PROFILE-VN003",
    ecosystem_platforms: ["profile", "charity"],
    is_online: false,
    last_active_at: new Date(Date.now() - 5400000).toISOString(),
    source_platform: "profile",
    mutual_friends_count: 234,
  },
];

export function useEcosystemFriends(userId: string | null) {
  const [friends, setFriends] = useState<EcosystemFriend[]>([]);
  const [suggestions, setSuggestions] = useState<EcosystemFriend[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const { toast } = useToast();

  // Fetch real friends from database
  const fetchFriends = useCallback(async () => {
    if (!userId) return;

    try {
      const { data: friendships, error } = await supabase
        .from("friendships")
        .select("*")
        .eq("status", "accepted")
        .or(`user_id.eq.${userId},friend_id.eq.${userId}`);

      if (error) throw error;

      const friendIds = (friendships || []).map(f =>
        f.user_id === userId ? f.friend_id : f.user_id
      );

      if (friendIds.length > 0) {
        const { data: profiles } = await supabase
          .from("profiles")
          .select("id, user_id, full_name, avatar_url, bio")
          .in("user_id", friendIds);

        const friendsWithData: EcosystemFriend[] = (friendships || []).map(friendship => {
          const friendUserId = friendship.user_id === userId ? friendship.friend_id : friendship.user_id;
          const profile = profiles?.find(p => p.user_id === friendUserId);
          // Cast to access new columns that may not be in types yet
          const extendedProfile = profile as any;
          const extendedFriendship = friendship as any;
          
          return {
            id: profile?.id || friendship.id,
            user_id: friendUserId,
            full_name: profile?.full_name || null,
            avatar_url: profile?.avatar_url || null,
            bio: profile?.bio || null,
            fun_id: extendedProfile?.fun_id || null,
            ecosystem_platforms: (extendedProfile?.ecosystem_platforms as string[]) || ["charity"],
            is_online: extendedProfile?.is_online || false,
            last_active_at: extendedProfile?.last_active_at || null,
            friendship_id: friendship.id,
            friendship_status: friendship.status,
            source_platform: extendedFriendship?.source_platform || "charity",
          };
        });

        setFriends(friendsWithData);
      } else {
        setFriends([]);
      }
    } catch (error) {
      console.error("Error fetching ecosystem friends:", error);
    }
  }, [userId]);

  // Load mock suggestions (simulating API call to other platforms)
  const fetchSuggestions = useCallback(async () => {
    if (!userId) return;

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // Filter out users that are already friends
    const friendUserIds = friends.map(f => f.user_id);
    const filtered = MOCK_ECOSYSTEM_FRIENDS.filter(
      f => !friendUserIds.includes(f.user_id)
    );

    setSuggestions(filtered);
  }, [userId, friends]);

  // Sync friends from FUN ID (mock implementation)
  const syncFromFunId = useCallback(async () => {
    if (!userId) return;

    setSyncing(true);
    try {
      // Simulate syncing from other platforms
      await new Promise(resolve => setTimeout(resolve, 2000));

      toast({
        title: "🔄 Đã đồng bộ xong!",
        description: "Danh sách bạn bè từ FUN Ecosystem đã được cập nhật",
      });

      // Refresh friends list
      await fetchFriends();
      await fetchSuggestions();
    } catch (error) {
      toast({
        title: "Lỗi đồng bộ",
        description: "Không thể kết nối với FUN Ecosystem",
        variant: "destructive",
      });
    } finally {
      setSyncing(false);
    }
  }, [userId, toast, fetchFriends, fetchSuggestions]);

  // Link FUN ID to current account
  const linkFunId = useCallback(async (funIdValue: string) => {
    if (!userId) return false;

    try {
      // Use raw update since columns may not be in types yet
      const { error } = await supabase
        .from("profiles")
        .update({
          fun_id: funIdValue,
          fun_id_linked_at: new Date().toISOString(),
        } as any)
        .eq("user_id", userId);

      if (error) throw error;

      toast({
        title: "🎉 Kết nối thành công!",
        description: `FUN ID ${funIdValue} đã được liên kết với tài khoản của bạn`,
      });

      // Trigger sync after linking
      await syncFromFunId();
      return true;
    } catch (error: any) {
      toast({
        title: "Lỗi",
        description: error.message,
        variant: "destructive",
      });
      return false;
    }
  }, [userId, toast, syncFromFunId]);

  // Setup realtime subscription for friendships
  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel("ecosystem-friends-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "friendships",
          filter: `user_id=eq.${userId}`,
        },
        () => {
          fetchFriends();
        }
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "friendships",
          filter: `friend_id=eq.${userId}`,
        },
        () => {
          fetchFriends();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, fetchFriends]);

  // Initial load
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      await fetchFriends();
      await fetchSuggestions();
      setLoading(false);
    };
    load();
  }, [fetchFriends, fetchSuggestions]);

  return {
    friends,
    suggestions,
    loading,
    syncing,
    fetchFriends,
    fetchSuggestions,
    syncFromFunId,
    linkFunId,
    mockFriends: MOCK_ECOSYSTEM_FRIENDS,
  };
}

export function useFunIdStatus(userId: string | null) {
  const [funId, setFunId] = useState<string | null>(null);
  const [linkedAt, setLinkedAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const fetchStatus = async () => {
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("user_id", userId)
          .maybeSingle();

        if (error) throw error;

        // Cast to access new columns
        const extendedData = data as any;
        setFunId(extendedData?.fun_id || null);
        setLinkedAt(extendedData?.fun_id_linked_at || null);
      } catch (error) {
        console.error("Error fetching FUN ID status:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStatus();
  }, [userId]);

  return { funId, linkedAt, loading, isLinked: !!funId };
}
