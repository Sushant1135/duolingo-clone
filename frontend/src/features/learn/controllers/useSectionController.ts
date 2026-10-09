"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/services/api";
import type { CourseTree, User } from "@/models/api";

export function useSectionController() {
  const params = useParams<{ sectionId: string }>();
  const router = useRouter();
  const selectedSectionId = Number(params.sectionId);
  const [user, setUser] = useState<User | null>(null);
  const [courseTree, setCourseTree] = useState<CourseTree | null>(null);
  const [activeLessonId, setActiveLessonId] = useState<number | null>(null);
  const [showStreakModal, setShowStreakModal] = useState(false);
  const [showHeartsModal, setShowHeartsModal] = useState(false);
  const [showDevModal, setShowDevModal] = useState(false);

  const loadData = useCallback(async () => {
    const [nextUser, nextTree] = await Promise.all([api.getUser(), api.getCourseTree(1)]);
    setUser(nextUser);
    setCourseTree(nextTree);
  }, []);

  useEffect(() => {
    void Promise.resolve().then(loadData).catch((error: unknown) =>
      console.error("Failed to load section:", error),
    );
  }, [loadData]);

  const selectedUnit = useMemo(() => {
    if (!courseTree) return null;
    return courseTree.units.find((unit) =>
      unit.skills.some((skill) => skill.id === selectedSectionId),
    ) || courseTree.units[0];
  }, [courseTree, selectedSectionId]);
  const selectedSkill =
    selectedUnit?.skills.find((skill) => skill.id === selectedSectionId) ||
    selectedUnit?.skills[0] ||
    null;

  const refillHearts = useCallback(async (method: "gems" | "practice" | "free") => {
    await api.refillHearts(method);
    await loadData();
  }, [loadData]);

  const simulateStreak = useCallback(async (
    action: "advance_day" | "miss_day" | "freeze" | "reset",
  ) => {
    await api.simulateStreak(action);
    await loadData();
  }, [loadData]);

  const deductHeart = useCallback(async () => {
    if (!user) return;
    await api.updateUserStats({ hearts: Math.max(0, user.hearts - 1) });
    await loadData();
  }, [loadData, user]);

  const resetProgress = useCallback(async () => {
    await api.resetProgress();
    await loadData();
  }, [loadData]);

  return {
    router,
    selectedUnit,
    selectedSkill,
    user,
    activeLessonId,
    setActiveLessonId,
    showStreakModal,
    setShowStreakModal,
    showHeartsModal,
    setShowHeartsModal,
    showDevModal,
    setShowDevModal,
    loadData,
    refillHearts,
    simulateStreak,
    deductHeart,
    resetProgress,
  };
}
