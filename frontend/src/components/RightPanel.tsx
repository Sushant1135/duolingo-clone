"use client";

import React from "react";
import Link from "next/link";
import { Shield, Target, Zap, Sparkles } from "lucide-react";
import { User, Quest, LeaderboardData } from "@/lib/api";
import { sound } from "@/lib/audio";

interface RightPanelProps {
  user: User | null;
  quests: Quest[];
  leaderboard: LeaderboardData | null;
  onClaimQuest: (questId: number) => void;
}

export const RightPanel: React.FC<RightPanelProps> = ({
  user,
  quests,
  leaderboard,
  onClaimQuest,
}) => {
  return (
    <aside className="hidden lg:flex flex-col gap-5 w-84 py-6 pr-6">
      {/* Super Duolingo Promo Card */}
      <div className="rounded-2xl border-2 border-[#e5e5e5] dark:border-[#2e4550] p-5 bg-gradient-to-br from-[#1a1a2e] to-[#16213e] text-white shadow-sm relative overflow-hidden">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-5 h-5 text-[#ffc800]" />
          <h3 className="font-extrabold text-sm uppercase tracking-wider text-[#ffc800]">
            Super Duolingo
          </h3>
        </div>
        <p className="text-xs text-slate-300 font-medium mb-4 leading-relaxed">
          Level up your Spanish with unlimited hearts, no interruptions, and personalized practice.
        </p>
        <button
          onClick={() => sound.playClick()}
          className="w-full py-2.5 rounded-xl bg-white text-[#1a1a2e] font-extrabold text-xs uppercase tracking-wider hover:bg-slate-100 transition-colors"
        >
          Try Free for 2 Weeks
        </button>
      </div>

      {/* Unlock / League Card */}
      <div className="rounded-2xl border-2 border-[#e5e5e5] dark:border-[#2e4550] p-5 bg-white dark:bg-[#1b2e35]">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-extrabold text-base text-[#4b4b4b] dark:text-white">
            {user?.league || "Silver"} League
          </h3>
          <Link
            href="/leaderboards"
            onClick={() => sound.playClick()}
            className="text-xs font-bold text-[#1cb0f6] uppercase tracking-wider hover:underline"
          >
            View League
          </Link>
        </div>

        <div className="flex items-center gap-3 p-3 rounded-xl bg-[#f7f7f7] dark:bg-[#131f24] mb-3 border border-transparent dark:border-[#203843]">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#afafaf] to-[#e5e5e5] dark:from-[#2e4550] dark:to-[#1b2e35] flex items-center justify-center text-xl shadow-inner">
            <Shield className="w-6 h-6 text-[#ff9600]" />
          </div>
          <div>
            <p className="text-xs font-bold text-[#4b4b4b] dark:text-white">
              Top 3 advance to Gold!
            </p>
            <p className="text-[11px] text-[#777777] dark:text-[#8b9eab]">
              {leaderboard ? leaderboard.time_left : "Season ending soon"}
            </p>
          </div>
        </div>

        {leaderboard && (
          <div className="space-y-2">
            {leaderboard.entries.slice(0, 3).map((entry) => (
              <div
                key={entry.id}
                className={`flex items-center justify-between text-xs px-2 py-1.5 rounded-lg ${
                  entry.is_current_user
                    ? "bg-[#ddf4ff] dark:bg-[#1b3848] font-extrabold text-[#1cb0f6]"
                    : "text-[#777777] dark:text-[#8b9eab]"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-[#afafaf] dark:text-[#557585] w-4">{entry.rank}</span>
                  <span className="text-base">{entry.avatar}</span>
                  <span className="truncate max-w-[110px] dark:text-white">{entry.name}</span>
                </div>
                <span className="font-bold">{entry.xp} XP</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Daily Quests Card */}
      <div className="rounded-2xl border-2 border-[#e5e5e5] dark:border-[#2e4550] p-5 bg-white dark:bg-[#1b2e35]">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-[#ff9600]" />
            <h3 className="font-extrabold text-base text-[#4b4b4b] dark:text-white">Daily Quests</h3>
          </div>
          <Link
            href="/quests"
            onClick={() => sound.playClick()}
            className="text-xs font-bold text-[#1cb0f6] uppercase tracking-wider hover:underline"
          >
            View All
          </Link>
        </div>

        <div className="space-y-4">
          {quests.slice(0, 3).map((quest) => {
            const pct = Math.min(100, Math.round((quest.current_progress / quest.target_progress) * 100));
            const isReady = quest.current_progress >= quest.target_progress && !quest.is_claimed;

            return (
              <div key={quest.id} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-[#4b4b4b] dark:text-white flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-[#ffc800] fill-[#ffc800]" />
                    {quest.title}
                  </span>
                  <span className="text-[#777777] dark:text-[#8b9eab] font-semibold text-[11px]">
                    {quest.current_progress}/{quest.target_progress}
                  </span>
                </div>

                {/* Progress bar with chest icon on end */}
                <div className="w-full h-3 rounded-full bg-[#e5e5e5] dark:bg-[#203843] overflow-hidden relative">
                  <div
                    className="h-full bg-[#ff9600] rounded-full transition-all duration-500"
                    style={{ width: `${pct}%` }}
                  />
                </div>

                {/* Claim button if complete */}
                {isReady && (
                  <button
                    onClick={() => {
                      sound.playCorrect();
                      onClaimQuest(quest.id);
                    }}
                    className="mt-1 w-full py-1.5 rounded-lg bg-[#58cc02] border-b-2 border-[#46a302] text-white font-extrabold text-xs uppercase tracking-wider hover:brightness-105 active:translate-y-[1px]"
                  >
                    Claim +{quest.reward_gems} Gems 💎
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </aside>
  );
};
