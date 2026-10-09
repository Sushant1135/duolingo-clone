"use client";

import React from "react";
import Link from "next/link";
import { Sidebar } from "@/shared/views/components/Sidebar";
import { useSettingsController } from "@/features/settings/controllers/useSettingsController";
import {
  notificationOptions,
  preferenceOptions,
  preferenceSections,
} from "@/features/settings/models/preferences";

export default function SettingsPage() {
  const {
    theme,
    setTheme,
    preferences,
    togglePreference,
    notice,
    showNotice,
    closeNotice,
  } = useSettingsController();

  const renderPreferenceOptions = (
    options: typeof preferenceOptions,
  ) => (
    <div className="divide-y divide-[var(--border)]">
      {options.map(({ key, label }) => (
        <div key={key} className="flex min-h-[64px] items-center justify-between gap-3 py-3 sm:gap-5">
          <span className="min-w-0 flex-1 break-words text-sm font-bold leading-snug sm:text-base">{label}</span>
          <button
            type="button"
            role="switch"
            aria-checked={preferences[key]}
            aria-label={label}
            onClick={() => togglePreference(key)}
            className={`relative h-8 w-[70px] shrink-0 rounded-full transition-colors ${
              preferences[key] ? "bg-[#49c0f8]" : "bg-[#374b54]"
            }`}
          >
            <span
              className={`absolute left-0 top-[-3px] h-[38px] w-[38px] rounded-xl border-2 bg-[var(--background)] shadow-sm transition-transform ${
                preferences[key]
                  ? "translate-x-[34px] border-[#1cb0f6]"
                  : "translate-x-0 border-[#374b54]"
              }`}
            />
          </button>
        </div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--text-primary)]">
      <Sidebar />
      <main className="min-[700px]:ml-[var(--duo-sidebar-width)]">
        <div className="mx-auto grid w-full max-w-[1440px] gap-8 px-4 py-6 sm:gap-10 sm:px-8 lg:grid-cols-[minmax(0,2fr)_minmax(260px,1fr)] lg:gap-12 lg:px-12">
          <section className="min-w-0">
            <h1 className="mb-8 text-2xl font-extrabold sm:mb-12 sm:text-3xl">Settings</h1>

            <section id="preferences" aria-labelledby="lesson-experience-heading" className="scroll-mt-6">
              <h2 id="lesson-experience-heading" className="border-b-2 border-[var(--border)] pb-3 text-lg font-extrabold sm:text-xl">
                Lesson experience
              </h2>
              {renderPreferenceOptions(preferenceOptions)}
            </section>

            <section aria-labelledby="appearance-heading" className="mt-8 sm:mt-10">
              <h2 id="appearance-heading" className="border-b-2 border-[var(--border)] pb-3 text-lg font-extrabold sm:text-xl">
                Appearance
              </h2>
              <label htmlFor="theme-preference" className="mt-5 block text-sm font-bold sm:text-base">
                Dark mode
              </label>
              <select
                id="theme-preference"
                value={theme}
                onChange={(event) => setTheme(event.target.value as "system" | "light" | "dark")}
                className="mt-2 min-h-14 w-full rounded-xl border-2 border-[var(--border)] bg-[var(--surface)] px-4 font-extrabold uppercase tracking-wide text-[var(--text-primary)] outline-none focus:border-[#1cb0f6] dark:[color-scheme:dark]"
              >
                <option value="system" className="bg-white text-[#4b4b4b] dark:bg-[#101f24] dark:text-white">System default</option>
                <option value="light" className="bg-white text-[#4b4b4b] dark:bg-[#101f24] dark:text-white">Light</option>
                <option value="dark" className="bg-white text-[#4b4b4b] dark:bg-[#101f24] dark:text-white">Dark</option>
              </select>
            </section>

            <section id="notifications" aria-labelledby="notifications-heading" className="mt-8 scroll-mt-6 sm:mt-10">
              <h2 id="notifications-heading" className="border-b-2 border-[var(--border)] pb-3 text-lg font-extrabold sm:text-xl">
                Notifications
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-[var(--text-secondary)]">
                Choose which reminders you would like enabled for this browser.
              </p>
              {renderPreferenceOptions(notificationOptions)}
            </section>
          </section>

          <aside className="min-w-0 space-y-5">
            {preferenceSections.map((section) => (
              <nav
                key={section.title}
                aria-label={section.title}
                className="rounded-2xl border-2 border-[var(--border)] p-4 sm:p-6"
              >
                <h2 className="mb-4 text-lg font-extrabold sm:text-xl">{section.title}</h2>
                <ul className="space-y-1">
                  {section.links.map((link) => (
                    <li key={link.label}>
                      {link.message ? (
                        <button
                          type="button"
                          onClick={() => showNotice(link.label, link.message ?? "")}
                          className="block w-full break-words rounded-lg py-1.5 text-left text-sm font-bold transition-colors hover:text-[#1cb0f6] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1cb0f6] sm:text-base"
                        >
                          {link.label}
                        </button>
                      ) : link.external ? (
                        <a
                          href={link.href}
                          target="_blank"
                          rel="noreferrer"
                          className="block break-words rounded-lg py-1.5 text-sm font-bold transition-colors hover:text-[#1cb0f6] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1cb0f6] sm:text-base"
                        >
                          {link.label}
                        </a>
                      ) : (
                        <Link
                          href={link.href ?? "/settings"}
                          aria-current={link.label === "Preferences" ? "page" : undefined}
                          className={`block break-words rounded-lg py-1.5 text-sm font-bold transition-colors hover:text-[#1cb0f6] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1cb0f6] sm:text-base ${
                            link.label === "Preferences" ? "text-[#1cb0f6]" : ""
                          }`}
                        >
                          {link.label}
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
            <button
              type="button"
              onClick={() =>
                showNotice(
                  "Log out",
                  "This app uses a shared demo learner and does not have account sign-in. Your demo progress is still saved.",
                )
              }
              className="min-h-14 w-full rounded-2xl border-2 border-[var(--border)] border-b-4 px-4 text-sm font-extrabold uppercase tracking-wide text-[#1cb0f6] transition-colors hover:bg-[var(--surface-secondary)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1cb0f6]"
            >
              Log out
            </button>
          </aside>
        </div>
      </main>
      {notice && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeNotice();
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="settings-notice-title"
            className="w-full max-w-md rounded-2xl border-2 border-[var(--border)] bg-[var(--background)] p-6 shadow-xl"
          >
            <h2 id="settings-notice-title" className="text-xl font-extrabold">{notice.title}</h2>
            <p className="mt-3 text-sm leading-relaxed text-[var(--text-secondary)]">{notice.message}</p>
            <button
              type="button"
              onClick={closeNotice}
              className="duo-btn-blue mt-6 min-h-12 w-full rounded-xl font-extrabold uppercase tracking-wide"
            >
              Got it
            </button>
          </section>
        </div>
      )}
    </div>
  );
}
