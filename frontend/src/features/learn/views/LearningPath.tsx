"use client";

import React, { useMemo, useState } from "react";
import {
  ArrowLeft,
  BookOpen,
  Check,
  Headphones,
  Lock,
  Play,
} from "lucide-react";
import { CourseSection, Unit, Skill } from "@/models/api";
import { sound } from "@/services/audio";
import { DuoMascot } from "@/shared/views/components/DuoMascot";

interface LearningPathProps {
  sections: CourseSection[];
  selectedSectionId?: number;
  onOpenGuidebook: (unit: Unit) => void;
  onOpenSectionOverview: () => void;
  onStartLesson: (lessonId: number) => void;
}

export const LearningPath: React.FC<LearningPathProps> = ({
  sections,
  selectedSectionId,
  onOpenGuidebook,
  onOpenSectionOverview,
  onStartLesson,
}) => {
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);

  const selectedSection = useMemo(() => {
    if (sections.length === 0) return null;
    if (selectedSectionId) {
      return sections.find((section) => section.id === selectedSectionId) ?? sections[0];
    }
    return sections[0];
  }, [sections, selectedSectionId]);

  const getNodeOffset = (index: number) => {
    const pattern = [0, -70, -95, -48, 0, 70, 95, 48];
    return pattern[index % pattern.length];
  };

  const getOffsetStyle = (index: number) => {
    const offset = getNodeOffset(index);
    return { transform: `translateX(clamp(-92px, ${offset}px, 92px))` };
  };

  const getNodeGlyph = (skill: Skill, index: number) => {
    if (!skill.is_unlocked) return <Lock className="w-9 h-9 text-[#557585] stroke-[2.7]" />;
    if (skill.is_completed) return <Check className="w-11 h-11 text-white stroke-[3.4]" />;
    if (index % 2 === 0) return <Headphones className="w-10 h-10 text-white stroke-[2.8]" />;
    return <BookOpen className="w-10 h-10 text-white fill-white/80 stroke-[2.8]" />;
  };

  if (!selectedSection) {
    return null;
  }

  return (
    <div className="flex w-full max-w-[740px] flex-col items-center mx-auto pb-28 pt-10 xl:pt-9 relative">
      {selectedSkill && (
        <div className="fixed inset-0 z-30 bg-transparent" onClick={() => setSelectedSkill(null)} />
      )}

      <div key={selectedSection.id} className="w-full flex flex-col items-center mb-12">
        {selectedSection.units.map((sectionUnit) => {
          const unit = sectionUnit.unit;
          const unitSkills = unit.skills;

          return (
            <div key={sectionUnit.id} className="w-full flex flex-col items-center mb-12">
              <div className="w-full max-w-[740px] rounded-2xl bg-[#58cc02] px-5 py-5 text-white flex items-center justify-between gap-4 shadow-[0_8px_0_#46a302] mb-8 transition-transform">
                <div className="space-y-2 min-w-0">
                  <button
                    type="button"
                    aria-label="Choose a course section"
                    onClick={() => {
                      sound.playClick();
                      onOpenSectionOverview();
                    }}
                    className="flex items-center gap-2 text-left text-sm sm:text-base font-extrabold uppercase tracking-wide text-[#d7ffb8] transition-colors hover:text-white"
                  >
                    <ArrowLeft className="h-5 w-5 stroke-[3]" />
                    <span>Section {selectedSection.id}, Unit {sectionUnit.unitId}</span>
                  </button>
                  <h2 className="text-2xl sm:text-[28px] font-extrabold leading-none tracking-tight">{unit.title.replace(/^Unit \d+:\s*/, "")}</h2>
                </div>

                <button
                  onClick={() => {
                    sound.playClick();
                    onOpenGuidebook(unit);
                  }}
                  className="flex items-center gap-3 px-4 sm:px-5 py-3.5 rounded-2xl bg-[#58cc02] hover:bg-[#63d90b] text-white font-extrabold text-sm sm:text-base uppercase tracking-wide transition-colors shrink-0 border-2 border-[#46a302] shadow-[0_4px_0_#46a302] active:translate-y-1 active:shadow-none"
                >
                  <BookOpen className="w-7 h-7 fill-white/80 stroke-[2.8]" />
                  <span>Guidebook</span>
                </button>
              </div>

              <div className="w-full flex flex-col items-center gap-[34px] sm:gap-[40px] relative pt-1 pb-2">
                {unitSkills.length > 1 && (
                  <svg
                    aria-hidden="true"
                    className="absolute top-7 left-1/2 -translate-x-1/2 w-[300px] h-[calc(100%-2rem)] pointer-events-none opacity-60"
                    viewBox={`0 0 300 ${Math.max(120, (unitSkills.length - 1) * 122 + 80)}`}
                    preserveAspectRatio="none"
                  >
                    <polyline
                      points={unitSkills
                        .map((_, idx) => `${150 + getNodeOffset(idx)} ${40 + idx * 122}`)
                        .join(" ")}
                      fill="none"
                      stroke="#203843"
                      strokeWidth="8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}

                <div className="absolute top-[126px] right-[44px] pointer-events-none select-none z-10 hidden sm:flex flex-col items-center animate-bounce-subtle">
                  <DuoMascot mood="happy" size={142} />
                </div>

                {unitSkills.map((skill, sIdx) => {
                  const isSelected = selectedSkill?.id === skill.id;
                  const nextLesson = skill.lessons.find((l) => !l.is_completed) || skill.lessons[0];
                  const progressPct = skill.total_lessons > 0 ? Math.round((skill.completed_lessons / skill.total_lessons) * 100) : 0;

                  return (
                    <div key={skill.id} style={getOffsetStyle(sIdx)} className={`relative flex flex-col items-center transition-transform ${isSelected ? "z-50" : "z-10"}`}>
                      {skill.is_current && (
                        <div className="absolute -top-11 flex flex-col items-center z-30 select-none animate-bounce-subtle pointer-events-none">
                          <div className="bg-white text-[#1cb0f6] px-4 py-1.5 rounded-xl shadow-md text-xs font-extrabold uppercase tracking-widest border-2 border-[#84d8ff] dark:bg-[#1b2e35]">START</div>
                          <div className="w-2.5 h-2.5 bg-white dark:bg-[#1b2e35] -mt-1.5 rotate-45 border-r-2 border-b-2 border-[#84d8ff]" />
                        </div>
                      )}

                      <div className="relative">
                        {skill.is_unlocked && !skill.is_completed && skill.completed_lessons > 0 && (
                          <svg className="absolute -inset-3 w-[100px] h-[100px] -rotate-90 pointer-events-none" viewBox="0 0 100 100">
                            <circle cx="50" cy="50" r="44" stroke="#203843" strokeWidth="7" fill="none" />
                            <circle cx="50" cy="50" r="44" stroke="#ffc800" strokeWidth="7" strokeDasharray="276" strokeDashoffset={276 - (276 * progressPct) / 100} strokeLinecap="round" fill="none" className="transition-all duration-500" />
                          </svg>
                        )}

                        <button
                          onClick={() => {
                            sound.playClick();
                            if (skill.is_unlocked && nextLesson) onStartLesson(nextLesson.id);
                          }}
                          disabled={!skill.is_unlocked}
                          className={`relative w-[78px] h-[78px] sm:w-[86px] sm:h-[86px] rounded-full flex items-center justify-center transition-transform active:translate-y-2 select-none cursor-pointer ${
                            skill.is_completed
                              ? "bg-[#1cb0f6] border-b-[10px] border-[#1687bd] text-white hover:brightness-110 shadow-[0_8px_0_rgba(0,0,0,0.15)]"
                              : skill.is_unlocked
                              ? "bg-[#1cb0f6] border-b-[10px] border-[#1687bd] text-white hover:brightness-110 shadow-[0_8px_0_rgba(0,0,0,0.15)]"
                              : "bg-[#203843] border-b-[10px] border-[#192b33] text-[#557585] cursor-not-allowed"
                          } ${isSelected ? "ring-4 ring-[#84d8ff]" : ""}`}
                        >
                          <span className="absolute inset-2 rounded-full bg-white/10" />
                          <span className="absolute left-4 top-3 h-4 w-7 rounded-full bg-white/20 rotate-[-25deg]" />
                          <span className="relative z-10">{getNodeGlyph(skill, sIdx)}</span>
                        </button>
                      </div>

                      <span className={`mt-2 font-extrabold text-xs tracking-wide ${skill.is_unlocked ? "text-[#4b4b4b] dark:text-white" : "text-[#afafaf] dark:text-[#557585]"}`}>
                        {skill.title}
                      </span>

                      {isSelected && (
                        <div className="absolute top-[92px] z-50 w-80 bg-white dark:bg-[#1b2e35] rounded-3xl p-5 shadow-2xl border-2 border-[#e5e5e5] dark:border-[#2e4550] animate-fade-in flex flex-col items-center text-center pointer-events-auto">
                          <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white dark:bg-[#1b2e35] border-t-2 border-l-2 border-[#e5e5e5] dark:border-[#2e4550] rotate-45" />

                          <div className="w-full flex items-center justify-between mb-2">
                            <h4 className="font-extrabold text-lg text-[#4b4b4b] dark:text-white">{skill.title}</h4>
                            <span className="text-xs font-bold text-[#777777] dark:text-[#8b9eab]">{skill.completed_lessons}/{skill.total_lessons} Lessons</span>
                          </div>

                          <p className="text-xs text-[#777777] dark:text-[#8b9eab] mb-4">
                            {skill.is_completed ? "You've mastered this skill! Practice anytime to strengthen your memory." : `Lesson ${skill.completed_lessons + 1} of ${skill.total_lessons}`}
                          </p>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (nextLesson) {
                                sound.playCorrect();
                                setSelectedSkill(null);
                                onStartLesson(nextLesson.id);
                              }
                            }}
                            className={`w-full py-3.5 px-6 rounded-2xl font-extrabold text-sm uppercase tracking-wider transition-all active:translate-y-1 shadow-md cursor-pointer flex items-center justify-center gap-2 relative z-50 ${skill.is_completed ? "duo-btn-blue" : "duo-btn-green"}`}
                          >
                            <Play className="w-4 h-4 fill-current" />
                            <span>{skill.is_completed ? "PRACTICE +10 XP" : "START +15 XP"}</span>
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
