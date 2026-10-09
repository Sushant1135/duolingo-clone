"use client";

import React from "react";
import Link from "next/link";
import { Flame, Gem, Heart } from "lucide-react";
import { User } from "@/models/api";
import { sound } from "@/services/audio";

type CefrLevel = "A1" | "A2";

interface TopBarProps {
  user: User | null;
  cefrLevel?: CefrLevel;
  onOpenStreakModal: () => void;
  onOpenHeartsModal: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  user,
  cefrLevel = "A1",
  onOpenStreakModal,
  onOpenHeartsModal,
}) => {
  return (
    <header className="min-h-[var(--duo-topbar-height)] bg-white dark:bg-[#101f24] border-b border-[#e5e5e5] dark:border-[#2e4550] z-20 px-4 py-3 xl:px-0 xl:py-2 flex items-center justify-end transition-colors">
      <div className="flex items-center gap-3 sm:gap-6">
        <span className="flex h-9 w-12 items-center justify-center rounded-md border-2 border-white bg-[#ef4444] shadow-sm overflow-hidden" aria-label="German course">
          <span className="flex h-full w-full flex-col">
            <span className="flex-1 bg-[#111827]" />
            <span className="flex-1 bg-[#ef4444]" />
            <span className="flex-1 bg-[#facc15]" />
          </span>
        </span>
        <span
          className="font-extrabold text-sm uppercase tracking-wide text-[#777777] dark:text-[#d7e1e8]"
          aria-label={`German course level ${cefrLevel}`}
          title={`German course level ${cefrLevel}`}
        >
          {cefrLevel}
        </span>

        <button
          onClick={() => {
            sound.playClick();
            onOpenStreakModal();
          }}
          className="flex items-center gap-2 rounded-xl px-1.5 py-1 hover:bg-[#fff4e5] dark:hover:bg-[#2b211a] transition-colors group"
          title="Streak details"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#ff9600] border-b-4 border-[#d97800]">
            <Flame className="w-6 h-6 text-white fill-white group-hover:scale-110 transition-transform" />
          </span>
          <span className="font-extrabold text-base text-[#ff9600]">{user?.streak ?? 0}</span>
        </button>

        <Link
          href="/shop"
          onClick={() => sound.playClick()}
          className="flex items-center gap-2 rounded-xl px-1.5 py-1 hover:bg-[#eef9ff] dark:hover:bg-[#1b3848] transition-colors group"
          title="Gems and shop"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#1cb0f6] border-b-4 border-[#1687bd]">
            <Gem className="w-6 h-6 text-white fill-white group-hover:scale-110 transition-transform" />
          </span>
          <span className="font-extrabold text-base text-[#1cb0f6]">{user?.gems ?? 0}</span>
        </Link>

        <button
          onClick={() => {
            sound.playClick();
            onOpenHeartsModal();
          }}
          className="hidden sm:flex items-center gap-2 rounded-xl px-1.5 py-1 hover:bg-[#ffebee] dark:hover:bg-[#381418] transition-colors group"
          title="Hearts refill"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#ff4b4b] border-b-4 border-[#d83a3a]">
            <Heart className="w-6 h-6 text-white fill-white group-hover:scale-110 transition-transform" />
          </span>
          <span className="font-extrabold text-base text-[#ff4b4b]">{user?.hearts ?? 0}</span>
        </button>

      </div>
    </header>
  );
};
