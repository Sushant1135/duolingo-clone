"use client";

import React from "react";
import { X, BookOpen, Volume2 } from "lucide-react";
import { sound } from "@/services/audio";

interface GuidebookModalProps {
  isOpen: boolean;
  onClose: () => void;
  unit: {
    unit_number: number;
    title: string;
    subtitle: string;
    color: string;
    guide_content?: string;
    content?: string;
  } | null;
}

const renderInlineMarkdown = (text: string) => {
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g);
  return parts.map((part, idx) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={idx}>{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith("*") && part.endsWith("*")) {
      return <em key={idx}>{part.slice(1, -1)}</em>;
    }
    return <React.Fragment key={idx}>{part}</React.Fragment>;
  });
};

const getSpeakableText = (line: string) =>
  line
    .replace(/^[-*\d.)\s]+/, "")
    .replace(/\*\*/g, "")
    .split("=")[0]
    .trim();

const renderGuidebookContent = (markdown: string) => {
  const lines = markdown.split(/\r?\n/);
  const elements: React.ReactNode[] = [];
  let listItems: string[] = [];

  const flushList = () => {
    if (listItems.length === 0) return;
    elements.push(
      <ul key={`list-${elements.length}`} className="space-y-2">
        {listItems.map((item, idx) => {
          const speakable = getSpeakableText(item);
          return (
            <li
              key={`${item}-${idx}`}
              className="flex items-start justify-between gap-3 rounded-xl border border-[#e5e5e5] dark:border-[#2e4550] bg-white dark:bg-[#132329] p-3"
            >
              <span className="text-sm leading-relaxed text-[#4b4b4b] dark:text-white">
                {renderInlineMarkdown(item)}
              </span>
              {speakable && (
                <button
                  type="button"
                  onClick={() => sound.speak(speakable, "de-DE")}
                  className="shrink-0 p-2 rounded-lg bg-[#ddf4ff] dark:bg-[#1b3848] text-[#1cb0f6] hover:bg-[#bde6ff] transition-colors"
                  aria-label={`Pronounce ${speakable}`}
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              )}
            </li>
          );
        })}
      </ul>
    );
    listItems = [];
  };

  lines.forEach((rawLine, idx) => {
    const line = rawLine.trim();
    if (!line) {
      flushList();
      return;
    }

    if (line.startsWith("- ")) {
      listItems.push(line.slice(2));
      return;
    }

    flushList();

    if (line.startsWith("#### ")) {
      elements.push(
        <h4 key={idx} className="pt-2 text-sm font-bold uppercase tracking-wider text-[#777777] dark:text-[#8b9eab]">
          {line.slice(5)}
        </h4>
      );
    } else if (line.startsWith("### ")) {
      elements.push(
        <h3 key={idx} className="pt-2 text-xl font-bold text-[#4b4b4b] dark:text-white">
          {line.slice(4)}
        </h3>
      );
    } else if (line.startsWith("## ")) {
      elements.push(
        <h3 key={idx} className="pt-2 text-xl font-bold text-[#4b4b4b] dark:text-white">
          {line.slice(3)}
        </h3>
      );
    } else if (line.startsWith("# ")) {
      elements.push(
        <h3 key={idx} className="pt-2 text-xl font-bold text-[#4b4b4b] dark:text-white">
          {line.slice(2)}
        </h3>
      );
    } else {
      elements.push(
        <p key={idx} className="text-sm leading-relaxed text-[#4b4b4b] dark:text-slate-200">
          {renderInlineMarkdown(line)}
        </p>
      );
    }
  });

  flushList();
  return elements;
};

export const GuidebookModal: React.FC<GuidebookModalProps> = ({
  isOpen,
  onClose,
  unit,
}) => {
  if (!isOpen || !unit) return null;

  const guideContent = unit.guide_content || unit.content || "";

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4 animate-fade-in">
      <div className="bg-[var(--surface)] rounded-[20px] max-w-[592px] w-full max-h-[90vh] flex flex-col shadow-2xl border border-[var(--border)] overflow-hidden">
        <div
          className="p-5 text-white flex items-start justify-between gap-4"
          style={{ backgroundColor: unit.color || "#58cc02" }}
        >
          <div className="flex items-start gap-3 min-w-0">
            <BookOpen className="w-6 h-6 mt-1 shrink-0" />
            <div className="min-w-0">
              <p className="text-xs uppercase font-bold tracking-wider opacity-90">
                Unit {unit.unit_number} Guidebook
              </p>
              <h2 className="text-xl font-bold leading-tight truncate">{unit.title}</h2>
            </div>
          </div>
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-colors shrink-0"
            aria-label="Close guidebook"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 text-[var(--text-primary)]">
          <div className="p-4 rounded-2xl bg-[#f7f7f7] dark:bg-[#132329] border border-[#e5e5e5] dark:border-[#2e4550]">
            <p className="text-sm font-medium text-[#777777] dark:text-[#8b9eab] leading-relaxed">
              {unit.subtitle}
            </p>
          </div>

          <div className="space-y-4">{renderGuidebookContent(guideContent)}</div>
        </div>

        <div className="p-4 border-t border-[var(--border)] bg-[var(--surface-secondary)] flex justify-end">
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="px-6 py-2.5 rounded-xl duo-btn-green font-bold text-sm uppercase tracking-wider"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};
