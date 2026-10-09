"use client";

import React, { Suspense } from "react";
import { Sidebar } from "@/shared/views/components/Sidebar";
import { TopBar } from "@/shared/views/components/TopBar";
import { RightPanel } from "@/shared/views/components/RightPanel";
import { LearningPath } from "@/features/learn/views/LearningPath";
import { LessonPlayer } from "@/features/learn/views/LessonPlayer";
import { GuidebookPage } from "@/features/learn/views/GuidebookPage";
import { StreakModal } from "@/shared/views/components/StreakModal";
import { HeartsModal } from "@/shared/views/components/HeartsModal";
import { DevBar } from "@/shared/views/components/DevBar";
import { useLearnController } from "@/features/learn/controllers/useLearnController";
import { DuoMascot } from "@/shared/views/components/DuoMascot";

function HomePageContent() {
  const {
    user,
    courseTree,
    leaderboard,
    quests,
    loading,
    sections,
    selectedSectionId,
    activeLessonId,
    setActiveLessonId,
    showSectionOverview,
    setShowSectionOverview,
    selectedGuidebookUnit,
    setSelectedGuidebookUnit,
    showStreakModal,
    setShowStreakModal,
    showHeartsModal,
    setShowHeartsModal,
    showDevModal,
    setShowDevModal,
    refreshAllData,
    handleSectionSelect,
    handleSimulateStreak,
    handleRefillHearts,
    handleDeductHeart,
    handleResetProgress,
    handleClaimQuest,
  } = useLearnController();

  if (loading) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-white gap-3">
        <DuoMascot mood="happy" size={110} className="animate-bounce" />
        <h2 className="font-extrabold text-[#58cc02] text-xl tracking-tight">
          Loading Duolingo...
        </h2>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-[#101f24] text-[#4b4b4b] dark:text-white transition-colors">
      {activeLessonId !== null ? (
        <LessonPlayer
          lessonId={activeLessonId}
          onExit={() => setActiveLessonId(null)}
          onLessonFinished={() => {
            setActiveLessonId(null);
            refreshAllData();
          }}
        />
      ) : (
        <div className="flex min-w-0">
          <Sidebar onOpenDevTools={() => setShowDevModal(true)} />

          <div className="min-w-0 flex-1 min-[700px]:ml-[var(--duo-sidebar-width)] flex min-h-screen flex-col bg-[var(--surface-secondary)] dark:bg-[var(--background)]">
            {selectedGuidebookUnit ? (
              <>
                <div className="fixed left-0 right-0 top-0 z-30 h-[var(--duo-topbar-height)] min-[700px]:left-[var(--duo-sidebar-width)]">
                  <TopBar
                    user={user}
                    cefrLevel={selectedSectionId === 2 ? "A2" : "A1"}
                    onOpenStreakModal={() => setShowStreakModal(true)}
                    onOpenHeartsModal={() => setShowHeartsModal(true)}
                  />
                </div>
                <div className="fixed bottom-0 left-0 right-0 top-[var(--duo-topbar-height)] overflow-y-auto overscroll-contain min-[700px]:left-[var(--duo-sidebar-width)]">
                  <GuidebookPage
                    unit={selectedGuidebookUnit}
                    onBack={() => setSelectedGuidebookUnit(null)}
                  />
                </div>
              </>
            ) : (
              <>
                <div className="mx-auto flex min-w-0 w-full max-w-[var(--duo-page-max-width)] flex-1 gap-[var(--duo-column-gap)] px-4 pb-24 pt-20 sm:px-6 md:pb-8 lg:px-8 xl:px-8 xl:pt-20">
                  <main className="min-w-0 flex-1">
                    {courseTree && (
                      showSectionOverview ? (
                        <section className="mx-auto w-full max-w-[740px] pt-10">
                          <button
                            type="button"
                            onClick={() => setShowSectionOverview(false)}
                            className="mb-5 text-sm font-extrabold uppercase tracking-wide text-[var(--text-secondary)] transition-colors hover:text-[#1cb0f6]"
                          >
                            Back to learning path
                          </button>
                          <h1 className="mb-5 text-2xl font-extrabold text-[var(--text-primary)]">Choose a section</h1>
                          <div className="grid gap-3 sm:grid-cols-2">
                            {sections.map((section) => {
                              const selected = section.id === selectedSectionId;
                              return (
                                <button
                                  key={section.id}
                                  type="button"
                                  onClick={() => {
                                    handleSectionSelect(section.id);
                                  }}
                                  className={`w-full rounded-[20px] border-2 p-4 text-left transition-all ${
                                    selected
                                      ? "border-[#1cb0f6] bg-[#1b3848] text-[#1cb0f6]"
                                      : "border-[var(--border)] bg-[var(--surface)] text-[var(--text-primary)] hover:border-[#84d8ff]"
                                  }`}
                                >
                                  <div className="mb-2 flex items-center justify-between gap-3">
                                    <span className="text-xs font-extrabold uppercase tracking-[0.18em]">Section {section.id}</span>
                                    <span className="text-xs font-extrabold text-[var(--text-secondary)]">{section.progress.percentage}%</span>
                                  </div>
                                  <div className="mb-2 text-base font-extrabold leading-tight sm:text-lg">{section.title}</div>
                                  <div className="h-2.5 overflow-hidden rounded-full bg-[#d9e3e8] dark:bg-[#2e4550]">
                                    <div className="h-full rounded-full bg-[#58cc02]" style={{ width: `${section.progress.percentage}%` }} />
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        </section>
                      ) : (
                        <LearningPath
                          sections={sections}
                          selectedSectionId={selectedSectionId}
                          onOpenGuidebook={(unit) => setSelectedGuidebookUnit(unit)}
                          onOpenSectionOverview={() => setShowSectionOverview(true)}
                          onStartLesson={setActiveLessonId}
                        />
                      )
                    )}
                  </main>

                  <aside className="hidden w-[var(--duo-right-rail-width)] shrink-0 flex-col gap-5 pt-3 xl:flex">
                    <RightPanel
                      user={user}
                      quests={quests}
                      leaderboard={leaderboard}
                      onClaimQuest={handleClaimQuest}
                    />
                  </aside>
                </div>

                <div className="fixed left-0 right-0 top-0 z-30 min-[700px]:left-[var(--duo-sidebar-width)]">
                  <TopBar
                    user={user}
                    cefrLevel={selectedSectionId === 2 ? "A2" : "A1"}
                    onOpenStreakModal={() => setShowStreakModal(true)}
                    onOpenHeartsModal={() => setShowHeartsModal(true)}
                  />
                </div>
              </>
            )}
          </div>
        </div>
      )}

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
        onResetProgress={handleResetProgress}
      />
    </div>
  );
}

export default function HomePage() {
      return (
        <Suspense fallback={<div className="h-screen w-screen flex items-center justify-center bg-white dark:bg-[#101f24]"><DuoMascot mood="happy" size={110} className="animate-bounce" /></div>}>
          <HomePageContent />
        </Suspense>
      );
}
