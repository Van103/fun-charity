import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

interface LightPointsData {
  total_points: number;
  weekly_points: number;
  monthly_points: number;
  deeds_count: number;
  rank: string;
}

export function useLightPoints() {
  const [lightPoints, setLightPoints] = useState(0);
  const [weeklyPoints, setWeeklyPoints] = useState(0);
  const [monthlyPoints, setMonthlyPoints] = useState(0);
  const [deedsCount, setDeedsCount] = useState(0);
  const [rank, setRank] = useState("Beginner");
  const [isLoading, setIsLoading] = useState(true);

  const fetchLightPoints = useCallback(async () => {
    try {
      setIsLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setIsLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("user_light_points")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setLightPoints(data.total_points || 0);
        setWeeklyPoints(data.weekly_points || 0);
        setMonthlyPoints(data.monthly_points || 0);
        setDeedsCount(data.deeds_count || 0);
        setRank(data.rank || "Beginner");
      }
    } catch (err) {
      console.error("Error fetching light points:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLightPoints();
  }, [fetchLightPoints]);

  return {
    lightPoints,
    weeklyPoints,
    monthlyPoints,
    deedsCount,
    rank,
    isLoading,
    refetch: fetchLightPoints,
  };
}

// Calculate rank based on points
export function calculateRank(points: number): string {
  if (points >= 10000) return "Legend";
  if (points >= 5000) return "Champion";
  if (points >= 1000) return "Hero";
  if (points >= 100) return "Helper";
  return "Beginner";
}
