/**
 * Assessment Authority & Quality Policy Rules
 * Gate 10 Architecture: Formal rules distinguishing instruction, practice, and evaluated assessment.
 */

import { AssessmentAuthorityClass } from "./types";

export const ASSESSMENT_AUTHORITY_POLICY: Record<
  string,
  {
    authorityClass: AssessmentAuthorityClass;
    canDeclareMastery: boolean;
    requiresRubric: boolean;
    description: string;
  }
> = {
  LESSON_VIEWED: {
    authorityClass: "INSTRUCTIONAL_ONLY",
    canDeclareMastery: false,
    requiresRubric: false,
    description: "Viewing lesson instructional material.",
  },
  LESSON_COMPLETED: {
    authorityClass: "INSTRUCTIONAL_ONLY",
    canDeclareMastery: false,
    requiresRubric: false,
    description: "Completing all steps in a lesson without formal evaluated assessment.",
  },
  LESSON_INTERACTIVE_WIDGET: {
    authorityClass: "INSTRUCTIONAL_ONLY",
    canDeclareMastery: false,
    requiresRubric: false,
    description: "Formative in-lesson interactive widget exploration.",
  },
  AI_CHAT_TUTOR: {
    authorityClass: "INSTRUCTIONAL_ONLY",
    canDeclareMastery: false,
    requiresRubric: false,
    description: "Conversational Q&A and tutoring with Zaki AI.",
  },
  AI_VISION_EXPLANATION: {
    authorityClass: "INSTRUCTIONAL_ONLY",
    canDeclareMastery: false,
    requiresRubric: false,
    description: "Visual exploration and AI feature extraction explanation.",
  },
  PRACTICE_LAB_CATALOG: {
    authorityClass: "PRACTICE_EVIDENCE",
    canDeclareMastery: false,
    requiresRubric: false,
    description: "Completing an unassessed portfolio practice lab project.",
  },
  CREATIVE_PROMPT_LAB: {
    authorityClass: "PRACTICE_EVIDENCE",
    canDeclareMastery: false,
    requiresRubric: false,
    description: "Creative prompt composition and generation activity.",
  },
  STRUCTURED_QUIZ_ASSESSMENT: {
    authorityClass: "GRADUATION_ELIGIBLE_EVIDENCE",
    canDeclareMastery: true,
    requiresRubric: true,
    description: "Evaluated multi-question multiple-choice assessment against canonical topic.",
  },
  LAB_MODEL_TEST_RUBRIC: {
    authorityClass: "GRADUATION_ELIGIBLE_EVIDENCE",
    canDeclareMastery: true,
    requiresRubric: true,
    description: "Deterministic accuracy testing on unseen generalization test dataset.",
  },
  LAB_ETHICS_DECISION_RUBRIC: {
    authorityClass: "GRADUATION_ELIGIBLE_EVIDENCE",
    canDeclareMastery: true,
    requiresRubric: true,
    description: "Deterministic ethical scenario decision rubric verification.",
  },
};

/**
 * Question Structural Quality Limits
 */
export const QUESTION_QUALITY_RULES = {
  minQuestionChars: 10,
  maxQuestionChars: 300,
  minOptionsCount: 2,
  maxOptionsCount: 4,
  minOptionChars: 1,
  maxOptionChars: 140,
  minExplanationChars: 5,
  maxExplanationChars: 350,
  minQuizQuestions: 1,
  maxQuizQuestions: 10,
  minQuestionsForMastery: 3,
  quizPassAccuracy: 70, // >= 70% to pass
  quizMasteryAccuracy: 85, // >= 85% for demonstrated mastery
  labMasteryAccuracy: 100, // 100% on generalization/decision rubric
};

/**
 * Forbidden fields in evidence payloads to preserve child privacy and security
 */
export const FORBIDDEN_EVIDENCE_PAYLOAD_KEYS = [
  "imageBase64",
  "rawResponse",
  "fullPrompt",
  "systemInstruction",
  "password",
  "token",
  "email",
  "apiKey",
  "chatHistory",
  "studentName",
  "rawAiPrompt",
] as const;

/**
 * Check if a learning event type can ever be eligible for mastery
 */
export function isMasteryEligibleEvidenceType(type: string): boolean {
  if (type === "QUIZ_ATTEMPTED" || type === "LAB_COMPLETED") {
    return true;
  }
  return false;
}

/**
 * Check if a given source ID represents a formal assessment source
 */
export function isAssessedEvidenceSource(sourceId: string): boolean {
  if (!sourceId || typeof sourceId !== "string") return false;
  return (
    sourceId.startsWith("quiz-") ||
    sourceId.startsWith("lab-train-model-rubric") ||
    sourceId.startsWith("lab-ethics-safeguard") ||
    sourceId.startsWith("step-quiz-")
  );
}

