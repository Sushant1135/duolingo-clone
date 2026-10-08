"use client";

import React from "react";
import { X, BookOpen, Volume2 } from "lucide-react";
import { sound } from "@/lib/audio";

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

export const GuidebookModal: React.FC<GuidebookModalProps> = ({
  isOpen,
  onClose,
  unit,
}) => {
  if (!isOpen || !unit) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-3xl max-w-lg w-full max-h-[85vh] flex flex-col shadow-2xl border-2 border-[#e5e5e5] overflow-hidden">
        {/* Header */}
        <div
          className="p-6 text-white flex items-center justify-between relative"
          style={{ backgroundColor: unit.color || "#58cc02" }}
        >
          <div className="flex items-center gap-3">
            <BookOpen className="w-7 h-7" />
            <div>
              <p className="text-xs uppercase font-extrabold tracking-wider opacity-90">
                Unit {unit.unit_number} Guidebook
              </p>
              <h2 className="text-xl font-extrabold">{unit.title}</h2>
            </div>
          </div>
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-[#4b4b4b]">
          <div className="p-4 rounded-2xl bg-[#f7f7f7] border border-[#e5e5e5]">
            <p className="text-sm font-semibold text-[#777777] italic">
              {unit.subtitle}
            </p>
          </div>

          {/* Quick Pronunciation Practice Section */}
          <div>
            <h4 className="font-extrabold text-sm uppercase tracking-wider text-[#777777] mb-3">
              Key Spanish Phrases
            </h4>
            <div className="space-y-2">
              {[
                { es: "¡Hola! ¿Cómo estás?", en: "Hello! How are you?" },
                { es: "Buenos días", en: "Good morning" },
                { es: "Por favor", en: "Please" },
                { es: "Muchas gracias", en: "Thank you very much" },
                { es: "Una mesa para dos, por favor", en: "A table for two, please" },
              ].map((phrase, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 rounded-xl border border-[#e5e5e5] hover:border-[#1cb0f6] bg-white transition-colors group cursor-pointer"
                  onClick={() => {
                    sound.speak(phrase.es, "es-ES");
                  }}
                >
                  <div>
                    <p className="font-extrabold text-sm text-[#4b4b4b] group-hover:text-[#1cb0f6] transition-colors">
                      {phrase.es}
                    </p>
                    <p className="text-xs text-[#777777]">{phrase.en}</p>
                  </div>
                  <button
                    className="p-2 rounded-lg bg-[#ddf4ff] text-[#1cb0f6] hover:bg-[#bde6ff] transition-colors"
                    title="Pronounce"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Guidebook Notes */}
          <div className="prose prose-sm max-w-none text-xs leading-relaxed text-[#4b4b4b] whitespace-pre-line border-t border-[#e5e5e5] pt-4">
            {unit.guide_content || unit.content}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t-2 border-[#e5e5e5] bg-[#f7f7f7] flex justify-end">
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="px-6 py-2.5 rounded-xl duo-btn-green font-extrabold text-sm uppercase tracking-wider"
          >
            Got it!
          </button>
        </div>
      </div>
    </div>
  );
};
