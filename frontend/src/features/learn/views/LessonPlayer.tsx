"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Heart,
  Volume2,
  VolumeX,
  CheckCircle2,
  XCircle,
  Flame,
  Zap,
  Sparkles,
  ArrowRight,
  Dumbbell,
} from "lucide-react";
import type { Exercise, SubmitResult } from "@/models/api";
import { sound } from "@/services/audio";
import { useLessonController } from "@/features/learn/controllers/useLessonController";
import { DuoMascot } from "@/shared/views/components/DuoMascot";

const normalizeWordTile = (token: string) =>
  token.normalize("NFKC").toLocaleLowerCase("de-DE").replace(/[\p{P}\p{S}]/gu, "").trim();

const getExerciseSpeech = (exercise: Exercise) => {
  if (exercise.type === "translate_words" && exercise.target_text) {
    return { text: exercise.target_text, lang: "en-US" };
  }
  if (exercise.audio_text) {
    return { text: exercise.audio_text, lang: "de-DE" };
  }
  return null;
};

interface LessonPlayerProps {
  lessonId: number;
  onExit: () => void;
  onLessonFinished: () => void;
}

export const LessonPlayer: React.FC<LessonPlayerProps> = (props) => (
  <LessonSession key={props.lessonId} {...props} />
);

const LessonSession: React.FC<LessonPlayerProps> = ({
  lessonId,
  onExit,
  onLessonFinished,
}) => {
  const {
    lesson,
    exerciseQueue,
    setExerciseQueue,
    loading,
    hearts,
    setHearts,
    completionResult,
    submitAnswer,
    completeLesson,
    refillHearts,
  } = useLessonController(lessonId);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [resolvedExerciseIds, setResolvedExerciseIds] = useState<Set<number>>(new Set());
  const [lastActionWasSkip, setLastActionWasSkip] = useState(false);

  // User answers per exercise type
  const [selectedOption, setSelectedOption] = useState<string>("");
  const [selectedTokens, setSelectedTokens] = useState<string[]>([]);
  const [typedText, setTypedText] = useState<string>("");

  // Matching pairs exercise state
  const [matchedPairs, setMatchedPairs] = useState<{ [key: string]: string }>({});
  const [activeLeft, setActiveLeft] = useState<string | null>(null);
  const [activeRight, setActiveRight] = useState<string | null>(null);
  const [mismatchError, setMismatchError] = useState(false);
  const [mismatchPair, setMismatchPair] = useState<{ left: string; right: string } | null>(null);
  const [recentlyMatchedPair, setRecentlyMatchedPair] = useState<{ left: string; right: string } | null>(null);
  const [isPairAnimating, setIsPairAnimating] = useState(false);
  const [matchSubmissionError, setMatchSubmissionError] = useState<string | null>(null);

  // Verification & feedback bar state
  const [status, setStatus] = useState<"idle" | "correct" | "incorrect">("idle");
  const [feedbackResult, setFeedbackResult] = useState<SubmitResult | null>(null);
  const [mistakesCount, setMistakesCount] = useState(0);
  const [isMuted, setIsMuted] = useState(() => sound.getMuted());
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Modals
  const [showQuitModal, setShowQuitModal] = useState(false);
  const [showOutOfHeartsModal, setShowOutOfHeartsModal] = useState(false);
  // Current exercise
  const currentExerciseId = exerciseQueue[currentIndex];
  const currentExercise: Exercise | undefined =
    lesson?.exercises.find((exercise) => exercise.id === currentExerciseId) ||
    lesson?.exercises[currentIndex];

  const resetExerciseState = () => {
    setSelectedOption("");
    setSelectedTokens([]);
    setTypedText("");
    setMatchedPairs({});
    setActiveLeft(null);
    setActiveRight(null);
    setMismatchError(false);
    setMismatchPair(null);
    setRecentlyMatchedPair(null);
    setIsPairAnimating(false);
    setMatchSubmissionError(null);
    setStatus("idle");
    setFeedbackResult(null);
    setLastActionWasSkip(false);
  };

  // Speak the next prompt when the lesson advances.
  useEffect(() => {
    if (currentExercise) {
      const speech = getExerciseSpeech(currentExercise);
      if (speech) sound.speak(speech.text, speech.lang);
    }
  }, [currentIndex, currentExercise]);

  if (loading) {
    return (
      <div className="fixed inset-0 bg-white dark:bg-[#101f24] z-50 flex flex-col items-center justify-center gap-4">
        <DuoMascot mood="happy" size={100} className="animate-bounce" />
        <p className="font-extrabold text-[#777777] dark:text-[#8b9eab] text-sm uppercase tracking-wider">
          Loading lesson...
        </p>
      </div>
    );
  }

  if (!lesson || !currentExercise) {
    return (
      <div className="fixed inset-0 bg-white dark:bg-[#101f24] z-50 flex flex-col items-center justify-center p-6 text-center">
        <p className="font-extrabold text-[#4b4b4b] dark:text-white mb-4">Lesson not found.</p>
        <button onClick={onExit} className="px-6 py-2.5 rounded-xl duo-btn-green font-bold">
          Go Back
        </button>
      </div>
    );
  }

  const totalExercises = lesson.exercises.length;
  const progressPercent = Math.round((resolvedExerciseIds.size / totalExercises) * 100);

  // Check if user has provided an answer to enable the "CHECK" button
  const hasAnswerSelected = () => {
    if (!currentExercise) return false;
    if (currentExercise.type === "multiple_choice" || currentExercise.type === "fill_blank") {
      return Boolean(selectedOption);
    }
    if (currentExercise.type === "translate_words") {
      return selectedTokens.length > 0;
    }
    if (currentExercise.type === "match_pairs") {
      const qPairs =
        (currentExercise.question_data?.pairs as Array<{ left: string; right: string }>) || [];
      return Object.keys(matchedPairs).length === qPairs.length;
    }
    if (currentExercise.type === "type_answer") {
      return typedText.trim().length > 0;
    }
    return false;
  };

  // Submit Answer
  const handleCheck = async () => {
    if (!hasAnswerSelected() || isSubmitting) return;
    setIsSubmitting(true);

    let answerPayload: unknown = null;
    if (currentExercise.type === "multiple_choice" || currentExercise.type === "fill_blank") {
      answerPayload = selectedOption;
    } else if (currentExercise.type === "translate_words") {
      answerPayload = selectedTokens;
    } else if (currentExercise.type === "match_pairs") {
      answerPayload = matchedPairs;
    } else if (currentExercise.type === "type_answer") {
      answerPayload = typedText.trim();
    }

    try {
      const result = await submitAnswer(currentExercise.id, answerPayload);
      setFeedbackResult(result);
      setHearts(result.hearts_remaining);
      setLastActionWasSkip(false);

      if (result.is_correct) {
        sound.playCorrect();
        setStatus("correct");
      } else {
        sound.playIncorrect();
        setStatus("incorrect");
        setMistakesCount((prev) => prev + 1);

        if (result.out_of_hearts || result.hearts_remaining <= 0) {
          setShowOutOfHeartsModal(true);
        }
      }
    } catch (err) {
      console.error("Submission failed:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Skip keeps the exercise pending and requeues it before completion.
  const handleSkip = async () => {
    if (isSubmitting || status !== "idle") return;
    setIsSubmitting(true);

    try {
      setFeedbackResult({
        is_correct: false,
        correct_solution: "This question will come back before the lesson ends.",
        explanation: "Skipped questions stay pending, so you still need to answer this one.",
        hearts_remaining: hearts,
        out_of_hearts: false,
      });
      sound.playIncorrect();
      setStatus("incorrect");
      setLastActionWasSkip(true);
    } catch (err) {
      console.error("Skip failed:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Move to Next Exercise or Complete Lesson
  const handleContinue = async () => {
    sound.playClick();

    if (lastActionWasSkip) {
      setExerciseQueue((queue) => {
        const currentId = queue[currentIndex];
        const nextQueue = queue.filter((id, idx) => idx !== currentIndex && id !== currentId);
        nextQueue.push(currentId);
        return nextQueue;
      });
      resetExerciseState();
      setCurrentIndex((prev) => Math.min(prev, totalExercises - 1));
      return;
    }

    const nextResolved = new Set(resolvedExerciseIds);
    nextResolved.add(currentExercise.id);
    setResolvedExerciseIds(nextResolved);

    if (nextResolved.size >= totalExercises) {
      try {
        await completeLesson(mistakesCount);
      } catch (err) {
        console.error("Failed to complete lesson:", err);
      }
      return;
    }

    let nextIndex = currentIndex + 1;
    while (nextIndex < exerciseQueue.length && nextResolved.has(exerciseQueue[nextIndex])) {
      nextIndex += 1;
    }
    if (nextIndex >= exerciseQueue.length) {
      nextIndex = exerciseQueue.findIndex((id) => !nextResolved.has(id));
    }

    resetExerciseState();
    setCurrentIndex(Math.max(0, nextIndex));
  };

  // Handling match_pairs clicks
  const handleMatchCardClick = (type: "left" | "right", value: string) => {
    if (isSubmitting || isPairAnimating || mismatchPair) return;
    sound.playClick();
    setMismatchError(false);
    setMatchSubmissionError(null);

    if (type === "left") {
      if (activeLeft === value) {
        setActiveLeft(null);
      } else {
        setActiveLeft(value);
        if (activeRight) {
          verifyPair(value, activeRight);
        }
      }
    } else {
      if (activeRight === value) {
        setActiveRight(null);
      } else {
        setActiveRight(value);
        if (activeLeft) {
          verifyPair(activeLeft, value);
        }
      }
    }
  };

  const verifyPair = async (leftVal: string, rightVal: string) => {
    const solutionPairs =
      (currentExercise?.solution_data?.pairs as Record<string, string>) || {};
    if (solutionPairs[leftVal]?.toLowerCase() === rightVal?.toLowerCase()) {
      sound.playCorrect();
      setMatchedPairs((prev) => ({ ...prev, [leftVal]: rightVal }));
      setRecentlyMatchedPair({ left: leftVal, right: rightVal });
      setIsPairAnimating(true);
      setActiveLeft(null);
      setActiveRight(null);
      window.setTimeout(() => {
        setRecentlyMatchedPair(null);
        setIsPairAnimating(false);
      }, 450);
    } else {
      sound.playIncorrect();
      setMismatchError(true);
      setMismatchPair({ left: leftVal, right: rightVal });
      setActiveLeft(null);
      setActiveRight(null);
      setIsSubmitting(true);

      try {
        const result = await submitAnswer(currentExercise.id, { [leftVal]: rightVal });
        setHearts(result.hearts_remaining);
        if (!result.is_correct) {
          setMistakesCount((count) => count + 1);
        }
        if (result.out_of_hearts || result.hearts_remaining <= 0) {
          setShowOutOfHeartsModal(true);
        }
      } catch (error) {
        console.error("Failed to record incorrect matching pair:", error);
        setMatchSubmissionError("We couldn't record that mistake. Check your connection and try again.");
      } finally {
        window.setTimeout(() => {
          setMismatchPair(null);
          setMismatchError(false);
          setIsSubmitting(false);
        }, 650);
      }
    }
  };

  // =================== RENDER CELEBRATION MODAL ===================
  if (completionResult) {
    return (
      <div className="fixed inset-0 bg-white dark:bg-[#101f24] z-50 flex flex-col justify-between items-center p-6 animate-fade-in max-w-2xl mx-auto">
        <div className="w-full flex-1 flex flex-col items-center justify-center text-center space-y-6">
          <DuoMascot mood="celebrating" size={160} className="animate-bounce" />

          <div>
            <h1 className="text-3xl font-extrabold text-[#58cc02] mb-1">
              Lesson Complete!
            </h1>
            <p className="text-sm font-semibold text-[#777777] dark:text-[#8b9eab]">
              {lesson.title} mastered. Keep up the amazing work!
            </p>
          </div>

          {/* Stat Cards Grid */}
          <div className="grid grid-cols-3 gap-3 w-full max-w-md">
            {/* XP Card */}
            <div className="p-4 rounded-2xl border-2 border-[#ffc800] bg-[#fffdf0] dark:bg-[#20281b] flex flex-col items-center">
              <span className="text-xs font-extrabold uppercase text-[#e5b300]">Total XP</span>
              <div className="flex items-center gap-1.5 mt-1">
                <Zap className="w-5 h-5 text-[#ffc800] fill-[#ffc800]" />
                <span className="text-xl font-extrabold text-[#e5b300]">
                  +{completionResult.xp_earned}
                </span>
              </div>
            </div>

            {/* Streak Card */}
            <div className="p-4 rounded-2xl border-2 border-[#ff9600] bg-[#fff9f0] dark:bg-[#2b211a] flex flex-col items-center">
              <span className="text-xs font-extrabold uppercase text-[#ff9600]">Streak</span>
              <div className="flex items-center gap-1.5 mt-1">
                <Flame className="w-5 h-5 text-[#ff9600] fill-[#ff9600]" />
                <span className="text-xl font-extrabold text-[#ff9600]">
                  {completionResult.streak} Days
                </span>
              </div>
            </div>

            {/* Accuracy Card */}
            <div className="p-4 rounded-2xl border-2 border-[#58cc02] bg-[#f3fce8] dark:bg-[#152a1d] flex flex-col items-center">
              <span className="text-xs font-extrabold uppercase text-[#58cc02]">Accuracy</span>
              <span className="text-xl font-extrabold text-[#58cc02] mt-1">
                {mistakesCount === 0 ? "100%" : `${Math.max(60, 100 - mistakesCount * 15)}%`}
              </span>
            </div>
          </div>

          {completionResult.skill_completed && (
            <div className="p-3.5 rounded-2xl bg-[#ddf4ff] dark:bg-[#1b3848] border-2 border-[#84d8ff] dark:border-[#1cb0f6] flex items-center gap-3 max-w-md text-left">
              <Sparkles className="w-6 h-6 text-[#1cb0f6] shrink-0" />
              <div>
                <p className="font-extrabold text-xs text-[#1cb0f6] uppercase tracking-wider">
                  Crown Level Up!
                </p>
                <p className="text-xs font-semibold text-[#4b4b4b] dark:text-slate-200">
                  You completed all lessons in this skill and unlocked the next path!
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Bar */}
        <div className="w-full max-w-md pt-4 border-t-2 border-[#e5e5e5] dark:border-[#2e4550]">
          <button
            onClick={() => {
              sound.playClick();
              onLessonFinished();
            }}
            className="w-full py-4 rounded-2xl duo-btn-green font-extrabold text-base uppercase tracking-wider flex items-center justify-center gap-2"
          >
            <span>CONTINUE</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    );
  }

  // =================== EXERCISE RENDERERS ===================
  const renderExerciseBody = () => {
    const isHardExercise = currentExercise.order >= 3;

    return (
      <div className="space-y-6 w-full max-w-lg">
        {/* Exercise Badge Header (like real Duolingo Image 5) */}
        {isHardExercise && (
          <div className="flex items-center gap-1.5 text-xs font-extrabold text-[#ff4b4b] bg-[#ffebee] dark:bg-[#381418] px-3 py-1 rounded-full w-fit border border-[#ff4b4b]/30">
            <Dumbbell className="w-3.5 h-3.5" />
            <span className="uppercase tracking-wider">HARD EXERCISE</span>
          </div>
        )}

        {/* Prompt Title */}
        <h2 className="text-2xl sm:text-3xl font-extrabold text-[#4b4b4b] dark:text-white leading-tight">
          {currentExercise.prompt}
        </h2>

        {/* Character & Speech Bubble (like real Duolingo Image 5) */}
        {currentExercise.target_text && currentExercise.type !== "fill_blank" && (
          <div className="flex items-center gap-4 pt-2">
            <DuoMascot mood="happy" size={78} className="shrink-0" />
            <div className="p-4 rounded-2xl border-2 border-[#e5e5e5] dark:border-[#2e4550] bg-[#f7f7f7] dark:bg-[#1b2e35] relative flex items-center gap-3 flex-1 shadow-xs">
              {getExerciseSpeech(currentExercise) && (
                <button
                  onClick={() => {
                    const speech = getExerciseSpeech(currentExercise);
                    if (speech) sound.speak(speech.text, speech.lang);
                  }}
                  className="p-2.5 rounded-xl bg-[#ddf4ff] dark:bg-[#1b3848] text-[#1cb0f6] hover:bg-[#bde6ff] transition-colors shrink-0"
                  title="Pronounce"
                >
                  <Volume2 className="w-5 h-5" />
                </button>
              )}
              <span className="font-extrabold text-lg sm:text-xl text-[#4b4b4b] dark:text-white underline decoration-dotted decoration-[#afafaf] underline-offset-4">
                {currentExercise.target_text}
              </span>
              {/* Bubble pointer tail */}
              <div className="absolute top-1/2 -translate-y-1/2 -left-2 w-3.5 h-3.5 bg-[#f7f7f7] dark:bg-[#1b2e35] border-l-2 border-b-2 border-[#e5e5e5] dark:border-[#2e4550] rotate-45" />
            </div>
          </div>
        )}

        {/* Exercise Inputs */}
        {currentExercise.type === "multiple_choice" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            {(
              (currentExercise.question_data?.options as Array<{
                id: string;
                text: string;
                subtext?: string;
              }>) || []
            ).map((opt, idx) => {
              const isSelected = selectedOption === opt.id || selectedOption === opt.text;
              return (
                <button
                  key={opt.id}
                  onClick={() => {
                    if (status !== "idle") return;
                    sound.playClick();
                    sound.speak(opt.subtext ?? opt.text, opt.subtext ? "de-DE" : "en-US");
                    setSelectedOption(opt.text || opt.id);
                  }}
                  className={`p-4 rounded-2xl text-left border-2 border-b-4 transition-all flex items-center justify-between ${
                    isSelected
                      ? "duo-card-selected"
                      : "duo-btn-white hover:bg-[#f7f7f7] dark:hover:bg-[#243c45]"
                  }`}
                >
                  <p className="font-extrabold text-base">{opt.subtext ?? opt.text}</p>
                  <span className="w-6 h-6 rounded-lg border border-[#e5e5e5] dark:border-[#2e4550] text-xs font-bold text-[#afafaf] dark:text-[#8b9eab] flex items-center justify-center">
                    {idx + 1}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {currentExercise.type === "translate_words" && (() => {
          const rawTokens = (currentExercise.question_data?.tokens as string[]) || [];
          const correctTokens = (currentExercise.solution_data?.correct_tokens as string[] | undefined) || [];
          const requiredTokenCounts = new Map<string, number>();
          for (const token of correctTokens) {
            const normalized = normalizeWordTile(token);
            requiredTokenCounts.set(normalized, (requiredTokenCounts.get(normalized) ?? 0) + 1);
          }
          const correctTokenSet = new Set(requiredTokenCounts.keys());
          const allTokens = rawTokens.filter((token) => {
            const normalized = normalizeWordTile(token);
            const requiredCount = requiredTokenCounts.get(normalized) ?? 0;
            if (requiredCount > 0) {
              requiredTokenCounts.set(normalized, requiredCount - 1);
              return true;
            }
            return !correctTokenSet.has(normalized);
          });
          const availableTokens = allTokens.filter(
            (tok) =>
              selectedTokens.filter((t) => t === tok).length <
              allTokens.filter((t) => t === tok).length
          );

          return (
            <div className="space-y-4">
              {/* Dropzone Line */}
              <div className="min-h-[72px] p-3 rounded-2xl border-b-2 border-[#e5e5e5] dark:border-[#2e4550] bg-[#fafafa] dark:bg-[#182930] flex flex-wrap gap-2.5 items-center">
                {selectedTokens.length === 0 && (
                  <span className="text-xs font-bold text-[#afafaf] italic px-2">
                    Tap the words below to form your translation
                  </span>
                )}
                {selectedTokens.map((token, idx) => (
                  <button
                    key={`${token}-${idx}`}
                    onClick={() => {
                      if (status !== "idle") return;
                      sound.playClick();
                      setSelectedTokens((prev) => prev.filter((_, i) => i !== idx));
                    }}
                    className="px-4 py-2.5 rounded-xl duo-btn-white font-extrabold text-sm shadow-sm"
                  >
                    {token}
                  </button>
                ))}
              </div>

              {/* Pool */}
              <div className="flex flex-wrap gap-2.5 pt-4 justify-center">
                {allTokens.map((token, idx) => {
                  const isUsed = !availableTokens.includes(token);
                  return (
                    <button
                      key={`${token}-${idx}`}
                      disabled={isUsed || status !== "idle"}
                      onClick={() => {
                        sound.playClick();
                        sound.speak(token, "de-DE");
                        setSelectedTokens((prev) => [...prev, token]);
                      }}
                      className={`px-4 py-2.5 rounded-xl font-extrabold text-sm transition-all ${
                        isUsed
                          ? "bg-[#e5e5e5] dark:bg-[#203843] text-transparent border-b-4 border-transparent cursor-default pointer-events-none"
                          : "duo-btn-white"
                      }`}
                    >
                      {token}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })()}

        {currentExercise.type === "match_pairs" && (() => {
          const rawPairs =
            (currentExercise.question_data?.pairs as Array<{ left: string; right: string }>) || [];
          const leftWords = rawPairs.map((p) => p.left);
          const rightWords =
            (currentExercise.question_data?.right_options as string[] | undefined) ||
            rawPairs.map((p) => p.right);

          return (
            <div>
              {matchSubmissionError && (
                <p role="alert" className="mb-3 text-center text-sm font-bold text-[#ea2b2b]">
                  {matchSubmissionError}
                </p>
              )}
              <div className={`grid grid-cols-2 gap-3 pt-2 ${mismatchError ? "animate-shake" : ""}`}>
                <div className="space-y-2.5">
                  {leftWords.map((word: string) => {
                    const isMatched = Boolean(matchedPairs[word]);
                    const isSelected = activeLeft === word;
                    const isMismatch = mismatchPair?.left === word;
                    const isRecentlyMatched = recentlyMatchedPair?.left === word;

                    return (
                      <button
                        key={word}
                        disabled={isMatched || isSubmitting || isPairAnimating}
                        onClick={() => {
                          sound.speak(word, "de-DE");
                          handleMatchCardClick("left", word);
                        }}
                        className={`w-full p-4 rounded-2xl font-extrabold text-sm text-left border-2 border-b-4 transition-all ${
                          isMismatch
                            ? "bg-[#ffdfe0] dark:bg-[#381418] text-[#ea2b2b] dark:text-[#ff6b6b] border-[#ff4b4b]"
                            : isRecentlyMatched
                            ? "bg-[#d7ffb8] dark:bg-[#0d2e1b] text-[#58a700] dark:text-[#58cc02] border-[#58cc02]"
                            : isMatched
                            ? "bg-[#f7f7f7] dark:bg-[#192b33] text-[#cecece] dark:text-[#385260] border-transparent cursor-default opacity-50"
                            : isSelected
                            ? "duo-card-selected"
                            : "duo-btn-white"
                        }`}
                      >
                        {word}
                      </button>
                    );
                  })}
                </div>

                <div className="space-y-2.5">
                  {rightWords.map((word: string) => {
                    const isMatched = Object.values(matchedPairs).includes(word);
                    const isSelected = activeRight === word;
                    const isMismatch = mismatchPair?.right === word;
                    const isRecentlyMatched = recentlyMatchedPair?.right === word;

                    return (
                      <button
                        key={word}
                        disabled={isMatched || isSubmitting || isPairAnimating}
                        onClick={() => {
                          sound.speak(word, "en-US");
                          handleMatchCardClick("right", word);
                        }}
                        className={`w-full p-4 rounded-2xl font-extrabold text-sm text-left border-2 border-b-4 transition-all ${
                          isMismatch
                            ? "bg-[#ffdfe0] dark:bg-[#381418] text-[#ea2b2b] dark:text-[#ff6b6b] border-[#ff4b4b]"
                            : isRecentlyMatched
                            ? "bg-[#d7ffb8] dark:bg-[#0d2e1b] text-[#58a700] dark:text-[#58cc02] border-[#58cc02]"
                            : isMatched
                            ? "bg-[#f7f7f7] dark:bg-[#192b33] text-[#cecece] dark:text-[#385260] border-transparent cursor-default opacity-50"
                            : isSelected
                            ? "duo-card-selected"
                            : "duo-btn-white"
                        }`}
                      >
                        {word}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })()}

        {currentExercise.type === "fill_blank" && (() => {
          const qData = currentExercise.question_data as {
            options?: string[];
            sentence_template?: string;
            translation?: string;
          };
          const options = qData.options || [];

          return (
            <div className="space-y-4">
              <div className="p-6 rounded-2xl border-2 border-[#e5e5e5] dark:border-[#2e4550] bg-[#fafafa] dark:bg-[#182930] text-center">
                <p className="text-2xl font-extrabold text-[#4b4b4b] dark:text-white">
                  {qData.sentence_template?.replace(
                    "[blank]",
                    selectedOption ? `[ ${selectedOption} ]` : "_______"
                  )}
                </p>
                {qData.translation && (
                  <p className="text-xs font-semibold text-[#777777] dark:text-[#8b9eab] mt-2">
                    Translation: &quot;{qData.translation}&quot;
                  </p>
                )}
              </div>

              <div className="flex flex-wrap gap-3 justify-center pt-2">
                {options.map((opt) => {
                  const isSelected = selectedOption === opt;
                  return (
                    <button
                      key={opt}
                      onClick={() => {
                        if (status !== "idle") return;
                        sound.playClick();
                        sound.speak(opt, "de-DE");
                        setSelectedOption(opt);
                      }}
                      className={`px-6 py-3 rounded-2xl font-extrabold text-base border-2 border-b-4 transition-all ${
                        isSelected ? "duo-card-selected" : "duo-btn-white"
                      }`}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })()}

        {currentExercise.type === "type_answer" && (() => {
          const isTargetEnglish =
            currentExercise.prompt.toLowerCase().includes("english");
          const placeholder = isTargetEnglish
            ? "Type in English..."
            : "Type in German...";
          const specialChars = ["ae", "oe", "ue", "ss"];

          return (
            <div className="space-y-3">
              <textarea
                value={typedText}
                onChange={(e) => setTypedText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    if (hasAnswerSelected() && status === "idle") {
                      handleCheck();
                    } else if (status !== "idle") {
                      handleContinue();
                    }
                  }
                }}
                disabled={status !== "idle"}
                placeholder={placeholder}
                rows={3}
                className="w-full p-4 rounded-2xl border-2 border-[#e5e5e5] dark:border-[#2e4550] bg-white dark:bg-[#182930] focus:border-[#1cb0f6] focus:outline-none text-base font-bold text-[#4b4b4b] dark:text-white placeholder-[#afafaf] dark:placeholder-[#557585] resize-none"
              />

              {!isTargetEnglish && (
                <div className="flex flex-wrap gap-1.5 justify-center">
                  {specialChars.map((char) => (
                    <button
                      key={char}
                      type="button"
                      onClick={() => {
                        sound.playClick();
                        setTypedText((prev) => prev + char);
                      }}
                      className="w-9 h-9 rounded-xl duo-btn-white text-sm font-extrabold"
                    >
                      {char}
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })()}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-white dark:bg-[#101f24] z-50 flex flex-col justify-between overflow-x-hidden">
      {/* Top Header Bar */}
      <header className="max-w-4xl w-full mx-auto p-4 sm:p-6 flex items-center justify-between gap-4">
        <button
          onClick={() => {
            sound.playClick();
            setShowQuitModal(true);
          }}
          className="p-2 rounded-xl hover:bg-[#f7f7f7] dark:hover:bg-[#1b2e35] text-[#afafaf] hover:text-[#4b4b4b] dark:hover:text-white transition-colors"
          title="Quit Lesson"
        >
          <X className="w-6 h-6 stroke-[3]" />
        </button>

        <button
          type="button"
          onClick={() => {
            const nextMuted = !sound.getMuted();
            sound.setMuted(nextMuted);
            setIsMuted(nextMuted);
            if (!nextMuted) sound.playClick();
          }}
          className="rounded-xl p-2 text-[#777777] transition-colors hover:bg-[#f7f7f7] dark:text-[#8b9eab] dark:hover:bg-[#1b2e35]"
          title={isMuted ? "Unmute audio" : "Mute audio"}
          aria-label={isMuted ? "Unmute audio" : "Mute audio"}
        >
          {isMuted ? (
            <VolumeX className="h-5 w-5 text-[#afafaf]" />
          ) : (
            <Volume2 className="h-5 w-5 text-[#58cc02]" />
          )}
        </button>

        {/* Lesson Progress Bar */}
        <div className="flex-1 h-3.5 bg-[#e5e5e5] dark:bg-[#203843] rounded-full overflow-hidden relative">
          <div
            className="h-full bg-[#58cc02] rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Hearts Indicator */}
        <div className="flex items-center gap-1.5 text-[#ff4b4b] font-extrabold text-base">
          <Heart className="w-6 h-6 fill-[#ff4b4b]" />
          <span>{hearts}</span>
        </div>
      </header>

      {/* Main Exercise Content Area */}
      <main className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 max-w-2xl w-full mx-auto">
        {renderExerciseBody()}
      </main>

      {/* Signature Bottom Bar with SKIP on Left and CHECK/CONTINUE on Right! */}
      <footer
        className={`w-full border-t-2 transition-all duration-200 ${
          status === "correct"
            ? "bg-[#d7ffb8] dark:bg-[#0d2e1b] border-[#b8f28b] dark:border-[#1e6b37]"
            : status === "incorrect"
            ? "bg-[#ffdfe0] dark:bg-[#381418] border-[#ffc1c4] dark:border-[#7a232b]"
            : "bg-white dark:bg-[#101f24] border-[#e5e5e5] dark:border-[#2e4550]"
        }`}
      >
        <div className="max-w-4xl mx-auto p-4 sm:p-6 flex items-center justify-between gap-4">
          {/* Left section: Feedback message when answered, or SKIP button when idle */}
          <div className="flex items-center gap-4 flex-1">
            {status === "idle" ? (
              <button
                onClick={handleSkip}
                disabled={isSubmitting}
                className="px-7 py-3.5 rounded-2xl duo-btn-white font-extrabold text-sm uppercase tracking-wider text-[#777777] dark:text-[#8b9eab] hover:text-[#4b4b4b] dark:hover:text-white transition-colors"
              >
                SKIP
              </button>
            ) : status === "correct" ? (
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-white dark:bg-[#152a1d] flex items-center justify-center shadow-sm shrink-0">
                  <CheckCircle2 className="w-8 h-8 text-[#58cc02]" />
                </div>
                <div>
                  <h3 className="font-extrabold text-xl text-[#58a700] dark:text-[#58cc02]">
                    Nicely done!
                  </h3>
                  {feedbackResult?.explanation && (
                    <p className="text-xs font-semibold text-[#58a700] dark:text-emerald-300 mt-0.5">
                      {feedbackResult.explanation}
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-white dark:bg-[#2b1619] flex items-center justify-center shadow-sm shrink-0">
                  <XCircle className="w-8 h-8 text-[#ff4b4b]" />
                </div>
                <div>
                  <h3 className="font-extrabold text-lg text-[#ea2b2b] dark:text-[#ff6b6b]">
                    Correct solution:
                  </h3>
                  <p className="font-bold text-sm text-[#ea2b2b] dark:text-rose-200">
                    {String(feedbackResult?.correct_solution || "See correction")}
                  </p>
                  {feedbackResult?.explanation && (
                    <p className="text-xs font-semibold text-[#ea2b2b] dark:text-rose-300 opacity-90 mt-0.5">
                      {feedbackResult.explanation}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Right section: CHECK or CONTINUE button */}
          <div className="w-36 sm:w-48 shrink-0">
            {status === "idle" ? (
              <button
                disabled={!hasAnswerSelected() || isSubmitting}
                onClick={handleCheck}
                className={`w-full py-3.5 rounded-2xl font-extrabold text-sm uppercase tracking-wider ${
                  hasAnswerSelected() && !isSubmitting
                    ? "duo-btn-green"
                    : "duo-btn-gray cursor-not-allowed"
                }`}
              >
                CHECK
              </button>
            ) : (
              <button
                onClick={handleContinue}
                className={`w-full py-3.5 rounded-2xl font-extrabold text-sm uppercase tracking-wider ${
                  status === "correct" ? "duo-btn-green" : "duo-btn-red"
                }`}
              >
                CONTINUE
              </button>
            )}
          </div>
        </div>
      </footer>

      {/* Quit Modal */}
      {showQuitModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1b2e35] rounded-3xl max-w-sm w-full p-6 text-center shadow-2xl border-2 border-[#e5e5e5] dark:border-[#2e4550]">
            <DuoMascot mood="sad" size={100} className="mx-auto mb-2" />
            <h3 className="text-xl font-extrabold text-[#4b4b4b] dark:text-white mb-1">
              Are you sure you want to quit?
            </h3>
            <p className="text-xs text-[#777777] dark:text-[#8b9eab] mb-6">
              All progress in this lesson will be lost! Duo will miss you.
            </p>
            <div className="space-y-2">
              <button
                onClick={() => setShowQuitModal(false)}
                className="w-full py-3 rounded-xl duo-btn-green font-extrabold text-xs uppercase tracking-wider"
              >
                KEEP LEARNING
              </button>
              <button
                onClick={onExit}
                className="w-full py-2.5 rounded-xl text-[#ff4b4b] font-extrabold text-xs uppercase tracking-wider hover:bg-[#ffebee] dark:hover:bg-[#2e1417] transition-colors"
              >
                END SESSION
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Out of Hearts Modal */}
      {showOutOfHeartsModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1b2e35] rounded-3xl max-w-sm w-full p-6 text-center shadow-2xl border-2 border-[#e5e5e5] dark:border-[#2e4550]">
            <div className="w-16 h-16 rounded-2xl bg-[#ffebee] dark:bg-[#381418] border-2 border-[#ff4b4b] flex items-center justify-center mx-auto mb-3">
              <Heart className="w-8 h-8 text-[#ff4b4b]" />
            </div>
            <h3 className="text-xl font-extrabold text-[#4b4b4b] dark:text-white mb-1">
              You ran out of hearts!
            </h3>
            <p className="text-xs text-[#777777] dark:text-[#8b9eab] mb-6">
              Refill hearts to continue or take a practice session to replenish your hearts.
            </p>
            <div className="space-y-2">
              <button
                onClick={async () => {
                  try {
                    await refillHearts("gems");
                    setShowOutOfHeartsModal(false);
                    sound.playCorrect();
                  } catch (e: unknown) {
                    console.error(e);
                  }
                }}
                className="w-full py-3 rounded-xl duo-btn-blue font-extrabold text-xs uppercase tracking-wider"
              >
                REFILL (350 GEMS)
              </button>
              <button
                onClick={async () => {
                  await refillHearts("free");
                  setShowOutOfHeartsModal(false);
                  sound.playCorrect();
                }}
                className="w-full py-2.5 rounded-xl duo-btn-green font-extrabold text-xs uppercase tracking-wider"
              >
                FREE PRACTICE REFILL (FULL)
              </button>
              <button
                onClick={onExit}
                className="w-full py-2 rounded-xl text-[#777777] dark:text-[#8b9eab] font-extrabold text-xs uppercase tracking-wider"
              >
                QUIT LESSON
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
