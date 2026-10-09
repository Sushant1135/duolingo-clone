"use client";

import React, { Suspense, useState } from "react";
import { ArrowLeft, Check, ChevronDown, Lock, Play, Trophy } from "lucide-react";
import { Sidebar } from "@/shared/views/components/Sidebar";
import { TopBar } from "@/shared/views/components/TopBar";
import { LessonPlayer } from "@/features/learn/views/LessonPlayer";
import { StreakModal } from "@/shared/views/components/StreakModal";
import { HeartsModal } from "@/shared/views/components/HeartsModal";
import { DevBar } from "@/shared/views/components/DevBar";
import { DuoMascot } from "@/shared/views/components/DuoMascot";
import type { LessonSummary, Skill, Unit } from "@/models/api";
import { useSectionController } from "@/features/learn/controllers/useSectionController";
import { sound } from "@/services/audio";

type SectionStatus = "completed" | "current" | "available" | "locked";

const sectionMessages = [
  "Ich kann Leute auf Deutsch begruessen.",
  "Ich kann mich auf Deutsch vorstellen.",
  "Ich kenne ein paar Woerter auf Deutsch.",
  "Ich kann Essen und Getraenke bestellen.",
  "Ich kann in einem Restaurant sprechen.",
  "Ich kann ueber Orte sprechen.",
  "Ich kann ueber meinen Alltag sprechen.",
];

const getUnitTitle = (unit: Unit) => unit.title.replace(/^Unit \d+:\s*/, "");

const getSectionStatus = (skill: Skill): SectionStatus => {
  if (skill.is_completed) return "completed";
  if (!skill.is_unlocked) return "locked";
  if (skill.is_current || skill.completed_lessons > 0) return "current";
  return "available";
};

const getNextLesson = (skill: Skill) => skill.lessons.find((lesson) => !lesson.is_completed) || skill.lessons[0];

const canJumpToSection = (skill: Skill) => {
  void skill;
  return false;
};

const SectionProgress = ({ progress }: { progress: number }) => (
  <div className="grid grid-cols-[1fr_auto_auto] items-center gap-3">
    <div className="h-3 overflow-hidden rounded-full bg-[#d9e3e8] dark:bg-[#2e4550]">
      <div className="h-full rounded-full bg-[#58cc02] transition-all duration-500" style={{ width: `${progress}%` }} />
    </div>
    <span className="w-11 text-right text-sm font-extrabold text-[var(--text-secondary)]">{progress}%</span>
    <div
      className={`flex h-9 w-9 items-center justify-center rounded-xl border-2 transition-colors ${
        progress >= 100
          ? "border-[#46a302] bg-[#58cc02] text-white shadow-[0_3px_0_#46a302]"
          : "border-[#ffc700] bg-[#fff8d6] text-[#ffc700] dark:bg-[#453b16]"
      }`}
    >
      <Trophy className="h-5 w-5 fill-current" />
    </div>
  </div>
);

const SpeechBubble = ({ message }: { message: string }) => (
  <div className="relative rounded-2xl border-2 border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm font-bold leading-relaxed text-[var(--text-primary)] shadow-sm">
    {message}
    <span className="absolute -bottom-2 right-8 h-4 w-4 rotate-45 border-b-2 border-r-2 border-[var(--border)] bg-[var(--surface)]" />
  </div>
);

const getLessonState = (lesson: LessonSummary, skill: Skill) => {
  if (lesson.is_locked || !skill.is_unlocked) return "locked";
  if (lesson.is_completed) return "completed";
  if (lesson.is_current || lesson.id === getNextLesson(skill)?.id) return "current";
  return "available";
};

const LessonDetails = ({
  skill,
  status,
  onStartLesson,
}: {
  skill: Skill;
  status: SectionStatus;
  onStartLesson: (lessonId: number) => void;
}) => (
  <div
    className={`mt-5 rounded-2xl border p-3 sm:p-4 ${
      status === "completed"
        ? "border-[#557585] bg-black/10"
        : "border-[var(--border)] bg-[var(--surface-secondary)]"
    }`}
  >
    <div className="space-y-2">
      {skill.lessons.map((lesson) => {
        const lessonState = getLessonState(lesson, skill);
        const locked = lessonState === "locked";

        return (
          <button
            key={lesson.id}
            type="button"
            disabled={locked}
            onClick={() => {
              if (locked) return;
              sound.playClick();
              onStartLesson(lesson.id);
            }}
            className={`grid w-full grid-cols-[32px_1fr_auto] items-center gap-3 rounded-xl border-2 px-3 py-3 text-left text-sm transition-all ${
              locked
                ? "cursor-not-allowed border-transparent text-[var(--text-secondary)] opacity-65"
                : lessonState === "completed"
                ? "border-transparent bg-white/10 text-inherit hover:border-[#84d8ff]"
                : lessonState === "current"
                ? "border-[#58cc02] bg-[#efffdc] text-[#3c3c3c] shadow-[0_3px_0_#46a302] hover:brightness-[0.98] dark:bg-[#213a22] dark:text-white"
                : "border-transparent bg-[var(--surface)] text-[var(--text-primary)] hover:border-[#1cb0f6]"
            }`}
          >
            <span
              className={`flex h-8 w-8 items-center justify-center rounded-full ${
                lessonState === "completed"
                  ? "bg-[#58cc02] text-white"
                  : lessonState === "current"
                  ? "bg-[#1cb0f6] text-white"
                  : locked
                  ? "bg-[#203843] text-[#8b9eab]"
                  : "bg-[#d7f5ff] text-[#1cb0f6]"
              }`}
            >
              {lessonState === "completed" ? <Check className="h-5 w-5 stroke-[3]" /> : locked ? <Lock className="h-4 w-4" /> : <Play className="h-4 w-4 fill-current" />}
            </span>
            <span className="min-w-0">
              <span className="block truncate font-extrabold">{lesson.title}</span>
              <span className="text-xs font-bold text-[var(--text-secondary)]">
                {lessonState === "completed" ? "Review available" : lessonState === "current" ? "Current lesson" : locked ? "Locked" : "Ready"}
              </span>
            </span>
            <span className="shrink-0 text-xs font-extrabold text-[var(--text-secondary)]">{lesson.xp_reward} XP</span>
          </button>
        );
      })}
    </div>
  </div>
);

const SectionCard = ({
  skill,
  sectionNumber,
  selected,
  onStartLesson,
}: {
  skill: Skill;
  sectionNumber: number;
  selected: boolean;
  onStartLesson: (lessonId: number) => void;
}) => {
  const status = getSectionStatus(skill);
  const [showDetails, setShowDetails] = useState(selected || status === "current");
  const progress = skill.total_lessons > 0 ? Math.round((skill.completed_lessons / skill.total_lessons) * 100) : 0;
  const nextLesson = getNextLesson(skill);
  const message = sectionMessages[(sectionNumber - 1) % sectionMessages.length];
  const isLocked = status === "locked";
  const jumpAllowed = canJumpToSection(skill);
  const canStart = Boolean(nextLesson) && (!isLocked || jumpAllowed);

  const startLabel =
    status === "completed"
      ? "Review"
      : status === "locked"
      ? `Jump to Unit ${sectionNumber}`
      : status === "available"
      ? "Start"
      : "Continue";

  return (
    <article
      className={`overflow-hidden rounded-[20px] border-2 border-[var(--border)] transition-shadow ${
        status === "completed"
          ? "bg-[linear-gradient(135deg,#203843_0,#203843_18px,#263f49_18px,#263f49_36px)] text-white shadow-[0_5px_0_rgba(0,0,0,0.16)]"
          : isLocked
          ? "bg-[var(--surface-secondary)] opacity-85"
          : "bg-[var(--surface)] shadow-[0_5px_0_rgba(0,0,0,0.08)]"
      } ${selected ? "ring-4 ring-[#84d8ff]" : ""}`}
    >
      <div className={`${selected || status === "current" ? "p-5 sm:p-7" : "p-4 sm:p-5"}`}>
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <button
              type="button"
              onClick={() => setShowDetails((current) => !current)}
              className={`mb-2 flex items-center gap-1.5 rounded-full px-0.5 text-xs font-extrabold uppercase tracking-[0.04em] transition-colors ${
                status === "completed" ? "text-[#bde6ff] hover:text-white" : "text-[#1cb0f6] hover:text-[#1899d6]"
              }`}
            >
              <span>{sectionNumber <= 3 ? "A1" : "A2"}</span>
              <span aria-hidden="true">•</span>
              <span>{showDetails ? "Hide details" : "See details"}</span>
              <ChevronDown className={`h-4 w-4 transition-transform ${showDetails ? "rotate-180" : ""}`} />
            </button>
            <h2
              className={`text-[26px] font-extrabold leading-tight ${
                status === "completed" ? "text-white" : isLocked ? "text-[var(--text-secondary)]" : "text-[var(--text-primary)]"
              }`}
            >
              Unit {sectionNumber}
            </h2>
            <p className={`mt-1 text-sm font-semibold ${status === "completed" ? "text-[#d7e1e8]" : "text-[var(--text-secondary)]"}`}>
              {skill.title}
            </p>
          </div>

          {status === "completed" && (
            <div className="flex shrink-0 items-center gap-2 rounded-full bg-[#58cc02] px-3 py-1 text-xs font-extrabold uppercase text-white">
              <Check className="h-4 w-4" />
              Completed
            </div>
          )}
          {isLocked && (
            <div className="flex shrink-0 items-center gap-2 rounded-full border border-[var(--border)] px-3 py-1 text-xs font-extrabold uppercase text-[var(--text-secondary)]">
              <Lock className="h-4 w-4" />
              Locked
            </div>
          )}
        </div>

        {status === "current" || status === "available" ? (
          <div className="mt-5 space-y-5">
            <SectionProgress progress={progress} />
            <div className="grid items-end gap-4 sm:grid-cols-[1fr_150px]">
              <SpeechBubble message={message} />
              <div className="flex justify-center sm:justify-end">
                <DuoMascot mood={selected || status === "current" ? "cheering" : "happy"} size={selected || status === "current" ? 132 : 112} />
              </div>
            </div>
          </div>
        ) : null}

        {isLocked && (
          <div className="mt-5 grid items-end gap-4 sm:grid-cols-[1fr_120px]">
            <SpeechBubble message={message} />
            <div className="flex justify-center opacity-70 sm:justify-end">
              <DuoMascot mood="neutral" size={108} />
            </div>
          </div>
        )}

        {showDetails && <LessonDetails skill={skill} status={status} onStartLesson={onStartLesson} />}

        <div className="mt-5 flex justify-end">
          <button
            type="button"
            disabled={!canStart}
            onClick={() => {
              if (!canStart || !nextLesson) return;
              sound.playCorrect();
              onStartLesson(nextLesson.id);
            }}
            className={`min-w-[180px] rounded-2xl px-5 py-3 text-sm font-extrabold uppercase tracking-wide transition-all active:translate-y-1 ${
              !canStart
                ? "cursor-not-allowed bg-[#e5e5e5] text-[#afafaf] dark:bg-[#203843] dark:text-[#557585]"
                : status === "completed"
                ? "duo-btn-blue"
                : "duo-btn-green"
            }`}
          >
            {startLabel}
          </button>
        </div>
      </div>
    </article>
  );
};

function SectionDetailsContent() {
  const {
    router,
    selectedUnit,
    selectedSkill,
    user,
    activeLessonId,
    setActiveLessonId,
    showStreakModal,
    setShowStreakModal,
    showHeartsModal,
    setShowHeartsModal,
    showDevModal,
    setShowDevModal,
    loadData,
    refillHearts: handleRefillHearts,
    simulateStreak: handleSimulateStreak,
    deductHeart: handleDeductHeart,
    resetProgress: handleResetProgress,
  } = useSectionController();

  if (activeLessonId !== null) {
    return (
      <LessonPlayer
        lessonId={activeLessonId}
        onExit={() => setActiveLessonId(null)}
        onLessonFinished={() => {
          setActiveLessonId(null);
          void loadData();
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--text-primary)]">
      <Sidebar onOpenDevTools={() => setShowDevModal(true)} />
      <div className="min-h-screen min-[700px]:ml-[var(--duo-sidebar-width)]">
        <TopBar
          user={user}
          cefrLevel={selectedUnit && selectedUnit.unit_number > 3 ? "A2" : "A1"}
          onOpenStreakModal={() => setShowStreakModal(true)}
          onOpenHeartsModal={() => setShowHeartsModal(true)}
        />

        <main className="mx-auto w-full max-w-[900px] px-4 pb-24 pt-5 sm:px-6">
          <button
            type="button"
            onClick={() => {
              sound.playClick();
              router.push("/learn");
            }}
            className="mb-5 flex items-center gap-2 text-sm font-extrabold uppercase tracking-wide text-[var(--text-secondary)] transition-colors hover:text-[#1cb0f6]"
          >
            <ArrowLeft className="h-5 w-5" />
            Back
          </button>
          <div className="mb-6 border-t-2 border-[var(--border)]" />

          {selectedUnit && selectedSkill && (
            <>
              <section className="mb-7 rounded-2xl bg-[#58cc02] p-5 text-white shadow-[0_6px_0_#46a302]">
                <p className="flex items-center gap-2 text-sm font-extrabold uppercase tracking-wide text-[#d7ffb8]">
                  <ArrowLeft className="h-5 w-5 stroke-[3]" />
                  Section {selectedUnit.skills.findIndex((skill) => skill.id === selectedSkill.id) + 1}, Unit {selectedUnit.unit_number}
                </p>
                <h1 className="mt-2 text-2xl font-extrabold leading-tight sm:text-[32px] sm:leading-9">{getUnitTitle(selectedUnit)}</h1>
              </section>

              <div className="space-y-5">
                {selectedUnit.skills.map((skill, index) => (
                  <SectionCard
                    key={skill.id}
                    skill={skill}
                    sectionNumber={index + 1}
                    selected={skill.id === selectedSkill.id}
                    onStartLesson={(lessonId) => setActiveLessonId(lessonId)}
                  />
                ))}
              </div>
            </>
          )}
        </main>
      </div>

      <StreakModal isOpen={showStreakModal} onClose={() => setShowStreakModal(false)} user={user} onSimulateStreak={handleSimulateStreak} />
      <HeartsModal isOpen={showHeartsModal} onClose={() => setShowHeartsModal(false)} user={user} onRefill={handleRefillHearts} />
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

export default function SectionDetailsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[var(--background)] text-[var(--text-primary)]">
          <div className="text-sm font-extrabold uppercase tracking-wide text-[#58cc02]">Loading section...</div>
        </div>
      }
    >
      <SectionDetailsContent />
    </Suspense>
  );
}
