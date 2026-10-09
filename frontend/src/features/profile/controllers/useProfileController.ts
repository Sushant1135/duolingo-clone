"use client";

import { useCallback, useEffect, useState } from "react";
import { api } from "@/services/api";
import { sound } from "@/services/audio";
import type { Achievement, CourseTree, User } from "@/models/api";

export function useProfileController() {
  const [user, setUser] = useState<User | null>(null);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [courseTree, setCourseTree] = useState<CourseTree | null>(null);

  const loadProfile = useCallback(async () => {
    try {
      const [nextUser, nextAchievements, nextCourseTree] = await Promise.all([
        api.getUser(),
        api.getAchievements(),
        api.getCourseTree(1),
      ]);
      setUser(nextUser);
      setAchievements(nextAchievements);
      setCourseTree(nextCourseTree);
    } catch (error) {
      console.error("Failed to load profile:", error);
    }
  }, []);

  useEffect(() => {
    void Promise.resolve().then(loadProfile);
  }, [loadProfile]);

  const refillHearts = useCallback(async (method: "gems" | "practice" | "free") => {
    await api.refillHearts(method);
    await loadProfile();
  }, [loadProfile]);

  const simulateStreak = useCallback(async (
    action: "advance_day" | "miss_day" | "freeze" | "reset",
  ) => {
    await api.simulateStreak(action);
    await loadProfile();
  }, [loadProfile]);

  const deductHeart = useCallback(async () => {
    if (!user) return;
    await api.updateUserStats({ hearts: Math.max(0, user.hearts - 1) });
    await loadProfile();
  }, [loadProfile, user]);

  const resetProgress = useCallback(async () => {
    if (!window.confirm("Reset your learning progress and return to Lesson 1?")) return;
    try {
      await api.resetProgress();
      sound.playCorrect();
      await loadProfile();
    } catch (error) {
      console.error("Failed to reset learner progress:", error);
    }
  }, [loadProfile]);

  const joinedDate = user?.created_at
    ? new Intl.DateTimeFormat("en", { month: "long", year: "numeric" }).format(new Date(user.created_at))
    : "October 2026";
  const crownsEarned =
    courseTree?.units.reduce(
      (total, unit) => total + unit.skills.filter((skill) => skill.is_completed).length,
      0,
    ) ?? 0;

  return {
    user,
    achievements,
    joinedDate,
    crownsEarned,
    refillHearts,
    simulateStreak,
    deductHeart,
    resetProgress,
  };
}
