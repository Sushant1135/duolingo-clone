"use client";

import React, { useState, useEffect } from "react";
import { Sidebar } from "@/components/Sidebar";
import { TopBar } from "@/components/TopBar";
import { StreakModal } from "@/components/StreakModal";
import { HeartsModal } from "@/components/HeartsModal";
import { DevBar } from "@/components/DevBar";
import { api, User, Achievement } from "@/lib/api";
import { Flame, Zap, Shield, Crown, Award, Trophy, RotateCcw } from "lucide-react";
import { sound } from "@/lib/audio";

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);

  const [showStreakModal, setShowStreakModal] = useState(false);
  const [showHeartsModal, setShowHeartsModal] = useState(false);
  const [showDevModal, setShowDevModal] = useState(false);

  const loadData = () => {
    Promise.all([api.getUser(), api.getAchievements()])
      .then(([u, a]) => {
        setUser(u);
        setAchievements(a);
      })
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleReset = async () => {
    if (confirm("Reset your learning progress and return to Lesson 1?")) {
      try {
        await api.resetProgress();
        sound.playCorrect();
        loadData();
      } catch (e) {
        console.error(e);
      }
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
            {/* Profile Header */}
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 pb-6 border-b-2 border-[#e5e5e5]">
              <div className="w-24 h-24 rounded-3xl bg-[#f7f7f7] border-2 border-[#e5e5e5] flex items-center justify-center text-5xl shadow-sm">
                {user?.avatar || "🦉"}
              </div>

              <div className="text-center sm:text-left space-y-1">
                <h1 className="text-2xl font-extrabold text-[#4b4b4b]">
                  {user?.name || "Learner"}
                </h1>
                <p className="text-sm font-semibold text-[#777777]">
                  @{user?.username || "learner_alex"}
                </p>
                <div className="flex items-center gap-2 pt-2 text-xs font-semibold text-[#afafaf]">
                  <span>Joined October 2026</span>
                  <span>•</span>
                  <span>Learning Spanish 🇪🇸</span>
                </div>
              </div>
            </div>

            {/* Statistics Grid */}
            <div>
              <h3 className="font-extrabold text-lg text-[#4b4b4b] mb-4">Statistics</h3>
              <div className="grid grid-cols-2 gap-3">
                {/* Streak */}
                <div className="p-4 rounded-2xl border-2 border-[#e5e5e5] flex items-center gap-3">
                  <Flame className="w-7 h-7 text-[#ff9600] fill-[#ff9600]" />
                  <div>
                    <h4 className="font-extrabold text-lg text-[#4b4b4b]">
                      {user?.streak || 0}
                    </h4>
                    <p className="text-xs font-bold text-[#777777]">Day streak</p>
                  </div>
                </div>

                {/* Total XP */}
                <div className="p-4 rounded-2xl border-2 border-[#e5e5e5] flex items-center gap-3">
                  <Zap className="w-7 h-7 text-[#ffc800] fill-[#ffc800]" />
                  <div>
                    <h4 className="font-extrabold text-lg text-[#4b4b4b]">
                      {user?.xp || 0}
                    </h4>
                    <p className="text-xs font-bold text-[#777777]">Total XP</p>
                  </div>
                </div>

                {/* Current League */}
                <div className="p-4 rounded-2xl border-2 border-[#e5e5e5] flex items-center gap-3">
                  <Shield className="w-7 h-7 text-[#1cb0f6] fill-[#1cb0f6]" />
                  <div>
                    <h4 className="font-extrabold text-lg text-[#4b4b4b]">
                      {user?.league || "Silver"}
                    </h4>
                    <p className="text-xs font-bold text-[#777777]">Current league</p>
                  </div>
                </div>

                {/* Crowns */}
                <div className="p-4 rounded-2xl border-2 border-[#e5e5e5] flex items-center gap-3">
                  <Crown className="w-7 h-7 text-[#ffc800] fill-[#ffc800]" />
                  <div>
                    <h4 className="font-extrabold text-lg text-[#4b4b4b]">1</h4>
                    <p className="text-xs font-bold text-[#777777]">Crowns earned</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Achievements Showcase */}
            <div>
              <h3 className="font-extrabold text-lg text-[#4b4b4b] mb-4">Achievements</h3>
              <div className="space-y-3">
                {achievements.map((ach) => {
                  const pct = Math.min(100, Math.round((ach.progress / ach.goal) * 100));

                  return (
                    <div
                      key={ach.id}
                      className="p-4 rounded-2xl border-2 border-[#e5e5e5] flex items-center gap-4 bg-white"
                    >
                      <div className="w-14 h-14 rounded-2xl bg-[#fffdf0] border-2 border-[#ffc800] flex items-center justify-center shrink-0">
                        <Award className="w-8 h-8 text-[#ffc800]" />
                      </div>

                      <div className="flex-1 space-y-1.5">
                        <div className="flex items-center justify-between">
                          <h4 className="font-extrabold text-sm text-[#4b4b4b]">
                            {ach.title} (Level {ach.tier})
                          </h4>
                          <span className="text-xs font-bold text-[#777777]">
                            {ach.progress} / {ach.goal}
                          </span>
                        </div>
                        <p className="text-xs text-[#777777] font-medium">
                          {ach.description}
                        </p>
                        <div className="w-full h-3 rounded-full bg-[#e5e5e5] overflow-hidden">
                          <div
                            className="h-full bg-[#ffc800] rounded-full transition-all duration-500"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Course Reset */}
            <div className="pt-6 border-t-2 border-[#e5e5e5]">
              <button
                onClick={handleReset}
                className="w-full py-3 rounded-2xl border-2 border-red-200 bg-red-50 hover:bg-red-100 text-red-600 font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Reset Learner Progress (Fresh Demo)</span>
              </button>
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
