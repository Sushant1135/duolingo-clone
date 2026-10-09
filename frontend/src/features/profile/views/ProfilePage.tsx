"use client";

import React, { useRef, useState } from "react";
import Link from "next/link";
import { Sidebar } from "@/shared/views/components/Sidebar";
import { TopBar } from "@/shared/views/components/TopBar";
import { StreakModal } from "@/shared/views/components/StreakModal";
import { HeartsModal } from "@/shared/views/components/HeartsModal";
import { DevBar } from "@/shared/views/components/DevBar";
import { useProfileController } from "@/features/profile/controllers/useProfileController";
import {
  Flame,
  Zap,
  Shield,
  Crown,
  Award,
  RotateCcw,
  BarChart3,
  UserRound,
  Pencil,
  Search,
  ChevronRight,
} from "lucide-react";

export default function ProfilePage() {
  const {
    user,
    achievements,
    joinedDate,
    crownsEarned,
    refillHearts: handleRefillHearts,
    simulateStreak: handleSimulateStreak,
    deductHeart: handleDeductHeart,
    resetProgress: handleReset,
  } = useProfileController();
  const statsRef = useRef<HTMLDivElement | null>(null);
  const [socialTab, setSocialTab] = useState<"following" | "followers">("following");
  const [socialNotice, setSocialNotice] = useState("");

  const [showStreakModal, setShowStreakModal] = useState(false);
  const [showHeartsModal, setShowHeartsModal] = useState(false);
  const [showDevModal, setShowDevModal] = useState(false);

  return (
    <div className="min-h-screen bg-white dark:bg-[#101f24] text-[#4b4b4b] dark:text-white transition-colors">
      <div className="flex">
        <Sidebar onOpenDevTools={() => setShowDevModal(true)} />

        <div className="flex-1 min-[700px]:ml-[var(--duo-sidebar-width)] flex flex-col min-h-screen">
          <TopBar
            user={user}
            onOpenStreakModal={() => setShowStreakModal(true)}
            onOpenHeartsModal={() => setShowHeartsModal(true)}
          />

          <main className="mx-auto grid w-full max-w-[1440px] flex-1 items-start gap-7 px-4 py-5 sm:px-6 lg:grid-cols-[minmax(0,1.55fr)_minmax(300px,0.9fr)] lg:gap-10 lg:px-10">
            <div className="min-w-0 space-y-7">
              <section aria-label="Profile" className="overflow-hidden rounded-2xl border-2 border-[#e5e5e5] bg-[#f5f9fa] dark:border-[#2e4550] dark:bg-[#1b2e35]">
                <div className="relative flex h-44 items-center justify-center border-b-2 border-dashed border-[#1cb0f6] bg-[#eaf8ff] dark:bg-[#20343c] sm:h-56">
                  <div className="relative flex h-36 w-36 items-center justify-center rounded-[38%] border-[5px] border-dashed border-[#49c0f8] text-[#3986a7] sm:h-44 sm:w-44">
                    <UserRound className="h-24 w-24 fill-current stroke-[1.2] sm:h-32 sm:w-32" />
                    <span className="absolute flex h-11 w-11 items-center justify-center rounded-full bg-[#1cb0f6] text-white shadow-lg">
                      <span className="text-3xl font-light leading-none">+</span>
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSocialNotice("Profile photo editing is not available in this demo.")}
                    aria-label="Edit profile photo"
                    className="absolute right-4 top-4 flex h-12 w-12 items-center justify-center rounded-2xl border-2 border-[var(--border)] bg-[var(--surface)] text-[var(--text-primary)] transition-colors hover:border-[#1cb0f6] hover:text-[#1cb0f6]"
                  >
                    <Pencil className="h-5 w-5" />
                  </button>
                </div>
                <div className="flex flex-col gap-5 p-5 sm:flex-row sm:items-start sm:justify-between sm:p-6">
                  <div className="min-w-0">
                    <h1 className="truncate text-2xl font-extrabold sm:text-3xl">{user?.name || "Learner"}</h1>
                    <p className="mt-1 font-semibold text-[#777] dark:text-[#8b9eab]">@{user?.username || "learner_alex"}</p>
                    <p className="mt-2 text-sm font-semibold text-[#777] dark:text-[#8b9eab]">
                      Joined {joinedDate}
                    </p>
                    <div className="mt-4 flex flex-wrap gap-2" aria-label="Learning courses">
                      <span title="Learning German" className="flex h-8 w-10 overflow-hidden rounded-md border border-[var(--border)]">
                        <span className="flex-1 bg-[#111827]" /><span className="flex-1 bg-[#ef4444]" /><span className="flex-1 bg-[#facc15]" />
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => statsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })}
                    className="inline-flex shrink-0 items-center justify-center gap-2 rounded-2xl border-b-4 border-[#1687bd] bg-[#1cb0f6] px-5 py-3 text-sm font-extrabold uppercase tracking-wide text-white transition hover:brightness-105 active:translate-y-1 active:border-b-0 focus:outline-none focus:ring-4 focus:ring-[#84d8ff]"
                  >
                    <BarChart3 className="h-5 w-5" /> View Stats
                  </button>
                </div>
              </section>

              <section ref={statsRef} aria-labelledby="profile-statistics">
                <h2 id="profile-statistics" className="mb-4 text-xl font-extrabold">Statistics</h2>
                <div className="grid grid-cols-1 gap-3 min-[420px]:grid-cols-2">
                  <div className="flex min-h-24 items-center gap-4 overflow-hidden rounded-2xl border-2 border-[#e5b000] bg-[#ffc800] p-4 text-white shadow-[0_4px_0_#dfa900]">
                    <Flame className="h-8 w-8 shrink-0 fill-[#ff9600] text-[#ff9600]" />
                    <div><p className="text-xl font-extrabold">{user?.streak ?? 0}</p><p className="text-sm font-bold">Day streak</p></div>
                  </div>
                  <div className="flex min-h-24 items-center gap-4 rounded-2xl border-2 border-[var(--border)] bg-[var(--surface)] p-4">
                    <Zap className="h-8 w-8 shrink-0 fill-[#ffc800] text-[#ffc800]" />
                    <div><p className="text-xl font-extrabold">{user?.xp ?? 0}</p><p className="text-sm font-bold text-[#777] dark:text-[#8b9eab]">Total XP</p></div>
                  </div>
                  <Link href="/leaderboards" className="flex min-h-24 items-center gap-4 rounded-2xl border-2 border-[var(--border)] bg-[var(--surface)] p-4 transition-colors hover:border-[#1cb0f6]">
                    <Shield className="h-8 w-8 shrink-0 fill-[#cd7f32] text-[#cd7f32]" />
                    <div><p className="text-xl font-extrabold">{user?.league || "Bronze"}</p><p className="text-sm font-bold text-[#777] dark:text-[#8b9eab]">Current league</p></div>
                  </Link>
                  <div className="flex min-h-24 items-center gap-4 rounded-2xl border-2 border-[var(--border)] bg-[var(--surface)] p-4">
                    <Crown className="h-8 w-8 shrink-0 fill-[#ffc800] text-[#ffc800]" />
                    <div><p className="text-xl font-extrabold">{crownsEarned}</p><p className="text-sm font-bold text-[#777] dark:text-[#8b9eab]">Crowns earned</p></div>
                  </div>
                </div>
              </section>

              <section aria-labelledby="profile-achievements">
                <h2 id="profile-achievements" className="mb-4 text-xl font-extrabold">Achievements</h2>
                <div className="space-y-3">
                  {achievements.map((ach) => {
                    const pct = Math.min(100, Math.round((ach.progress / ach.goal) * 100));
                    return (
                      <article key={ach.id} className="flex items-center gap-4 rounded-2xl border-2 border-[var(--border)] bg-[var(--surface)] p-4">
                        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border-2 border-[#ffc800] bg-[#fffdf0]">
                          <Award className="h-8 w-8 text-[#ffc800]" />
                        </div>
                        <div className="min-w-0 flex-1 space-y-1.5">
                          <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                            <h3 className="font-extrabold text-[var(--text-primary)]">{ach.title} (Level {ach.tier})</h3>
                            <span className="text-xs font-bold text-[#777] dark:text-[#8b9eab]">{ach.progress} / {ach.goal}</span>
                          </div>
                          <p className="text-sm font-medium text-[#777] dark:text-[#8b9eab]">{ach.description}</p>
                          <div className="h-3 w-full overflow-hidden rounded-full bg-[#e5e5e5] dark:bg-[#34474e]" role="progressbar" aria-label={`${ach.title} progress`} aria-valuenow={ach.progress} aria-valuemin={0} aria-valuemax={ach.goal}>
                            <div className="h-full rounded-full bg-[#ffc800] transition-all duration-500" style={{ width: `${pct}%` }} />
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              </section>

              <div className="border-t-2 border-[var(--border)] pt-5">
                <button onClick={handleReset} className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-red-200 bg-red-50 py-3 text-xs font-extrabold uppercase tracking-wider text-red-600 transition-colors hover:bg-red-100">
                  <RotateCcw className="h-4 w-4" /><span>Reset Learner Progress (Fresh Demo)</span>
                </button>
              </div>
            </div>

            <aside className="min-w-0 space-y-5 lg:sticky lg:top-5">
              <section className="overflow-hidden rounded-2xl border-2 border-[var(--border)] bg-[var(--surface)]">
                <div className="grid grid-cols-2 border-b-2 border-[var(--border)]">
                  {(["following", "followers"] as const).map((tab) => (
                    <button
                      key={tab}
                      type="button"
                      onClick={() => { setSocialTab(tab); setSocialNotice(""); }}
                      aria-pressed={socialTab === tab}
                      className={`border-b-2 px-3 py-4 text-sm font-extrabold uppercase tracking-wide transition-colors ${
                        socialTab === tab ? "border-[#1cb0f6] text-[#1cb0f6]" : "border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                      }`}
                    >
                      {tab} <span className="ml-1 text-xs">0</span>
                    </button>
                  ))}
                </div>
                <div className="flex min-h-[290px] flex-col items-center justify-center p-6 text-center">
                  <div className="flex items-end justify-center -space-x-5" aria-hidden="true">
                    {["🧑🏻‍🎓", "👩🏽‍🎨", "🧑🏾‍🚀", "👨🏼‍🍳", "👩🏻‍🔬"].map((avatar, index) => (
                      <span
                        key={index}
                        style={{ backgroundColor: ["#ffd6e7", "#e7d5ff", "#b6e6ff", "#ffcf8b", "#baf0d3"][index] }}
                        className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-[var(--surface)] text-3xl sm:h-16 sm:w-16"
                      >
                        {avatar}
                      </span>
                    ))}
                  </div>
                  <p className="mt-7 max-w-xs text-lg font-semibold leading-relaxed text-[var(--text-secondary)]">
                    {socialTab === "following"
                      ? "Learning is more fun and effective when you connect with others."
                      : "No followers yet. Invite friends to learn German together."}
                  </p>
                </div>
                {socialNotice && <p role="status" className="border-t border-[var(--border)] px-4 py-3 text-center text-sm font-semibold text-[var(--text-secondary)]">{socialNotice}</p>}
              </section>

              <section className="rounded-2xl border-2 border-[var(--border)] bg-[var(--surface)] p-5">
                <h2 className="mb-3 text-lg font-extrabold">Add friends</h2>
                <button type="button" onClick={() => setSocialNotice("Friend search is not available in this demo yet.")} className="flex min-h-16 w-full items-center gap-4 rounded-xl px-2 text-left font-bold transition-colors hover:bg-[var(--surface-secondary)]">
                  <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#e8f8ff] text-[#1cb0f6]"><Search className="h-6 w-6" /></span>
                  <span className="flex-1">Find friends</span><ChevronRight className="h-5 w-5 text-[var(--text-secondary)]" />
                </button>
                <button type="button" onClick={() => setSocialNotice("Inviting friends is not available in this demo yet.")} className="flex min-h-16 w-full items-center gap-4 rounded-xl px-2 text-left font-bold transition-colors hover:bg-[var(--surface-secondary)]">
                  <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#f2fbdc] text-2xl">🦉</span>
                  <span className="flex-1">Invite friends</span><ChevronRight className="h-5 w-5 text-[var(--text-secondary)]" />
                </button>
              </section>
            </aside>
          </main>
        </div>
      </div>

      <StreakModal
        isOpen={showStreakModal}
        onClose={() => setShowStreakModal(false)}
        user={user}
        onSimulateStreak={handleSimulateStreak}
      />
      <HeartsModal
        isOpen={showHeartsModal}
        onClose={() => setShowHeartsModal(false)}
        user={user}
        onRefill={handleRefillHearts}
      />
      <DevBar
        isOpen={showDevModal}
        onClose={() => setShowDevModal(false)}
        onSimulateStreak={handleSimulateStreak}
        onRefillHearts={handleRefillHearts}
        onDeductHeart={handleDeductHeart}
        onResetProgress={handleReset}
      />
    </div>
  );
}
