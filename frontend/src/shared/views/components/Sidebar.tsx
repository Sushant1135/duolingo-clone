"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Award,
  CircleHelp,
  Dumbbell,
  ExternalLink,
  Home,
  LogOut,
  MoreHorizontal,
  Settings,
  Shield,
  ShoppingBag,
  Target,
  User as UserIcon,
  Wrench,
} from "lucide-react";
import { sound } from "@/services/audio";

interface SidebarProps {
  onOpenDevTools?: () => void;
}

const navItems = [
  { label: "LEARN", href: "/learn", icon: Home, color: "text-[#ff4b4b]", bg: "bg-[#ffc800]" },
  { label: "PRACTICE", href: "/practice", icon: Dumbbell, color: "text-[#1cb0f6]", bg: "" },
  { label: "LEADERBOARDS", href: "/leaderboards", icon: Shield, color: "text-[#ffc800]", bg: "" },
  { label: "QUESTS", href: "/quests", icon: Target, color: "text-[#ffc800]", bg: "" },
  { label: "SHOP", href: "/shop", icon: ShoppingBag, color: "text-[#ff4b4b]", bg: "" },
  { label: "PROFILE", href: "/profile", icon: UserIcon, color: "text-[#557585]", bg: "" },
  { label: "MORE", icon: MoreHorizontal, color: "text-[#ce82ff]", bg: "" },
];

export const Sidebar: React.FC<SidebarProps> = ({ onOpenDevTools }) => {
  const pathname = usePathname();
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const [moreNotice, setMoreNotice] = useState<string | null>(null);
  const moreMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isMoreOpen) return;

    const closeOnOutsideClick = (event: MouseEvent) => {
      if (!moreMenuRef.current?.contains(event.target as Node)) {
        setIsMoreOpen(false);
        setMoreNotice(null);
      }
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsMoreOpen(false);
        setMoreNotice(null);
      }
    };

    document.addEventListener("mousedown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("mousedown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [isMoreOpen]);

  const isItemActive = (label: string, href?: string) => {
    if (label === "MORE") return isMoreOpen;
    if (label === "LEARN") return pathname === "/learn" || pathname.startsWith("/learn/");
    return Boolean(href && pathname.startsWith(href));
  };

  const toggleMore = () => {
    sound.playClick();
    setMoreNotice(null);
    setIsMoreOpen((open) => !open);
  };

  const moreMenu = isMoreOpen && (
    <div
      ref={moreMenuRef}
      id="more-menu"
      role="menu"
      aria-label="More options"
      className="fixed bottom-20 left-3 right-3 z-50 overflow-hidden rounded-2xl border-2 border-[#2e4550] bg-[#101f24] text-[#d7e1e8] shadow-2xl min-[700px]:bottom-14 min-[700px]:left-[calc(var(--duo-sidebar-width)-10px)] min-[700px]:right-auto min-[700px]:w-[364px]"
    >
      <a
        href="https://englishtest.duolingo.com/"
        target="_blank"
        rel="noreferrer"
        role="menuitem"
        onClick={() => sound.playClick()}
        className="flex min-h-[86px] items-center gap-6 border-b-2 border-[#2e4550] px-6 py-5 font-extrabold transition-colors hover:bg-[#1b2e35]"
      >
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#58cc02] text-white">
          <Award className="h-7 w-7 fill-white" />
        </span>
        <span className="flex-1">DUOLINGO ENGLISH TEST</span>
        <ExternalLink className="h-4 w-4 text-[#8b9eab]" />
      </a>
      <div className="py-2">
        <Link
          href="/settings"
          role="menuitem"
          onClick={() => {
            sound.playClick();
            setIsMoreOpen(false);
            setMoreNotice(null);
          }}
          className="flex min-h-12 items-center gap-3 px-6 font-bold transition-colors hover:bg-[#1b2e35]"
        >
          <Settings className="h-4 w-4 text-[#8b9eab]" />
          SETTINGS
        </Link>
        <a
          href="https://support.duolingo.com/"
          target="_blank"
          rel="noreferrer"
          role="menuitem"
          onClick={() => sound.playClick()}
          className="flex min-h-12 items-center gap-3 px-6 font-bold transition-colors hover:bg-[#1b2e35]"
        >
          <CircleHelp className="h-4 w-4 text-[#8b9eab]" />
          HELP
          <ExternalLink className="ml-auto h-4 w-4 text-[#8b9eab]" />
        </a>
        <button
          type="button"
          role="menuitem"
          onClick={() => setMoreNotice("You are using the local demo, so there is no account to log out of.")}
          className="flex min-h-12 w-full items-center gap-3 px-6 text-left font-bold transition-colors hover:bg-[#1b2e35]"
        >
          <LogOut className="h-4 w-4 text-[#8b9eab]" />
          LOG OUT
        </button>
      </div>
      {moreNotice && (
        <p role="status" className="border-t border-[#2e4550] px-6 py-3 text-sm font-semibold text-[#aab9bf]">
          {moreNotice}
        </p>
      )}
    </div>
  );

  const renderNavItem = (item: (typeof navItems)[number], mobile = false) => {
    const active = isItemActive(item.label, item.href);
    const Icon = item.icon;
    if (item.label === "MORE") {
      return (
        <button
          key={item.label}
          type="button"
          onClick={toggleMore}
          aria-label={mobile ? "More" : undefined}
          aria-haspopup="menu"
          aria-expanded={isMoreOpen}
          aria-controls="more-menu"
          className={mobile
            ? `rounded-xl p-2 transition-colors ${active ? "text-[#1cb0f6]" : "text-[#afafaf] dark:text-[#557585]"}`
            : `flex w-full items-center gap-4 rounded-2xl border-2 px-4 py-3 text-left text-[15px] font-extrabold tracking-wide transition-all ${
              active
                ? "border-[#84d8ff] bg-[#ddf4ff] text-[#1cb0f6] dark:border-[#1cb0f6] dark:bg-[#1b3848]"
                : "border-transparent text-[#777777] hover:bg-[#f7f7f7] hover:text-[#4b4b4b] dark:text-[#d7e1e8] dark:hover:bg-[#1b2e35] dark:hover:text-white"
            }`}
        >
          <span className={mobile ? "" : "flex h-9 w-9 items-center justify-center rounded-xl text-[#ce82ff]"}>
            <Icon className={mobile ? "h-6 w-6 fill-current" : "h-7 w-7 fill-current stroke-[2.6]"} />
          </span>
          {!mobile && <span>{item.label}</span>}
        </button>
      );
    }

    return (
      <Link
        key={item.label}
        href={item.href!}
        onClick={() => sound.playClick()}
        aria-label={mobile ? item.label : undefined}
        className={mobile
          ? `flex flex-col items-center justify-center rounded-xl p-2 transition-all ${active ? "text-[#1cb0f6]" : "text-[#afafaf] dark:text-[#557585]"}`
          : `flex items-center gap-4 rounded-2xl border-2 px-4 py-3 text-[15px] font-extrabold tracking-wide transition-all ${
            active
              ? "border-[#84d8ff] bg-[#ddf4ff] text-[#1cb0f6] dark:border-[#1cb0f6] dark:bg-[#1b3848]"
              : "border-transparent text-[#777777] hover:bg-[#f7f7f7] hover:text-[#4b4b4b] dark:text-[#d7e1e8] dark:hover:bg-[#1b2e35] dark:hover:text-white"
          }`}
      >
        {mobile ? (
          <Icon className="h-6 w-6 fill-current" />
        ) : (
          <>
            <span className={`flex h-9 w-9 items-center justify-center rounded-xl ${item.bg} ${active ? "text-[#1cb0f6]" : item.color}`}>
              <Icon className="h-7 w-7 fill-current stroke-[2.6]" />
            </span>
            <span>{item.label}</span>
          </>
        )}
      </Link>
    );
  };

  return (
    <>
      <aside className="fixed left-0 top-0 z-30 hidden h-screen w-[var(--duo-sidebar-width)] flex-col justify-between border-r-2 border-[var(--border)] bg-[var(--surface)] px-5 py-6 transition-colors min-[700px]:flex">
        <div>
          <Link
            href="/learn"
            onClick={() => sound.playClick()}
            className="mb-9 flex items-center px-2 py-1 transition-opacity hover:opacity-90"
          >
            <span className="select-none text-[32px] font-extrabold leading-none tracking-tight text-[#58cc02]">
              duolingo
            </span>
          </Link>

          <nav className="flex flex-col gap-4">
            {navItems.map((item) => renderNavItem(item))}
          </nav>
        </div>

        <div className="border-t border-[#e5e5e5] pt-4 dark:border-[#2e4550]">
          <button
            onClick={() => {
              sound.playClick();
              onOpenDevTools?.();
            }}
            className="flex w-full items-center gap-2 rounded-xl border border-[#e5e5e5] px-3 py-2.5 text-xs font-semibold text-[#777777] transition-colors hover:bg-[#f7f7f7] hover:text-[#4b4b4b] dark:border-[#2e4550] dark:text-[#8b9eab] dark:hover:bg-[#1b2e35] dark:hover:text-white"
          >
            <Wrench className="h-4 w-4 text-[#ff9600]" />
            <span>Dev tools</span>
          </button>
        </div>
      </aside>

      <nav className="fixed bottom-0 left-0 right-0 z-40 flex h-16 items-center justify-around border-t border-[var(--border)] bg-[var(--surface)] px-2 transition-colors min-[700px]:hidden">
        {navItems.slice(0, 5).map((item) => renderNavItem(item, true))}
        {renderNavItem(navItems[6], true)}
        <button
          onClick={() => {
            sound.playClick();
            onOpenDevTools?.();
          }}
          aria-label="Developer tools"
          className="rounded-xl p-2 text-[#777777] dark:text-[#8b9eab]"
        >
          <Wrench className="h-5 w-5 text-[#ff9600]" />
        </button>
      </nav>
      {moreMenu}
    </>
  );
};
