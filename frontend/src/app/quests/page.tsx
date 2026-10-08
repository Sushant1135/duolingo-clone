"use client";

import React, { useState, useEffect } from "react";
import confetti from "canvas-confetti";
import { Sidebar } from "@/components/Sidebar";
import { TopBar } from "@/components/TopBar";
import { StreakModal } from "@/components/StreakModal";
import { HeartsModal } from "@/components/HeartsModal";
import { DevBar } from "@/components/DevBar";
import { api, User, Quest } from "@/lib/api";
import { Target, Zap, Gem, CheckCircle, Sparkles } from "lucide-react";
import { sound } from "@/lib/audio";
import { DuoMascot } from "@/components/DuoMascot";

export default function QuestsPage() {
  const [user, setUser] = useState<User | null>(null);
  const [quests, setQuests] = useState<Quest[]>([]);
  const [loading, setLoading] = useState(true);

  const [showStreakModal, setShowStreakModal] = useState(false);
  const [showHeartsModal, setShowHeartsModal] = useState(false);
  const [showDevModal, setShowDevModal] = useState(false);

  const loadData = () => {
    Promise.all([api.getUser(), api.getQuests()])
      .then(([u, q]) => {
        setUser(u);
        setQuests(q);
      })
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleClaim = async (questId: number) => {
    try {
      sound.playLessonComplete();
      confetti({ particleCount: 70, spread: 60, origin: { y: 0.7 } });
      await api.claimQuest(questId);
      loadData();
    } catch (e: any) {
      alert(e.message || "Failed to claim");
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="flex">
        <Sidebar onOpenDevTools={() => setShowDevModal(true)} />

        <div className="flex-1 md:ml-64 flex flex-col min-h-screen">
          <TopBar
            user={user}
            onOpenStreakModal={() => setShowStreakModal(true)}
            onOpenHeartsModal={() => setShowHeartsModal(true)}
          />

          <main className="flex-1 max-w-2xl w-full mx-auto p-4 sm:p-8 space-y-8">
            {/* Monthly Challenge Banner */}
            <div className="rounded-3xl border-2 border-[#e5e5e5] p-6 bg-gradient-to-r from-[#ffe4d6] to-[#fff3eb] flex items-center justify-between gap-6 shadow-sm">
              <div className="space-y-2">
                <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#ff9600] bg-white px-2.5 py-1 rounded-full border border-[#ff9600]/30">
                  Monthly Challenge
                </span>
                <h2 className="text-2xl font-extrabold text-[#4b4b4b]">
                  Duo's Explorer Quest
                </h2>
                <p className="text-xs font-semibold text-[#777777] max-w-sm leading-relaxed">
                  Complete daily quests throughout the month to unlock the prestigious Explorer Badge and 200 gems!
                </p>
                <div className="flex items-center gap-2 pt-2">
                  <div className="w-48 h-3.5 rounded-full bg-white overflow-hidden border border-[#e5e5e5]">
                    <div className="h-full bg-[#ff9600] rounded-full w-2/5" />
                  </div>
                  <span className="text-xs font-extrabold text-[#4b4b4b]">12/30</span>
                </div>
              </div>

              <DuoMascot mood="happy" size={120} className="shrink-0 hidden sm:inline-flex" />
            </div>

            {/* Daily Quests Header */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Target className="w-6 h-6 text-[#ff9600]" />
                  <h3 className="text-xl font-extrabold text-[#4b4b4b]">
                    Daily Quests
                  </h3>
                </div>
                <span className="text-xs font-bold text-[#777777]">
                  Resets in 8 hours
                </span>
              </div>

              <div className="space-y-4">
                {quests.map((quest) => {
                  const pct = Math.min(
                    100,
                    Math.round((quest.current_progress / quest.target_progress) * 100)
                  );
                  const isCompleted = quest.current_progress >= quest.target_progress;

                  return (
                    <div
                      key={quest.id}
                      className="p-5 rounded-2xl border-2 border-[#e5e5e5] bg-white shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="flex items-start gap-4 flex-1">
                        <div className="w-12 h-12 rounded-2xl bg-[#fff4e5] border border-[#ff9600]/30 flex items-center justify-center shrink-0">
                          <Zap className="w-6 h-6 text-[#ff9600] fill-[#ff9600]" />
                        </div>
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center justify-between">
                            <h4 className="font-extrabold text-base text-[#4b4b4b]">
                              {quest.title}
                            </h4>
                            <span className="text-xs font-extrabold text-[#777777]">
                              {quest.current_progress} / {quest.target_progress}
                            </span>
                          </div>
                          <p className="text-xs text-[#777777] font-medium">
                            {quest.description}
                          </p>

                          {/* Progress bar */}
                          <div className="w-full h-3 rounded-full bg-[#e5e5e5] overflow-hidden">
                            <div
                              className="h-full bg-[#ff9600] rounded-full transition-all duration-500"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Reward button or Claim */}
                      <div className="sm:w-36 shrink-0 flex justify-end">
                        {quest.is_claimed ? (
                          <div className="flex items-center gap-1.5 text-xs font-extrabold text-[#58cc02] bg-[#f3fce8] px-3 py-2 rounded-xl border border-[#b8f28b]">
                            <CheckCircle className="w-4 h-4" />
                            <span>Claimed</span>
                          </div>
                        ) : isCompleted ? (
                          <button
                            onClick={() => handleClaim(quest.id)}
                            className="w-full py-2.5 rounded-xl duo-btn-green font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5"
                          >
                            <Gem className="w-4 h-4 fill-current" />
                            <span>Claim +{quest.reward_gems}</span>
                          </button>
                        ) : (
                          <div className="flex items-center gap-1 text-xs font-extrabold text-[#1cb0f6] bg-[#ddf4ff] px-3 py-2 rounded-xl">
                            <Gem className="w-4 h-4 fill-current" />
                            <span>{quest.reward_gems} Gems</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </main>
        </div>
      </div>

      <StreakModal
        isOpen={showStreakModal}
        onClose={() => setShowStreakModal(false)}
        user={user}
        onSimulateStreak={() => {}}
      />
      <HeartsModal
        isOpen={showHeartsModal}
        onClose={() => setShowHeartsModal(false)}
        user={user}
        onRefill={() => {}}
      />
      <DevBar
        isOpen={showDevModal}
        onClose={() => setShowDevModal(false)}
        onSimulateStreak={() => {}}
        onRefillHearts={() => {}}
        onDeductHeart={() => {}}
        onResetProgress={() => {}}
      />
    </div>
  );
}
