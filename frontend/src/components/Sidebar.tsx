"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Shield, Target, ShoppingBag, User as UserIcon, Wrench } from "lucide-react";
import { sound } from "@/lib/audio";

interface SidebarProps {
  onOpenDevTools?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onOpenDevTools }) => {
  const pathname = usePathname();

  const navItems = [
    { label: "LEARN", href: "/", icon: Home, color: "text-[#58cc02]" },
    { label: "LEADERBOARDS", href: "/leaderboards", icon: Shield, color: "text-[#ffc800]" },
    { label: "QUESTS", href: "/quests", icon: Target, color: "text-[#ff9600]" },
    { label: "SHOP", href: "/shop", icon: ShoppingBag, color: "text-[#1cb0f6]" },
    { label: "PROFILE", href: "/profile", icon: UserIcon, color: "text-[#ce82ff]" },
  ];

  return (
    <>
      {/* Desktop Left Sidebar */}
      <aside className="hidden md:flex flex-col justify-between w-64 h-screen fixed left-0 top-0 border-r-2 border-[#e5e5e5] dark:border-[#2e4550] bg-white dark:bg-[#131f24] p-4 z-30 transition-colors">
        <div>
          {/* Logo */}
          <Link
            href="/"
            onClick={() => sound.playClick()}
            className="flex items-center gap-3 px-3 py-4 mb-6 hover:opacity-90 transition-opacity"
          >
            <div className="w-9 h-9 rounded-xl bg-[#58cc02] flex items-center justify-center text-white font-extrabold text-2xl shadow-sm">
              🦉
            </div>
            <span className="text-3xl font-extrabold tracking-tight text-[#58cc02] select-none">
              duolingo
            </span>
          </Link>

          {/* Nav List */}
          <nav className="flex flex-col gap-2">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => sound.playClick()}
                  className={`flex items-center gap-4 px-4 py-3 rounded-2xl font-bold text-sm tracking-wide transition-all border-2 ${
                    isActive
                      ? "bg-[#ddf4ff] dark:bg-[#1b3848] text-[#1cb0f6] border-[#84d8ff] dark:border-[#1cb0f6]"
                      : "text-[#777777] dark:text-[#8b9eab] border-transparent hover:bg-[#f7f7f7] dark:hover:bg-[#1b2e35] hover:text-[#4b4b4b] dark:hover:text-white"
                  }`}
                >
                  <Icon className={`w-6 h-6 ${isActive ? "text-[#1cb0f6]" : "text-[#afafaf] dark:text-[#557585]"}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Evaluation / Dev controls pill */}
        <div className="pt-4 border-t border-[#e5e5e5] dark:border-[#2e4550]">
          <button
            onClick={() => {
              sound.playClick();
              if (onOpenDevTools) onOpenDevTools();
            }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border border-[#e5e5e5] dark:border-[#2e4550] text-xs font-bold text-[#777777] dark:text-[#8b9eab] hover:bg-[#f7f7f7] dark:hover:bg-[#1b2e35] hover:text-[#4b4b4b] dark:hover:text-white transition-colors"
          >
            <Wrench className="w-4 h-4 text-[#ff9600]" />
            <span>Dev & Testing Tools</span>
          </button>
        </div>
      </aside>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white dark:bg-[#131f24] border-t-2 border-[#e5e5e5] dark:border-[#2e4550] flex justify-around items-center px-2 z-40 transition-colors">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => sound.playClick()}
              className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all ${
                isActive ? "text-[#1cb0f6]" : "text-[#afafaf] dark:text-[#557585]"
              }`}
            >
              <Icon className="w-6 h-6" />
            </Link>
          );
        })}
        <button
          onClick={() => {
            sound.playClick();
            if (onOpenDevTools) onOpenDevTools();
          }}
          className="p-2 text-[#777777] dark:text-[#8b9eab]"
        >
          <Wrench className="w-5 h-5 text-[#ff9600]" />
        </button>
      </nav>
    </>
  );
};
