"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Volume2, VolumeX, Flame, Heart, Gem, Moon, Sun } from "lucide-react";
import { User } from "@/lib/api";
import { sound } from "@/lib/audio";

interface TopBarProps {
  user: User | null;
  onOpenStreakModal: () => void;
  onOpenHeartsModal: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  user,
  onOpenStreakModal,
  onOpenHeartsModal,
}) => {
  const [isMuted, setIsMuted] = useState(false);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // Check initial saved theme or system preference
    const saved = localStorage.getItem("duo-theme");
    if (saved === "dark") {
      setIsDark(true);
      document.body.classList.add("dark-mode");
      document.documentElement.classList.add("dark");
    }
  }, []);

  const toggleTheme = () => {
    sound.playClick();
    const nextDark = !isDark;
    setIsDark(nextDark);
    if (nextDark) {
      document.body.classList.add("dark-mode");
      document.documentElement.classList.add("dark");
      localStorage.setItem("duo-theme", "dark");
    } else {
      document.body.classList.remove("dark-mode");
      document.documentElement.classList.remove("dark");
      localStorage.setItem("duo-theme", "light");
    }
  };

  const toggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    sound.setMuted(nextMuted);
    if (!nextMuted) sound.playClick();
  };

  return (
    <header className="sticky top-0 bg-white/95 dark:bg-[#131f24]/95 backdrop-blur-md border-b-2 border-[#e5e5e5] dark:border-[#2e4550] z-20 px-4 py-3 flex items-center justify-between transition-colors">
      {/* Current Course Selector */}
      <div className="flex items-center gap-2 cursor-pointer hover:bg-[#f7f7f7] dark:hover:bg-[#1b2e35] px-3 py-1.5 rounded-xl border border-transparent hover:border-[#e5e5e5] dark:hover:border-[#2e4550] transition-all">
        <span className="text-2xl" role="img" aria-label="Spanish">🇪🇸</span>
        <span className="font-extrabold text-xs uppercase tracking-wider text-[#777777] dark:text-[#8b9eab] hidden sm:inline">
          Spanish
        </span>
      </div>

      {/* Stats Cluster: Streak, Gems, Hearts, Dark Mode, Audio */}
      <div className="flex items-center gap-2 sm:gap-4">
        {/* Streak Button */}
        <button
          onClick={() => {
            sound.playClick();
            onOpenStreakModal();
          }}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl hover:bg-[#fff4e5] dark:hover:bg-[#2b211a] transition-colors group"
          title="Streak Details"
        >
          <Flame className="w-5 h-5 text-[#ff9600] fill-[#ff9600] group-hover:scale-110 transition-transform" />
          <span className="font-extrabold text-sm text-[#ff9600]">
            {user ? user.streak : 0}
          </span>
        </button>

        {/* Gems Button */}
        <Link
          href="/shop"
          onClick={() => sound.playClick()}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl hover:bg-[#eef9ff] dark:hover:bg-[#1b3848] transition-colors group"
          title="Gems & Shop"
        >
          <Gem className="w-5 h-5 text-[#1cb0f6] fill-[#1cb0f6] group-hover:scale-110 transition-transform" />
          <span className="font-extrabold text-sm text-[#1cb0f6]">
            {user ? user.gems : 0}
          </span>
        </Link>

        {/* Hearts Button */}
        <button
          onClick={() => {
            sound.playClick();
            onOpenHeartsModal();
          }}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl hover:bg-[#ffebee] dark:hover:bg-[#381418] transition-colors group"
          title="Hearts Refill"
        >
          <Heart
            className={`w-5 h-5 ${
              (user?.hearts ?? 5) > 0
                ? "text-[#ff4b4b] fill-[#ff4b4b]"
                : "text-[#afafaf] fill-[#afafaf]"
            } group-hover:scale-110 transition-transform`}
          />
          <span
            className={`font-extrabold text-sm ${
              (user?.hearts ?? 5) > 0 ? "text-[#ff4b4b]" : "text-[#afafaf]"
            }`}
          >
            {user ? user.hearts : 0}
          </span>
        </button>

        {/* Theme Toggle (Dark / Light Mode) */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl text-[#777777] dark:text-[#8b9eab] hover:bg-[#f7f7f7] dark:hover:bg-[#1b2e35] transition-colors"
          title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
        >
          {isDark ? (
            <Sun className="w-5 h-5 text-[#ffc800]" />
          ) : (
            <Moon className="w-5 h-5 text-[#777777]" />
          )}
        </button>

        {/* Audio Toggle */}
        <button
          onClick={toggleMute}
          className="p-2 rounded-xl text-[#afafaf] hover:text-[#4b4b4b] dark:hover:text-white hover:bg-[#f7f7f7] dark:hover:bg-[#1b2e35] transition-colors"
          title={isMuted ? "Unmute Audio" : "Mute Audio"}
        >
          {isMuted ? (
            <VolumeX className="w-5 h-5 text-[#afafaf]" />
          ) : (
            <Volume2 className="w-5 h-5 text-[#58cc02]" />
          )}
        </button>
      </div>
    </header>
  );
};
