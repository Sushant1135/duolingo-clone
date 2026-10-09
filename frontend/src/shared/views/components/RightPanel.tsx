"use client";

import React from "react";
import Link from "next/link";
import { BriefcaseBusiness, Gem, Shield, Volume2, Zap } from "lucide-react";
import { User, Quest, LeaderboardData } from "@/models/api";
import { sound } from "@/services/audio";

interface RightPanelProps {
  user: User | null;
  quests?: Quest[];
  leaderboard: LeaderboardData | null;
  onClaimQuest: (questId: number) => void;
}

export const RightPanel: React.FC<RightPanelProps> = ({
  user,
  quests = [],
  leaderboard,
  onClaimQuest,
}) => {
  const currentUserRank =
    leaderboard?.entries.find((entry) => entry.is_current_user)?.rank ?? 12;

  return (
    <aside className="flex flex-col gap-4">
      <section className="rounded-2xl border-2 border-[#e5e5e5] dark:border-[#2e4550] p-4 bg-white dark:bg-[#101f24]">
        <div className="flex items-start justify-between gap-4">
          <h3 className="font-extrabold text-xl text-[#4b4b4b] dark:text-white leading-none">
            {user?.league || leaderboard?.league || "Bronze"} League
          </h3>
          <Link
            href="/leaderboards"
            onClick={() => sound.playClick()}
            className="text-sm font-extrabold text-[#1cb0f6] uppercase tracking-wider hover:underline"
          >
            View League
          </Link>
        </div>

        <div className="mt-5 flex items-center gap-4">
          <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-[#cd7f32] border-b-[6px] border-[#9f6126]">
            <Shield className="h-10 w-10 text-[#6f4219] fill-[#6f4219]" />
            <span className="absolute -right-2 -bottom-1 flex h-7 w-7 items-center justify-center rounded-full bg-[#ff4b4b] text-white font-extrabold">
              !
            </span>
          </div>
          <div className="min-w-0">
            <p className="text-base font-extrabold text-[#4b4b4b] dark:text-white">
              You&apos;re ranked <span className="text-[#ff4b4b]">#{currentUserRank}</span>
            </p>
            <p className="mt-2 text-sm font-semibold leading-snug text-[#777777] dark:text-[#d7e1e8]">
              Complete a lesson to climb the leaderboard.
            </p>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border-2 border-[#e5e5e5] dark:border-[#2e4550] p-4 bg-white dark:bg-[#101f24]">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-extrabold text-xl text-[#4b4b4b] dark:text-white">Daily Quests</h3>
          <Link
            href="/quests"
            onClick={() => sound.playClick()}
            className="text-sm font-extrabold text-[#1cb0f6] uppercase tracking-wider hover:underline"
          >
            View All
          </Link>
        </div>

        <div className="space-y-5">
          {quests.slice(0, 3).map((quest) => {
            const pct = Math.min(100, Math.round((quest.current_progress / quest.target_progress) * 100));
            const isReady = quest.current_progress >= quest.target_progress && !quest.is_claimed;

            return (
              <div key={quest.id} className="grid grid-cols-[48px_1fr_32px] items-center gap-3">
                <div className="flex items-center justify-center">
                  {quest.icon === "volume" || quest.title.toLowerCase().includes("listen") ? (
                    <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#1cb0f6] border-b-4 border-[#1687bd]">
                      <Volume2 className="h-6 w-6 text-white fill-white" />
                    </span>
                  ) : (
                    <Zap className="h-12 w-12 text-[#ffc800] fill-[#ffc800] stroke-[#ffc800]" />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="mb-2 truncate text-sm font-extrabold text-[#4b4b4b] dark:text-white">
                    {quest.title}
                  </p>
                  <div className="relative h-4 rounded-full bg-[#e5e5e5] dark:bg-[#3a4b53] overflow-hidden">
                    <div
                      className="h-full rounded-full bg-[#ffc800] transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                    <span className="absolute inset-0 flex items-center justify-center text-xs font-extrabold text-[#9a7a00] dark:text-[#cfd8dc]">
                      {quest.current_progress} / {quest.target_progress}
                    </span>
                  </div>
                </div>
                <BriefcaseBusiness className="h-8 w-8 text-[#c68642] fill-[#f4b06a]" />
                {isReady && (
                  <button
                    onClick={() => {
                      sound.playCorrect();
                      onClaimQuest(quest.id);
                    }}
                    className="col-span-3 mt-1 w-full py-2 rounded-xl bg-[#58cc02] border-b-4 border-[#46a302] text-white font-extrabold text-xs uppercase tracking-wider hover:brightness-105 active:translate-y-[1px] flex items-center justify-center gap-1"
                  >
                    <Gem className="w-3.5 h-3.5 fill-current" />
                    Claim +{quest.reward_gems}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </aside>
  );
};
