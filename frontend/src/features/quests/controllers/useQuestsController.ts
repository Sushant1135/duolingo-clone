"use client";

import { useCallback, useEffect, useState } from "react";
import confetti from "canvas-confetti";
import { api } from "@/services/api";
import { sound } from "@/services/audio";
import type { QuestOverview, User } from "@/models/api";

export function useQuestsController() {
  const [user, setUser] = useState<User | null>(null);
  const [questData, setQuestData] = useState<QuestOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadQuests = useCallback(async () => {
    setError(null);
    try {
      const [nextUser, nextQuests] = await Promise.all([api.getUser(), api.getQuests()]);
      setUser(nextUser);
      setQuestData(nextQuests);
    } catch (loadError) {
      console.error("Failed to load quests:", loadError);
      setError("We couldn't load your quests. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void Promise.resolve().then(loadQuests);
  }, [loadQuests]);

  const claimQuest = useCallback(async (questId: number) => {
    try {
      await api.claimQuest(questId);
      sound.playLessonComplete();
      confetti({ particleCount: 70, spread: 60, origin: { y: 0.7 } });
      await loadQuests();
    } catch (claimError) {
      console.error("Failed to claim daily quest:", claimError);
      setError("We couldn't claim that reward. Please try again.");
    }
  }, [loadQuests]);

  const claimMonthlyQuest = useCallback(async () => {
    try {
      await api.claimMonthlyQuest();
      sound.playLessonComplete();
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.7 } });
      await loadQuests();
    } catch (claimError) {
      console.error("Failed to claim monthly reward:", claimError);
      setError("We couldn't claim that reward. Please try again.");
    }
  }, [loadQuests]);

  const refillHearts = useCallback(async (method: "gems" | "practice" | "free") => {
    await api.refillHearts(method);
    await loadQuests();
  }, [loadQuests]);

  const simulateStreak = useCallback(async (
    action: "advance_day" | "miss_day" | "freeze" | "reset",
  ) => {
    await api.simulateStreak(action);
    await loadQuests();
  }, [loadQuests]);

  const deductHeart = useCallback(async () => {
    if (!user) return;
    await api.updateUserStats({ hearts: Math.max(0, user.hearts - 1) });
    await loadQuests();
  }, [loadQuests, user]);

  const resetProgress = useCallback(async () => {
    await api.resetProgress();
    await loadQuests();
  }, [loadQuests]);

  return {
    user,
    questData,
    loading,
    error,
    loadQuests,
    claimQuest,
    claimMonthlyQuest,
    refillHearts,
    simulateStreak,
    deductHeart,
    resetProgress,
    dailyQuests: questData?.daily ?? [],
    monthly: questData?.monthly,
    badges: questData?.badges ?? [],
  };
}
