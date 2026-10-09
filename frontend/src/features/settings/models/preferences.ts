export type PreferenceKey =
  | "soundEffects"
  | "animations"
  | "motivationalMessages"
  | "listeningExercises"
  | "dailyReminders"
  | "streakReminders"
  | "emailUpdates";

export type Preferences = Record<PreferenceKey, boolean>;

export const preferenceDefaults: Preferences = {
  soundEffects: true,
  animations: true,
  motivationalMessages: true,
  listeningExercises: true,
  dailyReminders: true,
  streakReminders: true,
  emailUpdates: false,
};

export const preferenceOptions: { key: PreferenceKey; label: string }[] = [
  { key: "soundEffects", label: "Sound effects" },
  { key: "animations", label: "Animations" },
  { key: "motivationalMessages", label: "Motivational messages" },
  { key: "listeningExercises", label: "Listening exercises" },
];

export const notificationOptions: { key: PreferenceKey; label: string }[] = [
  { key: "dailyReminders", label: "Daily learning reminders" },
  { key: "streakReminders", label: "Streak reminders" },
  { key: "emailUpdates", label: "Product updates by email" },
];

export const preferenceSections: {
  title: string;
  links: {
    label: string;
    href?: string;
    external?: boolean;
    message?: string;
  }[];
}[] = [
  {
    title: "Account",
    links: [
      { label: "Preferences", href: "/settings#preferences" },
      { label: "Profile", href: "/profile" },
      { label: "Notifications", href: "/settings#notifications" },
      { label: "Courses", href: "/learn" },
      {
        label: "Score on LinkedIn",
        href: "https://www.linkedin.com/sharing/share-offsite/?url=https%3A%2F%2Fduolingo.com",
        external: true,
      },
      {
        label: "Duolingo for Schools",
        href: "https://schools.duolingo.com/",
        external: true,
      },
      {
        label: "Social accounts",
        message: "Social account linking is not available in this local demo.",
      },
      {
        label: "Privacy settings",
        message: "Privacy controls are not connected in this local demo.",
      },
    ],
  },
  {
    title: "Subscription",
    links: [
      {
        label: "Super Duolingo",
        message: "Subscriptions are a demo-only feature and cannot be purchased here.",
      },
    ],
  },
  {
    title: "Support",
    links: [
      {
        label: "Help Center",
        href: "https://support.duolingo.com/",
        external: true,
      },
      {
        label: "Feedback",
        message: "Thanks for helping improve the demo! Feedback submission is not connected yet.",
      },
    ],
  },
];

export const preferenceStorageKey = "duo-preferences";
export const defaultPreferenceSnapshot = JSON.stringify(preferenceDefaults);

export const getPreferenceSnapshot = () =>
  window.localStorage.getItem(preferenceStorageKey) ?? defaultPreferenceSnapshot;

export const subscribeToPreferences = (onChange: () => void) => {
  window.addEventListener("storage", onChange);
  window.addEventListener("duo-preferences-change", onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener("duo-preferences-change", onChange);
  };
};

export const parsePreferences = (snapshot: string): Preferences => {
  let parsed: unknown;
  try {
    parsed = JSON.parse(snapshot);
  } catch (error) {
    console.error("Failed to parse saved preferences:", error);
    return preferenceDefaults;
  }
  if (typeof parsed !== "object" || parsed === null) return preferenceDefaults;
  const values = parsed as Record<string, unknown>;
  return {
    soundEffects: typeof values.soundEffects === "boolean" ? values.soundEffects : preferenceDefaults.soundEffects,
    animations: typeof values.animations === "boolean" ? values.animations : preferenceDefaults.animations,
    motivationalMessages: typeof values.motivationalMessages === "boolean" ? values.motivationalMessages : preferenceDefaults.motivationalMessages,
    listeningExercises: typeof values.listeningExercises === "boolean" ? values.listeningExercises : preferenceDefaults.listeningExercises,
    dailyReminders: typeof values.dailyReminders === "boolean" ? values.dailyReminders : preferenceDefaults.dailyReminders,
    streakReminders: typeof values.streakReminders === "boolean" ? values.streakReminders : preferenceDefaults.streakReminders,
    emailUpdates: typeof values.emailUpdates === "boolean" ? values.emailUpdates : preferenceDefaults.emailUpdates,
  };
};
