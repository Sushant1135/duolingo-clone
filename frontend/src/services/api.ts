const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ||
  (typeof window !== "undefined"
    ? `${window.location.protocol}//${window.location.hostname}:8000`
    : "http://localhost:8000");

import type { User, CourseTree, LessonDetail, SubmitResult, CompleteResult, LeaderboardData, Quest, MonthlyQuest, MonthlyBadge, QuestOverview, Achievement, ShopItem, PurchaseResult } from "@/models/types";

function isQuest(value: unknown): value is Quest {
  if (typeof value !== "object" || value === null) return false;
  const quest = value as Record<string, unknown>;
  return (
    typeof quest.id === "number" &&
    typeof quest.title === "string" &&
    typeof quest.description === "string" &&
    typeof quest.icon === "string" &&
    typeof quest.current_progress === "number" &&
    typeof quest.target_progress === "number" &&
    typeof quest.reward_gems === "number" &&
    typeof quest.is_claimed === "boolean" &&
    (typeof quest.is_completed === "boolean" || quest.is_completed === undefined)
  );
}

function isMonthlyQuest(value: unknown): value is MonthlyQuest | null {
  if (value === null) return true;
  if (typeof value !== "object") return false;
  const monthly = value as Record<string, unknown>;
  return (
    typeof monthly.year === "number" &&
    typeof monthly.month === "number" &&
    typeof monthly.month_name === "string" &&
    typeof monthly.title === "string" &&
    typeof monthly.goal === "number" &&
    typeof monthly.completed_count === "number" &&
    typeof monthly.completed === "boolean" &&
    typeof monthly.reward_claimed === "boolean" &&
    typeof monthly.reward_gems === "number" &&
    typeof monthly.badge_name === "string" &&
    typeof monthly.days_remaining === "number"
  );
}

function isMonthlyBadge(value: unknown): value is MonthlyBadge {
  if (typeof value !== "object" || value === null) return false;
  const badge = value as Record<string, unknown>;
  return (
    typeof badge.id === "number" &&
    typeof badge.year === "number" &&
    typeof badge.month === "number" &&
    typeof badge.month_name === "string" &&
    typeof badge.title === "string" &&
    typeof badge.badge_name === "string" &&
    typeof badge.goal === "number" &&
    typeof badge.completed_count === "number" &&
    typeof badge.completed === "boolean" &&
    typeof badge.reward_claimed === "boolean" &&
    typeof badge.reward_gems === "number"
  );
}

// API methods
export const api = {
  async getUser(): Promise<User> {
    const res = await fetch(`${API_BASE}/api/users/me`);
    if (!res.ok) throw new Error("Failed to load user profile");
    return res.json();
  },

  async updateUserStats(payload: Partial<Pick<User, "xp" | "gems" | "hearts" | "streak">>): Promise<User> {
    const res = await fetch(`${API_BASE}/api/users/me`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error("Failed to update learner stats");
    return res.json();
  },

  async getCourseTree(courseId: number = 1): Promise<CourseTree> {
    const res = await fetch(`${API_BASE}/api/courses/${courseId}/tree`);
    if (!res.ok) throw new Error("Failed to load learning tree");
    return res.json();
  },

  async getGuidebook(unitId: number): Promise<{ unit_id: number; title: string; subtitle: string; color: string; content: string }> {
    const res = await fetch(`${API_BASE}/api/courses/units/${unitId}/guidebook`);
    if (!res.ok) throw new Error("Failed to load guidebook");
    return res.json();
  },

  async getLesson(lessonId: number): Promise<LessonDetail> {
    const res = await fetch(`${API_BASE}/api/lessons/${lessonId}`);
    if (!res.ok) throw new Error("Failed to load lesson");
    return res.json();
  },

  async submitAnswer(exerciseId: number, userAnswer: unknown): Promise<SubmitResult> {
    const res = await fetch(`${API_BASE}/api/lessons/exercises/${exerciseId}/submit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ exercise_id: exerciseId, user_answer: userAnswer }),
    });
    if (!res.ok) throw new Error("Failed to submit answer");
    return res.json();
  },

  async completeLesson(lessonId: number, payload: { mistakes_count: number; time_spent_seconds: number }): Promise<CompleteResult> {
    const res = await fetch(`${API_BASE}/api/lessons/${lessonId}/complete`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error("Failed to complete lesson");
    return res.json();
  },

  async refillHearts(method: "gems" | "practice" | "free"): Promise<{ success: boolean; hearts: number; gems: number; message: string }> {
    const res = await fetch(`${API_BASE}/api/users/refill-hearts`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ method }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || "Failed to refill hearts");
    }
    return res.json();
  },

  async simulateStreak(action: "advance_day" | "miss_day" | "freeze" | "reset"): Promise<{ success: boolean; streak: number; streak_freeze: number; message: string }> {
    const res = await fetch(`${API_BASE}/api/users/simulate-streak`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
    if (!res.ok) throw new Error("Failed to simulate streak");
    return res.json();
  },

  async resetProgress(): Promise<{ success: boolean; message: string }> {
    const res = await fetch(`${API_BASE}/api/users/reset-progress`, {
      method: "POST",
    });
    if (!res.ok) throw new Error("Failed to reset progress");
    return res.json();
  },

  async getLeaderboard(): Promise<LeaderboardData> {
    const res = await fetch(`${API_BASE}/api/leaderboard`);
    if (!res.ok) throw new Error("Failed to load leaderboard");
    return res.json();
  },

  async getQuests(): Promise<QuestOverview> {
    const res = await fetch(`${API_BASE}/api/users/quests`);
    if (!res.ok) throw new Error("Failed to load quests");
    const data: unknown = await res.json();
    if (Array.isArray(data)) {
      if (!data.every(isQuest)) throw new Error("Invalid daily quests response from server");
      return {
        daily: data.map((quest) => ({
          ...quest,
          is_completed: quest.is_completed ?? quest.current_progress >= quest.target_progress,
        })),
        monthly: null,
        badges: [],
      };
    }
    if (typeof data === "object" && data !== null) {
      const overview = data as Record<string, unknown>;
      const daily = overview.daily;
      const monthly = overview.monthly;
      const badges = overview.badges;
      if (
        Array.isArray(daily) &&
        daily.every(isQuest) &&
        isMonthlyQuest(monthly) &&
        Array.isArray(badges) &&
        badges.every(isMonthlyBadge)
      ) {
        return {
        daily: daily.filter(isQuest).map((quest) => ({
          ...quest,
          is_completed: quest.is_completed ?? quest.current_progress >= quest.target_progress,
        })),
        monthly,
        badges: badges.filter(isMonthlyBadge),
      };
      }
    }
    throw new Error("Invalid quests response from server");
  },

  async claimQuest(questId: number): Promise<{ success: boolean; reward_gems: number; total_gems: number }> {
    const res = await fetch(`${API_BASE}/api/users/quests/${questId}/claim`, {
      method: "POST",
    });
    if (!res.ok) throw new Error("Failed to claim quest");
    return res.json();
  },

  async claimMonthlyQuest(): Promise<{ success: boolean; reward_gems: number; total_gems: number }> {
    const res = await fetch(`${API_BASE}/api/users/quests/monthly/claim`, {
      method: "POST",
    });
    if (!res.ok) throw new Error("Failed to claim monthly quest");
    return res.json();
  },

  async getAchievements(): Promise<Achievement[]> {
    const res = await fetch(`${API_BASE}/api/users/achievements`);
    if (!res.ok) throw new Error("Failed to load achievements");
    return res.json();
  },

  async getShopItems(): Promise<ShopItem[]> {
    const res = await fetch(`${API_BASE}/api/shop`);
    if (!res.ok) throw new Error("Failed to load shop items");
    return res.json();
  },

  async purchaseShopItem(itemId: string): Promise<PurchaseResult> {
    const res = await fetch(`${API_BASE}/api/shop/purchase`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ item_id: itemId }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || "Failed to purchase item");
    }
    return res.json();
  },
};
