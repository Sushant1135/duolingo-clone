"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Award, CheckCircle, Gem, Target, Zap } from "lucide-react";
import { Sidebar } from "@/shared/views/components/Sidebar";
import { TopBar } from "@/shared/views/components/TopBar";
import { StreakModal } from "@/shared/views/components/StreakModal";
import { HeartsModal } from "@/shared/views/components/HeartsModal";
import { DevBar } from "@/shared/views/components/DevBar";
import { DuoMascot } from "@/shared/views/components/DuoMascot";
import { useQuestsController } from "@/features/quests/controllers/useQuestsController";
import type { MonthlyBadge, Quest } from "@/models/api";

export default function QuestsPage() {
  const {
    user,
    questData,
    loading,
    error,
    refillHearts: handleRefillHearts,
    simulateStreak: handleSimulateStreak,
    deductHeart: handleDeductHeart,
    resetProgress: handleResetProgress,
    claimQuest: handleClaim,
    claimMonthlyQuest: handleMonthlyClaim,
    dailyQuests,
    monthly,
    badges,
  } = useQuestsController();
  const [showStreakModal, setShowStreakModal] = useState(false);
  const [showHeartsModal, setShowHeartsModal] = useState(false);
  const [showDevModal, setShowDevModal] = useState(false);

  const completedBadges = badges.filter((badge) => badge.completed);

  return (
    <div className="min-h-screen bg-white text-[#4b4b4b] transition-colors dark:bg-[#101f24] dark:text-white">
      <div className="flex">
        <Sidebar onOpenDevTools={() => setShowDevModal(true)} />
        <div className="flex min-h-screen min-w-0 flex-1 flex-col min-[700px]:ml-[var(--duo-sidebar-width)]">
          <TopBar
            user={user}
            onOpenStreakModal={() => setShowStreakModal(true)}
            onOpenHeartsModal={() => setShowHeartsModal(true)}
          />

          <main className="mx-auto w-full max-w-[var(--duo-readable-max-width)] flex-1 space-y-6 p-4 sm:p-8">
            <header>
              <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#ff9600]">Your learning goals</p>
              <h1 className="mt-1 text-3xl font-extrabold">Quests</h1>
            </header>

            {error && (
              <div role="alert" className="rounded-xl border border-[#ff4b4b]/30 bg-[#ff4b4b]/10 p-4 text-sm font-bold text-[#c43a3a] dark:text-[#ff8585]">
                {error}
              </div>
            )}

            {loading && !questData ? (
              <div className="rounded-2xl border-2 border-[#e5e5e5] p-8 text-center font-bold text-[#777] dark:border-[#2e4550] dark:text-[#d7e1e8]">
                Loading your quests...
              </div>
            ) : (
              <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1.65fr)_minmax(260px,0.8fr)]">
                <div className="space-y-8">
                  {monthly && (
                    <section className="relative overflow-hidden rounded-3xl border-2 border-[#ffd08a] bg-gradient-to-br from-[#fff5df] via-[#fffaf0] to-[#ffe7ca] p-5 shadow-sm dark:border-[#765526] dark:from-[#352a1c] dark:via-[#2a251e] dark:to-[#3b2a1b] sm:p-7">
                      <div className="relative z-10 max-w-xl sm:pr-32">
                        <span className="inline-flex rounded-full border border-[#ff9600]/30 bg-white/80 px-3 py-1 text-[11px] font-extrabold uppercase tracking-wider text-[#cb7200] dark:bg-[#101f24]/70 dark:text-[#ffc66d]">
                          {monthly.month_name} monthly quest
                        </span>
                        <h2 className="mt-3 text-2xl font-extrabold sm:text-3xl">{monthly.title}</h2>
                        <p className="mt-2 max-w-md text-sm font-semibold leading-relaxed text-[#777] dark:text-[#d7e1e8]">
                          Complete daily quests to earn the {monthly.badge_name} badge and a monthly gem reward.
                        </p>
                        <div className="mt-5 flex items-center gap-3">
                          <div
                            className="h-3.5 min-w-0 flex-1 overflow-hidden rounded-full border border-[#e5e5e5] bg-white dark:border-[#52636a] dark:bg-[#182a30]"
                            role="progressbar"
                            aria-label="Monthly quest progress"
                            aria-valuenow={monthly.completed_count}
                            aria-valuemin={0}
                            aria-valuemax={monthly.goal}
                          >
                            <div
                              className="h-full rounded-full bg-[#ff9600] transition-all"
                              style={{ width: `${Math.min(100, Math.round((monthly.completed_count / monthly.goal) * 100))}%` }}
                            />
                          </div>
                          <span className="shrink-0 text-sm font-extrabold">
                            {monthly.completed_count}/{monthly.goal}
                          </span>
                        </div>
                        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-bold text-[#777] dark:text-[#d7e1e8]">
                          <span>{monthly.days_remaining} days remaining</span>
                          <span className="inline-flex items-center gap-1"><Gem className="h-4 w-4 text-[#1cb0f6]" />{monthly.reward_gems} gems</span>
                        </div>
                        {monthly.completed && !monthly.reward_claimed && (
                          <button
                            onClick={() => void handleMonthlyClaim()}
                            className="duo-btn-green mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-extrabold uppercase tracking-wider sm:w-auto"
                          >
                            <Gem className="h-4 w-4 fill-current" /> Claim {monthly.reward_gems} gems
                          </button>
                        )}
                        {monthly.reward_claimed && (
                          <p className="mt-4 inline-flex items-center gap-2 text-sm font-extrabold text-[#58a900] dark:text-[#a4e46e]">
                            <CheckCircle className="h-5 w-5" /> Monthly reward claimed
                          </p>
                        )}
                      </div>
                      <DuoMascot mood="happy" size={135} className="absolute bottom-0 right-4 hidden opacity-90 sm:inline-flex lg:right-8" />
                    </section>
                  )}

                  <section>
                    <div className="mb-4 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-2">
                        <Target className="h-6 w-6 text-[#ff9600]" />
                        <h2 className="text-xl font-extrabold">Daily Quests</h2>
                      </div>
                      <span className="text-right text-xs font-bold text-[#777] dark:text-[#d7e1e8]">New quests at midnight</span>
                    </div>
                    {dailyQuests.length === 0 ? (
                      <p className="rounded-2xl border-2 border-dashed border-[#e5e5e5] p-6 text-center text-sm font-bold text-[#777] dark:border-[#2e4550] dark:text-[#d7e1e8]">
                        No daily quests are available yet.
                      </p>
                    ) : (
                      <div className="space-y-3">
                        {dailyQuests.map((quest) => (
                          <DailyQuestCard key={quest.id} quest={quest} onClaim={handleClaim} />
                        ))}
                      </div>
                    )}
                  </section>
                </div>

                <aside className="rounded-2xl border-2 border-[#e5e5e5] bg-white p-5 dark:border-[#2e4550] dark:bg-[#14262c]">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <Award className="h-5 w-5 text-[#ff9600]" />
                        <h2 className="text-lg font-extrabold">Monthly Badges</h2>
                      </div>
                      <p className="mt-1 text-xs font-semibold text-[#777] dark:text-[#d7e1e8]">
                        {completedBadges.length} earned
                      </p>
                    </div>
                    <Link href="/quests/badges" className="shrink-0 text-xs font-extrabold uppercase tracking-wide text-[#1cb0f6] hover:underline">
                      View all
                    </Link>
                  </div>
                  <div className="mt-5 space-y-3">
                    {completedBadges.slice(0, 4).map((badge) => (
                      <BadgeRow key={badge.id} badge={badge} />
                    ))}
                    {completedBadges.length === 0 && (
                      <p className="rounded-xl bg-[#f7f7f7] p-4 text-sm font-semibold text-[#777] dark:bg-[#1d333a] dark:text-[#d7e1e8]">
                        Complete monthly quests to earn your first badge.
                      </p>
                    )}
                  </div>
                </aside>
              </div>
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

function DailyQuestCard({ quest, onClaim }: { quest: Quest; onClaim: (id: number) => void }) {
  const percentage = Math.min(100, Math.round((quest.current_progress / quest.target_progress) * 100));

  return (
    <article className="rounded-2xl border-2 border-[#e5e5e5] bg-white p-4 dark:border-[#2e4550] dark:bg-[#14262c] sm:p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="flex min-w-0 flex-1 items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[#ff9600]/30 bg-[#fff4e5] dark:bg-[#392d1e]">
            <Zap className="h-5 w-5 fill-[#ff9600] text-[#ff9600]" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-3">
              <h3 className="text-sm font-extrabold sm:text-base">{quest.title}</h3>
              <span className="shrink-0 text-xs font-extrabold text-[#777] dark:text-[#d7e1e8]">
                {quest.current_progress}/{quest.target_progress}
              </span>
            </div>
            <p className="mt-1 text-xs font-medium text-[#777] dark:text-[#d7e1e8]">{quest.description}</p>
            <div
              className="mt-3 h-2.5 overflow-hidden rounded-full bg-[#e5e5e5] dark:bg-[#334951]"
              role="progressbar"
              aria-label={`${quest.title} progress`}
              aria-valuenow={quest.current_progress}
              aria-valuemin={0}
              aria-valuemax={quest.target_progress}
            >
              <div className="h-full rounded-full bg-[#ff9600] transition-all" style={{ width: `${percentage}%` }} />
            </div>
          </div>
        </div>
        <div className="sm:w-36 sm:shrink-0">
          {quest.is_claimed ? (
            <span className="flex items-center justify-center gap-1.5 rounded-xl border border-[#b8f28b] bg-[#f3fce8] px-3 py-2.5 text-xs font-extrabold text-[#469900] dark:bg-[#20391b] dark:text-[#a4e46e]">
              <CheckCircle className="h-4 w-4" /> Claimed
            </span>
          ) : quest.is_completed ? (
            <button
              onClick={() => onClaim(quest.id)}
              className="duo-btn-green flex w-full items-center justify-center gap-1.5 rounded-xl py-2.5 text-xs font-extrabold uppercase tracking-wider"
            >
              <Gem className="h-4 w-4 fill-current" /> Claim +{quest.reward_gems}
            </button>
          ) : (
            <span className="flex items-center justify-center gap-1 rounded-xl bg-[#ddf4ff] px-3 py-2.5 text-xs font-extrabold text-[#1687bd] dark:bg-[#183a49] dark:text-[#69cfff]">
              <Gem className="h-4 w-4 fill-current" /> {quest.reward_gems} Gems
            </span>
          )}
        </div>
      </div>
    </article>
  );
}

function BadgeRow({ badge }: { badge: MonthlyBadge }) {
  return (
    <div className="flex items-center gap-3 rounded-xl bg-[#fff7e8] p-3 dark:bg-[#352a1c]">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#ffcf69] text-[#7b4f00]">
        <Award className="h-5 w-5" />
      </div>
      <div className="min-w-0">
        <p className="truncate text-sm font-extrabold">{badge.badge_name}</p>
        <p className="text-xs font-semibold text-[#777] dark:text-[#d7e1e8]">{badge.month_name} {badge.year}</p>
      </div>
    </div>
  );
}
