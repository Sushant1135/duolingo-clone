"use client";

import React, { useState } from "react";
import { ArrowDown, ArrowUp, Check, Lock, Shield } from "lucide-react";
import { Sidebar } from "@/shared/views/components/Sidebar";
import { TopBar } from "@/shared/views/components/TopBar";
import { StreakModal } from "@/shared/views/components/StreakModal";
import { HeartsModal } from "@/shared/views/components/HeartsModal";
import { DevBar } from "@/shared/views/components/DevBar";
import type { LeaderboardEntry } from "@/models/api";
import { leagues, type LeagueConfig } from "@/features/leaderboards/models/leagues";
import { useLeaderboardController } from "@/features/leaderboards/controllers/useLeaderboardController";
import { sound } from "@/services/audio";

const statusOptions = ["😎", "🎉", "💪", "👀", "🍿", "🇩🇪", "😈", "💯", "🏆", "🛍️", "🐵", "✨"];

const LeagueBadge = ({ league, size = "sm", state = "future" }: {
  league: LeagueConfig;
  size?: "sm" | "lg";
  state?: "past" | "current" | "future";
}) => {
  const isLarge = size === "lg";
  return (
    <div
      className={`relative flex items-center justify-center rounded-[18px] border-2 transition-all ${
        isLarge ? "h-24 w-24 border-b-[8px]" : "h-12 w-12 border-b-4"
      } ${state === "current" ? "scale-105 shadow-sm" : state === "future" ? "opacity-45" : "opacity-85"}`}
      style={{ backgroundColor: league.surface, borderColor: league.border, color: league.color }}
      title={`${league.name} League`}
    >
      {state === "future" ? (
        <Lock className={isLarge ? "h-10 w-10" : "h-5 w-5"} />
      ) : (
        <Shield className={`${isLarge ? "h-12 w-12" : "h-6 w-6"} fill-current`} />
      )}
      {state === "past" && (
        <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#58cc02] text-white">
          <Check className="h-3 w-3 stroke-[3]" />
        </span>
      )}
    </div>
  );
};

const LeagueHeader = ({ currentLeague, timeLeft }: { currentLeague: LeagueConfig; timeLeft: string }) => (
  <section className="mt-7 flex flex-col items-center text-center">
    <h1 className="text-[30px] leading-9 font-extrabold text-[var(--text-primary)] sm:text-[36px] sm:leading-[42px]">
      {currentLeague.name} League
    </h1>
    <p className="mt-3 text-sm font-bold text-[var(--text-secondary)] sm:text-base">
      {currentLeague.promotionCount > 0
        ? `Top ${currentLeague.promotionCount} advance to the next league`
        : "Compete to stay in Diamond League!"}
    </p>
    <p className="mt-1 text-base font-extrabold text-[#ffc700]">{timeLeft.replace(" left", "")}</p>
  </section>
);

const LeagueProgression = ({ currentLeague }: { currentLeague: LeagueConfig }) => {
  const currentIndex = leagues.findIndex((league) => league.id === currentLeague.id);
  const startIndex = Math.min(Math.max(currentIndex - 3, 0), Math.max(leagues.length - 5, 0));
  const visibleLeagues = leagues.slice(startIndex, startIndex + 5);

  return (
  <nav aria-label="League progression" className="pb-1">
    <div className="flex items-center justify-center gap-5 sm:gap-7">
      {visibleLeagues.map((league) => {
        const state =
          league.order < currentLeague.order ? "past" : league.order === currentLeague.order ? "current" : "future";
        return (
          <button
            key={league.id}
            type="button"
            className={`flex h-[68px] w-[68px] shrink-0 items-center justify-center rounded-[20px] border-0 transition-all hover:-translate-y-0.5 ${
              state === "current"
                ? "scale-105 bg-transparent"
                : "bg-transparent"
            }`}
            aria-label={`${league.name} league ${state}`}
            aria-current={state === "current" ? "step" : undefined}
            title={`${league.name} League`}
          >
            <LeagueBadge league={league} state={state} />
          </button>
        );
      })}
    </div>
  </nav>
  );
};

const ZoneDivider = ({ type }: { type: "promotion" | "demotion" }) => {
  const isPromotion = type === "promotion";
  return (
    <div className={`flex items-center gap-4 py-4 text-center text-sm font-extrabold uppercase tracking-[0.08em] ${isPromotion ? "text-[#58cc02]" : "text-[#ee5555]"}`}>
      <span className="h-px flex-1 bg-[var(--border)]" />
      {isPromotion ? <ArrowUp className="h-5 w-5 fill-current" /> : <ArrowDown className="h-5 w-5 fill-current" />}
      <span className="whitespace-nowrap">{isPromotion ? "Promotion Zone" : "Demotion Zone"}</span>
      {isPromotion ? <ArrowUp className="h-5 w-5 fill-current" /> : <ArrowDown className="h-5 w-5 fill-current" />}
      <span className="h-px flex-1 bg-[var(--border)]" />
    </div>
  );
};

const LeaderboardRow = ({
  entry,
  currentLeague,
  demotionStart,
}: {
  entry: LeaderboardEntry;
  currentLeague: LeagueConfig;
  demotionStart: number | null;
}) => {
  const isPromotionRank = entry.rank <= currentLeague.promotionCount;
  const isDemotionRank = demotionStart !== null && entry.rank >= demotionStart;

  return (
  <div
    className={`grid grid-cols-[32px_44px_minmax(0,1fr)_auto] items-center gap-3 rounded-2xl px-3 py-3 transition-colors sm:grid-cols-[44px_52px_minmax(0,1fr)_auto] sm:gap-4 sm:px-5 ${
      entry.is_current_user ? "bg-[var(--surface-secondary)]" : "hover:bg-[var(--surface-secondary)]"
    }`}
  >
    <div
      className={`text-center text-base font-extrabold ${isPromotionRank ? "text-[#58cc02]" : isDemotionRank ? "text-[#ee5555]" : "text-[var(--text-secondary)]"}`}
    >
      {entry.rank}
    </div>
    <div className="flex h-11 w-11 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface-secondary)] text-lg font-bold text-[var(--text-primary)]">
      {entry.avatar}
    </div>
    <div className="min-w-0">
      <div className="flex items-center gap-2">
        <p className="truncate text-base font-extrabold text-[var(--text-primary)]">{entry.name}</p>
        {entry.is_current_user && (
          <span className="rounded-lg bg-[#1cb0f6] px-2 py-0.5 text-[11px] font-extrabold uppercase text-white">
            You
          </span>
        )}
      </div>
      <p className="truncate text-sm font-medium text-[var(--text-secondary)]">@{entry.username}</p>
    </div>
    <p className={`whitespace-nowrap text-sm font-extrabold sm:text-base ${isDemotionRank && entry.is_current_user ? "text-[#ee5555]" : "text-[var(--text-primary)]"}`}>
      {entry.xp} XP
    </p>
  </div>
  );
};

const LeaderboardList = ({ entries, currentLeague }: { entries: LeaderboardEntry[]; currentLeague: LeagueConfig }) => {
  const demotionStart =
    currentLeague.demotionCount > 0
      ? Math.max(currentLeague.promotionCount + 2, entries.length - currentLeague.demotionCount + 1)
      : null;

  return (
    <section aria-label="League leaderboard" className="mt-7">
      {entries.map((entry, index) => (
        <React.Fragment key={entry.id}>
          {index === currentLeague.promotionCount && currentLeague.promotionCount > 0 && <ZoneDivider type="promotion" />}
          {demotionStart === entry.rank && <ZoneDivider type="demotion" />}
          <LeaderboardRow entry={entry} currentLeague={currentLeague} demotionStart={demotionStart} />
        </React.Fragment>
      ))}
    </section>
  );
};

const StatusPanel = () => {
  const [selectedStatus, setSelectedStatus] = useState(
    () => (typeof window !== "undefined" && window.localStorage.getItem("duo-status")) || "😎"
  );

  const selectStatus = (status: string) => {
    sound.playClick();
    setSelectedStatus(status);
    window.localStorage.setItem("duo-status", status);
  };

  return (
    <aside className="space-y-8">
      <section className="rounded-[20px] border-2 border-[var(--border)] bg-[var(--surface)] p-5">
        <h2 className="text-xl font-extrabold text-[var(--text-primary)]">Set your status</h2>
        <div className="mt-6 flex items-center justify-center">
          <div className="relative flex h-24 w-24 items-center justify-center rounded-full border-2 border-dashed border-[#52656d] text-4xl">
            {selectedStatus}
            <span className="absolute bottom-2 right-1 h-4 w-4 rounded-full bg-[#58cc02]" />
          </div>
        </div>
        <div className="mt-6 grid grid-cols-6 gap-2">
          {statusOptions.map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => selectStatus(status)}
              className={`flex h-11 w-11 items-center justify-center rounded-xl border-2 text-xl transition-transform hover:-translate-y-0.5 ${
                selectedStatus === status
                  ? "border-[#58cc02] bg-[#d7ffb8]"
                  : "border-[var(--border)] bg-[var(--surface-secondary)]"
              }`}
              aria-label={`Set status ${status}`}
            >
              {status}
            </button>
          ))}
        </div>
      </section>
    </aside>
  );
};

export default function LeaderboardsPage() {
  const {
    user,
    leaderboard,
    currentLeague,
    entries,
    refillHearts: handleRefillHearts,
    simulateStreak: handleSimulateStreak,
    deductHeart: handleDeductHeart,
    resetProgress: handleResetProgress,
  } = useLeaderboardController();
  const [showStreakModal, setShowStreakModal] = useState(false);
  const [showHeartsModal, setShowHeartsModal] = useState(false);
  const [showDevModal, setShowDevModal] = useState(false);

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--text-primary)] transition-colors">
      <div className="flex">
        <Sidebar onOpenDevTools={() => setShowDevModal(true)} />
        <div className="flex-1 min-[700px]:ml-[var(--duo-sidebar-width)] flex min-h-screen flex-col">
          <TopBar
            user={user}
            onOpenStreakModal={() => setShowStreakModal(true)}
            onOpenHeartsModal={() => setShowHeartsModal(true)}
          />

          <main className="mx-auto grid w-full max-w-[1180px] grid-cols-1 gap-8 px-4 pb-24 pt-6 sm:px-6 lg:grid-cols-[minmax(0,760px)_340px] lg:gap-10 lg:px-8">
            <div>
              <LeagueProgression currentLeague={currentLeague} />
              <LeagueHeader currentLeague={currentLeague} timeLeft={leaderboard?.time_left || "2 days left"} />
              <LeaderboardList entries={entries} currentLeague={currentLeague} />
            </div>
            <div className="lg:pt-8">
              <StatusPanel />
            </div>
          </main>
        </div>
      </div>

      <StreakModal isOpen={showStreakModal} onClose={() => setShowStreakModal(false)} user={user} onSimulateStreak={handleSimulateStreak} />
      <HeartsModal isOpen={showHeartsModal} onClose={() => setShowHeartsModal(false)} user={user} onRefill={handleRefillHearts} />
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
