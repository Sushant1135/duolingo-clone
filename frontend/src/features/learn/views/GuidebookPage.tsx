"use client";

import React, { useEffect, useState } from "react";
import { ArrowLeft, BookOpen, Volume2 } from "lucide-react";
import { DuoMascot } from "@/shared/views/components/DuoMascot";
import { api } from "@/services/api";
import { Exercise, Unit } from "@/models/api";
import { sound } from "@/services/audio";

interface GuidebookPageProps {
  unit: Unit;
  onBack: () => void;
}

interface GuideSection {
  title: string;
  paragraphs: string[];
}

interface SkillExamples {
  skillTitle: string;
  vocabulary: Array<{ german: string; english: string }>;
  phrase?: { german: string; english: string };
}

function parseGuideSections(markdown: string): GuideSection[] {
  const sections: GuideSection[] = [];
  let current: GuideSection = { title: "Unit overview", paragraphs: [] };

  for (const rawLine of markdown.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line) continue;

    const heading = line.match(/^#{1,4}\s+(.+)$/);
    if (heading) {
      if (current.paragraphs.length > 0 || (current.title !== "Unit overview" && current.title)) {
        sections.push(current);
      }
      current = { title: heading[1], paragraphs: [] };
    } else {
      current.paragraphs.push(line.replace(/^-\s+/, ""));
    }
  }
  if (current.paragraphs.length > 0) sections.push(current);
  return sections;
}

function renderInlineMarkdown(text: string): React.ReactNode[] {
  return text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g).map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={index} className="font-extrabold text-[#4b4b4b] dark:text-white">{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith("*") && part.endsWith("*")) {
      return <em key={index}>{part.slice(1, -1)}</em>;
    }
    return <React.Fragment key={index}>{part}</React.Fragment>;
  });
}

function getPairs(exercise: Exercise): Array<{ left: string; right: string }> {
  const pairs = exercise.question_data.pairs;
  if (!Array.isArray(pairs)) return [];
  return pairs.filter((pair): pair is { left: string; right: string } =>
    typeof pair === "object" &&
    pair !== null &&
    "left" in pair &&
    "right" in pair &&
    typeof pair.left === "string" &&
    typeof pair.right === "string"
  );
}

export const GuidebookPage: React.FC<GuidebookPageProps> = ({ unit, onBack }) => {
  const [examples, setExamples] = useState<SkillExamples[]>([]);
  const [loadingExamples, setLoadingExamples] = useState(true);
  const [examplesError, setExamplesError] = useState<string | null>(null);
  const sections = parseGuideSections(unit.guide_content || "");

  useEffect(() => {
    let cancelled = false;
    const loadExamples = async () => {
      try {
        const results = await Promise.all(
          unit.skills.map(async (skill) => {
            const firstLesson = skill.lessons[0];
            if (!firstLesson) {
              return { skillTitle: skill.title, vocabulary: [] };
            }
            const lesson = await api.getLesson(firstLesson.id);
            const pairExercise = lesson.exercises.find((exercise) => exercise.type === "match_pairs");
            const translation = lesson.exercises.find((exercise) => exercise.type === "translate_words");
            return {
              skillTitle: skill.title,
              vocabulary: pairExercise ? getPairs(pairExercise).map(({ left, right }) => ({
                german: left,
                english: right,
              })) : [],
              ...(translation?.audio_text && translation.target_text
                ? { phrase: { german: translation.audio_text, english: translation.target_text } }
                : {}),
            };
          })
        );
        if (!cancelled) {
          setExamples(results);
          setExamplesError(null);
        }
      } catch (error) {
        console.error("Failed to load guidebook examples:", error);
        if (!cancelled) setExamplesError("Key phrases and vocabulary could not be loaded.");
      } finally {
        if (!cancelled) setLoadingExamples(false);
      }
    };
    void loadExamples();
    return () => {
      cancelled = true;
    };
  }, [unit]);

  return (
    <main className="mx-auto w-full max-w-[900px] px-4 pb-24 pt-5 sm:px-6">
      <button
        type="button"
        onClick={() => {
          sound.playClick();
          onBack();
        }}
        className="mb-5 inline-flex items-center gap-2 text-sm font-extrabold text-[var(--text-secondary)] transition-colors hover:text-[#1cb0f6]"
      >
        <ArrowLeft className="h-5 w-5" />
        Back
      </button>
      <div className="mb-6 border-t-2 border-[var(--border)]" />

      <section className="mb-7 flex flex-col items-center gap-5 border-b-2 border-[var(--border)] pb-7 sm:flex-row sm:gap-8">
        <DuoMascot mood="happy" size={150} className="shrink-0" />
        <div>
          <p className="text-sm font-extrabold uppercase tracking-wide text-[#1cb0f6]">
            Unit {unit.unit_number} Guidebook
          </p>
          <h1 className="mt-1 text-2xl font-extrabold sm:text-3xl">{unit.title.replace(/^Unit \d+:\s*/, "")}</h1>
          <p className="mt-2 text-base font-medium leading-relaxed text-[#52656d] dark:text-[#d7e1e8]">{unit.subtitle}</p>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="mb-4 text-base font-extrabold uppercase tracking-wide text-[#1cb0f6]">Key phrases</h2>
        {loadingExamples ? (
          <p className="rounded-xl border-2 border-[var(--border)] p-4 text-sm font-semibold text-[var(--text-secondary)]">
            Loading unit phrases...
          </p>
        ) : examplesError ? (
          <p role="alert" className="rounded-xl border border-[#ff4b4b]/30 bg-[#ff4b4b]/10 p-4 text-sm font-semibold text-[#c43a3a] dark:text-[#ff8585]">
            {examplesError}
          </p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {examples.filter((example) => example.phrase).map((example) => (
              <div key={example.skillTitle} className="flex items-start gap-3 rounded-2xl border-2 border-[var(--border)] bg-[var(--surface)] p-4">
                <button
                  type="button"
                  onClick={() => sound.speak(example.phrase!.german, "de-DE")}
                  aria-label={`Pronounce ${example.phrase!.german}`}
                  className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#ddf4ff] text-[#1cb0f6] transition-colors hover:bg-[#bde6ff] dark:bg-[#1b3848] dark:hover:bg-[#244b5d]"
                >
                  <Volume2 className="h-5 w-5" />
                </button>
                <div className="min-w-0">
                  <p className="font-extrabold leading-relaxed">{example.phrase!.german}</p>
                  <p className="mt-1 text-sm font-medium text-[#52656d] dark:text-[#8b9eab]">{example.phrase!.english}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {examples.some((example) => example.vocabulary.length > 0) && (
        <section className="mb-8">
          <h2 className="mb-4 text-base font-extrabold uppercase tracking-wide text-[#1cb0f6]">Vocabulary</h2>
          <div className="space-y-5">
            {examples.filter((example) => example.vocabulary.length > 0).map((example) => (
              <div key={example.skillTitle} className="overflow-hidden rounded-2xl border-2 border-[var(--border)]">
                <h3 className="bg-[#e8f7ff] px-4 py-3 font-extrabold text-[#1687bd] dark:bg-[#1b3848] dark:text-[#69cfff]">
                  {example.skillTitle}
                </h3>
                <div className="grid grid-cols-2 bg-[#eef8fc] px-4 py-3 text-sm font-extrabold dark:bg-[#244958]">
                  <span>German</span>
                  <span>English</span>
                </div>
                {example.vocabulary.map((word) => (
                  <div key={`${example.skillTitle}-${word.german}`} className="grid grid-cols-2 border-t border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm">
                    <button
                      type="button"
                      onClick={() => sound.speak(word.german, "de-DE")}
                      className="flex items-center gap-2 text-left font-extrabold text-[#1cb0f6] hover:underline"
                      aria-label={`Pronounce ${word.german}`}
                    >
                      <Volume2 className="h-4 w-4 shrink-0" />
                      {word.german}
                    </button>
                    <span className="font-medium">{word.english}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="mb-4">
        <h2 className="mb-4 text-base font-extrabold uppercase tracking-wide text-[#1cb0f6]">Tips & grammar</h2>
        <div className="space-y-5">
          {sections.map((section, index) => (
            <article key={`${section.title}-${index}`} className="rounded-2xl border-2 border-[var(--border)] bg-[var(--surface-secondary)] p-5 sm:p-6">
              <p className="text-xs font-extrabold uppercase tracking-wider text-[#1cb0f6]">Tip {index + 1}</p>
              <h3 className="mt-2 text-xl font-extrabold">{section.title}</h3>
              <div className="mt-4 space-y-3 text-[15px] leading-relaxed text-[#52656d] dark:text-[#d7e1e8]">
                {section.paragraphs.map((paragraph, paragraphIndex) => (
                  <p key={paragraphIndex}>{renderInlineMarkdown(paragraph)}</p>
                ))}
              </div>
            </article>
          ))}
          {sections.length === 0 && (
            <div className="rounded-2xl border-2 border-[var(--border)] bg-[var(--surface-secondary)] p-5">
              <BookOpen className="mb-3 h-6 w-6 text-[#1cb0f6]" />
              <p className="text-sm leading-relaxed">{unit.subtitle}</p>
            </div>
          )}
        </div>
      </section>
    </main>
  );
};
