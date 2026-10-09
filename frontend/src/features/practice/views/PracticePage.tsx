"use client";

import React from "react";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  Headphones,
  MessageCircle,
  RotateCcw,
  Sparkles,
  Volume2,
} from "lucide-react";
import { Sidebar } from "@/shared/views/components/Sidebar";
import { TopBar } from "@/shared/views/components/TopBar";
import { RightPanel } from "@/shared/views/components/RightPanel";
import { LessonPlayer } from "@/features/learn/views/LessonPlayer";
import { StreakModal } from "@/shared/views/components/StreakModal";
import { HeartsModal } from "@/shared/views/components/HeartsModal";
import { PracticeCollectionReview } from "@/features/practice/views/PracticeCollectionReview";
import { usePracticeController } from "@/features/practice/controllers/usePracticeController";

export default function PracticePage() {
  const {
    user,
    courseTree,
    leaderboard,
    quests,
    activeLessonId,
    setActiveLessonId,
    activeCollection,
    setActiveCollection,
    showStreakModal,
    setShowStreakModal,
    showHeartsModal,
    setShowHeartsModal,
    loading,
    error,
    loadPageData,
    availableLessonId,
    startPractice,
    claimQuest,
    simulateStreak,
    refillHearts,
    finishLesson,
  } = usePracticeController();

  if (activeLessonId !== null) {
    return (
      <LessonPlayer
        lessonId={activeLessonId}
        onExit={() => setActiveLessonId(null)}
        onLessonFinished={finishLesson}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[var(--surface-secondary)] text-[var(--text-primary)] dark:bg-[var(--background)]">
      <Sidebar />
      <div className="min-h-screen min-w-0 min-[700px]:ml-[var(--duo-sidebar-width)]">
        <div className="fixed top-0 left-0 right-0 z-20 min-[700px]:left-[var(--duo-sidebar-width)]">
          <TopBar
            user={user}
            onOpenStreakModal={() => setShowStreakModal(true)}
            onOpenHeartsModal={() => setShowHeartsModal(true)}
          />
        </div>

        <div className="mx-auto flex min-w-0 w-full max-w-[var(--duo-page-max-width)] gap-[var(--duo-column-gap)] px-4 pb-24 pt-20 sm:px-6 md:pb-8 lg:px-8 xl:px-8 xl:pt-20">
          <main className="min-w-0 flex-1 pt-3">
            {activeCollection ? (
              <PracticeCollectionReview
                collection={activeCollection}
                onBack={() => setActiveCollection(null)}
              />
            ) : (
              <>
            <div className="mb-7">
              <p className="mb-1 text-xs font-extrabold uppercase tracking-[0.2em] text-[#1cb0f6]">
                German course
              </p>
              <h1 className="text-3xl font-extrabold tracking-tight text-[#4b4b4b] dark:text-white sm:text-4xl">
                Today&apos;s Review
              </h1>
            </div>

            {error && (
              <div
                role="alert"
                className="mb-5 rounded-2xl border-2 border-[#ffb4b4] bg-[#fff0f0] px-4 py-3 font-bold text-[#c43d3d] dark:bg-[#381f24]"
              >
                {error}
                {!courseTree && (
                  <button
                    type="button"
                    onClick={() => void loadPageData()}
                    className="ml-2 underline underline-offset-2"
                  >
                    Retry
                  </button>
                )}
              </div>
            )}

            <section className="mb-9 overflow-hidden rounded-[28px] border-2 border-[#a8e2ff] bg-[#ddf4ff] shadow-[0_7px_0_#b9e9ff] dark:border-[#24516a] dark:bg-[#173748] dark:shadow-[0_7px_0_#102c3a]">
              <div className="flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-7">
                <div className="flex items-start gap-4">
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-[#1cb0f6] text-white shadow-[0_5px_0_#1687bd]">
                    <Headphones className="h-9 w-9" />
                  </div>
                  <div>
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <h2 className="text-2xl font-extrabold text-[#164b65] dark:text-white sm:text-3xl">
                        Listen-Up
                      </h2>
                      <span className="rounded-full bg-white/80 px-3 py-1 text-xs font-extrabold uppercase tracking-wide text-[#1687bd] dark:bg-[#102c3a]">
                        Recommended
                      </span>
                    </div>
                    <p className="max-w-lg font-semibold leading-relaxed text-[#3f7187] dark:text-[#c4e9f7]">
                      Sharpen your ear with focused listening practice
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={startPractice}
                  disabled={loading || !availableLessonId}
                  className="flex shrink-0 items-center justify-center gap-2 rounded-2xl bg-[#58cc02] px-6 py-4 text-sm font-extrabold uppercase tracking-wider text-white shadow-[0_5px_0_#46a302] transition hover:brightness-105 active:translate-y-1 active:shadow-none disabled:cursor-wait disabled:opacity-60"
                >
                  <Volume2 className="h-5 w-5 fill-current" />
                  START +20 XP
                </button>
              </div>
              <div className="flex items-center gap-2 border-t border-[#b9e9ff] px-6 py-3 text-xs font-bold text-[#43829e] dark:border-[#24516a] dark:text-[#a6d9ed]">
                <Sparkles className="h-4 w-4" />
                Build confidence by listening closely to German
              </div>
            </section>

            <section className="mb-9">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-2xl font-extrabold text-[#4b4b4b] dark:text-white">Conversation</h2>
              </div>
              <button
                type="button"
                onClick={startPractice}
                disabled={loading || !availableLessonId}
                className="group flex w-full items-center gap-4 rounded-[22px] border-2 border-[var(--border)] bg-[var(--surface)] p-5 text-left shadow-[0_4px_0_rgba(0,0,0,0.05)] transition hover:border-[#84d8ff] disabled:cursor-wait disabled:opacity-60 sm:p-6"
              >
                <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#ffc800] text-[#735900] shadow-[0_4px_0_#d9a900]">
                  <MessageCircle className="h-8 w-8 fill-current" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="mb-1 block text-xl font-extrabold text-[#4b4b4b] dark:text-white">Listen</span>
                  <span className="block font-semibold leading-relaxed text-[#777] dark:text-[#c5d0d5]">
                    Boost your listening skills with an audio-only session
                  </span>
                </span>
                <ArrowRight className="h-6 w-6 shrink-0 text-[#afafaf] transition group-hover:translate-x-1 group-hover:text-[#1cb0f6]" />
              </button>
            </section>

            <section>
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-2xl font-extrabold text-[#4b4b4b] dark:text-white">Your collections</h2>
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                <CollectionCard
                  icon={<RotateCcw className="h-7 w-7" />}
                  title="Mistakes"
                  description="Start a personalized lesson to practice your mistakes"
                  onClick={startPractice}
                  disabled={loading || !availableLessonId}
                  accent="red"
                />
                <CollectionCard
                  icon={<BookOpen className="h-7 w-7" />}
                  title="Words"
                  description="Explore 32 German words by topic with pronunciation and flashcard review"
                  onClick={() => setActiveCollection("words")}
                  disabled={false}
                  accent="blue"
                />
                <CollectionCard
                  icon={<MessageCircle className="h-7 w-7" />}
                  title="Stories"
                  description="Read six original German mini-stories with audio and comprehension checks"
                  onClick={() => setActiveCollection("stories")}
                  disabled={false}
                  accent="purple"
                />
              </div>
            </section>

              </>
            )}

          </main>

          <aside className="hidden w-[var(--duo-right-rail-width)] shrink-0 flex-col gap-5 xl:flex">
            {loading ? (
              <div className="rounded-2xl border-2 border-[var(--border)] bg-[var(--surface)] p-5 font-bold text-[var(--text-secondary)]">
                Loading your league and quests...
              </div>
            ) : (
              <RightPanel
                user={user}
                quests={quests}
                leaderboard={leaderboard}
                onClaimQuest={(questId) => void claimQuest(questId)}
              />
            )}
            <footer className="flex flex-wrap gap-x-4 gap-y-2 border-t border-[var(--border)] pt-4 text-xs font-bold text-[#8b9eab]">
              <Link href="/profile" className="hover:text-[#1cb0f6]">Profile</Link>
              <Link href="/leaderboards" className="hover:text-[#1cb0f6]">League</Link>
              <Link href="/quests" className="hover:text-[#1cb0f6]">Quests</Link>
              <Link href="/shop" className="hover:text-[#1cb0f6]">Shop</Link>
              <Link href="/learn" className="hover:text-[#1cb0f6]">Learn</Link>
            </footer>
          </aside>
        </div>
      </div>

      <StreakModal
        isOpen={showStreakModal}
        onClose={() => setShowStreakModal(false)}
        user={user}
        onSimulateStreak={simulateStreak}
      />
      <HeartsModal
        isOpen={showHeartsModal}
        onClose={() => setShowHeartsModal(false)}
        user={user}
        onRefill={refillHearts}
      />
    </div>
  );
}

interface CollectionCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  onClick: () => void;
  disabled: boolean;
  accent: "red" | "blue" | "purple";
}

function CollectionCard({
  icon,
  title,
  description,
  onClick,
  disabled,
  accent,
}: CollectionCardProps) {
  const accentClasses = {
    red: "bg-[#ffeded] text-[#ff4b4b] dark:bg-[#381f24]",
    blue: "bg-[#e5f7ff] text-[#1cb0f6] dark:bg-[#173748]",
    purple: "bg-[#f4eaff] text-[#a560d4] dark:bg-[#2d2240]",
  };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="group flex min-h-[220px] flex-col items-start rounded-[22px] border-2 border-[var(--border)] bg-[var(--surface)] p-5 text-left shadow-[0_4px_0_rgba(0,0,0,0.05)] transition hover:-translate-y-1 hover:border-[#84d8ff] disabled:cursor-wait disabled:opacity-60"
    >
      <span className={`mb-4 flex h-12 w-12 items-center justify-center rounded-2xl ${accentClasses[accent]}`}>
        {icon}
      </span>
      <span className="mb-2 text-lg font-extrabold text-[#4b4b4b] dark:text-white">{title}</span>
      <span className="flex-1 text-sm font-semibold leading-relaxed text-[#777] dark:text-[#c5d0d5]">
        {description}
      </span>
      <span className="mt-4 flex items-center gap-1 text-xs font-extrabold uppercase tracking-wide text-[#1cb0f6]">
        Review <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
      </span>
    </button>
  );
}
