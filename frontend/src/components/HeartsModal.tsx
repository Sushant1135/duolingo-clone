"use client";

import React from "react";
import { X, Heart, Gem, Zap } from "lucide-react";
import { User } from "@/lib/api";
import { sound } from "@/lib/audio";

interface HeartsModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  onRefill: (method: "gems" | "practice" | "free") => void;
}

export const HeartsModal: React.FC<HeartsModalProps> = ({
  isOpen,
  onClose,
  user,
  onRefill,
}) => {
  if (!isOpen) return null;

  const currentHearts = user?.hearts ?? 5;
  const maxHearts = user?.max_hearts ?? 5;
  const gems = user?.gems ?? 0;
  const canAffordGems = gems >= 350;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-sm w-full p-6 text-center shadow-2xl border-2 border-[#e5e5e5] relative animate-fade-in">
        {/* Close */}
        <button
          onClick={() => {
            sound.playClick();
            onClose();
          }}
          className="absolute right-4 top-4 text-[#afafaf] hover:text-[#4b4b4b] p-1 rounded-full transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Big Heart Graphic */}
        <div className="w-20 h-20 mx-auto rounded-3xl bg-[#ffebee] border-2 border-[#ff4b4b] flex items-center justify-center mb-4 shadow-sm animate-bounce-subtle">
          <Heart className="w-12 h-12 text-[#ff4b4b] fill-[#ff4b4b]" />
        </div>

        <h2 className="text-2xl font-extrabold text-[#4b4b4b] mb-1">
          {currentHearts} / {maxHearts} Hearts
        </h2>
        <p className="text-xs text-[#777777] mb-6">
          Hearts allow you to complete lessons. Wrong answers cost 1 heart.
        </p>

        {/* 5 Heart Icons */}
        <div className="flex justify-center gap-2 mb-6">
          {Array.from({ length: maxHearts }).map((_, idx) => (
            <Heart
              key={idx}
              className={`w-7 h-7 transition-all ${
                idx < currentHearts
                  ? "text-[#ff4b4b] fill-[#ff4b4b] scale-105"
                  : "text-[#e5e5e5] fill-[#e5e5e5]"
              }`}
            />
          ))}
        </div>

        {/* Options */}
        <div className="space-y-3">
          {/* Refill with gems */}
          <button
            onClick={() => {
              if (canAffordGems) {
                sound.playCorrect();
                onRefill("gems");
              } else {
                sound.playIncorrect();
              }
            }}
            disabled={!canAffordGems || currentHearts === maxHearts}
            className={`w-full p-3.5 rounded-2xl flex items-center justify-between border-2 transition-all ${
              currentHearts === maxHearts
                ? "bg-[#f7f7f7] border-[#e5e5e5] opacity-60 cursor-not-allowed"
                : canAffordGems
                ? "duo-btn-blue"
                : "bg-[#f7f7f7] border-[#e5e5e5] opacity-60 cursor-not-allowed"
            }`}
          >
            <div className="text-left">
              <p className="font-extrabold text-sm">Refill Hearts (Full)</p>
              <p className="text-[11px] opacity-90">Restore all 5 hearts</p>
            </div>
            <div className="flex items-center gap-1 font-extrabold text-sm">
              <Gem className="w-4 h-4 fill-current" />
              <span>350</span>
            </div>
          </button>

          {/* Practice to earn 1 heart */}
          <button
            onClick={() => {
              sound.playCorrect();
              onRefill("practice");
            }}
            disabled={currentHearts === maxHearts}
            className={`w-full p-3.5 rounded-2xl flex items-center justify-between border-2 transition-all ${
              currentHearts === maxHearts
                ? "bg-[#f7f7f7] border-[#e5e5e5] opacity-60 cursor-not-allowed"
                : "duo-btn-green"
            }`}
          >
            <div className="text-left">
              <p className="font-extrabold text-sm">Practice Refill</p>
              <p className="text-[11px] opacity-90">Earn +1 heart for free</p>
            </div>
            <Zap className="w-5 h-5 fill-current" />
          </button>

          {/* Instant Dev Refill */}
          <button
            onClick={() => {
              sound.playCorrect();
              onRefill("free");
            }}
            className="w-full py-2.5 rounded-xl duo-btn-white font-extrabold text-xs uppercase tracking-wider text-[#777777]"
          >
            Instant Free Refill (Dev / Testing)
          </button>
        </div>
      </div>
    </div>
  );
};
