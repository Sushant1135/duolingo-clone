"use client";

import React from "react";
import { X, Wrench, RotateCcw, Plus, Minus, Volume2, Sparkles } from "lucide-react";
import { sound } from "@/services/audio";
import { StreakIcon } from "@/shared/views/components/StreakIcon";

interface DevBarProps {
  isOpen: boolean;
  onClose: () => void;
  onSimulateStreak: (action: "advance_day" | "miss_day" | "freeze" | "reset") => void;
  onRefillHearts: (method: "gems" | "practice" | "free") => void;
  onDeductHeart: () => void;
  onResetProgress: () => void;
}

export const DevBar: React.FC<DevBarProps> = ({
  isOpen,
  onClose,
  onSimulateStreak,
  onRefillHearts,
  onDeductHeart,
  onResetProgress,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border-2 border-[#e5e5e5] relative">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#e5e5e5] mb-5">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#fff4e5] text-[#ff9600]">
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-lg text-[#4b4b4b]">
                SDE Evaluation & Dev Controls
              </h3>
              <p className="text-xs text-[#777777]">
                Quick tools to test gamification loops & states
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="text-[#afafaf] hover:text-[#4b4b4b] p-1 rounded-full transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Control Grid */}
        <div className="space-y-4">
          {/* Hearts Section */}
          <div>
            <h4 className="font-extrabold text-xs uppercase tracking-wider text-[#777777] mb-2">
              Hearts System
            </h4>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  sound.playIncorrect();
                  onDeductHeart();
                }}
                className="p-3 rounded-xl border border-[#e5e5e5] hover:border-[#ff4b4b] bg-white hover:bg-[#fff5f5] flex items-center gap-2 text-xs font-bold text-[#ff4b4b] transition-colors"
              >
                <Minus className="w-4 h-4" />
                <span>Lose 1 Heart</span>
              </button>
              <button
                onClick={() => {
                  sound.playCorrect();
                  onRefillHearts("free");
                }}
                className="p-3 rounded-xl border border-[#e5e5e5] hover:border-[#58cc02] bg-white hover:bg-[#f3fce8] flex items-center gap-2 text-xs font-bold text-[#58cc02] transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Refill 5 Hearts</span>
              </button>
            </div>
          </div>

          {/* Streak Section */}
          <div>
            <h4 className="font-extrabold text-xs uppercase tracking-wider text-[#777777] mb-2">
              Streak Simulator
            </h4>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  sound.playCorrect();
                  onSimulateStreak("advance_day");
                }}
                className="p-3 rounded-xl border border-[#e5e5e5] hover:border-[#ff9600] bg-white hover:bg-[#fff9f0] flex items-center gap-2 text-xs font-bold text-[#ff9600] transition-colors"
              >
                <StreakIcon className="h-4 w-4" />
                <span>Advance Day</span>
              </button>
              <button
                onClick={() => {
                  sound.playClick();
                  onSimulateStreak("freeze");
                }}
                className="p-3 rounded-xl border border-[#e5e5e5] hover:border-[#1cb0f6] bg-white hover:bg-[#f0f9ff] flex items-center gap-2 text-xs font-bold text-[#1cb0f6] transition-colors"
              >
                <Sparkles className="w-4 h-4" />
                <span>Add Streak Freeze</span>
              </button>
            </div>
          </div>

          {/* Audio & Reset */}
          <div>
            <h4 className="font-extrabold text-xs uppercase tracking-wider text-[#777777] mb-2">
              Audio & Course Reset
            </h4>
            <div className="space-y-2">
              <button
                onClick={() => {
                  sound.playLessonComplete();
                }}
                className="w-full p-2.5 rounded-xl border border-[#e5e5e5] hover:bg-[#f7f7f7] flex items-center justify-center gap-2 text-xs font-bold text-[#4b4b4b] transition-colors"
              >
                <Volume2 className="w-4 h-4 text-[#58cc02]" />
                <span>Test Duolingo Fanfare Sound</span>
              </button>
              <button
                onClick={() => {
                  sound.playClick();
                  if (confirm("Reset all lesson completions back to the beginning of the course?")) {
                    onResetProgress();
                    onClose();
                  }
                }}
                className="w-full p-2.5 rounded-xl border border-red-200 bg-red-50 hover:bg-red-100 flex items-center justify-center gap-2 text-xs font-bold text-red-600 transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Reset Learner Progress to Start</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-[#e5e5e5] flex justify-end">
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="px-5 py-2 rounded-xl duo-btn-white font-extrabold text-xs uppercase tracking-wider"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
