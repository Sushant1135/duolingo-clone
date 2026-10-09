"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { api } from "@/services/api";
import type {
  CourseTree,
  LeaderboardData,
  Quest,
  Unit,
  User,
} from "@/models/api";
import { buildCourseSections, getDefaultSectionId } from "@/features/learn/models/course";

export function useLearnController() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [user, setUser] = useState<User | null>(null);
  const [courseTree, setCourseTree] = useState<CourseTree | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardData | null>(null);
  const [quests, setQuests] = useState<Quest[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSectionOverview, setShowSectionOverview] = useState(false);
  const [activeLessonId, setActiveLessonId] = useState<number | null>(null);
  const [selectedGuidebookUnit, setSelectedGuidebookUnit] = useState<Unit | null>(null);
  const [showStreakModal, setShowStreakModal] = useState(false);
  const [showHeartsModal, setShowHeartsModal] = useState(false);
  const [showDevModal, setShowDevModal] = useState(false);

  const sections = useMemo(
    () => (courseTree ? buildCourseSections(courseTree.units) : []),
    [courseTree],
  );
  const requestedSectionId = Number(searchParams.get("section") || "");
  const selectedSectionId = sections.some((section) => section.id === requestedSectionId)
    ? requestedSectionId
    : getDefaultSectionId(sections);

  const refreshAllData = async () => {
    try {
      const [userData, treeData, leaderboardData, questsData] = await Promise.all([
        api.getUser(),
        api.getCourseTree(1),
        api.getLeaderboard(),
        api.getQuests(),
      ]);
      setUser(userData);
      setCourseTree(treeData);
      setLeaderboard(leaderboardData);
      setQuests(questsData.daily);
    } catch (error) {
      console.error("Failed to load home page data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void Promise.resolve().then(refreshAllData);
  }, []);

  useEffect(() => {
    if (!courseTree) return;
    const defaultSectionId = getDefaultSectionId(sections);
    const validSection = sections.some((section) => section.id === requestedSectionId)
      ? requestedSectionId
      : defaultSectionId;
    const params = new URLSearchParams(searchParams.toString());
    if (params.get("section") !== String(validSection)) {
      params.set("section", String(validSection));
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    }
  }, [courseTree, pathname, requestedSectionId, router, searchParams, sections]);

  const handleSectionSelect = (sectionId: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("section", String(sectionId));
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    setShowSectionOverview(false);
  };

  const handleSimulateStreak = async (action: "advance_day" | "miss_day" | "freeze" | "reset") => {
    try {
      await api.simulateStreak(action);
      await refreshAllData();
    } catch (error) {
      console.error(error);
    }
  };

  const handleRefillHearts = async (method: "gems" | "practice" | "free") => {
    try {
      await api.refillHearts(method);
      await refreshAllData();
    } catch (error: unknown) {
      console.error(error);
    }
  };

  const handleDeductHeart = async () => {
    if (!user) return;
    try {
      await api.updateUserStats({ hearts: Math.max(0, user.hearts - 1) });
      await refreshAllData();
    } catch (error) {
      console.error(error);
    }
  };

  const handleResetProgress = async () => {
    try {
      await api.resetProgress();
      await refreshAllData();
    } catch (error) {
      console.error(error);
    }
  };

  const handleClaimQuest = async (questId: number) => {
    try {
      await api.claimQuest(questId);
      await refreshAllData();
    } catch (error) {
      console.error(error);
    }
  };

  return {
    user,
    courseTree,
    leaderboard,
    quests,
    loading,
    sections,
    selectedSectionId,
    activeLessonId,
    setActiveLessonId,
    showSectionOverview,
    setShowSectionOverview,
    selectedGuidebookUnit,
    setSelectedGuidebookUnit,
    showStreakModal,
    setShowStreakModal,
    showHeartsModal,
    setShowHeartsModal,
    showDevModal,
    setShowDevModal,
    refreshAllData,
    handleSectionSelect,
    handleSimulateStreak,
    handleRefillHearts,
    handleDeductHeart,
    handleResetProgress,
    handleClaimQuest,
  };
}
