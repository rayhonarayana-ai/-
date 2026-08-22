import { UserProgress, WeeklyGoal } from "../../types";
import { calculateLevel } from "./level";
import { evaluateStreakOnActivity } from "./streak";
import { XPEvent, ProgressOperationResult } from "./types";

const MAX_STORED_EVENT_IDS = 150;

/**
 * Ensures an array of strings behaves as a deduplicated set.
 */
export function deduplicateIds(items: string[]): string[] {
  return Array.from(new Set(items.filter(Boolean)));
}

/**
 * Applies an idempotent XP reward event to user progress.
 * If the event ID has already been applied, progress is returned unchanged without duplicate XP.
 */
export function applyXPEvent(
  progress: UserProgress,
  event: XPEvent
): ProgressOperationResult<UserProgress> {
  const appliedIds = progress.appliedXpEventIds || [];

  if (appliedIds.includes(event.id)) {
    return {
      updatedProgress: progress,
      applied: false,
      reason: `XP event with ID '${event.id}' has already been applied.`,
    };
  }

  const validAmount = Math.max(0, typeof event.amount === "number" ? event.amount : 0);
  const newXP = progress.xp + validAmount;
  const newLevel = calculateLevel(newXP);

  // Keep bounded history of applied event IDs
  const updatedEventIds = [event.id, ...appliedIds].slice(0, MAX_STORED_EVENT_IDS);

  const updatedProgress: UserProgress = {
    ...progress,
    xp: newXP,
    level: newLevel,
    appliedXpEventIds: updatedEventIds,
  };

  return {
    updatedProgress,
    applied: true,
  };
}

/**
 * Marks a lesson as completed, awards its XP idempotently, and updates the daily streak.
 */
export function completeLessonProgress(
  progress: UserProgress,
  lessonId: string,
  xpReward: number,
  eventAttemptId?: string,
  dateInput?: Date | string | number
): {
  updatedProgress: UserProgress;
  isFirstCompletion: boolean;
  xpApplied: boolean;
  streakIncremented: boolean;
} {
  const isFirstCompletion = !progress.completedLessons.includes(lessonId);
  const nextCompletedLessons = deduplicateIds([...progress.completedLessons, lessonId]);

  let current = {
    ...progress,
    completedLessons: nextCompletedLessons,
  };

  // Evaluate streak for qualifying learning activity
  const streakResult = evaluateStreakOnActivity(current, "lesson_completed", dateInput);
  current = {
    ...current,
    streakDays: streakResult.streakDays,
    lastLearningActivityDate: streakResult.lastLearningActivityDate,
  };

  // Apply idempotent XP event (keyed to lessonId)
  const eventId = eventAttemptId
    ? `lesson-completed:${lessonId}:${eventAttemptId}`
    : `lesson-completed:${lessonId}`;

  const xpResult = applyXPEvent(current, {
    id: eventId,
    type: "lesson_completed",
    sourceId: lessonId,
    amount: xpReward,
    reason: "إكمال الدرس الذكي",
    createdAt: new Date().toISOString(),
  });

  return {
    updatedProgress: xpResult.updatedProgress,
    isFirstCompletion,
    xpApplied: xpResult.applied,
    streakIncremented: streakResult.streakIncremented,
  };
}

/**
 * Completes a lab project, updates completedLabs set, awards XP, and updates streak.
 */
export function completeLabProgress(
  progress: UserProgress,
  labId: string,
  xpReward: number = 100,
  eventAttemptId?: string,
  dateInput?: Date | string | number
): {
  updatedProgress: UserProgress;
  isFirstCompletion: boolean;
  xpApplied: boolean;
  streakIncremented: boolean;
} {
  const isFirstCompletion = !progress.completedLabs.includes(labId);
  const nextCompletedLabs = deduplicateIds([...progress.completedLabs, labId]);

  let current = {
    ...progress,
    completedLabs: nextCompletedLabs,
  };

  // Update streak for qualifying lab activity
  const streakResult = evaluateStreakOnActivity(current, "lab_completed", dateInput);
  current = {
    ...current,
    streakDays: streakResult.streakDays,
    lastLearningActivityDate: streakResult.lastLearningActivityDate,
  };

  const eventId = eventAttemptId
    ? `lab-completed:${labId}:${eventAttemptId}`
    : `lab-completed:${labId}:${Date.now()}`;

  const xpResult = applyXPEvent(current, {
    id: eventId,
    type: "lab_completed",
    sourceId: labId,
    amount: xpReward,
    reason: "إنجاز وتوثيق مشروع المختبر",
    createdAt: new Date().toISOString(),
  });

  return {
    updatedProgress: xpResult.updatedProgress,
    isFirstCompletion,
    xpApplied: xpResult.applied,
    streakIncremented: streakResult.streakIncremented,
  };
}

/**
 * Records a quiz completion, awards XP, and updates learning streak.
 */
export function completeQuizProgress(
  progress: UserProgress,
  topic: string,
  earnedXP: number,
  attemptId: string,
  dateInput?: Date | string | number
): {
  updatedProgress: UserProgress;
  xpApplied: boolean;
  streakIncremented: boolean;
} {
  // Update streak for qualifying quiz activity
  const streakResult = evaluateStreakOnActivity(progress, "quiz_completed", dateInput);
  let current: UserProgress = {
    ...progress,
    streakDays: streakResult.streakDays,
    lastLearningActivityDate: streakResult.lastLearningActivityDate,
  };

  const eventId = `quiz-completed:${topic}:${attemptId}`;
  const xpResult = applyXPEvent(current, {
    id: eventId,
    type: "quiz_completed",
    sourceId: topic,
    amount: earnedXP,
    reason: `اجتياز اختبار ${topic}`,
    createdAt: new Date().toISOString(),
  });

  return {
    updatedProgress: xpResult.updatedProgress,
    xpApplied: xpResult.applied,
    streakIncremented: streakResult.streakIncremented,
  };
}

/**
 * Awards an achievement badge ensuring strict ID deduplication.
 */
export function awardBadge(progress: UserProgress, badgeId: string): UserProgress {
  if (progress.earnedBadges.includes(badgeId)) {
    return progress;
  }
  return {
    ...progress,
    earnedBadges: deduplicateIds([...progress.earnedBadges, badgeId]),
  };
}

/**
 * Claims a weekly goal reward idempotently preventing double-claims.
 */
export function claimWeeklyGoalReward(
  progress: UserProgress,
  goalId: string,
  rewardXP: number
): ProgressOperationResult<UserProgress> {
  const activeGoal = progress.weeklyGoal;

  if (!activeGoal || activeGoal.id !== goalId) {
    return {
      updatedProgress: progress,
      applied: false,
      reason: "No matching active weekly goal found.",
    };
  }

  if (activeGoal.isCompleted) {
    return {
      updatedProgress: progress,
      applied: false,
      reason: "Weekly goal reward has already been claimed for this goal period.",
    };
  }

  const updatedGoal: WeeklyGoal = {
    ...activeGoal,
    isCompleted: true,
  };

  const eventId = `goal-reward:${goalId}`;
  const progressWithCompletedGoal: UserProgress = {
    ...progress,
    weeklyGoal: updatedGoal,
  };

  const xpResult = applyXPEvent(progressWithCompletedGoal, {
    id: eventId,
    type: "goal_reward",
    sourceId: goalId,
    amount: rewardXP,
    reason: "إكمال الهدف الأسبوعي بنجاح 🎯",
    createdAt: new Date().toISOString(),
  });

  return {
    updatedProgress: xpResult.updatedProgress,
    applied: xpResult.applied,
    reason: xpResult.reason,
  };
}
