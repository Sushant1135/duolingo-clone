"use client";

import React from "react";
import { X, Flame, ShieldCheck, Check } from "lucide-react";
import { User } from "@/lib/api";
import { sound } from "@/lib/audio";

interface StreakModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  onSimulateStreak: (action: "advance_day" | "freeze") => void;
}

export const StreakModal: React.FC<StreakModalProps> = ({
  isOpen,
  onClose,
  user,
  onSimulateStreak,
}) => {
  if (!isOpen) return null;

  const daysOfWeek = ["M", "T", "W", "T", "F", "S", "S"];
  const currentDayIndex = 3; // Simulated today

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-sm w-full p-6 text-center shadow-2xl border-2 border-[#e5e5e5] relative animate-fade-in">
        {/* Close Button */}
        <button
          onClick={() => {
            sound.playClick();
            onClose();
          }}
          className="absolute right-4 top-4 text-[#afafaf] hover:text-[#4b4b4b] p-1 rounded-full transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Flame Graphic */}
        <div className="w-20 h-20 mx-auto rounded-3xl bg-[#fff4e5] border-2 border-[#ff9600] flex items-center justify-center mb-4 shadow-sm animate-bounce-subtle">
          <Flame className="w-12 h-12 text-[#ff9600] fill-[#ff9600]" />
        </div>

        <h2 className="text-2xl font-extrabold text-[#4b4b4b] mb-1">
          {user?.streak || 0} Day Streak!
        </h2>
        <p className="text-xs text-[#777777] mb-6">
          Practice every day to keep your streak alive and build fluency!
        </p>

        {/* 7-Day Calendar Streak Tracker */}
        <div className="p-4 rounded-2xl bg-[#f7f7f7] border border-[#e5e5e5] mb-6">
          <div className="flex justify-between items-center mb-2">
            {daysOfWeek.map((day, idx) => {
              const isPastOrToday = idx <= currentDayIndex;
              return (
                <div key={idx} className="flex flex-col items-center gap-1.5">
                  <span className="text-[11px] font-bold text-[#afafaf]">{day}</span>
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                      isPastOrToday
                        ? "bg-[#ff9600] text-white shadow-sm"
                        : "bg-[#e5e5e5] text-[#afafaf]"
                    }`}
                  >
                    {isPastOrToday ? <Check className="w-4 h-4 stroke-[3]" /> : ""}
                  </div>
                </div>
              );
            })}
          </div>
          <p className="text-[11px] font-semibold text-[#777777] mt-3">
            Last practiced: {user?.last_streak_date || "Today"}
          </p>
        </div>

        {/* Streak Freeze Status */}
        <div className="flex items-center justify-between p-3 rounded-xl border border-[#e5e5e5] bg-white mb-6 text-left">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-[#ddf4ff] text-[#1cb0f6]">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-[#4b4b4b]">Streak Freeze</p>
              <p className="text-[11px] text-[#777777]">Protects 1 inactive day</p>
            </div>
          </div>
          <span className="text-xs font-extrabold text-[#1cb0f6] bg-[#ddf4ff] px-2.5 py-1 rounded-lg">
            {user?.streak_freeze || 0} Equipped
          </span>
        </div>

        {/* Action / Evaluation Buttons */}
        <div className="space-y-2">
          <button
            onClick={() => {
              sound.playCorrect();
              onSimulateStreak("advance_day");
            }}
            className="w-full py-3 rounded-xl duo-btn-green font-extrabold text-xs uppercase tracking-wider"
          >
            Simulate Next Day Practice (+1 Streak)
          </button>
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="w-full py-2.5 rounded-xl duo-btn-white font-extrabold text-xs uppercase tracking-wider"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
