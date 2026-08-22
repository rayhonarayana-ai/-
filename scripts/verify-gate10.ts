/**
 * AI TEACHER — GATE 10 VERIFICATION SUITE
 * Assessment Quality, Coverage & Competency Mapping
 *
 * Requirements:
 * - At least 35 deterministic proofs covering competency mapping, assessment quality,
 *   evidence authority, scoring integrity, provenance, and anti-inflation invariants.
 */

import {
  CANONICAL_COMPETENCY_REGISTRY,
  getCompetencyForSkill,
  getSkillsTaughtByLesson,
  getSkillsPracticedByLab,
  getSkillForAssessmentTopic,
  isCanonicalSkill,
  validateCompetencyMappingIntegrity,
} from "../src/domain/assessment/competencyMap";

import {
  QUESTION_QUALITY_RULES,
  ASSESSMENT_AUTHORITY_POLICY,
  isMasteryEligibleEvidenceType,
  isAssessedEvidenceSource,
} from "../src/domain/assessment/policy";

import {
  validateQuestionStructure,
  validateQuizStructure,
  evaluateQuizScore,
  evaluateEvidenceAuthority,
  validateEvidenceProvenance,
  isDuplicateEvidence,
} from "../src/domain/assessment/evaluator";

import {
  CANONICAL_SKILLS,
  deriveMasteryStatus,
  recordLearningEvidence,
  loadLearningEvidences,
} from "../src/utils/learningEvidence";
import { learningEvidenceStore } from "../src/persistence";

import { validateQuizOutput } from "../server/ai/validation";

let passedCount = 0;
let failedCount = 0;

function assert(condition: boolean, testName: string, details?: string) {
  if (condition) {
    passedCount++;
    console.log(`  ✅ [PASS] ${testName}`);
  } else {
    failedCount++;
    console.error(`  ❌ [FAIL] ${testName}${details ? ` -> ${details}` : ""}`);
  }
}

console.log("\n=======================================================");
console.log("AI TEACHER — GATE 10: ASSESSMENT INTEGRITY & COMPETENCY MAP AUDIT");
console.log("=======================================================\n");

// -------------------------------------------------------------
// SECTION 1: CANONICAL COMPETENCY MAP & TAXONOMY INTEGRITY (Tests 1–7)
// -------------------------------------------------------------
console.log("--- SECTION 1: Canonical Competency Map & Taxonomy Integrity ---");

const mappingReport = validateCompetencyMappingIntegrity();
assert(
  mappingReport.isValid && mappingReport.errors.length === 0,
  "Proof 1: validateCompetencyMappingIntegrity confirms 100% relational integrity without errors",
  mappingReport.errors.join(", ")
);

const canonicalKeys = Object.keys(CANONICAL_SKILLS);
const registeredKeys = Object.keys(CANONICAL_COMPETENCY_REGISTRY);
assert(
  canonicalKeys.length === 6 && registeredKeys.length === 6 && canonicalKeys.every((k) => registeredKeys.includes(k)),
  "Proof 2: 1:1 bijective alignment between CANONICAL_SKILLS (6) and CANONICAL_COMPETENCY_REGISTRY (6)"
);

let allSkillsHaveLessons = true;
for (const skillId of canonicalKeys) {
  const comp = getCompetencyForSkill(skillId);
  if (!comp || comp.taughtLessons.length === 0) {
    allSkillsHaveLessons = false;
    break;
  }
}
assert(allSkillsHaveLessons, "Proof 3: Every canonical skill has at least 1 mapped taught lesson");

let allSkillsHaveLabs = true;
for (const skillId of canonicalKeys) {
  const comp = getCompetencyForSkill(skillId);
  if (!comp || comp.practicedLabs.length === 0) {
    allSkillsHaveLabs = false;
    break;
  }
}
assert(allSkillsHaveLabs, "Proof 4: Every canonical skill has at least 1 mapped practice lab experience");

let allSkillsHaveAssessments = true;
for (const skillId of canonicalKeys) {
  const comp = getCompetencyForSkill(skillId);
  if (!comp || comp.assessedSources.length === 0 || comp.assessmentTopics.length === 0) {
    allSkillsHaveAssessments = false;
    break;
  }
}
assert(allSkillsHaveAssessments, "Proof 5: Every canonical skill has explicit assessment sources and topic aliases");

const lesson1Skills = getSkillsTaughtByLesson("lesson-1");
const labTrainSkills = getSkillsPracticedByLab("train-classifier");
assert(
  lesson1Skills.includes("skill_ai_foundations") && labTrainSkills.includes("skill_machine_learning"),
  "Proof 6: Reverse lookup functions (getSkillsTaughtByLesson, getSkillsPracticedByLab) resolve correctly"
);

assert(
  isCanonicalSkill("skill_python_coding") === true && isCanonicalSkill("fake_unregistered_skill") === false,
  "Proof 7: isCanonicalSkill strictly validates against the canonical taxonomy"
);

// -------------------------------------------------------------
// SECTION 2: TOPIC MAPPING & HEURISTIC RESOLUTION (Tests 8–12)
// -------------------------------------------------------------
console.log("\n--- SECTION 2: Assessment Topic Mapping & Heuristics ---");

assert(
  getSkillForAssessmentTopic("أساسيات الذكاء الاصطناعي") === "skill_ai_foundations",
  "Proof 8: Resolves 'أساسيات الذكاء الاصطناعي' to skill_ai_foundations"
);

assert(
  getSkillForAssessmentTopic("رؤية الكمبيوتر ومعالجة الصور") === "skill_computer_vision",
  "Proof 9: Resolves Computer Vision topic to skill_computer_vision"
);

assert(
  getSkillForAssessmentTopic("هندسة وصياغة الأوامر الذكية") === "skill_prompt_engineering",
  "Proof 10: Resolves Prompt Engineering topic to skill_prompt_engineering"
);

assert(
  getSkillForAssessmentTopic("البرمجة بلغة بايثون والتكرار") === "skill_python_coding",
  "Proof 11: Resolves Python coding topic to skill_python_coding"
);

assert(
  getSkillForAssessmentTopic("أخلاقيات الذكاء الاصطناعي والأمان الرقمي") === "skill_ai_ethics",
  "Proof 12: Resolves AI ethics topic to skill_ai_ethics"
);

// -------------------------------------------------------------
// SECTION 3: QUESTION QUALITY RULES & BOUNDS (Tests 13–18)
// -------------------------------------------------------------
console.log("\n--- SECTION 3: Question Quality Rules & Bounds ---");

const validQuestion = {
  question: "ما هو التعلّم الآلي وتدريب النماذج في الذكاء الاصطناعي؟",
  options: ["برنامج يتعلم من البيانات", "شاشة تلفاز", "ساعة يد", "مصباح ضوئي"],
  correctIndex: 0,
  explanation: "ممتاز! تعلم الآلة هو تدريب النماذج على الأمثلة والبيانات!",
};
const vRes = validateQuestionStructure(validQuestion);
assert(vRes.isValid && vRes.violations.length === 0, "Proof 13: Valid question passes structural quality validation");

const shortQ = { ...validQuestion, question: "قصير؟" };
const shortQRes = validateQuestionStructure(shortQ);
assert(
  !shortQRes.isValid && shortQRes.violations.includes("QUESTION_TOO_SHORT"),
  "Proof 14: Rejects question text that is too short (< 10 chars)"
);

const duplicateOptsQ = {
  ...validQuestion,
  options: ["برنامج يتعلم من البيانات", "برنامج يتعلم من البيانات", "خيار ثالث", "خيار رابع"],
};
const dupRes = validateQuestionStructure(duplicateOptsQ);
assert(
  !dupRes.isValid && dupRes.violations.some((v) => v.includes("DUPLICATE_OPTION")),
  "Proof 15: Rejects question with duplicate options"
);

const badIndexQ = { ...validQuestion, correctIndex: 10 };
const badIndexRes = validateQuestionStructure(badIndexQ);
assert(
  !badIndexRes.isValid && badIndexRes.violations.includes("CORRECT_INDEX_OUT_OF_BOUNDS"),
  "Proof 16: Rejects correctIndex out of bounds"
);

const emptyExpQ = { ...validQuestion, explanation: "" };
const emptyExpRes = validateQuestionStructure(emptyExpQ);
assert(
  !emptyExpRes.isValid && emptyExpRes.violations.includes("EMPTY_EXPLANATION"),
  "Proof 17: Rejects empty or missing question explanation"
);

const singleOptQ = { ...validQuestion, options: ["خيار وحيد فقط"] };
const singleOptRes = validateQuestionStructure(singleOptQ);
assert(
  !singleOptRes.isValid && singleOptRes.violations.includes("TOO_FEW_OPTIONS"),
  "Proof 18: Rejects question with fewer than 2 options"
);

// -------------------------------------------------------------
// SECTION 4: COMPLETE QUIZ VALIDATION & SANITIZATION (Tests 19–23)
// -------------------------------------------------------------
console.log("\n--- SECTION 4: Quiz Validation & Sanitization ---");

const validQuizObj = {
  title: "اختبار الرؤية الحاسوبية",
  topic: "رؤية الكمبيوتر",
  questions: [
    validQuestion,
    {
      question: "كيف يرى الحاسوب الصورة الرقمية في الذاكرة؟",
      options: ["مصفوفة بكسلات وأرقام", "نص كتابي", "صوت مسموع", "شريط مغناطيسي"],
      correctIndex: 0,
      explanation: "أحسنت! الصور الرقمية تتكون من مصفوفات أرقام للبكسلات.",
    },
    {
      question: "ما وظيفة المربع المحيط في كشف الكائنات؟",
      options: ["تحديد مكان الكائن بدقة", "حذف الصورة", "تلوين الشاشة", "إغلاق الحاسوب"],
      correctIndex: 0,
      explanation: "ممتاز! المربع المحيط يحدد موقع الكائن المكتشف داخل الصورة.",
    },
  ],
};

const quizValRes = validateQuizStructure(validQuizObj);
assert(
  quizValRes.isValid && quizValRes.sanitizedQuiz?.questions.length === 3,
  "Proof 19: Full 3-question quiz passes validation with sanitized output"
);

const emptyQuizRes = validateQuizStructure({ title: "اختبار فارغ", questions: [] });
assert(!emptyQuizRes.isValid, "Proof 20: Rejects quiz with 0 questions");

const nullQuizRes = validateQuizStructure(null);
assert(!nullQuizRes.isValid, "Proof 21: Rejects null or non-object quiz input");

const rawAiJson = JSON.stringify(validQuizObj);
const serverValidated = validateQuizOutput(rawAiJson);
assert(
  serverValidated !== null && serverValidated.questions.length === 3,
  "Proof 22: Server-side validateQuizOutput parses and validates raw AI output"
);

const corruptedAiText = "Here is your quiz: { invalid json ...";
const serverCorrupted = validateQuizOutput(corruptedAiText);
assert(
  serverCorrupted === null,
  "Proof 23: Server-side validateQuizOutput rejects corrupted or non-JSON AI strings"
);

// -------------------------------------------------------------
// SECTION 5: SCORING DETERMINISM & BOUNDARIES (Tests 24–28)
// -------------------------------------------------------------
console.log("\n--- SECTION 5: Scoring Determinism & Boundary Protection ---");

const perfectScore = evaluateQuizScore(3, 3, "skill_machine_learning");
assert(
  perfectScore.score === 100 && perfectScore.passed && perfectScore.masteryEligible,
  "Proof 24: 3/3 score yields 100%, passed=true, masteryEligible=true"
);

const failingScore = evaluateQuizScore(1, 3, "skill_machine_learning");
assert(
  failingScore.score === 33 && !failingScore.passed && !failingScore.masteryEligible,
  "Proof 25: 1/3 score yields 33%, passed=false, masteryEligible=false"
);

const nanScore = evaluateQuizScore(NaN as any, 3, "skill_machine_learning");
assert(
  nanScore.score === 0 && !nanScore.passed && !nanScore.masteryEligible && nanScore.error === "INVALID_CORRECT_COUNT",
  "Proof 26: Gracefully handles NaN score input without runtime crash"
);

const divZeroScore = evaluateQuizScore(2, 0, "skill_machine_learning");
assert(
  divZeroScore.score === 0 && !divZeroScore.passed && divZeroScore.error === "INVALID_TOTAL_COUNT",
  "Proof 27: Protected against division by zero"
);

const twoQuestionScore = evaluateQuizScore(2, 2, "skill_machine_learning");
assert(
  twoQuestionScore.score === 100 && twoQuestionScore.passed && !twoQuestionScore.masteryEligible,
  "Proof 28: 2/2 is passed (100%) but NOT mastery-eligible due to min 3 questions rule"
);

// -------------------------------------------------------------
// SECTION 6: EVIDENCE AUTHORITY & POLICY CLASSIFICATION (Tests 29–33)
// -------------------------------------------------------------
console.log("\n--- SECTION 6: Evidence Authority & Policy Classification ---");

const lessonEv = {
  type: "LESSON_COMPLETED",
  sourceId: "lesson-1",
  skillIds: ["skill_ai_foundations"],
  assessed: false,
};
const lessonAuth = evaluateEvidenceAuthority(lessonEv);
assert(
  lessonAuth.authorityClass === "INSTRUCTIONAL_ONLY" && !lessonAuth.isMasteryEligible,
  "Proof 29: LESSON_COMPLETED is classified as INSTRUCTIONAL_ONLY and cannot grant mastery"
);

const practiceLabEv = {
  type: "LAB_COMPLETED",
  sourceId: "prompt-storyteller",
  skillIds: ["skill_prompt_engineering"],
  assessed: false,
};
const labAuth = evaluateEvidenceAuthority(practiceLabEv);
assert(
  labAuth.authorityClass === "PRACTICE_EVIDENCE" && !labAuth.isMasteryEligible,
  "Proof 30: Unassessed practice lab is classified as PRACTICE_EVIDENCE and cannot grant mastery"
);

const assessedQuizEv = {
  type: "QUIZ_ATTEMPTED",
  sourceId: "quiz-skill_machine_learning",
  skillIds: ["skill_machine_learning"],
  score: 100,
  total: 3,
  assessed: true,
  passed: true,
  masteryEligible: true,
};
const quizAuth = evaluateEvidenceAuthority(assessedQuizEv);
assert(
  quizAuth.authorityClass === "GRADUATION_ELIGIBLE_EVIDENCE" && quizAuth.isMasteryEligible,
  "Proof 31: Assessed quiz meeting rubric (>=85%, >=3 items) is GRADUATION_ELIGIBLE_EVIDENCE"
);

assert(
  !isMasteryEligibleEvidenceType("LESSON_COMPLETED") &&
    !isMasteryEligibleEvidenceType("LESSON_VIEWED") &&
    isMasteryEligibleEvidenceType("QUIZ_ATTEMPTED"),
  "Proof 32: isMasteryEligibleEvidenceType strictly restricts mastery to assessed events"
);

assert(
  isAssessedEvidenceSource("quiz-machine-learning") && !isAssessedEvidenceSource("lesson-1"),
  "Proof 33: isAssessedEvidenceSource correctly distinguishes assessment sources"
);

// -------------------------------------------------------------
// SECTION 7: PROVENANCE, PRIVACY & INTEGRATION VERIFICATION (Tests 34–37)
// -------------------------------------------------------------
console.log("\n--- SECTION 7: Provenance, Privacy & Integration Verification ---");

const cleanEvidence = {
  type: "QUIZ_ATTEMPTED",
  sourceId: "quiz-ai-ethics",
  skillIds: ["skill_ai_ethics"],
  score: 100,
  total: 3,
  assessed: true,
  createdAt: new Date().toISOString(),
};
const cleanProv = validateEvidenceProvenance(cleanEvidence);
assert(cleanProv.isValid && cleanProv.errors.length === 0, "Proof 34: Clean evidence record passes provenance checks");

const dirtyEvidence = {
  ...cleanEvidence,
  metadata: {
    studentName: "Child Real Name",
    rawAiPrompt: "Secret system prompt",
  },
};
const dirtyProv = validateEvidenceProvenance(dirtyEvidence);
assert(
  !dirtyProv.isValid && dirtyProv.errors.some((e) => e.includes("FORBIDDEN_PAYLOAD_KEY")),
  "Proof 35: Privacy guard: Rejects evidence containing forbidden PII or prompt keys"
);

// Test idempotency
const existingLogs = [
  {
    type: "QUIZ_ATTEMPTED" as const,
    sourceId: "quiz-ai-foundations",
    skillIds: ["skill_ai_foundations"],
    score: 100,
    total: 3,
    assessed: true,
    passed: true,
    masteryEligible: true,
    idempotencyKey: "quiz-attempt-101",
    createdAt: new Date().toISOString(),
  },
];
assert(
  isDuplicateEvidence(existingLogs, { idempotencyKey: "quiz-attempt-101" }),
  "Proof 36: Idempotency detection prevents duplicate evidence submission"
);

// End-to-end derivation check
const lessonOnlyEvidences = [
  {
    id: "test-ev-1",
    type: "LESSON_COMPLETED" as const,
    sourceId: "lesson-1",
    skillIds: ["skill_ai_foundations"],
    assessed: false,
    createdAt: new Date().toISOString(),
  },
];
const derived = deriveMasteryStatus("skill_ai_foundations", lessonOnlyEvidences);
assert(
  derived === "not_assessed",
  "Proof 37: End-to-end: Completing lessons alone keeps mastery at not_assessed (Activity != Mastery)"
);

console.log("\n=======================================================");
console.log(`GATE 10 VERIFICATION RESULT: ${passedCount} / ${passedCount + failedCount} PASSED`);
console.log("=======================================================\n");

if (failedCount > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
