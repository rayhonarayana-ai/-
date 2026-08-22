import { UserProgress } from "../../types";
import { QualifyingLearningActivityType, StreakEvaluationResult } from "./types";

export const QUALIFYING_LEARNING_ACTIVITIES: readonly QualifyingLearningActivityType[] = [
  "lesson_completed",
  "quiz_completed",
  "lab_completed",
] as const;

/**
 * Checks whether an activity type qualifies as a legitimate learning action for streak.
 */
export function isQualifyingLearningActivity(activityType: string): boolean {
  return QUALIFYING_LEARNING_ACTIVITIES.includes(
    activityType as QualifyingLearningActivityType
  );
}

/**
 * Formats a Date or date string to local "YYYY-MM-DD" calendar date format.
 */
export function toCalendarDateString(dateInput?: Date | string | number): string {
  const d = dateInput
    ? typeof dateInput === "string" || typeof dateInput === "number"
      ? new Date(dateInput)
      : dateInput
    : new Date();

  if (isNaN(d.getTime())) {
    const fallback = new Date();
    return `${fallback.getFullYear()}-${String(fallback.getMonth() + 1).padStart(2, "0")}-${String(fallback.getDate()).padStart(2, "0")}`;
  }

  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Calculates the difference in calendar days between two "YYYY-MM-DD" strings (dateB - dateA).
 */
export function getCalendarDayDiff(dateAStr: string, dateBStr: string): number {
  const [yA, mA, dA] = dateAStr.split("-").map(Number);
  const [yB, mB, dB] = dateBStr.split("-").map(Number);

  const utcA = Date.UTC(yA, mA - 1, dA);
  const utcB = Date.UTC(yB, mB - 1, dB);

  const msPerDay = 24 * 60 * 60 * 1000;
  return Math.round((utcB - utcA) / msPerDay);
}

/**
 * Evaluates and updates student streak upon performing a learning activity.
 * 
 * Rules:
 * 1. Non-qualifying activity -> Streak is NOT updated.
 * 2. First ever qualifying activity -> Streak becomes 1.
 * 3. Activity on same calendar day -> Streak remains unchanged.
 * 4. Activity on consecutive next calendar day (diff == 1) -> Streak increments by 1.
 * 5. Activity after missed days (diff > 1) -> Streak resets to 1.
 */
export function evaluateStreakOnActivity(
  progress: UserProgress,
  activityType: string,
  currentDateInput?: Date | string | number
): StreakEvaluationResult {
  const currentStreak = progress.streakDays || 0;
  const todayStr = toCalendarDateString(currentDateInput);

  if (!isQualifyingLearningActivity(activityType)) {
    return {
      streakDays: currentStreak,
      lastLearningActivityDate: progress.lastLearningActivityDate || "",
      streakIncremented: false,
      isFirstActivityOfDay: false,
    };
  }

  // If no previous activity record exists:
  if (!progress.lastLearningActivityDate) {
    return {
      streakDays: Math.max(1, currentStreak),
      lastLearningActivityDate: todayStr,
      streakIncremented: false,
      isFirstActivityOfDay: true,
    };
  }

  const diffDays = getCalendarDayDiff(progress.lastLearningActivityDate, todayStr);

  if (diffDays === 0) {
    // Same calendar day: streak remains unchanged
    return {
      streakDays: currentStreak,
      lastLearningActivityDate: todayStr,
      streakIncremented: false,
      isFirstActivityOfDay: false,
    };
  }

  if (diffDays === 1) {
    // Consecutive day: increment streak
    const newStreak = currentStreak + 1;
    return {
      streakDays: newStreak,
      lastLearningActivityDate: todayStr,
      streakIncremented: true,
      isFirstActivityOfDay: true,
    };
  }

  if (diffDays > 1) {
    // Missed 1 or more calendar days: reset streak to 1
    return {
      streakDays: 1,
      lastLearningActivityDate: todayStr,
      streakIncremented: true,
      isFirstActivityOfDay: true,
    };
  }

  // Future/Negative diff (e.g. clock anomaly)
  return {
    streakDays: currentStreak,
    lastLearningActivityDate: progress.lastLearningActivityDate,
    streakIncremented: false,
    isFirstActivityOfDay: false,
  };
}
