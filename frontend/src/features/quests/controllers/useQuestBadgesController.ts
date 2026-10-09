"use client";

import { useCallback, useEffect, useState } from "react";
import { api } from "@/services/api";
import type { MonthlyBadge, User } from "@/models/api";

export function useQuestBadgesController() {
  const [user, setUser] = useState<User | null>(null);
  const [badges, setBadges] = useState<MonthlyBadge[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const loadBadges = useCallback(async () => {
    try {
      const [nextUser, questData] = await Promise.all([api.getUser(), api.getQuests()]);
      setUser(nextUser);
      setBadges(questData.badges);
      setError(null);
    } catch (loadError: unknown) {
      console.error("Failed to load monthly badges:", loadError);
      setError("We couldn't load your badges. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void Promise.resolve().then(loadBadges);
  }, [loadBadges]);

  const refillHearts = useCallback(async (method: "gems" | "practice" | "free") => {
    await api.refillHearts(method);
    await loadBadges();
  }, [loadBadges]);

  const simulateStreak = useCallback(async (
    action: "advance_day" | "miss_day" | "freeze" | "reset",
  ) => {
    await api.simulateStreak(action);
    await loadBadges();
  }, [loadBadges]);

  const deductHeart = useCallback(async () => {
    if (!user) return;
    await api.updateUserStats({ hearts: Math.max(0, user.hearts - 1) });
    await loadBadges();
  }, [loadBadges, user]);

  const resetProgress = useCallback(async () => {
    await api.resetProgress();
    await loadBadges();
  }, [loadBadges]);

  return {
    user,
    badges,
    error,
    loading,
    refillHearts,
    simulateStreak,
    deductHeart,
    resetProgress,
  };
}
