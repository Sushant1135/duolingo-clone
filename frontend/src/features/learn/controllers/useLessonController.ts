"use client";

import { useCallback, useEffect, useState } from "react";
import confetti from "canvas-confetti";
import { api } from "@/services/api";
import { sound } from "@/services/audio";
import { shuffleExerciseOptions } from "@/features/learn/models/lesson";
import type { CompleteResult, LessonDetail, SubmitResult } from "@/models/api";

export function useLessonController(lessonId: number) {
  const [lesson, setLesson] = useState<LessonDetail | null>(null);
  const [exerciseQueue, setExerciseQueue] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [hearts, setHearts] = useState(5);
  const [completionResult, setCompletionResult] = useState<CompleteResult | null>(null);
  const [timeSpentSeconds, setTimeSpentSeconds] = useState(0);

  useEffect(() => {
    let active = true;

    void api.getLesson(lessonId)
      .then((data) => {
        if (!active) return;
        const exercises = data.exercises.map(shuffleExerciseOptions);
        setLesson({ ...data, exercises });
        setExerciseQueue(exercises.map((exercise) => exercise.id));
        setLoading(false);
      })
      .catch((error: unknown) => {
        console.error("Failed to load lesson:", error);
        if (active) setLoading(false);
      });

    void api.getUser()
      .then((user) => {
        if (active) setHearts(user.hearts);
      })
      .catch((error: unknown) => console.error("Failed to load learner hearts:", error));

    return () => {
      active = false;
    };
  }, [lessonId]);

  useEffect(() => {
    if (!lesson || completionResult) return;
    const interval = window.setInterval(() => {
      setTimeSpentSeconds((elapsed) => elapsed + 1);
    }, 1000);
    return () => window.clearInterval(interval);
  }, [completionResult, lesson]);

  const submitAnswer = useCallback(
    (exerciseId: number, answer: unknown): Promise<SubmitResult> =>
      api.submitAnswer(exerciseId, answer),
    [],
  );

  const completeLesson = useCallback(async (mistakesCount: number) => {
    if (!lesson) throw new Error("Cannot complete a lesson before its content is loaded.");
    const result = await api.completeLesson(lesson.id, {
      mistakes_count: mistakesCount,
      time_spent_seconds: timeSpentSeconds,
    });
    setCompletionResult(result);
    sound.playLessonComplete();
    confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
    return result;
  }, [lesson, timeSpentSeconds]);

  const refillHearts = useCallback(async (method: "gems" | "practice" | "free") => {
    const result = await api.refillHearts(method);
    setHearts(result.hearts);
    return result;
  }, []);

  return {
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
  };
}
