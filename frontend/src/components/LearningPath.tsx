"use client";

import React, { useState } from "react";
import { Star, BookOpen, Coffee, MessageCircle, Plane, Trophy, Lock, Check, Crown, Gem } from "lucide-react";
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

  // Serpentine X-offsets for snake layout
  const getOffsetStyle = (index: number) => {
    const pattern = [0, 48, 64, 32, -32, -64, -48];
    const offset = pattern[index % pattern.length];
    return { transform: `translateX(${offset}px)` };
  };

  return (
    <div className="flex flex-col items-center w-full max-w-xl mx-auto pb-24">
      {units.map((unit) => (
        <div key={unit.id} className="w-full flex flex-col items-center mb-12">
          {/* Unit Banner Header */}
          <div
            className="w-full rounded-2xl p-4 sm:p-5 text-white flex items-center justify-between shadow-sm mb-10 transition-transform"
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
              className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-white/20 hover:bg-white/30 text-white font-extrabold text-xs uppercase tracking-wider transition-colors shrink-0 border border-white/30"
            >
              <BookOpen className="w-4 h-4" />
              <span className="hidden sm:inline">Guidebook</span>
            </button>
          </div>

          {/* Sinuous Skill Nodes */}
          <div className="w-full flex flex-col items-center gap-10">
            {unit.skills.map((skill, sIdx) => {
              const isSelected = selectedSkill?.id === skill.id;
              const nextLesson =
                skill.lessons.find((l) => !l.is_completed) || skill.lessons[0];

              // Calculate progress percentage for active circle ring
              const progressPct =
                skill.total_lessons > 0
                  ? Math.round((skill.completed_lessons / skill.total_lessons) * 100)
                  : 0;

              return (
                <div
                  key={skill.id}
                  style={getOffsetStyle(sIdx)}
                  className="relative flex flex-col items-center transition-transform"
                >
                  {/* Floating Mascot on Current Active Node */}
                  {skill.is_current && (
                    <div className="absolute -top-20 flex flex-col items-center z-10 animate-bounce-subtle select-none pointer-events-none">
                      <div className="bg-white border-2 border-[#e5e5e5] px-3 py-1 rounded-xl shadow-md text-xs font-extrabold text-[#58cc02] uppercase tracking-wider mb-1 relative">
                        Start Here!
                        <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-white border-b-2 border-r-2 border-[#e5e5e5] rotate-45" />
                      </div>
                      <DuoMascot mood="happy" size={72} />
                    </div>
                  )}

                  {/* Circular Node Button */}
                  <div className="relative">
                    {/* Progress Ring for In-Progress Skill */}
                    {skill.is_unlocked && !skill.is_completed && skill.completed_lessons > 0 && (
                      <svg
                        className="absolute -inset-2.5 w-24 h-24 -rotate-90 pointer-events-none"
                        viewBox="0 0 100 100"
                      >
                        <circle
                          cx="50"
                          cy="50"
                          r="42"
                          stroke="#e5e5e5"
                          strokeWidth="8"
                          fill="none"
                        />
                        <circle
                          cx="50"
                          cy="50"
                          r="42"
                          stroke="#ffc800"
                          strokeWidth="8"
                          strokeDasharray="264"
                          strokeDashoffset={264 - (264 * progressPct) / 100}
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
                          ? "bg-[#ffc800] border-b-[8px] border-[#e5b300] text-white"
                          : skill.is_unlocked
                          ? "bg-[#58cc02] border-b-[8px] border-[#46a302] text-white hover:brightness-105"
                          : "bg-[#e5e5e5] border-b-[8px] border-[#cecece] text-[#afafaf] cursor-not-allowed"
                      } ${isSelected ? "ring-4 ring-[#84d8ff]" : ""}`}
                    >
                      {skill.is_completed ? (
                        <Crown className="w-10 h-10 fill-current text-white stroke-[2.5]" />
                      ) : skill.is_unlocked ? (
                        getSkillIcon(skill.icon)
                      ) : (
                        <Lock className="w-8 h-8 text-[#afafaf] stroke-[2.5]" />
                      )}
                    </button>
                  </div>

                  {/* Skill Title Subtitle */}
                  <span
                    className={`mt-2 font-extrabold text-sm tracking-wide ${
                      skill.is_unlocked ? "text-[#4b4b4b]" : "text-[#afafaf]"
                    }`}
                  >
                    {skill.title}
                  </span>

                  {/* Interactive Popover Card */}
                  {isSelected && (
                    <div className="absolute top-24 z-30 w-72 bg-white rounded-2xl p-4 shadow-xl border-2 border-[#e5e5e5] animate-fade-in flex flex-col items-center text-center">
                      <div className="w-full flex items-center justify-between mb-2">
                        <h4 className="font-extrabold text-base text-[#4b4b4b]">
                          {skill.title}
                        </h4>
                        <span className="text-xs font-bold text-[#777777]">
                          {skill.completed_lessons}/{skill.total_lessons} Lessons
                        </span>
                      </div>

                      <p className="text-xs text-[#777777] mb-4">
                        {skill.is_completed
                          ? "You've mastered this skill! Practice anytime to strengthen your memory."
                          : `Lesson ${skill.completed_lessons + 1} of ${skill.total_lessons}`}
                      </p>

                      <button
                        onClick={() => {
                          if (nextLesson) {
                            sound.playCorrect();
                            onStartLesson(nextLesson.id);
                          }
                        }}
                        className={`w-full py-3 rounded-xl font-extrabold text-xs uppercase tracking-wider ${
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
