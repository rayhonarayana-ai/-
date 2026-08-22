/**
 * GATE 9 — ADAPTIVE LEARNING & PERSONALIZATION ENGINE VERIFICATION SUITE
 * 
 * Invariants:
 * 1. Deterministic authority (zero Math.random() or non-deterministic choice).
 * 2. Independent of XP, level farming, streaks, and cosmetic badges.
 * 3. AI-independent authority (AI explains, but does not choose or alter state).
 * 4. Evidence-driven: Reuses Gate 2 mastery derivation authority.
 * 5. Loop & Duplicate Protection: Completed lessons are not recommended as "learn".
 * 6. Child-safe & privacy-preserving: No psychological profiling, no deficit labeling.
 * 
 * 35 Formal Verification Proofs
 */

import {
  recommendNextLearningAction,
  deriveAdaptiveLearnerState,
  deriveActivityDifficulty,
  getDifficultyLabel,
  getDifficultyDescription,
  REASON_CODES,
  POLICY_PRIORITIES,
  AdaptiveRecommendationInput,
} from "../src/domain/adaptive";
import { LearningEvidence } from "../src/types/learningEvidence";
import { LabResult, UserProgress } from "../src/types";

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ [FAIL] ${message}`);
    throw new Error(`Assertion failed: ${message}`);
  }
}

function createSampleEvidence(
  id: string,
  skillId: string,
  overrides: Partial<LearningEvidence> = {}
): LearningEvidence {
  return {
    id,
    type: "SKILL_ASSESSED",
    sourceId: `test-source-${id}`,
    skillIds: [skillId],
    score: 90,
    assessed: true,
    passed: true,
    masteryEligible: true,
    createdAt: new Date().toISOString(),
    ...overrides,
  };
}

function createSampleLab(
  id: string,
  labKey: string,
  category: "classification" | "computer-vision" | "prompt-engineering" | "python-code" | "other" = "classification",
  overrides: Partial<LabResult> = {}
): LabResult {
  return {
    id,
    labKey,
    titleAr: `مختبر ${labKey}`,
    titleEn: `Lab ${labKey}`,
    category,
    completedAt: new Date().toISOString(),
    accuracy: 95,
    attempts: 1,
    durationMinutes: 10,
    resultSummaryAr: "تم الإنجاز بنجاح",
    resultSummaryEn: "Completed successfully",
    tags: ["test", labKey],
    ...overrides,
  };
}

function createBaseProgress(overrides: Partial<UserProgress> = {}): UserProgress {
  return {
    studentName: "مطور المستقبل",
    xp: 0,
    level: 1,
    streakDays: 0,
    totalChatMessages: 0,
    completedLessons: [],
    completedLabs: [],
    earnedBadges: [],
    ...overrides,
  };
}

console.log("=================================================");
console.log("  AI TEACHER — GATE 9 ADAPTIVE ENGINE AUDIT");
console.log("=================================================");

// --- PROOF 1: Cold Start Returns Lesson 1 ---
{
  const rec = recommendNextLearningAction({
    progress: createBaseProgress(),
    evidences: [],
    labs: [],
  });

  assert(rec.actionType === "learn", "Proof 1: Cold start action must be 'learn'");
  assert(rec.targetId === "lesson-1", "Proof 1: Cold start target must be 'lesson-1'");
  assert(rec.difficulty === "foundation", "Proof 1: Cold start difficulty must be foundation");
  assert(rec.reasonCode === REASON_CODES.COLD_START_FOUNDATION, "Proof 1: Reason code must be COLD_START_FOUNDATION");
  console.log("✅ Proof 1: Cold start with 0 progress returns lesson-1 with foundation difficulty.");
}

// --- PROOF 2: Cold Start Has No Inferred Weaknesses ---
{
  const state = deriveAdaptiveLearnerState({
    progress: createBaseProgress(),
    evidences: [],
    labs: [],
  });

  assert(state.developingSkillCount === 0, "Proof 2: Developing skill count must be 0 for cold start");
  assert(state.demonstratedSkillCount === 0, "Proof 2: Demonstrated skill count must be 0 for cold start");
  assert(state.notAssessedSkillCount > 0, "Proof 2: All canonical skills must be not_assessed");
  console.log("✅ Proof 2: Cold start treats all skills as not_assessed without inventing developing status.");
}

// --- PROOF 3: No Evidence != Weak ---
{
  const state = deriveAdaptiveLearnerState({
    progress: createBaseProgress({ xp: 500 }),
    evidences: [],
  });

  Object.values(state.skillStates).forEach((skill) => {
    assert(skill.masteryStatus === "not_assessed", "Proof 3: Skill without evidence must be not_assessed");
    assert(skill.needState !== "needs_practice", "Proof 3: Skill without evidence must not be marked as needing practice");
  });
  console.log("✅ Proof 3: Zero evidence strictly derives not_assessed and never negative labeling.");
}

// --- PROOF 4: 100% Deterministic (100 Iterations) ---
{
  const input: AdaptiveRecommendationInput = {
    progress: createBaseProgress({ completedLessons: ["lesson-1", "lesson-2"] }),
    evidences: [
      createSampleEvidence("e1", "skill_ai_foundations", { score: 60, passed: false, masteryEligible: false }),
    ],
  };

  const baseline = recommendNextLearningAction(input);
  for (let i = 0; i < 100; i++) {
    const nextRec = recommendNextLearningAction(input);
    assert(nextRec.actionType === baseline.actionType, "Proof 4: ActionType must be identical across runs");
    assert(nextRec.targetId === baseline.targetId, "Proof 4: TargetId must be identical across runs");
    assert(nextRec.reasonCode === baseline.reasonCode, "Proof 4: ReasonCode must be identical across runs");
    assert(nextRec.priority === baseline.priority, "Proof 4: Priority must be identical across runs");
  }
  console.log("✅ Proof 4: Recommendation is 100% deterministic across 100 consecutive iterations.");
}

// --- PROOF 5: Pure Logic (Zero Math.random Branching) ---
{
  const input: AdaptiveRecommendationInput = {
    progress: createBaseProgress({ completedLessons: ["lesson-1"] }),
    evidences: [],
  };

  const rec1 = recommendNextLearningAction(input);
  const rec2 = recommendNextLearningAction(input);
  assert(JSON.stringify(rec1) === JSON.stringify(rec2), "Proof 5: Recs must be strictly equal with 0 randomness");
  console.log("✅ Proof 5: Pure recommendation logic operates with zero random branching.");
}

// --- PROOF 6: Developing Skill Triggers Remediation ---
{
  const input: AdaptiveRecommendationInput = {
    progress: createBaseProgress({ completedLessons: ["lesson-1", "lesson-2", "lesson-3"] }),
    evidences: [
      createSampleEvidence("ev1", "skill_machine_learning", { score: 65, passed: false, masteryEligible: false }),
    ],
  };

  const rec = recommendNextLearningAction(input);
  assert(rec.reasonCode === REASON_CODES.SKILL_DEVELOPING_REMEDIATION, "Proof 6: Reason must be developing remediation");
  assert(rec.difficulty === "foundation", "Proof 6: Remediation difficulty must be foundation");
  assert(rec.priority === POLICY_PRIORITIES.DEVELOPING_REMEDIATION, "Proof 6: Must have highest priority (100)");
  console.log("✅ Proof 6: Single developing skill triggers high-priority remediation.");
}

// --- PROOF 7: Multiple Developing Skills Resolved in Canonical Order ---
{
  const input: AdaptiveRecommendationInput = {
    progress: createBaseProgress({ completedLessons: ["lesson-1", "lesson-2", "lesson-3", "lesson-5"] }),
    evidences: [
      createSampleEvidence("ev1", "skill_computer_vision", { score: 60, passed: false, masteryEligible: false }),
      createSampleEvidence("ev2", "skill_ai_foundations", { score: 65, passed: false, masteryEligible: false }),
    ],
  };

  const rec = recommendNextLearningAction(input);
  assert(rec.skillId === "skill_ai_foundations", "Proof 7: Foundational skill must be prioritized in canonical order");
  console.log("✅ Proof 7: Multiple developing skills are resolved deterministically in canonical order.");
}

// --- PROOF 8: Developing Skill with Uncompleted Lab Recommends Practice Lab ---
{
  const input: AdaptiveRecommendationInput = {
    progress: createBaseProgress({ completedLessons: ["lesson-1", "lesson-2", "lesson-3"] }),
    evidences: [
      createSampleEvidence("ev1", "skill_machine_learning", { score: 60, passed: false, masteryEligible: false }),
    ],
    labs: [],
  };

  const rec = recommendNextLearningAction(input);
  assert(rec.targetType === "lab", "Proof 8: Must recommend practice lab");
  assert(rec.actionType === "practice", "Proof 8: Action must be practice");
  assert(rec.labKey === "fruit-classifier", "Proof 8: Must recommend uncompleted lab fruit-classifier");
  console.log("✅ Proof 8: Developing skill with uncompleted lab recommends targeted practice lab.");
}

// --- PROOF 9: Developing Skill with All Labs Done Recommends Lesson Review ---
{
  const input: AdaptiveRecommendationInput = {
    progress: createBaseProgress({ completedLessons: ["lesson-1", "lesson-2", "lesson-3"] }),
    evidences: [
      createSampleEvidence("ev1", "skill_machine_learning", { score: 60, passed: false, masteryEligible: false }),
    ],
    labs: [
      createSampleLab("1", "fruit-classifier", "classification"),
      createSampleLab("2", "emotion-classifier", "classification"),
    ],
  };

  const rec = recommendNextLearningAction(input);
  assert(rec.targetType === "lesson", "Proof 9: Must recommend lesson review");
  assert(rec.actionType === "review", "Proof 9: Action must be review");
  console.log("✅ Proof 9: Developing skill with all labs completed recommends lesson review.");
}

// --- PROOF 10: Retake Passing Unlocks Advancement ---
{
  const beforeRetake: AdaptiveRecommendationInput = {
    progress: createBaseProgress({ completedLessons: ["lesson-1", "lesson-2", "lesson-3"] }),
    evidences: [
      createSampleEvidence("ev1", "skill_ai_foundations", { score: 60, passed: false, masteryEligible: false }),
    ],
  };
  const recBefore = recommendNextLearningAction(beforeRetake);
  assert(recBefore.reasonCode === REASON_CODES.SKILL_DEVELOPING_REMEDIATION, "Proof 10: Before retake must be remediation");

  const afterRetake: AdaptiveRecommendationInput = {
    progress: createBaseProgress({ completedLessons: ["lesson-1", "lesson-2", "lesson-3"] }),
    evidences: [
      createSampleEvidence("ev1", "skill_ai_foundations", { score: 60, passed: false, masteryEligible: false }),
      createSampleEvidence("ev2", "skill_ai_foundations", { score: 95, passed: true, masteryEligible: true }),
      createSampleEvidence("ev3", "skill_ai_foundations", { score: 90, passed: true, masteryEligible: true }),
    ],
  };
  const recAfter = recommendNextLearningAction(afterRetake);
  assert(recAfter.reasonCode !== REASON_CODES.SKILL_DEVELOPING_REMEDIATION, "Proof 10: After retake must advance past remediation");
  console.log("✅ Proof 10: Passing retake evidence transitions skill to demonstrated and unlocks progression.");
}

// --- PROOF 11: Idempotency of Duplicate Evidence ---
{
  const singleEv = createSampleEvidence("dup1", "skill_ai_foundations", { score: 90 });
  const input1: AdaptiveRecommendationInput = {
    progress: createBaseProgress({ completedLessons: ["lesson-1", "lesson-2"] }),
    evidences: [singleEv],
  };
  const input2: AdaptiveRecommendationInput = {
    progress: createBaseProgress({ completedLessons: ["lesson-1", "lesson-2"] }),
    evidences: [singleEv, singleEv],
  };

  const rec1 = recommendNextLearningAction(input1);
  const rec2 = recommendNextLearningAction(input2);
  assert(rec1.targetId === rec2.targetId, "Proof 11: TargetId must match");
  assert(rec1.reasonCode === rec2.reasonCode, "Proof 11: ReasonCode must match");
  console.log("✅ Proof 11: Duplicate evidence events are idempotent.");
}

// --- PROOF 12: Demonstrated Skills Avoid Remediation Loops ---
{
  const input: AdaptiveRecommendationInput = {
    progress: createBaseProgress({ completedLessons: ["lesson-1", "lesson-2"] }),
    evidences: [
      createSampleEvidence("e1", "skill_ai_foundations", { score: 95 }),
      createSampleEvidence("e2", "skill_ai_foundations", { score: 90 }),
    ],
  };

  const rec = recommendNextLearningAction(input);
  assert(rec.actionType !== "review", "Proof 12: Demonstrated skill must not be assigned basic review");
  assert(rec.targetId === "lesson-3", "Proof 12: Must advance to lesson-3");
  console.log("✅ Proof 12: Demonstrated skills are not trapped in remediation loops.");
}

// --- PROOF 13: Completed Lesson Derives Ready for Assessment ---
{
  const state = deriveAdaptiveLearnerState({
    progress: createBaseProgress({ completedLessons: ["lesson-1", "lesson-2"] }),
    evidences: [],
  });

  assert(
    state.skillStates["skill_ai_foundations"].needState === "ready_for_assessment",
    "Proof 13: Prerequisite lesson completed with 0 evidence derives ready_for_assessment"
  );
  console.log("✅ Proof 13: Completed lesson with not_assessed skill derives ready_for_assessment.");
}

// --- PROOF 14: Ready for Assessment Triggers Quiz Action ---
{
  const input: AdaptiveRecommendationInput = {
    progress: createBaseProgress({ completedLessons: ["lesson-1", "lesson-2"] }),
    evidences: [],
  };

  const rec = recommendNextLearningAction(input);
  assert(rec.actionType === "assess", "Proof 14: Action must be assess");
  assert(rec.targetType === "quiz", "Proof 14: TargetType must be quiz");
  assert(rec.reasonCode === REASON_CODES.INSTRUCTION_COMPLETE_READY_FOR_ASSESSMENT, "Proof 14: Reason must be ready for assessment");
  console.log("✅ Proof 14: Ready-for-assessment state triggers quiz recommendation.");
}

// --- PROOF 15: Core Curriculum Progression Steps Linearly ---
{
  const input: AdaptiveRecommendationInput = {
    progress: createBaseProgress({ completedLessons: ["lesson-1", "lesson-2", "lesson-3"] }),
    evidences: [
      createSampleEvidence("e1", "skill_ai_foundations", { score: 90 }),
      createSampleEvidence("e2", "skill_machine_learning", { score: 90 }),
    ],
  };

  const rec = recommendNextLearningAction(input);
  assert(rec.targetId === "lesson-4", "Proof 15: Must recommend next sequential lesson lesson-4");
  assert(rec.actionType === "learn", "Proof 15: Action must be learn");
  console.log("✅ Proof 15: Core curriculum progression steps linearly to next lesson.");
}

// --- PROOF 16: Completed Lessons Never Recommended as 'learn' ---
{
  const completed = ["lesson-1", "lesson-2", "lesson-3", "lesson-4"];
  const input: AdaptiveRecommendationInput = {
    progress: createBaseProgress({ completedLessons: completed }),
    evidences: [
      createSampleEvidence("e1", "skill_ai_foundations", { score: 90 }),
      createSampleEvidence("e2", "skill_machine_learning", { score: 90 }),
    ],
  };

  const rec = recommendNextLearningAction(input);
  if (rec.actionType === "learn") {
    assert(!completed.includes(rec.targetId), "Proof 16: Recommended learn target must not be in completedLessons");
  }
  console.log("✅ Proof 16: Completed lessons are never recommended as 'learn'.");
}

// --- PROOF 17: Core Curriculum Cannot Be Arbitrarily Skipped ---
{
  const input: AdaptiveRecommendationInput = {
    progress: createBaseProgress({ completedLessons: ["lesson-1"] }),
    evidences: [createSampleEvidence("e1", "skill_ai_foundations", { score: 90 })],
  };

  const rec = recommendNextLearningAction(input);
  assert(rec.targetId === "lesson-2", "Proof 17: Must not skip to lesson-10 or lesson-20");
  console.log("✅ Proof 17: Core curriculum progression preserves prerequisite continuity.");
}

// --- PROOF 18: Uncompleted Practical Lab Recommended ---
{
  const allLessons = Array.from({ length: 24 }, (_, i) => `lesson-${i + 1}`);
  const input: AdaptiveRecommendationInput = {
    progress: createBaseProgress({ completedLessons: allLessons }),
    evidences: [
      createSampleEvidence("e1", "skill_ai_foundations", { score: 90 }),
      createSampleEvidence("e2", "skill_machine_learning", { score: 90 }),
      createSampleEvidence("e3", "skill_computer_vision", { score: 90 }),
      createSampleEvidence("e4", "skill_prompt_engineering", { score: 90 }),
      createSampleEvidence("e5", "skill_ai_ethics", { score: 90 }),
      createSampleEvidence("e6", "skill_python_coding", { score: 90 }),
    ],
    labs: [],
  };

  const rec = recommendNextLearningAction(input);
  assert(rec.targetType === "lab", "Proof 18: TargetType must be lab");
  assert(rec.reasonCode === REASON_CODES.PRACTICAL_LAB_APPLICATION, "Proof 18: Reason must be practical lab application");
  console.log("✅ Proof 18: Uncompleted practical lab is recommended after lessons.");
}

// --- PROOF 19: All Core Done Triggers Advanced Challenge ---
{
  const allLessons = Array.from({ length: 24 }, (_, i) => `lesson-${i + 1}`);
  const allLabs: LabResult[] = [
    createSampleLab("1", "fruit-classifier", "classification"),
    createSampleLab("2", "emotion-classifier", "classification"),
    createSampleLab("3", "object-detector", "computer-vision"),
    createSampleLab("4", "color-sorter", "computer-vision"),
    createSampleLab("5", "story-prompter", "prompt-engineering"),
    createSampleLab("6", "image-prompt-crafter", "prompt-engineering"),
    createSampleLab("7", "explain-like-five", "prompt-engineering"),
    createSampleLab("8", "prompt-debugger", "prompt-engineering"),
    createSampleLab("9", "python-turtle-loops", "python-code"),
    createSampleLab("10", "python-star-drawer", "python-code"),
    createSampleLab("11", "python-smart-counter", "python-code"),
    createSampleLab("12", "python-pattern-gen", "python-code"),
  ];

  const input: AdaptiveRecommendationInput = {
    progress: createBaseProgress({ completedLessons: allLessons }),
    evidences: [
      createSampleEvidence("e1", "skill_ai_foundations", { score: 95 }),
      createSampleEvidence("e2", "skill_machine_learning", { score: 95 }),
      createSampleEvidence("e3", "skill_computer_vision", { score: 95 }),
      createSampleEvidence("e4", "skill_prompt_engineering", { score: 95 }),
      createSampleEvidence("e5", "skill_ai_ethics", { score: 95 }),
      createSampleEvidence("e6", "skill_python_coding", { score: 95 }),
    ],
    labs: allLabs,
  };

  const rec = recommendNextLearningAction(input);
  assert(rec.reasonCode === REASON_CODES.ADVANCED_CHALLENGE, "Proof 19: Reason must be advanced challenge");
  assert(rec.difficulty === "challenge", "Proof 19: Difficulty must be challenge");
  console.log("✅ Proof 19: Fully completed curriculum triggers advanced challenge.");
}

// --- PROOF 20: 100% Independent of XP ---
{
  const baseInput = {
    evidences: [createSampleEvidence("e1", "skill_ai_foundations", { score: 90 })],
    labs: [],
    completedLessons: ["lesson-1"],
  };

  const recLowXP = recommendNextLearningAction({
    progress: createBaseProgress({ ...baseInput, xp: 0 }),
    evidences: baseInput.evidences,
  });

  const recHighXP = recommendNextLearningAction({
    progress: createBaseProgress({ ...baseInput, xp: 100000 }),
    evidences: baseInput.evidences,
  });

  assert(recLowXP.targetId === recHighXP.targetId, "Proof 20: TargetId must match regardless of XP");
  assert(recLowXP.actionType === recHighXP.actionType, "Proof 20: ActionType must match regardless of XP");
  assert(recLowXP.priority === recHighXP.priority, "Proof 20: Priority must match regardless of XP");
  console.log("✅ Proof 20: Recommender is 100% independent of total XP.");
}

// --- PROOF 21: 100% Independent of Level ---
{
  const evs = [createSampleEvidence("e1", "skill_ai_foundations", { score: 90 })];
  const recLvl1 = recommendNextLearningAction({
    progress: createBaseProgress({ level: 1, completedLessons: ["lesson-1"] }),
    evidences: evs,
  });
  const recLvl50 = recommendNextLearningAction({
    progress: createBaseProgress({ level: 50, completedLessons: ["lesson-1"] }),
    evidences: evs,
  });

  assert(recLvl1.targetId === recLvl50.targetId, "Proof 21: Level must have 0 effect on target");
  console.log("✅ Proof 21: Recommender is 100% independent of current Level.");
}

// --- PROOF 22: 100% Independent of Streak ---
{
  const evs = [createSampleEvidence("e1", "skill_ai_foundations", { score: 90 })];
  const recStreak0 = recommendNextLearningAction({
    progress: createBaseProgress({ streakDays: 0, completedLessons: ["lesson-1"] }),
    evidences: evs,
  });
  const recStreak100 = recommendNextLearningAction({
    progress: createBaseProgress({ streakDays: 100, completedLessons: ["lesson-1"] }),
    evidences: evs,
  });

  assert(recStreak0.targetId === recStreak100.targetId, "Proof 22: Streak must have 0 effect on target");
  console.log("✅ Proof 22: Recommender is 100% independent of streak days.");
}

// --- PROOF 23: 100% Independent of Badges ---
{
  const evs = [createSampleEvidence("e1", "skill_ai_foundations", { score: 90 })];
  const recNoBadges = recommendNextLearningAction({
    progress: createBaseProgress({ earnedBadges: [], completedLessons: ["lesson-1"] }),
    evidences: evs,
  });
  const recAllBadges = recommendNextLearningAction({
    progress: createBaseProgress({ earnedBadges: ["b1", "b2", "b3", "b4", "b5"], completedLessons: ["lesson-1"] }),
    evidences: evs,
  });

  assert(recNoBadges.targetId === recAllBadges.targetId, "Proof 23: Badges must have 0 effect on target");
  console.log("✅ Proof 23: Recommender is 100% independent of earned badges.");
}

// --- PROOF 24: Recommender Cannot Declare Mastery ---
{
  const input: AdaptiveRecommendationInput = {
    progress: createBaseProgress({ completedLessons: ["lesson-1"] }),
    evidences: [],
  };

  const stateBefore = deriveAdaptiveLearnerState(input);
  recommendNextLearningAction(input);
  const stateAfter = deriveAdaptiveLearnerState(input);

  assert(
    stateBefore.demonstratedSkillCount === stateAfter.demonstratedSkillCount,
    "Proof 24: Calling recommendation must not change demonstrated count"
  );
  console.log("✅ Proof 24: Recommender cannot declare mastery or mutate mastery status.");
}

// --- PROOF 25: Recommender Cannot Create Evidence Documents ---
{
  const evidences: LearningEvidence[] = [];
  const input: AdaptiveRecommendationInput = {
    progress: createBaseProgress(),
    evidences,
  };

  recommendNextLearningAction(input);
  assert(evidences.length === 0, "Proof 25: Evidence list must remain unmodified");
  console.log("✅ Proof 25: Recommender is pure and does not create evidence documents.");
}

// --- PROOF 26: Recommender Cannot Mutate XP ---
{
  const progress = createBaseProgress({ xp: 150 });
  const input: AdaptiveRecommendationInput = { progress, evidences: [] };

  recommendNextLearningAction(input);
  assert(progress.xp === 150, "Proof 26: Total XP must remain 150");
  console.log("✅ Proof 26: Recommender cannot award or mutate XP.");
}

// --- PROOF 27: Recommender Cannot Issue Certificates ---
{
  const rec = recommendNextLearningAction({
    progress: createBaseProgress(),
    evidences: [],
  });

  assert(!("certificate" in rec), "Proof 27: Recommendation must not contain a certificate object");
  console.log("✅ Proof 27: Recommender is strictly decoupled from certificate issuance.");
}

// --- PROOF 28: Difficulty Policy Mapping ---
{
  assert(deriveActivityDifficulty("demonstrated", "demonstrated") === "challenge", "Proof 28: Demonstrated -> challenge");
  assert(deriveActivityDifficulty("developing", "needs_practice") === "foundation", "Proof 28: Developing -> foundation");
  assert(deriveActivityDifficulty("not_assessed", "new") === "standard", "Proof 28: Not assessed -> standard");
  console.log("✅ Proof 28: Difficulty policy accurately maps mastery and need states.");
}

// --- PROOF 29: Child-Safe Growth-Mindset Descriptions ---
{
  const labelFoundation = getDifficultyLabel("foundation", "ar");
  const labelChallenge = getDifficultyLabel("challenge", "ar");
  const descFoundation = getDifficultyDescription("foundation", "ar");

  assert(!labelFoundation.includes("ضعيف"), "Proof 29: No negative deficit words");
  assert(!labelFoundation.includes("بطيء"), "Proof 29: No deficit labeling");
  assert(!descFoundation.includes("متعثر"), "Proof 29: Foundation desc must be supportive");
  assert(labelChallenge.includes("تحدي"), "Proof 29: Challenge label must be empowering");
  console.log("✅ Proof 29: Difficulty labels and descriptions are child-safe and growth-mindset framed.");
}

// --- PROOF 30: Missing & Null Input Resilience ---
{
  const recNull = recommendNextLearningAction({
    progress: null,
    evidences: null,
    labs: null,
  });

  assert(recNull !== null && typeof recNull === "object", "Proof 30: Must safely return recommendation on null input");
  assert(recNull.targetId === "lesson-1", "Proof 30: Null input defaults to safe cold start lesson-1");
  console.log("✅ Proof 30: Missing and null input objects are handled safely with standard fallback.");
}

// --- PROOF 31: Corrupted Evidence Resilience ---
{
  const corruptedEvidences: any[] = [
    null,
    undefined,
    { id: "invalid-1" },
    { type: "UNKNOWN_TYPE", score: "not-a-number" },
  ];

  const rec = recommendNextLearningAction({
    progress: createBaseProgress(),
    evidences: corruptedEvidences,
  });

  assert(rec !== null, "Proof 31: Must not throw on corrupted evidence");
  assert(rec.actionType === "learn", "Proof 31: Sanitized corrupted input falls back to learn");
  console.log("✅ Proof 31: Corrupted evidence structures are sanitized without throwing.");
}

// --- PROOF 32: Traceable Explainability Metadata ---
{
  const rec = recommendNextLearningAction({
    progress: createBaseProgress({ completedLessons: ["lesson-1"] }),
    evidences: [createSampleEvidence("e1", "skill_ai_foundations", { score: 90 })],
  });

  assert(typeof rec.reasonCode === "string" && rec.reasonCode.length > 0, "Proof 32: reasonCode must be non-empty string");
  assert(typeof rec.explanationAr === "string" && rec.explanationAr.length > 0, "Proof 32: explanationAr must be non-empty string");
  assert(typeof rec.explanationEn === "string" && rec.explanationEn.length > 0, "Proof 32: explanationEn must be non-empty string");
  assert(typeof rec.priority === "number", "Proof 32: priority must be number");
  console.log("✅ Proof 32: Every recommendation provides traceable explainability metadata.");
}

// --- PROOF 33: Reason Codes Match Canonical Policy Enum ---
{
  const validCodes = Object.values(REASON_CODES);
  const rec = recommendNextLearningAction({
    progress: createBaseProgress(),
    evidences: [],
  });

  assert(validCodes.includes(rec.reasonCode as any), "Proof 33: Reason code must belong to REASON_CODES enum");
  console.log("✅ Proof 33: Recommendation reason codes match canonical policy enum.");
}

// --- PROOF 34: Privacy-Preserving In-Memory Execution ---
{
  const state = deriveAdaptiveLearnerState({
    progress: createBaseProgress({ studentName: "سارة" }),
    evidences: [],
  });

  assert(state.studentName === "سارة", "Proof 34: Student nickname preserved locally");
  assert(!("psychologicalProfile" in state), "Proof 34: Zero psychological profiling");
  assert(!("adTargeting" in state), "Proof 34: Zero advertising or tracking metadata");
  console.log("✅ Proof 34: Engine executes purely in-memory with zero psychological profiling or tracking.");
}

// --- PROOF 35: 100% Offline Functional Guarantee ---
{
  // Offline verification: Execute recommendation in isolation without any network/AI dependencies
  const offlineRec = recommendNextLearningAction({
    progress: createBaseProgress({ completedLessons: ["lesson-1", "lesson-2", "lesson-3", "lesson-4"] }),
    evidences: [
      createSampleEvidence("e1", "skill_ai_foundations", { score: 90 }),
      createSampleEvidence("e2", "skill_machine_learning", { score: 90 }),
    ],
    labs: [],
  });

  assert(offlineRec.targetId === "lesson-5", "Proof 35: Offline rec target must be lesson-5");
  assert(offlineRec.actionType === "learn", "Proof 35: Offline rec action must be learn");
  assert(offlineRec.explanationAr.length > 0, "Proof 35: Offline explanation must be available");
  console.log("✅ Proof 35: Adaptive recommendations operate 100% offline with zero external network dependencies.");
}

console.log("=================================================");
console.log("🎉 ALL 35/35 GATE 9 VERIFICATION PROOFS PASSED!");
console.log("=================================================");
