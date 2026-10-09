"use client";

import { useCallback, useEffect, useState } from "react";
import { api } from "@/services/api";
import { sound } from "@/services/audio";
import type { CourseTree, LeaderboardData, Quest, User } from "@/models/api";

export function usePracticeController() {
  const [user, setUser] = useState<User | null>(null);
  const [courseTree, setCourseTree] = useState<CourseTree | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardData | null>(null);
  const [quests, setQuests] = useState<Quest[]>([]);
  const [activeLessonId, setActiveLessonId] = useState<number | null>(null);
  const [activeCollection, setActiveCollection] = useState<"words" | "stories" | null>(null);
  const [showStreakModal, setShowStreakModal] = useState(false);
  const [showHeartsModal, setShowHeartsModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadPageData = useCallback(async () => {
    setError(null);
    try {
      const [nextUser, nextTree, nextLeaderboard, nextQuests] = await Promise.all([
        api.getUser(),
        api.getCourseTree(1),
        api.getLeaderboard(),
        api.getQuests(),
      ]);
      setUser(nextUser);
      setCourseTree(nextTree);
      setLeaderboard(nextLeaderboard);
      setQuests(nextQuests.daily);
    } catch (loadError) {
      console.error("Failed to load practice page data:", loadError);
      setError("We couldn't load your practice page. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void Promise.resolve().then(loadPageData);
  }, [loadPageData]);

  const availableLessonId = courseTree?.units
    .flatMap((unit) => unit.skills)
    .flatMap((skill) => skill.lessons)
    .find((lesson) => !lesson.is_locked)?.id;

  const startPractice = useCallback(() => {
    if (!availableLessonId) {
      setError("There isn't an available lesson to practice yet.");
      return;
    }
    sound.playClick();
    setActiveLessonId(availableLessonId);
  }, [availableLessonId]);

  const claimQuest = useCallback(async (questId: number) => {
    try {
      await api.claimQuest(questId);
      await loadPageData();
    } catch (claimError) {
      console.error("Failed to claim quest:", claimError);
      setError("We couldn't claim that quest. Please try again.");
    }
  }, [loadPageData]);

  const simulateStreak = useCallback(async (
    action: "advance_day" | "miss_day" | "freeze" | "reset",
  ) => {
    try {
      await api.simulateStreak(action);
      await loadPageData();
    } catch (actionError) {
      console.error("Failed to update streak:", actionError);
      setError("We couldn't update your streak. Please try again.");
    }
  }, [loadPageData]);

  const refillHearts = useCallback(async (method: "gems" | "practice" | "free") => {
    try {
      await api.refillHearts(method);
      await loadPageData();
    } catch (actionError) {
      console.error("Failed to refill hearts:", actionError);
      setError("We couldn't refill your hearts. Please try again.");
    }
  }, [loadPageData]);

  const finishLesson = useCallback(() => {
    setActiveLessonId(null);
    void loadPageData();
  }, [loadPageData]);

  return {
    user,
    courseTree,
    leaderboard,
    quests,
    activeLessonId,
    setActiveLessonId,
    activeCollection,
    setActiveCollection,
    showStreakModal,
    setShowStreakModal,
    showHeartsModal,
    setShowHeartsModal,
    loading,
    error,
    loadPageData,
    availableLessonId,
    startPractice,
    claimQuest,
    simulateStreak,
    refillHearts,
    finishLesson,
  };
}
