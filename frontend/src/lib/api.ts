const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export interface User {
  id: number;
  username: string;
  name: string;
  email: string;
  avatar: string;
  streak: number;
  max_streak: number;
  last_streak_date?: string;
  xp: number;
  gems: number;
  hearts: number;
  max_hearts: number;
  league: string;
  streak_freeze: number;
  active_course_id: number;
  created_at: string;
}

export interface Exercise {
  id: number;
  lesson_id: number;
  order: number;
  type: "multiple_choice" | "translate_words" | "match_pairs" | "fill_blank" | "type_answer";
  prompt: string;
  target_text?: string;
  audio_text?: string;
  question_data: any;
  solution_data: any;
}

export interface LessonSummary {
  id: number;
  skill_id: number;
  order: number;
  title: string;
  xp_reward: number;
  is_completed: boolean;
  is_current: boolean;
  is_locked: boolean;
}

export interface Skill {
  id: number;
  unit_id: number;
  order: number;
  title: string;
  icon: string;
  total_lessons: number;
  completed_lessons: number;
  is_unlocked: boolean;
  is_completed: boolean;
  is_current: boolean;
  crown_level: number;
  lessons: LessonSummary[];
}

export interface Unit {
  id: number;
  course_id: number;
  unit_number: number;
  title: string;
  subtitle: string;
  guide_content: string;
  color: string;
  skills: Skill[];
}

export interface CourseTree {
  course: {
    id: number;
    title: string;
    code: string;
    flag: string;
    description: string;
  };
  units: Unit[];
}

export interface LessonDetail {
  id: number;
  skill_id: number;
  skill_title: string;
  order: number;
  title: string;
  xp_reward: number;
  exercises: Exercise[];
}

export interface SubmitResult {
  is_correct: boolean;
  correct_solution: any;
  explanation: string;
  hearts_remaining: number;
  out_of_hearts: boolean;
}

export interface CompleteResult {
  success: boolean;
  xp_earned: number;
  total_xp: number;
  streak: number;
  gems_earned: number;
  total_gems: number;
  skill_completed: boolean;
  unlocked_next_skill: boolean;
}

export interface LeaderboardEntry {
  id: number;
  rank: number;
  name: string;
  username: string;
  avatar: string;
  xp: number;
  is_current_user: boolean;
}

export interface LeaderboardData {
  league: string;
  time_left: string;
  top_3_promotion_zone: number;
  demotion_zone_start: number;
  entries: LeaderboardEntry[];
}

export interface Quest {
  id: number;
  title: string;
  description: string;
  icon: string;
  current_progress: number;
  target_progress: number;
  reward_gems: number;
  is_claimed: boolean;
}

export interface Achievement {
  id: number;
  code: string;
  title: string;
  description: string;
  icon: string;
  tier: number;
  max_tier: number;
  progress: number;
  goal: number;
}

export interface ShopItem {
  id: string;
  title: string;
  description: string;
  icon: string;
  cost: number;
  cost_type: string;
  can_afford: boolean;
  badge?: string;
  category: string;
}

// API methods
export const api = {
  async getUser(): Promise<User> {
    const res = await fetch(`${API_BASE}/api/users/me`);
    if (!res.ok) throw new Error("Failed to load user profile");
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

  async submitAnswer(exerciseId: number, userAnswer: any): Promise<SubmitResult> {
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

  async getQuests(): Promise<Quest[]> {
    const res = await fetch(`${API_BASE}/api/users/quests`);
    if (!res.ok) throw new Error("Failed to load quests");
    return res.json();
  },

  async claimQuest(questId: number): Promise<{ success: boolean; reward_gems: number; total_gems: number }> {
    const res = await fetch(`${API_BASE}/api/users/quests/${questId}/claim`, {
      method: "POST",
    });
    if (!res.ok) throw new Error("Failed to claim quest");
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

  async purchaseShopItem(itemId: string): Promise<any> {
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
