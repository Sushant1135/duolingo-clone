import type { Exercise } from "@/models/types";

const shuffle = <T,>(items: T[]): T[] => {
  const shuffled = [...items];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }
  return shuffled;
};

export const shuffleExerciseOptions = (exercise: Exercise): Exercise => {
  const questionData = { ...exercise.question_data };

  if (exercise.type === "multiple_choice" && Array.isArray(questionData.options)) {
    questionData.options = shuffle(questionData.options as Array<{ id: string; text: string; subtext?: string }>);
  } else if (exercise.type === "translate_words" && Array.isArray(questionData.tokens)) {
    questionData.tokens = shuffle(questionData.tokens as string[]);
  } else if (exercise.type === "match_pairs" && Array.isArray(questionData.pairs)) {
    const pairs = shuffle(questionData.pairs as Array<{ left: string; right: string }>);
    questionData.pairs = pairs;
    questionData.right_options = shuffle(pairs.map((pair) => pair.right));
  } else if (exercise.type === "fill_blank" && Array.isArray(questionData.options)) {
    questionData.options = shuffle(questionData.options as string[]);
  }

  return { ...exercise, question_data: questionData };
};
