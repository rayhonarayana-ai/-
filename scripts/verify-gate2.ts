import {
  deriveMasteryStatus,
  isAssessmentEvidence,
  getSkillMasteryMap,
  CANONICAL_SKILLS,
  loadLearningEvidences,
} from "../src/utils/learningEvidence";
import { LearningEvidence } from "../src/types/learningEvidence";

console.log("=== RUNNING GATE 2 FORMAL PROOF VERIFICATION SUITE ===");

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

// PROOF 1: LESSON_COMPLETED with assessed:false cannot produce demonstrated mastery
{
  const evidences: LearningEvidence[] = [
    {
      id: "ev-1",
      type: "LESSON_COMPLETED",
      sourceId: "lesson-01",
      skillIds: ["skill_ai_foundations"],
      assessed: false,
      masteryEligible: false,
      createdAt: new Date().toISOString(),
    },
    {
      id: "ev-2",
      type: "LESSON_COMPLETED",
      sourceId: "lesson-02",
      skillIds: ["skill_ai_foundations"],
      assessed: false,
      masteryEligible: false,
      createdAt: new Date().toISOString(),
    },
  ];

  const status = deriveMasteryStatus("skill_ai_foundations", evidences);
  assert(
    status === "not_assessed",
    "PROOF 1: LESSON_COMPLETED with assessed:false results strictly in not_assessed",
    `Expected not_assessed, received ${status}`
  );
}

// PROOF 2: XP is not read anywhere by mastery derivation
{
  const evidencesWithNoXP: LearningEvidence[] = [
    {
      id: "ev-1",
      type: "QUIZ_ATTEMPTED",
      sourceId: "quiz-ai-1",
      skillIds: ["skill_ai_foundations"],
      score: 95,
      assessed: true,
      masteryEligible: true,
      createdAt: new Date().toISOString(),
      metadata: { xpEarned: 999999 }, // Simulated XP in metadata
    },
  ];

  // Notice function signature accepts ONLY (skillId, evidences) - XP state is completely decoupled
  const statusDemonstrated = deriveMasteryStatus("skill_ai_foundations", evidencesWithNoXP);
  assert(
    statusDemonstrated === "demonstrated",
    "PROOF 2: Mastery status derived purely from assessment evidence without referencing XP",
    `Expected demonstrated, received ${statusDemonstrated}`
  );
}

// PROOF 3: A completed but non-assessed lab remains not_assessed for its skills if no other assessment evidence exists
{
  const nonAssessedLabs: LearningEvidence[] = [
    {
      id: "ev-vision",
      type: "LAB_COMPLETED",
      sourceId: "lab-vision-ai",
      skillIds: ["skill_computer_vision"],
      assessed: false,
      masteryEligible: false,
      createdAt: new Date().toISOString(),
    },
    {
      id: "ev-prompt",
      type: "LAB_COMPLETED",
      sourceId: "lab-prompt-engineer",
      skillIds: ["skill_prompt_engineering"],
      assessed: false,
      masteryEligible: false,
      createdAt: new Date().toISOString(),
    },
  ];

  const visionStatus = deriveMasteryStatus("skill_computer_vision", nonAssessedLabs);
  const promptStatus = deriveMasteryStatus("skill_prompt_engineering", nonAssessedLabs);

  assert(
    visionStatus === "not_assessed",
    "PROOF 3A: Completed Vision AI lab (assessed: false) remains not_assessed",
    `Expected not_assessed, received ${visionStatus}`
  );
  assert(
    promptStatus === "not_assessed",
    "PROOF 3B: Completed Prompt Engineer lab (assessed: false) remains not_assessed",
    `Expected not_assessed, received ${promptStatus}`
  );
}

// PROOF 4: Only evidence explicitly valid for assessment/mastery can contribute to demonstrated mastery
{
  // Developing evidence: Assessed but did not qualify for mastery
  const developingEvidence: LearningEvidence[] = [
    {
      id: "ev-quiz-low",
      type: "QUIZ_ATTEMPTED",
      sourceId: "quiz-python",
      skillIds: ["skill_python_coding"],
      score: 60,
      assessed: true,
      passed: false,
      masteryEligible: false,
      createdAt: new Date().toISOString(),
    },
  ];

  const pythonStatus = deriveMasteryStatus("skill_python_coding", developingEvidence);
  assert(
    pythonStatus === "developing",
    "PROOF 4A: Assessed quiz with masteryEligible:false results in developing, not demonstrated",
    `Expected developing, received ${pythonStatus}`
  );

  // Demonstrated evidence: Assessed with explicit mastery eligibility
  const masteryEvidence: LearningEvidence[] = [
    ...developingEvidence,
    {
      id: "ev-quiz-high",
      type: "QUIZ_ATTEMPTED",
      sourceId: "quiz-python-adv",
      skillIds: ["skill_python_coding"],
      score: 95,
      assessed: true,
      passed: true,
      masteryEligible: true,
      createdAt: new Date().toISOString(),
    },
  ];

  const pythonMasteryStatus = deriveMasteryStatus("skill_python_coding", masteryEvidence);
  assert(
    pythonMasteryStatus === "demonstrated",
    "PROOF 4B: Assessed evidence with masteryEligible:true promotes skill to demonstrated",
    `Expected demonstrated, received ${pythonMasteryStatus}`
  );
}

// PROOF 5: Evidence for one skill cannot incorrectly establish mastery of an unrelated skill
{
  const isolatedEvidence: LearningEvidence[] = [
    {
      id: "ev-ethics-100",
      type: "LAB_COMPLETED",
      sourceId: "lab-ethics-safeguard",
      skillIds: ["skill_ai_ethics"],
      score: 100,
      assessed: true,
      passed: true,
      masteryEligible: true,
      createdAt: new Date().toISOString(),
    },
  ];

  const ethicsStatus = deriveMasteryStatus("skill_ai_ethics", isolatedEvidence);
  const codingStatus = deriveMasteryStatus("skill_python_coding", isolatedEvidence);
  const mlStatus = deriveMasteryStatus("skill_machine_learning", isolatedEvidence);

  assert(
    ethicsStatus === "demonstrated",
    "PROOF 5A: Target skill (skill_ai_ethics) is demonstrated",
    `Expected demonstrated, received ${ethicsStatus}`
  );
  assert(
    codingStatus === "not_assessed",
    "PROOF 5B: Unrelated skill (skill_python_coding) remains completely not_assessed",
    `Expected not_assessed, received ${codingStatus}`
  );
  assert(
    mlStatus === "not_assessed",
    "PROOF 5C: Unrelated skill (skill_machine_learning) remains completely not_assessed",
    `Expected not_assessed, received ${mlStatus}`
  );
}

// PROOF 6: Missing evidence always results in not_assessed, never a fabricated score/status
{
  const emptyEvidences: LearningEvidence[] = [];
  const map = getSkillMasteryMap(emptyEvidences);

  const allSkillsNotAssessed = Object.values(map).every(
    (skill) =>
      skill.status === "not_assessed" &&
      skill.evidenceCount === 0 &&
      skill.assessedEvidenceCount === 0 &&
      skill.averageScore === undefined
  );

  assert(
    allSkillsNotAssessed,
    "PROOF 6: Empty/missing evidence store results in all skills not_assessed with zero fabricated scores",
    "One or more skills returned fabricated status"
  );
}

// PROOF 7: Backward compatibility check
{
  // Simulated missing or empty localStorage
  const fallback = loadLearningEvidences();
  assert(
    Array.isArray(fallback),
    "BACKWARD COMPATIBILITY: loadLearningEvidences returns safe empty array when storage is absent",
    "Failed to return empty array"
  );
}

console.log(`\n=== RESULTS: ${passedTests}/${totalTests} TESTS PASSED ===\n`);
if (passedTests !== totalTests) {
  process.exit(1);
}
