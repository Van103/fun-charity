import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export function useUserCount() {
  const [userCount, setUserCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Fetch initial count
    const fetchUserCount = async () => {
      try {
        const { count, error } = await supabase
          .from("profiles")
          .select("*", { count: "exact", head: true });

        if (error) {
          console.error("Error fetching user count:", error);
          return;
        }

        setUserCount(count || 0);
      } catch (err) {
        console.error("Error fetching user count:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserCount();

    // Subscribe to real-time updates for new users
    const channel = supabase
      .channel("profiles-count-changes")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "profiles",
        },
        () => {
          // Increment count when new user joins
          setUserCount((prev) => prev + 1);
        }
      )
      .on(
        "postgres_changes",
        {
          event: "DELETE",
          schema: "public",
          table: "profiles",
        },
        () => {
          // Decrement count when user is deleted
          setUserCount((prev) => Math.max(0, prev - 1));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return { userCount, isLoading };
}
