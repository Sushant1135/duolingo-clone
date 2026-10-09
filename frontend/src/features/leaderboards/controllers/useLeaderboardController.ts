"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { api } from "@/services/api";
import type { LeaderboardData, User } from "@/models/api";
import { getLeagueConfig } from "@/features/leaderboards/models/leagues";

export function useLeaderboardController() {
  const [user, setUser] = useState<User | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardData | null>(null);

  const loadLeaderboard = useCallback(async () => {
    try {
      const [nextUser, nextLeaderboard] = await Promise.all([
        api.getUser(),
        api.getLeaderboard(),
      ]);
      setUser(nextUser);
      setLeaderboard(nextLeaderboard);
    } catch (error) {
      console.error("Failed to load leaderboard:", error);
    }
  }, []);

  useEffect(() => {
    void Promise.resolve().then(loadLeaderboard);
  }, [loadLeaderboard]);

  const currentLeague = useMemo(
    () => getLeagueConfig(leaderboard?.league || user?.league),
    [leaderboard?.league, user?.league],
  );

  const refillHearts = useCallback(async (method: "gems" | "practice" | "free") => {
    await api.refillHearts(method);
    await loadLeaderboard();
  }, [loadLeaderboard]);

  const simulateStreak = useCallback(async (
    action: "advance_day" | "miss_day" | "freeze" | "reset",
  ) => {
    await api.simulateStreak(action);
    await loadLeaderboard();
  }, [loadLeaderboard]);

  const deductHeart = useCallback(async () => {
    if (!user) return;
    await api.updateUserStats({ hearts: Math.max(0, user.hearts - 1) });
    await loadLeaderboard();
  }, [loadLeaderboard, user]);

  const resetProgress = useCallback(async () => {
    await api.resetProgress();
    await loadLeaderboard();
  }, [loadLeaderboard]);

  return {
    user,
    leaderboard,
    currentLeague,
    entries: leaderboard?.entries ?? [],
    refillHearts,
    simulateStreak,
    deductHeart,
    resetProgress,
  };
}
