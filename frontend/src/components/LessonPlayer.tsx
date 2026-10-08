"use client";

import React, { useState, useEffect } from "react";
import confetti from "canvas-confetti";
import {
  X,
  Heart,
  Volume2,
  CheckCircle2,
  XCircle,
  Flame,
  Zap,
  RotateCcw,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { LessonDetail, Exercise, api, SubmitResult, CompleteResult } from "@/lib/api";
import { sound } from "@/lib/audio";
import { DuoMascot } from "./DuoMascot";

interface LessonPlayerProps {
  lessonId: number;
  onExit: () => void;
  onLessonFinished: () => void;
}

export const LessonPlayer: React.FC<LessonPlayerProps> = ({
  lessonId,
  onExit,
  onLessonFinished,
}) => {
  const [lesson, setLesson] = useState<LessonDetail | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  // User answers per exercise type
  const [selectedOption, setSelectedOption] = useState<string>("");
  const [selectedTokens, setSelectedTokens] = useState<string[]>([]);
  const [typedText, setTypedText] = useState<string>("");

  // Matching pairs exercise state
  const [matchedPairs, setMatchedPairs] = useState<{ [key: string]: string }>({});
  const [activeLeft, setActiveLeft] = useState<string | null>(null);
  const [activeRight, setActiveRight] = useState<string | null>(null);
  const [mismatchError, setMismatchError] = useState(false);

  // Verification & feedback bar state
  const [status, setStatus] = useState<"idle" | "correct" | "incorrect">("idle");
  const [feedbackResult, setFeedbackResult] = useState<SubmitResult | null>(null);
  const [mistakesCount, setMistakesCount] = useState(0);
  const [hearts, setHearts] = useState(5);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Modals
  const [showQuitModal, setShowQuitModal] = useState(false);
  const [showOutOfHeartsModal, setShowOutOfHeartsModal] = useState(false);
  const [completionResult, setCompletionResult] = useState<CompleteResult | null>(null);

  // Load lesson details
  useEffect(() => {
    let isMounted = true;
    api
      .getLesson(lessonId)
      .then((data) => {
        if (isMounted) {
          setLesson(data);
          setLoading(false);
          // Pronounce initial prompt if audio_text exists
          if (data.exercises[0]?.audio_text) {
            sound.speak(data.exercises[0].audio_text);
          }
        }
      })
      .catch((err) => {
        console.error("Failed to load lesson:", err);
        setLoading(false);
      });

    // Also fetch initial user hearts
    api.getUser().then((u) => setHearts(u.hearts)).catch(() => {});

    return () => {
      isMounted = false;
    };
  }, [lessonId]);

  // Current exercise
  const currentExercise: Exercise | undefined = lesson?.exercises[currentIndex];

  // Reset exercise-specific input states on index change
  useEffect(() => {
    setSelectedOption("");
    setSelectedTokens([]);
    setTypedText("");
    setMatchedPairs({});
    setActiveLeft(null);
    setActiveRight(null);
    setMismatchError(false);
    setStatus("idle");
    setFeedbackResult(null);

    if (currentExercise?.audio_text) {
      sound.speak(currentExercise.audio_text);
    }
  }, [currentIndex, currentExercise]);

  if (loading) {
    return (
      <div className="fixed inset-0 bg-white z-50 flex flex-col items-center justify-center gap-4">
        <DuoMascot mood="happy" size={100} className="animate-bounce" />
        <p className="font-extrabold text-[#777777] text-sm uppercase tracking-wider">
          Loading lesson...
        </p>
      </div>
    );
  }

  if (!lesson || !currentExercise) {
    return (
      <div className="fixed inset-0 bg-white z-50 flex flex-col items-center justify-center p-6 text-center">
        <p className="font-extrabold text-[#4b4b4b] mb-4">Lesson not found.</p>
        <button onClick={onExit} className="px-6 py-2.5 rounded-xl duo-btn-green font-bold">
          Go Back
        </button>
      </div>
    );
  }

  const totalExercises = lesson.exercises.length;
  const progressPercent = Math.round((currentIndex / totalExercises) * 100);

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
      const qPairs = currentExercise.question_data?.pairs || [];
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

    let answerPayload: any = null;
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
      const result = await api.submitAnswer(currentExercise.id, answerPayload);
      setFeedbackResult(result);
      setHearts(result.hearts_remaining);

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

  // Move to Next Exercise or Complete Lesson
  const handleContinue = async () => {
    sound.playClick();
    if (currentIndex + 1 < totalExercises) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      // Completed all exercises in lesson!
      try {
        const res = await api.completeLesson(lesson.id, {
          mistakes_count: mistakesCount,
          time_spent_seconds: 90,
        });
        setCompletionResult(res);
        sound.playLessonComplete();
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 },
        });
      } catch (err) {
        console.error("Failed to complete lesson:", err);
      }
    }
  };

  // Handling match_pairs clicks
  const handleMatchCardClick = (type: "left" | "right", value: string) => {
    sound.playClick();
    setMismatchError(false);

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

  const verifyPair = (leftVal: string, rightVal: string) => {
    const solutionPairs = currentExercise?.solution_data?.pairs || {};
    if (solutionPairs[leftVal]?.toLowerCase() === rightVal?.toLowerCase()) {
      sound.playCorrect();
      setMatchedPairs((prev) => ({ ...prev, [leftVal]: rightVal }));
      setActiveLeft(null);
      setActiveRight(null);
    } else {
      sound.playIncorrect();
      setMismatchError(true);
      setTimeout(() => {
        setActiveLeft(null);
        setActiveRight(null);
        setMismatchError(false);
      }, 700);
    }
  };

  // =================== RENDER CELEBRATION MODAL ===================
  if (completionResult) {
    return (
      <div className="fixed inset-0 bg-white z-50 flex flex-col justify-between items-center p-6 animate-fade-in max-w-2xl mx-auto">
        <div className="w-full flex-1 flex flex-col items-center justify-center text-center space-y-6">
          <DuoMascot mood="celebrating" size={160} className="animate-bounce" />

          <div>
            <h1 className="text-3xl font-extrabold text-[#58cc02] mb-1">
              Lesson Complete!
            </h1>
            <p className="text-sm font-semibold text-[#777777]">
              {lesson.title} mastered. Keep up the amazing work!
            </p>
          </div>

          {/* Stat Cards Grid */}
          <div className="grid grid-cols-3 gap-3 w-full max-w-md">
            {/* XP Card */}
            <div className="p-4 rounded-2xl border-2 border-[#ffc800] bg-[#fffdf0] flex flex-col items-center">
              <span className="text-xs font-extrabold uppercase text-[#e5b300]">Total XP</span>
              <div className="flex items-center gap-1.5 mt-1">
                <Zap className="w-5 h-5 text-[#ffc800] fill-[#ffc800]" />
                <span className="text-xl font-extrabold text-[#e5b300]">
                  +{completionResult.xp_earned}
                </span>
              </div>
            </div>

            {/* Streak Card */}
            <div className="p-4 rounded-2xl border-2 border-[#ff9600] bg-[#fff9f0] flex flex-col items-center">
              <span className="text-xs font-extrabold uppercase text-[#ff9600]">Streak</span>
              <div className="flex items-center gap-1.5 mt-1">
                <Flame className="w-5 h-5 text-[#ff9600] fill-[#ff9600]" />
                <span className="text-xl font-extrabold text-[#ff9600]">
                  {completionResult.streak} Days
                </span>
              </div>
            </div>

            {/* Accuracy Card */}
            <div className="p-4 rounded-2xl border-2 border-[#58cc02] bg-[#f3fce8] flex flex-col items-center">
              <span className="text-xs font-extrabold uppercase text-[#58cc02]">Accuracy</span>
              <span className="text-xl font-extrabold text-[#58cc02] mt-1">
                {mistakesCount === 0 ? "100%" : `${Math.max(60, 100 - mistakesCount * 15)}%`}
              </span>
            </div>
          </div>

          {completionResult.skill_completed && (
            <div className="p-3.5 rounded-2xl bg-[#ddf4ff] border-2 border-[#84d8ff] flex items-center gap-3 max-w-md text-left">
              <Sparkles className="w-6 h-6 text-[#1cb0f6] shrink-0" />
              <div>
                <p className="font-extrabold text-xs text-[#1cb0f6] uppercase tracking-wider">
                  Crown Level Up!
                </p>
                <p className="text-xs font-semibold text-[#4b4b4b]">
                  You completed all lessons in this skill and unlocked the next path!
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Bar */}
        <div className="w-full max-w-md pt-4 border-t-2 border-[#e5e5e5]">
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
    switch (currentExercise.type) {
      case "multiple_choice": {
        const options = currentExercise.question_data?.options || [];
        return (
          <div className="space-y-6 w-full max-w-lg">
            {/* Prompt & Audio */}
            <div className="flex items-center gap-4">
              {currentExercise.audio_text && (
                <button
                  onClick={() => sound.speak(currentExercise.audio_text!)}
                  className="w-14 h-14 rounded-2xl duo-btn-blue flex items-center justify-center shrink-0"
                  title="Listen"
                >
                  <Volume2 className="w-7 h-7" />
                </button>
              )}
              <div>
                <h2 className="text-xl sm:text-2xl font-extrabold text-[#4b4b4b]">
                  {currentExercise.prompt}
                </h2>
                {currentExercise.target_text && (
                  <p className="text-base text-[#777777] font-semibold mt-1">
                    "{currentExercise.target_text}"
                  </p>
                )}
              </div>
            </div>

            {/* Options Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4">
              {options.map((opt: any, idx: number) => {
                const isSelected = selectedOption === opt.id || selectedOption === opt.text;
                return (
                  <button
                    key={opt.id}
                    onClick={() => {
                      if (status !== "idle") return;
                      sound.playClick();
                      setSelectedOption(opt.text || opt.id);
                    }}
                    className={`p-4 rounded-2xl text-left border-2 border-b-4 transition-all flex items-center justify-between ${
                      isSelected
                        ? "duo-card-selected"
                        : "duo-btn-white hover:bg-[#f7f7f7]"
                    }`}
                  >
                    <div>
                      <p className="font-extrabold text-base">{opt.text}</p>
                      {opt.subtext && (
                        <p className="text-xs text-[#777777] font-medium mt-0.5">
                          {opt.subtext}
                        </p>
                      )}
                    </div>
                    <span className="w-6 h-6 rounded-lg border border-[#e5e5e5] text-xs font-bold text-[#afafaf] flex items-center justify-center">
                      {idx + 1}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        );
      }

      case "translate_words": {
        const allTokens: string[] = currentExercise.question_data?.tokens || [];
        const availableTokens = allTokens.filter(
          (tok) =>
            selectedTokens.filter((t) => t === tok).length <
            allTokens.filter((t) => t === tok).length
        );

        return (
          <div className="space-y-6 w-full max-w-lg">
            <h2 className="text-xl sm:text-2xl font-extrabold text-[#4b4b4b]">
              {currentExercise.prompt}
            </h2>

            {/* Sentence Speech Bubble with Mascot */}
            <div className="flex items-start gap-4">
              <DuoMascot mood="happy" size={76} />
              <div className="p-4 rounded-2xl border-2 border-[#e5e5e5] bg-[#f7f7f7] relative flex items-center gap-3 flex-1">
                {currentExercise.audio_text && (
                  <button
                    onClick={() => sound.speak(currentExercise.audio_text!)}
                    className="p-2 rounded-xl bg-[#ddf4ff] text-[#1cb0f6] hover:bg-[#bde6ff] transition-colors shrink-0"
                  >
                    <Volume2 className="w-5 h-5" />
                  </button>
                )}
                <span className="font-extrabold text-base text-[#4b4b4b]">
                  {currentExercise.target_text}
                </span>
                {/* Speech bubble tail */}
                <div className="absolute top-6 -left-2 w-3 h-3 bg-[#f7f7f7] border-l-2 border-b-2 border-[#e5e5e5] rotate-45" />
              </div>
            </div>

            {/* Target Words Dropzone (Sentence line) */}
            <div className="min-h-[64px] p-3 rounded-2xl border-b-2 border-[#e5e5e5] bg-[#fafafa] flex flex-wrap gap-2 items-center">
              {selectedTokens.map((token, idx) => (
                <button
                  key={`${token}-${idx}`}
                  onClick={() => {
                    if (status !== "idle") return;
                    sound.playClick();
                    setSelectedTokens((prev) => prev.filter((_, i) => i !== idx));
                  }}
                  className="px-3.5 py-2 rounded-xl duo-btn-white font-extrabold text-sm shadow-sm"
                >
                  {token}
                </button>
              ))}
            </div>

            {/* Words Pool */}
            <div className="flex flex-wrap gap-2.5 pt-4 justify-center">
              {allTokens.map((token, idx) => {
                const isUsed = !availableTokens.includes(token);
                return (
                  <button
                    key={`${token}-${idx}`}
                    disabled={isUsed || status !== "idle"}
                    onClick={() => {
                      sound.playClick();
                      setSelectedTokens((prev) => [...prev, token]);
                    }}
                    className={`px-4 py-2.5 rounded-xl font-extrabold text-sm transition-all ${
                      isUsed
                        ? "bg-[#e5e5e5] text-transparent border-b-4 border-transparent cursor-default pointer-events-none"
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
      }

      case "match_pairs": {
        const rawPairs = currentExercise.question_data?.pairs || [];
        const leftWords = rawPairs.map((p: any) => p.left);
        const rightWords = rawPairs.map((p: any) => p.right);

        return (
          <div className="space-y-6 w-full max-w-lg">
            <h2 className="text-xl sm:text-2xl font-extrabold text-[#4b4b4b]">
              {currentExercise.prompt}
            </h2>

            <div className={`grid grid-cols-2 gap-3 pt-2 ${mismatchError ? "animate-shake" : ""}`}>
              {/* Left Column (Spanish) */}
              <div className="space-y-2.5">
                {leftWords.map((word: string) => {
                  const isMatched = Boolean(matchedPairs[word]);
                  const isSelected = activeLeft === word;

                  return (
                    <button
                      key={word}
                      disabled={isMatched}
                      onClick={() => handleMatchCardClick("left", word)}
                      className={`w-full p-4 rounded-2xl font-extrabold text-sm text-left border-2 border-b-4 transition-all ${
                        isMatched
                          ? "bg-[#f7f7f7] text-[#cecece] border-transparent cursor-default opacity-50"
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

              {/* Right Column (English) */}
              <div className="space-y-2.5">
                {rightWords.map((word: string) => {
                  const isMatched = Object.values(matchedPairs).includes(word);
                  const isSelected = activeRight === word;

                  return (
                    <button
                      key={word}
                      disabled={isMatched}
                      onClick={() => handleMatchCardClick("right", word)}
                      className={`w-full p-4 rounded-2xl font-extrabold text-sm text-left border-2 border-b-4 transition-all ${
                        isMatched
                          ? "bg-[#f7f7f7] text-[#cecece] border-transparent cursor-default opacity-50"
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
      }

      case "fill_blank": {
        const qData = currentExercise.question_data || {};
        const options: string[] = qData.options || [];

        return (
          <div className="space-y-6 w-full max-w-lg">
            <h2 className="text-xl sm:text-2xl font-extrabold text-[#4b4b4b]">
              {currentExercise.prompt}
            </h2>

            {/* Sentence with blank */}
            <div className="p-6 rounded-2xl border-2 border-[#e5e5e5] bg-[#fafafa] text-center">
              <p className="text-2xl font-extrabold text-[#4b4b4b]">
                {qData.sentence_template?.replace(
                  "[blank]",
                  selectedOption ? `[ ${selectedOption} ]` : "_______"
                )}
              </p>
              {qData.translation && (
                <p className="text-xs font-semibold text-[#777777] mt-2">
                  Translation: "{qData.translation}"
                </p>
              )}
            </div>

            {/* Options pills */}
            <div className="flex flex-wrap gap-3 justify-center pt-4">
              {options.map((opt) => {
                const isSelected = selectedOption === opt;
                return (
                  <button
                    key={opt}
                    onClick={() => {
                      if (status !== "idle") return;
                      sound.playClick();
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
      }

      case "type_answer": {
        const specialChars = ["á", "é", "í", "ó", "ú", "ñ", "¿", "¡"];

        return (
          <div className="space-y-6 w-full max-w-lg">
            <h2 className="text-xl sm:text-2xl font-extrabold text-[#4b4b4b]">
              {currentExercise.prompt}
            </h2>

            <div className="p-4 rounded-2xl border-2 border-[#e5e5e5] bg-[#f7f7f7] flex items-center gap-3">
              {currentExercise.audio_text && (
                <button
                  onClick={() => sound.speak(currentExercise.audio_text!)}
                  className="p-2 rounded-xl bg-[#ddf4ff] text-[#1cb0f6] shrink-0"
                >
                  <Volume2 className="w-5 h-5" />
                </button>
              )}
              <span className="font-extrabold text-lg text-[#4b4b4b]">
                {currentExercise.target_text}
              </span>
            </div>

            {/* Textarea */}
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
                placeholder="Type your answer in Spanish..."
                rows={3}
                className="w-full p-4 rounded-2xl border-2 border-[#e5e5e5] focus:border-[#1cb0f6] focus:outline-none text-base font-bold text-[#4b4b4b] placeholder-[#afafaf] resize-none"
              />

              {/* Spanish Special Characters Bar */}
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
            </div>
          </div>
        );
      }

      default:
        return <div>Exercise type not supported yet.</div>;
    }
  };

  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col justify-between overflow-x-hidden">
      {/* Top Header Bar */}
      <header className="max-w-4xl w-full mx-auto p-4 sm:p-6 flex items-center justify-between gap-4">
        <button
          onClick={() => {
            sound.playClick();
            setShowQuitModal(true);
          }}
          className="p-2 rounded-xl hover:bg-[#f7f7f7] text-[#afafaf] hover:text-[#4b4b4b] transition-colors"
          title="Quit Lesson"
        >
          <X className="w-6 h-6 stroke-[3]" />
        </button>

        {/* Lesson Progress Bar */}
        <div className="flex-1 h-3.5 bg-[#e5e5e5] rounded-full overflow-hidden relative">
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

      {/* Bottom Feedback Bar */}
      <footer
        className={`w-full border-t-2 transition-all duration-200 ${
          status === "correct"
            ? "bg-[#d7ffb8] border-[#b8f28b]"
            : status === "incorrect"
            ? "bg-[#ffdfe0] border-[#ffc1c4]"
            : "bg-white border-[#e5e5e5]"
        }`}
      >
        <div className="max-w-3xl mx-auto p-4 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Feedback details */}
          <div className="flex items-center gap-4 w-full sm:w-auto">
            {status === "correct" && (
              <>
                <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-sm shrink-0">
                  <CheckCircle2 className="w-8 h-8 text-[#58cc02]" />
                </div>
                <div>
                  <h3 className="font-extrabold text-xl text-[#58a700]">
                    Nicely done!
                  </h3>
                  {feedbackResult?.explanation && (
                    <p className="text-xs font-semibold text-[#58a700] mt-0.5">
                      {feedbackResult.explanation}
                    </p>
                  )}
                </div>
              </>
            )}

            {status === "incorrect" && (
              <>
                <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-sm shrink-0">
                  <XCircle className="w-8 h-8 text-[#ff4b4b]" />
                </div>
                <div>
                  <h3 className="font-extrabold text-lg text-[#ea2b2b]">
                    Correct solution:
                  </h3>
                  <p className="font-bold text-sm text-[#ea2b2b]">
                    {feedbackResult?.correct_solution || "See correction above"}
                  </p>
                  {feedbackResult?.explanation && (
                    <p className="text-xs font-semibold text-[#ea2b2b] opacity-90 mt-0.5">
                      {feedbackResult.explanation}
                    </p>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Action Button: CHECK or CONTINUE */}
          <div className="w-full sm:w-48 shrink-0">
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
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 text-center shadow-2xl border-2 border-[#e5e5e5]">
            <DuoMascot mood="sad" size={100} className="mx-auto mb-2" />
            <h3 className="text-xl font-extrabold text-[#4b4b4b] mb-1">
              Are you sure you want to quit?
            </h3>
            <p className="text-xs text-[#777777] mb-6">
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
                className="w-full py-2.5 rounded-xl text-[#ff4b4b] font-extrabold text-xs uppercase tracking-wider hover:bg-[#ffebee] transition-colors"
              >
                END SESSION
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Out of Hearts Modal */}
      {showOutOfHeartsModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 text-center shadow-2xl border-2 border-[#e5e5e5]">
            <div className="w-16 h-16 rounded-2xl bg-[#ffebee] border-2 border-[#ff4b4b] flex items-center justify-center mx-auto mb-3">
              <Heart className="w-8 h-8 text-[#ff4b4b]" />
            </div>
            <h3 className="text-xl font-extrabold text-[#4b4b4b] mb-1">
              You ran out of hearts!
            </h3>
            <p className="text-xs text-[#777777] mb-6">
              Refill hearts to continue or take a practice session to replenish your hearts.
            </p>
            <div className="space-y-2">
              <button
                onClick={async () => {
                  try {
                    await api.refillHearts("gems");
                    setHearts(5);
                    setShowOutOfHeartsModal(false);
                    sound.playCorrect();
                  } catch (e: any) {
                    alert(e.message || "Not enough gems!");
                  }
                }}
                className="w-full py-3 rounded-xl duo-btn-blue font-extrabold text-xs uppercase tracking-wider"
              >
                REFILL (350 GEMS)
              </button>
              <button
                onClick={async () => {
                  await api.refillHearts("free");
                  setHearts(5);
                  setShowOutOfHeartsModal(false);
                  sound.playCorrect();
                }}
                className="w-full py-2.5 rounded-xl duo-btn-green font-extrabold text-xs uppercase tracking-wider"
              >
                FREE PRACTICE REFILL (FULL)
              </button>
              <button
                onClick={onExit}
                className="w-full py-2 rounded-xl text-[#777777] font-extrabold text-xs uppercase tracking-wider"
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
