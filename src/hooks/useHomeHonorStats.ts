import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface HomeHonorStats {
  totalUsers: number;
  topCharityRank: string;
  charityGiving: number;
  friends: number;
  posts: number;
  videos: number;
  nftCount: number;
  claimed: number;
  totalReward: number;
}

const fetchHomeHonorStats = async (): Promise<HomeHonorStats> => {
  // Fetch all stats in parallel
  const [
    profilesResult,
    donationsResult,
    friendsResult,
    postsResult,
    badgesResult,
    balancesResult,
    donorsCountResult
  ] = await Promise.all([
    // Total users
    supabase.from("profiles").select("id", { count: "exact", head: true }),
    
    // Total charity giving (completed donations)
    supabase
      .from("donations")
      .select("amount")
      .eq("status", "completed"),
    
    // Total friends using RPC
    supabase.rpc("get_total_friendship_count"),
    
    // Posts count
    supabase
      .from("feed_posts")
      .select("id, media_urls", { count: "exact" })
      .eq("is_active", true),
    
    // NFT count (badges)
    supabase.from("user_badges").select("id", { count: "exact", head: true }),
    
    // User balances for claimed and total reward
    supabase.from("user_balances").select("total_withdrawn, total_earned"),
    
    // Count unique donors for ranking
    supabase
      .from("donations")
      .select("donor_id")
      .eq("status", "completed")
      .not("donor_id", "is", null)
  ]);

  // Calculate total charity giving
  const charityGiving = donationsResult.data?.reduce(
    (sum, d) => sum + (d.amount || 0),
    0
  ) || 0;

  // Count videos (posts with video in media_urls)
  const videosCount = postsResult.data?.filter((post) => {
    if (!post.media_urls) return false;
    const urls = post.media_urls as string[];
    return urls.some((url) => url?.includes(".mp4") || url?.includes(".webm"));
  }).length || 0;

  // Calculate claimed and total reward
  const claimed = balancesResult.data?.reduce(
    (sum, b) => sum + (b.total_withdrawn || 0),
    0
  ) || 0;

  const totalReward = balancesResult.data?.reduce(
    (sum, b) => sum + (b.total_earned || 0),
    0
  ) || 0;

  // Get unique donors count for ranking display
  const uniqueDonors = new Set(
    donorsCountResult.data?.map((d) => d.donor_id).filter(Boolean)
  );
  const totalDonors = uniqueDonors.size || 1;

  return {
    totalUsers: profilesResult.count || 0,
    topCharityRank: `1/${totalDonors}`,
    charityGiving,
    friends: friendsResult.data || 0,
    posts: postsResult.count || 0,
    videos: videosCount,
    nftCount: badgesResult.count || 0,
    claimed,
    totalReward,
  };
};

export const useHomeHonorStats = () => {
  return useQuery({
    queryKey: ["home-honor-stats"],
    queryFn: fetchHomeHonorStats,
    staleTime: 60000, // 1 minute
    refetchInterval: 120000, // 2 minutes
  });
};
