import { UserProgress } from "../../types";

/**
 * Idempotent XP Reward Event Model
 */
export interface XPEvent {
  id: string; // Unique deterministic identifier e.g. "lesson-completed:lesson-1", "quiz-completed:quiz-ai-1:att-123"
  type: string; // e.g. "lesson_completed", "quiz_completed", "lab_completed", "goal_reward", "chat_interaction", "portfolio_star"
  sourceId: string; // Context identifier (lessonId, quizTopic, labId, etc.)
  amount: number; // Positive XP points to award
  reason?: string; // Human-readable motivation label
  createdAt: string; // ISO timestamp
}

/**
 * Allowlisted Qualifying Learning Activity Types for Streak Tracking
 * Engagement / UI actions (login, theme change, audio toggle, navigation) do NOT qualify.
 */
export type QualifyingLearningActivityType =
  | "lesson_completed"
  | "quiz_completed"
  | "lab_completed";

export interface StreakEvaluationResult {
  streakDays: number;
  lastLearningActivityDate: string;
  streakIncremented: boolean;
  isFirstActivityOfDay: boolean;
}

export interface ProgressOperationResult<T = UserProgress> {
  updatedProgress: T;
  applied: boolean;
  reason?: string;
}
