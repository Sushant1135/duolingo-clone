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
  question_data: Record<string, unknown>;
  solution_data: Record<string, unknown>;
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

export interface CourseSectionUnit {
  id: string;
  sectionId: number;
  unitId: number;
  backendUnitId: number;
  unit: Unit;
}

export interface SectionProgress {
  completedLessons: number;
  totalLessons: number;
  percentage: number;
  isComplete: boolean;
}

export interface CourseSection {
  id: number;
  title: string;
  units: CourseSectionUnit[];
  progress: SectionProgress;
  isLocked: boolean;
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
  correct_solution: unknown;
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
  is_completed: boolean;
}

export interface MonthlyQuest {
  year: number;
  month: number;
  month_name: string;
  title: string;
  goal: number;
  completed_count: number;
  completed: boolean;
  reward_claimed: boolean;
  reward_gems: number;
  badge_name: string;
  days_remaining: number;
}

export interface MonthlyBadge {
  id: number;
  year: number;
  month: number;
  month_name: string;
  title: string;
  badge_name: string;
  goal: number;
  completed_count: number;
  completed: boolean;
  reward_claimed: boolean;
  reward_gems: number;
}

export interface QuestOverview {
  daily: Quest[];
  monthly: MonthlyQuest | null;
  badges: MonthlyBadge[];
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

export interface PurchaseResult {
  success: boolean;
  message: string;
  gems: number;
  hearts: number;
  streak_freeze: number;
  avatar: string;
}
