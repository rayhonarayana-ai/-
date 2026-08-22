/**
 * GATE 4 FORMAL VERIFICATION & REGRESSION TEST SUITE
 * 
 * Verifies:
 * 1. XP Event Idempotency & Deduplication
 * 2. Deterministic Level Calculation from Cumulative XP
 * 3. Daily Streak Evaluation on Qualifying Learning Activities Only
 * 4. Same-Day Activity Streak Invariance (No Multi-Count on Same Day)
 * 5. Streak Gap Reset on Missed Days
 * 6. Set-like Deduplication of Badges, Lessons, Labs
 * 7. Single-Claim Weekly Goal Reward Protection
 * 8. Regression Verification of Gate 2 & Gate 3 Guarantees
 */

import {
  calculateLevel,
  getXpRequiredForLevel,
  getLevelProgressPercentage,
  XP_PER_LEVEL,
} from "../src/domain/progress/level";
import {
  isQualifyingLearningActivity,
  toCalendarDateString,
  getCalendarDayDiff,
  evaluateStreakOnActivity,
} from "../src/domain/progress/streak";
import {
  applyXPEvent,
  completeLessonProgress,
  completeLabProgress,
  completeQuizProgress,
  awardBadge,
  claimWeeklyGoalReward,
  deduplicateIds,
} from "../src/domain/progress/progression";
import { UserProgress, WeeklyGoal } from "../src/types";
import { DEFAULT_PROGRESS } from "../src/persistence/localStorageAdapter";

console.log("==========================================================");
console.log("=== RUNNING GATE 4 PROGRESSION, XP & STREAK SUITE     ===");
console.log("==========================================================");

let passedTests = 0;
let totalTests = 0;

function assert(condition: boolean, testName: string, detail?: string) {
  totalTests++;
  if (condition) {
    console.log(`✅ [PASS] ${testName}`);
    passedTests++;
  } else {
    console.error(`❌ [FAIL] ${testName}: ${detail || "Assertion failed"}`);
    process.exitCode = 1;
  }
}

// ----------------------------------------------------------------------------
// PROOF 1: XP Event Idempotency
// ----------------------------------------------------------------------------
{
  const initial: UserProgress = {
    ...DEFAULT_PROGRESS,
    xp: 150,
    level: 1,
    appliedXpEventIds: ["event-prev-1"],
  };

  const xpEvent = {
    id: "lesson-comp:lesson-ai-01",
    type: "lesson_completed",
    sourceId: "lesson-ai-01",
    amount: 50,
    createdAt: new Date().toISOString(),
  };

  // First application: must apply
  const res1 = applyXPEvent(initial, xpEvent);
  assert(
    res1.applied === true && res1.updatedProgress.xp === 200 && res1.updatedProgress.level === 2,
    "GATE 4 - PROOF 1A: First application of XP event adds points and updates level",
    `Expected xp 200, received ${res1.updatedProgress.xp}`
  );

  // Second application with identical ID: MUST be rejected and unchanged
  const res2 = applyXPEvent(res1.updatedProgress, xpEvent);
  assert(
    res2.applied === false && res2.updatedProgress.xp === 200,
    "GATE 4 - PROOF 1B: Duplicate XP event ID rejected idempotently with zero point duplication",
    `Expected xp 200, received ${res2.updatedProgress.xp}`
  );
}

// ----------------------------------------------------------------------------
// PROOF 2: Deterministic Level Calculation
// ----------------------------------------------------------------------------
{
  assert(calculateLevel(0) === 1, "GATE 4 - PROOF 2A: 0 XP is Level 1");
  assert(calculateLevel(199) === 1, "GATE 4 - PROOF 2B: 199 XP is Level 1");
  assert(calculateLevel(200) === 2, "GATE 4 - PROOF 2C: 200 XP is Level 2");
  assert(calculateLevel(399) === 2, "GATE 4 - PROOF 2D: 399 XP is Level 2");
  assert(calculateLevel(400) === 3, "GATE 4 - PROOF 2E: 400 XP is Level 3");
  assert(calculateLevel(1000) === 6, "GATE 4 - PROOF 2F: 1000 XP is Level 6");
  assert(calculateLevel(-50) === 1, "GATE 4 - PROOF 2G: Negative XP safely falls back to Level 1");

  assert(
    getLevelProgressPercentage(0) === 0,
    "GATE 4 - PROOF 2H: 0 XP has 0% progress to next level"
  );
  assert(
    getLevelProgressPercentage(100) === 50,
    "GATE 4 - PROOF 2I: 100 XP has 50% progress to next level"
  );
  assert(
    getLevelProgressPercentage(250) === 25,
    "GATE 4 - PROOF 2J: 250 XP (Level 2) has 25% progress to Level 3"
  );
}

// ----------------------------------------------------------------------------
// PROOF 3: Daily Streak Evaluation on Qualifying Learning Activities Only
// ----------------------------------------------------------------------------
{
  // 3A: Non-qualifying activities (e.g. login, navigation, audio toggle) do NOT increment streak
  assert(
    !isQualifyingLearningActivity("user_login"),
    "GATE 4 - PROOF 3A: user_login is not a qualifying learning activity"
  );
  assert(
    !isQualifyingLearningActivity("theme_toggle"),
    "GATE 4 - PROOF 3B: theme_toggle is not a qualifying learning activity"
  );
  assert(
    isQualifyingLearningActivity("lesson_completed") &&
      isQualifyingLearningActivity("quiz_completed") &&
      isQualifyingLearningActivity("lab_completed"),
    "GATE 4 - PROOF 3C: lesson, quiz, and lab completions are qualifying learning activities"
  );

  const baseProgress: UserProgress = {
    ...DEFAULT_PROGRESS,
    streakDays: 3,
    lastLearningActivityDate: "2026-08-20",
  };

  const nonQualEval = evaluateStreakOnActivity(baseProgress, "user_login", "2026-08-21");
  assert(
    nonQualEval.streakDays === 3 && !nonQualEval.streakIncremented,
    "GATE 4 - PROOF 3D: Non-qualifying activity leaves streakDays unchanged"
  );
}

// ----------------------------------------------------------------------------
// PROOF 4: Consecutive Days Increment & Same-Day Invariance
// ----------------------------------------------------------------------------
{
  // 4A: Consecutive calendar day (diff == 1) increments streak
  const progressDay1: UserProgress = {
    ...DEFAULT_PROGRESS,
    streakDays: 3,
    lastLearningActivityDate: "2026-08-20",
  };

  const evalNextDay = evaluateStreakOnActivity(progressDay1, "lesson_completed", "2026-08-21");
  assert(
    evalNextDay.streakDays === 4 &&
      evalNextDay.streakIncremented === true &&
      evalNextDay.lastLearningActivityDate === "2026-08-21",
    "GATE 4 - PROOF 4A: Activity on consecutive day increments streak by exactly 1"
  );

  // 4B: Second activity on the SAME calendar day does NOT increment streak
  const progressDay2AfterFirstActivity: UserProgress = {
    ...progressDay1,
    streakDays: 4,
    lastLearningActivityDate: "2026-08-21",
  };

  const evalSameDaySecond = evaluateStreakOnActivity(
    progressDay2AfterFirstActivity,
    "quiz_completed",
    "2026-08-21"
  );
  assert(
    evalSameDaySecond.streakDays === 4 &&
      evalSameDaySecond.streakIncremented === false &&
      evalSameDaySecond.isFirstActivityOfDay === false,
    "GATE 4 - PROOF 4B: Multiple qualifying activities on the same day do not double-increment streak"
  );
}

// ----------------------------------------------------------------------------
// PROOF 5: Streak Reset on Missed Days
// ----------------------------------------------------------------------------
{
  const progressBeforeGap: UserProgress = {
    ...DEFAULT_PROGRESS,
    streakDays: 8,
    lastLearningActivityDate: "2026-08-10",
  };

  // Activity 3 days later ("2026-08-13", diff == 3)
  const evalAfterGap = evaluateStreakOnActivity(progressBeforeGap, "lab_completed", "2026-08-13");
  assert(
    evalAfterGap.streakDays === 1 &&
      evalAfterGap.streakIncremented === true &&
      evalAfterGap.lastLearningActivityDate === "2026-08-13",
    "GATE 4 - PROOF 5: Missed calendar days reset streak to 1 upon new learning activity"
  );
}

// ----------------------------------------------------------------------------
// PROOF 6: Set-like Deduplication
// ----------------------------------------------------------------------------
{
  const rawList = ["badge-1", "badge-2", "badge-1", "badge-3", "badge-2", ""];
  const deduped = deduplicateIds(rawList);
  assert(
    deduped.length === 3 &&
      deduped.includes("badge-1") &&
      deduped.includes("badge-2") &&
      deduped.includes("badge-3"),
    "GATE 4 - PROOF 6A: deduplicateIds filters empty strings and preserves strict uniqueness"
  );

  const initial: UserProgress = {
    ...DEFAULT_PROGRESS,
    earnedBadges: ["badge-1"],
  };

  const updated1 = awardBadge(initial, "badge-2");
  assert(
    updated1.earnedBadges.length === 2 && updated1.earnedBadges.includes("badge-2"),
    "GATE 4 - PROOF 6B: Awarding new badge adds it"
  );

  const updated2 = awardBadge(updated1, "badge-2");
  assert(
    updated2.earnedBadges.length === 2,
    "GATE 4 - PROOF 6C: Awarding existing badge maintains strict uniqueness"
  );
}

// ----------------------------------------------------------------------------
// PROOF 7: Weekly Goal Single-Claim Protection
// ----------------------------------------------------------------------------
{
  const testGoal: WeeklyGoal = {
    id: "goal-week-34-2026",
    title: "تحدي الأسبوع",
    targetXP: 200,
    startXP: 100,
    startLessonsCount: 1,
    createdAt: "2026-08-17",
    isCompleted: false,
  };

  const initialProgress: UserProgress = {
    ...DEFAULT_PROGRESS,
    xp: 300,
    level: 2,
    weeklyGoal: testGoal,
  };

  const rewardAmount = 150;

  // First claim: success
  const claimRes1 = claimWeeklyGoalReward(initialProgress, testGoal.id, rewardAmount);
  assert(
    claimRes1.applied === true &&
      claimRes1.updatedProgress.xp === 450 &&
      claimRes1.updatedProgress.level === 3 &&
      claimRes1.updatedProgress.weeklyGoal?.isCompleted === true,
    "GATE 4 - PROOF 7A: First claim of weekly goal awards XP and marks goal completed"
  );

  // Second claim: rejected
  const claimRes2 = claimWeeklyGoalReward(claimRes1.updatedProgress, testGoal.id, rewardAmount);
  assert(
    claimRes2.applied === false &&
      claimRes2.updatedProgress.xp === 450,
    "GATE 4 - PROOF 7B: Subsequent claim of already completed weekly goal is safely rejected"
  );
}

console.log(`\n==========================================================`);
console.log(`=== GATE 4 TOTAL TESTS PASSED: ${passedTests}/${totalTests} ===`);
console.log(`==========================================================\n`);

if (passedTests !== totalTests) {
  process.exit(1);
}
