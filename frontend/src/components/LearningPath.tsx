"use client";

import React, { useState } from "react";
import { Star, BookOpen, Coffee, MessageCircle, Plane, Trophy, Lock, Crown, Gem, Volume2 } from "lucide-react";
import { Unit, Skill } from "@/lib/api";
import { sound } from "@/lib/audio";
import { DuoMascot } from "./DuoMascot";

interface LearningPathProps {
  units: Unit[];
  onOpenGuidebook: (unit: Unit) => void;
  onStartLesson: (lessonId: number) => void;
}

export const LearningPath: React.FC<LearningPathProps> = ({
  units,
  onOpenGuidebook,
  onStartLesson,
}) => {
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);

  // Icon mapping
  const getSkillIcon = (iconName: string) => {
    switch (iconName) {
      case "star":
        return <Star className="w-8 h-8 fill-current" />;
      case "chat":
        return <MessageCircle className="w-8 h-8 fill-current" />;
      case "coffee":
        return <Coffee className="w-8 h-8" />;
      case "plane":
        return <Plane className="w-8 h-8 fill-current" />;
      case "trophy":
        return <Trophy className="w-8 h-8 fill-current" />;
      case "gem":
        return <Gem className="w-8 h-8 fill-current" />;
      default:
        return <BookOpen className="w-8 h-8" />;
    }
  };

  // Serpentine X-offsets for snake layout (smooth sinusoidal pattern)
  const getOffsetStyle = (index: number) => {
    const pattern = [0, 48, 64, 32, -32, -64, -48];
    const offset = pattern[index % pattern.length];
    return { transform: `translateX(${offset}px)` };
  };

  return (
    <div className="flex flex-col items-center w-full max-w-xl mx-auto pb-28 relative">
      {/* Click-away overlay when a skill popover is active */}
      {selectedSkill && (
        <div
          className="fixed inset-0 z-40 bg-black/10 backdrop-blur-[1px]"
          onClick={() => setSelectedSkill(null)}
        />
      )}

      {units.map((unit) => (
        <div key={unit.id} className="w-full flex flex-col items-center mb-16">
          {/* Unit Banner Header (Duolingo Style) */}
          <div
            className="w-full rounded-2xl p-5 text-white flex items-center justify-between shadow-sm mb-6 transition-transform"
            style={{ backgroundColor: unit.color || "#58cc02" }}
          >
            <div className="space-y-1">
              <p className="text-xs font-extrabold uppercase tracking-widest opacity-90">
                Unit {unit.unit_number}
              </p>
              <h2 className="text-xl sm:text-2xl font-extrabold">{unit.title}</h2>
              <p className="text-xs sm:text-sm font-semibold opacity-90 max-w-md">
                {unit.subtitle}
              </p>
            </div>

            <button
              onClick={() => {
                sound.playClick();
                onOpenGuidebook(unit);
              }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/20 hover:bg-white/30 text-white font-extrabold text-xs uppercase tracking-wider transition-colors shrink-0 border border-white/30 shadow-xs active:translate-y-[1px]"
            >
              <BookOpen className="w-4 h-4" />
              <span>Guidebook</span>
            </button>
          </div>

          {/* Section Divider Subtitle (like real Duolingo Image 3) */}
          <div className="w-full flex items-center justify-center gap-4 my-6 text-[#777777] text-xs font-extrabold uppercase tracking-wider">
            <div className="h-[2px] bg-[#e5e5e5] dark:bg-[#2e4550] flex-1" />
            <span>{unit.title}</span>
            <div className="h-[2px] bg-[#e5e5e5] dark:bg-[#2e4550] flex-1" />
          </div>

          {/* Sinuous Skill Nodes Container */}
          <div className="w-full flex flex-col items-center gap-20 relative pt-4">
            {/* Mascot Duo standing playfully beside the path (as in real Duolingo Image 3) */}
            <div className="absolute top-28 right-0 sm:-right-8 pointer-events-none select-none z-10 hidden sm:flex flex-col items-center animate-bounce-subtle">
              <DuoMascot mood="happy" size={96} />
              <div className="mt-1 px-2.5 py-1 rounded-lg bg-white dark:bg-[#1b2e35] border border-[#e5e5e5] dark:border-[#2e4550] text-[11px] font-bold text-[#58cc02] shadow-sm">
                ¡Vamos! 🇪🇸
              </div>
            </div>

            {unit.skills.map((skill, sIdx) => {
              const isSelected = selectedSkill?.id === skill.id;
              const nextLesson =
                skill.lessons.find((l) => !l.is_completed) || skill.lessons[0];

              // Progress percentage
              const progressPct =
                skill.total_lessons > 0
                  ? Math.round((skill.completed_lessons / skill.total_lessons) * 100)
                  : 0;

              return (
                <div
                  key={skill.id}
                  style={getOffsetStyle(sIdx)}
                  className="relative flex flex-col items-center transition-transform z-20"
                >
                  {/* Clean START badge on Active Node (like real Duolingo Image 3) */}
                  {skill.is_current && (
                    <div className="absolute -top-10 flex flex-col items-center z-30 select-none animate-bounce-subtle pointer-events-none">
                      <div className="bg-[#1cb0f6] text-white px-3.5 py-1.5 rounded-xl shadow-md text-xs font-extrabold uppercase tracking-widest border border-white/20">
                        START
                      </div>
                      <div className="w-2.5 h-2.5 bg-[#1cb0f6] -mt-1.5 rotate-45 border-r border-b border-white/20" />
                    </div>
                  )}

                  {/* Circular Node Button */}
                  <div className="relative">
                    {/* Concentric Progress Ring */}
                    {skill.is_unlocked && !skill.is_completed && skill.completed_lessons > 0 && (
                      <svg
                        className="absolute -inset-3 w-[92px] h-[92px] -rotate-90 pointer-events-none"
                        viewBox="0 0 100 100"
                      >
                        <circle
                          cx="50"
                          cy="50"
                          r="44"
                          stroke="#e5e5e5"
                          strokeWidth="7"
                          fill="none"
                        />
                        <circle
                          cx="50"
                          cy="50"
                          r="44"
                          stroke="#ffc800"
                          strokeWidth="7"
                          strokeDasharray="276"
                          strokeDashoffset={276 - (276 * progressPct) / 100}
                          strokeLinecap="round"
                          fill="none"
                          className="transition-all duration-500"
                        />
                      </svg>
                    )}

                    <button
                      onClick={() => {
                        sound.playClick();
                        setSelectedSkill(isSelected ? null : skill);
                      }}
                      disabled={!skill.is_unlocked}
                      className={`relative w-20 h-20 rounded-full flex items-center justify-center transition-transform active:translate-y-2 select-none shadow-sm ${
                        skill.is_completed
                          ? "bg-[#ffc800] border-b-[8px] border-[#e5b300] text-white hover:brightness-105"
                          : skill.is_unlocked
                          ? "bg-[#58cc02] border-b-[8px] border-[#46a302] text-white hover:brightness-105"
                          : "bg-[#e5e5e5] dark:bg-[#203843] border-b-[8px] border-[#cecece] dark:border-[#192b33] text-[#afafaf] dark:text-[#557585] cursor-not-allowed"
                      } ${isSelected ? "ring-4 ring-[#84d8ff]" : ""}`}
                    >
                      {skill.is_completed ? (
                        <Crown className="w-10 h-10 fill-current text-white stroke-[2.5]" />
                      ) : skill.is_unlocked ? (
                        getSkillIcon(skill.icon)
                      ) : (
                        <Lock className="w-8 h-8 text-[#afafaf] dark:text-[#557585] stroke-[2.5]" />
                      )}
                    </button>
                  </div>

                  {/* Skill Title Subtitle */}
                  <span
                    className={`mt-2 font-extrabold text-sm tracking-wide ${
                      skill.is_unlocked
                        ? "text-[#4b4b4b] dark:text-white"
                        : "text-[#afafaf] dark:text-[#557585]"
                    }`}
                  >
                    {skill.title}
                  </span>

                  {/* Interactive Popover Card with Pointer Arrow & High Z-Index */}
                  {isSelected && (
                    <div className="absolute top-[96px] z-50 w-72 bg-white dark:bg-[#1b2e35] rounded-3xl p-5 shadow-2xl border-2 border-[#e5e5e5] dark:border-[#2e4550] animate-fade-in flex flex-col items-center text-center">
                      {/* Top Arrow pointer */}
                      <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white dark:bg-[#1b2e35] border-t-2 border-l-2 border-[#e5e5e5] dark:border-[#2e4550] rotate-45" />

                      <div className="w-full flex items-center justify-between mb-2">
                        <h4 className="font-extrabold text-base text-[#4b4b4b] dark:text-white">
                          {skill.title}
                        </h4>
                        <span className="text-xs font-bold text-[#777777] dark:text-[#8b9eab]">
                          {skill.completed_lessons}/{skill.total_lessons} Lessons
                        </span>
                      </div>

                      <p className="text-xs text-[#777777] dark:text-[#8b9eab] mb-4">
                        {skill.is_completed
                          ? "You've mastered this skill! Practice anytime to strengthen your memory."
                          : `Lesson ${skill.completed_lessons + 1} of ${skill.total_lessons}`}
                      </p>

                      <button
                        onClick={() => {
                          if (nextLesson) {
                            sound.playCorrect();
                            setSelectedSkill(null);
                            onStartLesson(nextLesson.id);
                          }
                        }}
                        className={`w-full py-3.5 rounded-2xl font-extrabold text-xs uppercase tracking-wider transition-transform active:translate-y-1 shadow-sm ${
                          skill.is_completed ? "duo-btn-blue" : "duo-btn-green"
                        }`}
                      >
                        {skill.is_completed ? "PRACTICE +10 XP" : "START +15 XP"}
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};
