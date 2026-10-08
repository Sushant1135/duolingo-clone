"use client";

import React, { useState, useEffect } from "react";
import { Sidebar } from "@/components/Sidebar";
import { TopBar } from "@/components/TopBar";
import { StreakModal } from "@/components/StreakModal";
import { HeartsModal } from "@/components/HeartsModal";
import { DevBar } from "@/components/DevBar";
import { api, User, LeaderboardData } from "@/lib/api";
import { Shield, Trophy, ArrowUp, ArrowDown, Sparkles } from "lucide-react";
import { sound } from "@/lib/audio";

export default function LeaderboardsPage() {
  const [user, setUser] = useState<User | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardData | null>(null);
  const [loading, setLoading] = useState(true);

  const [showStreakModal, setShowStreakModal] = useState(false);
  const [showHeartsModal, setShowHeartsModal] = useState(false);
  const [showDevModal, setShowDevModal] = useState(false);

  useEffect(() => {
    Promise.all([api.getUser(), api.getLeaderboard()])
      .then(([u, lb]) => {
        setUser(u);
        setLeaderboard(lb);
      })
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  }, []);

  const leagues = [
    { name: "Bronze", color: "#cd7f32" },
    { name: "Silver", color: "#a0a0a0", active: true },
    { name: "Gold", color: "#ffc800" },
    { name: "Sapphire", color: "#1cb0f6" },
    { name: "Ruby", color: "#ff4b4b" },
    { name: "Emerald", color: "#58cc02" },
    { name: "Diamond", color: "#ce82ff" },
  ];

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

          <main className="flex-1 max-w-2xl w-full mx-auto p-4 sm:p-8">
            {/* League Header */}
            <div className="flex flex-col items-center text-center mb-8">
              <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-[#9e9e9e] to-[#e0e0e0] flex items-center justify-center shadow-md mb-3 border-4 border-white">
                <Trophy className="w-14 h-14 text-white drop-shadow" />
              </div>
              <h1 className="text-3xl font-extrabold text-[#4b4b4b]">
                {leaderboard?.league || "Silver"} League
              </h1>
              <p className="text-xs font-bold text-[#777777] uppercase tracking-wider mt-1">
                Top 3 advance to the next league! • {leaderboard?.time_left || "2 days left"}
              </p>

              {/* League Step Icons */}
              <div className="flex items-center gap-2 mt-5 overflow-x-auto py-2">
                {leagues.map((lg) => (
                  <div
                    key={lg.name}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border-2 text-xs font-extrabold ${
                      lg.name === (leaderboard?.league || "Silver")
                        ? "bg-[#ddf4ff] border-[#84d8ff] text-[#1cb0f6] scale-105 shadow-sm"
                        : "bg-[#f7f7f7] border-[#e5e5e5] text-[#afafaf]"
                    }`}
                  >
                    <Shield className="w-3.5 h-3.5" style={{ color: lg.color }} />
                    <span>{lg.name}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Standings Table */}
            <div className="rounded-3xl border-2 border-[#e5e5e5] overflow-hidden shadow-sm divide-y-2 divide-[#e5e5e5]">
              {leaderboard?.entries.map((entry) => {
                const isPromotion = entry.rank <= 3;
                const isDemotion = entry.rank >= 8;

                return (
                  <div
                    key={entry.id}
                    className={`flex items-center justify-between p-4 transition-colors ${
                      entry.is_current_user
                        ? "bg-[#ddf4ff] text-[#1cb0f6] font-extrabold"
                        : "hover:bg-[#fcfcfc] text-[#4b4b4b]"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {/* Rank Indicator */}
                      <div className="w-7 text-center font-extrabold text-sm">
                        {entry.rank === 1 ? (
                          <span className="text-xl">🥇</span>
                        ) : entry.rank === 2 ? (
                          <span className="text-xl">🥈</span>
                        ) : entry.rank === 3 ? (
                          <span className="text-xl">🥉</span>
                        ) : (
                          <span className={entry.is_current_user ? "text-[#1cb0f6]" : "text-[#afafaf]"}>
                            {entry.rank}
                          </span>
                        )}
                      </div>

                      {/* Avatar */}
                      <div className="w-10 h-10 rounded-xl bg-white border border-[#e5e5e5] flex items-center justify-center text-xl shadow-xs">
                        {entry.avatar}
                      </div>

                      {/* Name & Status */}
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-extrabold text-sm">{entry.name}</p>
                          {entry.is_current_user && (
                            <span className="text-[10px] bg-[#1cb0f6] text-white px-2 py-0.5 rounded-md uppercase font-extrabold">
                              You
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-[#777777]">@{entry.username}</p>
                      </div>
                    </div>

                    {/* XP & Zone Flag */}
                    <div className="flex items-center gap-3">
                      {isPromotion && (
                        <div className="hidden sm:flex items-center gap-1 text-[11px] font-extrabold text-[#58cc02] bg-[#f3fce8] px-2 py-1 rounded-lg">
                          <ArrowUp className="w-3 h-3" />
                          <span>Promotion</span>
                        </div>
                      )}
                      {isDemotion && (
                        <div className="hidden sm:flex items-center gap-1 text-[11px] font-extrabold text-[#ff4b4b] bg-[#ffebee] px-2 py-1 rounded-lg">
                          <ArrowDown className="w-3 h-3" />
                          <span>Demotion</span>
                        </div>
                      )}
                      <span className="font-extrabold text-sm">{entry.xp} XP</span>
                    </div>
                  </div>
                );
              })}
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
