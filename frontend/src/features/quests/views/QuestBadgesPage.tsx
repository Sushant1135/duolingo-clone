"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Award, CheckCircle, Lock } from "lucide-react";
import { Sidebar } from "@/shared/views/components/Sidebar";
import { TopBar } from "@/shared/views/components/TopBar";
import { DevBar } from "@/shared/views/components/DevBar";
import { HeartsModal } from "@/shared/views/components/HeartsModal";
import { StreakModal } from "@/shared/views/components/StreakModal";
import { useQuestBadgesController } from "@/features/quests/controllers/useQuestBadgesController";
import type { MonthlyBadge } from "@/models/api";

export default function QuestBadgesPage() {
  const {
    user,
    badges,
    error,
    loading,
    refillHearts: handleRefillHearts,
    simulateStreak: handleSimulateStreak,
    deductHeart: handleDeductHeart,
    resetProgress: handleResetProgress,
  } = useQuestBadgesController();
  const [showStreakModal, setShowStreakModal] = useState(false);
  const [showHeartsModal, setShowHeartsModal] = useState(false);
  const [showDevModal, setShowDevModal] = useState(false);

  return (
    <div className="min-h-screen bg-white text-[#4b4b4b] dark:bg-[#101f24] dark:text-white">
      <div className="flex">
        <Sidebar onOpenDevTools={() => setShowDevModal(true)} />
        <div className="flex min-h-screen min-w-0 flex-1 flex-col min-[700px]:ml-[var(--duo-sidebar-width)]">
          <TopBar
            user={user}
            onOpenStreakModal={() => setShowStreakModal(true)}
            onOpenHeartsModal={() => setShowHeartsModal(true)}
          />
          <main className="mx-auto w-full max-w-[var(--duo-readable-max-width)] flex-1 p-4 sm:p-8">
            <Link href="/quests" className="inline-flex items-center gap-2 text-sm font-extrabold text-[#1cb0f6] hover:underline">
              <ArrowLeft className="h-4 w-4" /> Back to quests
            </Link>
            <div className="mt-5 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#fff2d6] text-[#df8b00] dark:bg-[#352a1c] dark:text-[#ffc66d]">
                <Award className="h-7 w-7" />
              </div>
              <div>
                <h1 className="text-2xl font-extrabold">Monthly Badges</h1>
                <p className="text-sm font-semibold text-[#777] dark:text-[#d7e1e8]">Your monthly quest history</p>
              </div>
            </div>

            {error && (
              <p role="alert" className="mt-6 rounded-xl border border-[#ff4b4b]/30 bg-[#ff4b4b]/10 p-4 text-sm font-bold text-[#c43a3a] dark:text-[#ff8585]">
                {error}
              </p>
            )}

            {loading ? (
              <p className="mt-7 rounded-2xl border-2 border-[#e5e5e5] p-8 text-center text-sm font-bold text-[#777] dark:border-[#2e4550] dark:text-[#d7e1e8]">
                Loading your badges...
              </p>
            ) : (
              <div className="mt-7 grid gap-4 sm:grid-cols-2">
                {badges.map((badge) => <BadgeCard key={badge.id} badge={badge} />)}
              </div>
            )}
            {!loading && !error && badges.length === 0 && (
              <p className="mt-6 rounded-2xl border-2 border-dashed border-[#e5e5e5] p-8 text-center text-sm font-bold text-[#777] dark:border-[#2e4550] dark:text-[#d7e1e8]">
                Your monthly badge history will appear here.
              </p>
            )}
          </main>
        </div>
      </div>
      <StreakModal
        isOpen={showStreakModal}
        onClose={() => setShowStreakModal(false)}
        user={user}
        onSimulateStreak={handleSimulateStreak}
      />
      <HeartsModal
        isOpen={showHeartsModal}
        onClose={() => setShowHeartsModal(false)}
        user={user}
        onRefill={handleRefillHearts}
      />
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

function BadgeCard({ badge }: { badge: MonthlyBadge }) {
  const progress = Math.min(100, Math.round((badge.completed_count / badge.goal) * 100));

  return (
    <article className="rounded-2xl border-2 border-[#e5e5e5] bg-white p-5 dark:border-[#2e4550] dark:bg-[#14262c]">
      <div className="flex items-center gap-4">
        <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ${badge.completed ? "bg-[#fff2d6] text-[#df8b00] dark:bg-[#352a1c] dark:text-[#ffc66d]" : "bg-[#f1f1f1] text-[#999] dark:bg-[#263b42] dark:text-[#a7b4b9]"}`}>
          {badge.completed ? <Award className="h-8 w-8" /> : <Lock className="h-6 w-6" />}
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="truncate font-extrabold">{badge.badge_name}</h2>
          <p className="text-sm font-semibold text-[#777] dark:text-[#d7e1e8]">{badge.month_name} {badge.year}</p>
        </div>
        {badge.completed && <CheckCircle className="h-5 w-5 shrink-0 text-[#58cc02]" />}
      </div>
      <div className="mt-5 flex items-center justify-between text-xs font-extrabold text-[#777] dark:text-[#d7e1e8]">
        <span>{badge.completed ? "Badge earned" : "Quest progress"}</span>
        <span>{badge.completed_count}/{badge.goal}</span>
      </div>
      <div
        className="mt-2 h-2.5 overflow-hidden rounded-full bg-[#e5e5e5] dark:bg-[#334951]"
        role="progressbar"
        aria-label={`${badge.month_name} ${badge.year} quest progress`}
        aria-valuenow={badge.completed_count}
        aria-valuemin={0}
        aria-valuemax={badge.goal}
      >
        <div className="h-full rounded-full bg-[#ffb900]" style={{ width: `${progress}%` }} />
      </div>
      {badge.reward_claimed && (
        <p className="mt-3 text-xs font-bold text-[#58a900] dark:text-[#a4e46e]">Monthly reward claimed · {badge.reward_gems} gems</p>
      )}
    </article>
  );
}
