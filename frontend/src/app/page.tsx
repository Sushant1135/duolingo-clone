"use client";

import React, { useState, useEffect } from "react";
import { Sidebar } from "@/components/Sidebar";
import { TopBar } from "@/components/TopBar";
import { RightPanel } from "@/components/RightPanel";
import { LearningPath } from "@/components/LearningPath";
import { LessonPlayer } from "@/components/LessonPlayer";
import { GuidebookModal } from "@/components/GuidebookModal";
import { StreakModal } from "@/components/StreakModal";
import { HeartsModal } from "@/components/HeartsModal";
import { DevBar } from "@/components/DevBar";
import { api, User, Unit, CourseTree, LeaderboardData, Quest } from "@/lib/api";
import { DuoMascot } from "@/components/DuoMascot";

export default function HomePage() {
  const [user, setUser] = useState<User | null>(null);
  const [courseTree, setCourseTree] = useState<CourseTree | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardData | null>(null);
  const [quests, setQuests] = useState<Quest[]>([]);
  const [loading, setLoading] = useState(true);

  // Active Lesson state
  const [activeLessonId, setActiveLessonId] = useState<number | null>(null);

  // Modals state
  const [selectedGuidebookUnit, setSelectedGuidebookUnit] = useState<Unit | null>(null);
  const [showStreakModal, setShowStreakModal] = useState(false);
  const [showHeartsModal, setShowHeartsModal] = useState(false);
  const [showDevModal, setShowDevModal] = useState(false);

  // Fetch initial data
  const refreshAllData = async () => {
    try {
      const [userData, treeData, lbData, questsData] = await Promise.all([
        api.getUser(),
        api.getCourseTree(1),
        api.getLeaderboard(),
        api.getQuests(),
      ]);
      setUser(userData);
      setCourseTree(treeData);
      setLeaderboard(lbData);
      setQuests(questsData);
    } catch (err) {
      console.error("Failed to load home page data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshAllData();
  }, []);

  // Handlers for Dev / Modal actions
  const handleSimulateStreak = async (action: "advance_day" | "miss_day" | "freeze" | "reset") => {
    try {
      await api.simulateStreak(action);
      await refreshAllData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleRefillHearts = async (method: "gems" | "practice" | "free") => {
    try {
      await api.refillHearts(method);
      await refreshAllData();
    } catch (e: any) {
      alert(e.message || "Could not refill hearts");
    }
  };

  const handleDeductHeart = async () => {
    if (!user) return;
    try {
      const newHearts = Math.max(0, user.hearts - 1);
      // Submit a dummy answer to deduct or update stats
      await fetch(`http://localhost:8000/api/users/me`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hearts: newHearts }),
      });
      await refreshAllData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleResetProgress = async () => {
    try {
      await api.resetProgress();
      await refreshAllData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleClaimQuest = async (questId: number) => {
    try {
      await api.claimQuest(questId);
      await refreshAllData();
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-white gap-3">
        <DuoMascot mood="happy" size={110} className="animate-bounce" />
        <h2 className="font-extrabold text-[#58cc02] text-xl tracking-tight">
          Loading Duolingo...
        </h2>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-[#131f24] text-[#4b4b4b] dark:text-white transition-colors">
      {/* If currently playing a lesson, render the LessonPlayer */}
      {activeLessonId !== null ? (
        <LessonPlayer
          lessonId={activeLessonId}
          onExit={() => setActiveLessonId(null)}
          onLessonFinished={() => {
            setActiveLessonId(null);
            refreshAllData();
          }}
        />
      ) : (
        <div className="flex">
          {/* Left Navigation Sidebar */}
          <Sidebar onOpenDevTools={() => setShowDevModal(true)} />

          {/* Main Content Area */}
          <div className="flex-1 md:ml-64 flex flex-col min-h-screen">
            <TopBar
              user={user}
              onOpenStreakModal={() => setShowStreakModal(true)}
              onOpenHeartsModal={() => setShowHeartsModal(true)}
            />

            <div className="flex-1 flex justify-center px-4 py-8">
              {/* Center Serpentine Learning Path */}
              <main className="w-full max-w-xl">
                {courseTree && (
                  <LearningPath
                    units={courseTree.units}
                    onOpenGuidebook={(unit) => setSelectedGuidebookUnit(unit)}
                    onStartLesson={(lessonId) => setActiveLessonId(lessonId)}
                  />
                )}
              </main>

              {/* Right Desktop Widgets */}
              <RightPanel
                user={user}
                quests={quests}
                leaderboard={leaderboard}
                onClaimQuest={handleClaimQuest}
              />
            </div>
          </div>
        </div>
      )}

      {/* Guidebook Modal */}
      <GuidebookModal
        isOpen={Boolean(selectedGuidebookUnit)}
        onClose={() => setSelectedGuidebookUnit(null)}
        unit={selectedGuidebookUnit}
      />

      {/* Streak Details Modal */}
      <StreakModal
        isOpen={showStreakModal}
        onClose={() => setShowStreakModal(false)}
        user={user}
        onSimulateStreak={handleSimulateStreak}
      />

      {/* Hearts Refill Modal */}
      <HeartsModal
        isOpen={showHeartsModal}
        onClose={() => setShowHeartsModal(false)}
        user={user}
        onRefill={handleRefillHearts}
      />

      {/* Dev & Evaluation Controls Modal */}
      <DevBar
        isOpen={showDevModal}
        onClose={() => setShowDevModal(false)}
        onSimulateStreak={handleSimulateStreak}
        onRefillHearts={handleRefillHearts}
        onDeductHeart={handleDeductHeart}
        onResetProgress={handleResetProgress}
      />
    </div>
  );
}
