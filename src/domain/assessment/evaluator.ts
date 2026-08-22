/**
 * Assessment Evaluator & Evidence Validator
 * Gate 10 Architecture: Pure, deterministic structural validation, score calculation, and provenance checks.
 */

import {
  AssessmentQuestion,
  QuestionValidationResult,
  QuizValidationResult,
  AssessmentScoringResult,
  EvidenceProvenanceRecord,
  AssessmentAuthorityClass,
} from "./types";
import {
  QUESTION_QUALITY_RULES,
  ASSESSMENT_AUTHORITY_POLICY,
  FORBIDDEN_EVIDENCE_PAYLOAD_KEYS,
} from "./policy";
import { isCanonicalSkill, getSkillForAssessmentTopic } from "./competencyMap";
import { LearningEvidence } from "../../types/learningEvidence";

/**
 * Validate the structural and quality integrity of a single assessment question
 */
export function validateQuestionStructure(q: any): QuestionValidationResult {
  const violations: string[] = [];

  if (!q || typeof q !== "object") {
    return { isValid: false, reason: "Question must be an object", violations: ["INVALID_OBJECT"] };
  }

  // 1. Question text validation
  if (typeof q.question !== "string" || q.question.trim().length === 0) {
    violations.push("EMPTY_QUESTION_TEXT");
  } else {
    const trimmed = q.question.trim();
    if (trimmed.length < QUESTION_QUALITY_RULES.minQuestionChars) {
      violations.push("QUESTION_TOO_SHORT");
    }
    if (trimmed.length > QUESTION_QUALITY_RULES.maxQuestionChars) {
      violations.push("QUESTION_TOO_LONG");
    }
  }

  // 2. Options validation
  if (!Array.isArray(q.options)) {
    violations.push("OPTIONS_NOT_ARRAY");
  } else {
    if (q.options.length < QUESTION_QUALITY_RULES.minOptionsCount) {
      violations.push("TOO_FEW_OPTIONS");
    }
    if (q.options.length > QUESTION_QUALITY_RULES.maxOptionsCount) {
      violations.push("TOO_MANY_OPTIONS");
    }

    const seenOptions = new Set<string>();
    for (let i = 0; i < q.options.length; i++) {
      const opt = q.options[i];
      if (typeof opt !== "string" || opt.trim().length === 0) {
        violations.push(`EMPTY_OPTION_AT_INDEX_${i}`);
      } else {
        const trimmedOpt = opt.trim();
        if (trimmedOpt.length > QUESTION_QUALITY_RULES.maxOptionChars) {
          violations.push(`OPTION_TOO_LONG_AT_INDEX_${i}`);
        }
        const normalized = trimmedOpt.toLowerCase();
        if (seenOptions.has(normalized)) {
          violations.push(`DUPLICATE_OPTION_AT_INDEX_${i}`);
        }
        seenOptions.add(normalized);
      }
    }
  }

  // 3. Correct index validation
  if (typeof q.correctIndex !== "number" || !Number.isInteger(q.correctIndex)) {
    violations.push("INVALID_CORRECT_INDEX_TYPE");
  } else if (Array.isArray(q.options)) {
    if (q.correctIndex < 0 || q.correctIndex >= q.options.length) {
      violations.push("CORRECT_INDEX_OUT_OF_BOUNDS");
    } else {
      const selectedAnswer = q.options[q.correctIndex];
      if (typeof selectedAnswer !== "string" || selectedAnswer.trim().length === 0) {
        violations.push("CORRECT_ANSWER_IS_EMPTY");
      }
    }
  }

  // 4. Explanation validation
  if (typeof q.explanation !== "string" || q.explanation.trim().length === 0) {
    violations.push("EMPTY_EXPLANATION");
  } else {
    const trimmedExp = q.explanation.trim();
    if (trimmedExp.length < QUESTION_QUALITY_RULES.minExplanationChars) {
      violations.push("EXPLANATION_TOO_SHORT");
    }
    if (trimmedExp.length > QUESTION_QUALITY_RULES.maxExplanationChars) {
      violations.push("EXPLANATION_TOO_LONG");
    }
  }

  return {
    isValid: violations.length === 0,
    reason: violations.length > 0 ? violations.join("; ") : undefined,
    violations,
  };
}

/**
 * Validate a complete assessment quiz structure and ensure all questions meet quality policy
 */
export function validateQuizStructure(quiz: any, expectedTopic?: string): QuizValidationResult {
  const violations: string[] = [];

  if (!quiz || typeof quiz !== "object") {
    return { isValid: false, reason: "Quiz must be an object", violations: ["INVALID_QUIZ_OBJECT"] };
  }

  const title = typeof quiz.title === "string" && quiz.title.trim().length > 0
    ? quiz.title.trim().slice(0, 150)
    : "اختبار تقييم المهارات الذكية 🧠⭐";

  if (!Array.isArray(quiz.questions) || quiz.questions.length === 0) {
    violations.push("ZERO_QUESTION_QUIZ");
    return { isValid: false, reason: "Quiz contains no questions", violations };
  }

  if (quiz.questions.length > QUESTION_QUALITY_RULES.maxQuizQuestions) {
    violations.push("TOO_MANY_QUIZ_QUESTIONS");
  }

  const validQuestions: AssessmentQuestion[] = [];

  for (let i = 0; i < quiz.questions.length; i++) {
    const q = quiz.questions[i];
    const qValidation = validateQuestionStructure(q);
    if (!qValidation.isValid) {
      violations.push(`QUESTION_${i}_INVALID: ${qValidation.reason}`);
    } else {
      validQuestions.push({
        question: q.question.trim(),
        options: q.options.map((opt: string) => opt.trim()),
        correctIndex: q.correctIndex,
        explanation: q.explanation.trim(),
      });
    }
  }

  if (validQuestions.length === 0) {
    violations.push("NO_VALID_QUESTIONS_FOUND");
  }

  const topic = expectedTopic || (typeof quiz.topic === "string" ? quiz.topic : "الذكاء الاصطناعي");
  const canonicalSkillId = getSkillForAssessmentTopic(topic);

  const isValid = violations.length === 0 && validQuestions.length > 0;

  return {
    isValid,
    reason: violations.length > 0 ? violations.join("; ") : undefined,
    violations,
    sanitizedQuiz: isValid
      ? {
          title,
          canonicalSkillId,
          topic,
          questions: validQuestions,
          isAiGenerated: Boolean(quiz.isAiGenerated),
          validatedAt: new Date().toISOString(),
        }
      : undefined,
  };
}

/**
 * Pure, deterministic score calculation
 * Prevents NaN, negative numbers, division by zero, overflow, and out-of-bounds scores.
 */
export function evaluateQuizScore(
  correct: number,
  total: number,
  skillId: string
): AssessmentScoringResult {
  if (typeof correct !== "number" || isNaN(correct) || !isFinite(correct) || correct < 0) {
    return {
      score: 0,
      correct: 0,
      total: Math.max(1, typeof total === "number" && !isNaN(total) && isFinite(total) ? Math.floor(total) : 1),
      passed: false,
      masteryEligible: false,
      error: "INVALID_CORRECT_COUNT",
    };
  }

  if (typeof total !== "number" || isNaN(total) || !isFinite(total) || total <= 0) {
    return {
      score: 0,
      correct: 0,
      total: 1,
      passed: false,
      masteryEligible: false,
      error: "INVALID_TOTAL_COUNT",
    };
  }

  const sanitizedTotal = Math.floor(total);
  const sanitizedCorrect = Math.min(sanitizedTotal, Math.floor(correct));

  const scorePct = Math.round((sanitizedCorrect / sanitizedTotal) * 100);
  const boundedScore = Math.max(0, Math.min(100, scorePct));

  const passed = boundedScore >= QUESTION_QUALITY_RULES.quizPassAccuracy;
  const isMastery =
    isCanonicalSkill(skillId) &&
    boundedScore >= QUESTION_QUALITY_RULES.quizMasteryAccuracy &&
    sanitizedTotal >= QUESTION_QUALITY_RULES.minQuestionsForMastery;

  return {
    score: boundedScore,
    correct: sanitizedCorrect,
    total: sanitizedTotal,
    passed,
    masteryEligible: isMastery,
  };
}

/**
 * Classify and evaluate the authority class of a given learning evidence event
 */
export function evaluateEvidenceAuthority(evidence: any): {
  authorityClass: AssessmentAuthorityClass;
  isMasteryEligible: boolean;
  isValid: boolean;
} {
  if (!evidence || typeof evidence !== "object") {
    return {
      authorityClass: "INSTRUCTIONAL_ONLY",
      isMasteryEligible: false,
      isValid: false,
    };
  }

  const evType = evidence.type as string;
  const sourceId = (evidence.sourceId as string) || "";

  // 1. Check policy classification
  if (evType === "LESSON_COMPLETED" || evType === "LESSON_VIEWED") {
    return {
      authorityClass: "INSTRUCTIONAL_ONLY",
      isMasteryEligible: false,
      isValid: true,
    };
  }

  if (evType === "QUIZ_ATTEMPTED") {
    const isAssessed = evidence.assessed === true;
    const score = evidence.score;
    const total = evidence.total || 0;
    const hasCanonicalSkill = Array.isArray(evidence.skillIds) && evidence.skillIds.some(isCanonicalSkill);

    const isMastery =
      isAssessed &&
      hasCanonicalSkill &&
      typeof score === "number" &&
      !isNaN(score) &&
      score >= QUESTION_QUALITY_RULES.quizMasteryAccuracy &&
      total >= QUESTION_QUALITY_RULES.minQuestionsForMastery &&
      evidence.masteryEligible === true;

    return {
      authorityClass: "GRADUATION_ELIGIBLE_EVIDENCE",
      isMasteryEligible: isMastery,
      isValid: isAssessed && hasCanonicalSkill,
    };
  }

  if (evType === "LAB_COMPLETED") {
    // Check if this lab is an assessed rubric lab
    const isAssessed = evidence.assessed === true;
    const hasCanonicalSkill = Array.isArray(evidence.skillIds) && evidence.skillIds.some(isCanonicalSkill);

    if (isAssessed && hasCanonicalSkill && evidence.masteryEligible === true) {
      return {
        authorityClass: "GRADUATION_ELIGIBLE_EVIDENCE",
        isMasteryEligible: true,
        isValid: true,
      };
    }

    return {
      authorityClass: "PRACTICE_EVIDENCE",
      isMasteryEligible: false,
      isValid: true,
    };
  }

  return {
    authorityClass: "INSTRUCTIONAL_ONLY",
    isMasteryEligible: false,
    isValid: true,
  };
}

/**
 * Validate provenance and security bounds on an evidence document
 */
export function validateEvidenceProvenance(evidence: any): EvidenceProvenanceRecord {
  const errors: string[] = [];

  if (!evidence || typeof evidence !== "object") {
    return {
      isValid: false,
      sourceId: "unknown",
      canonicalSkillIds: [],
      timestamp: "",
      authorityClass: "INSTRUCTIONAL_ONLY",
      errors: ["INVALID_EVIDENCE_OBJECT"],
    };
  }

  // 1. Source ID
  const sourceId = typeof evidence.sourceId === "string" ? evidence.sourceId.trim() : "";
  if (!sourceId) {
    errors.push("MISSING_SOURCE_ID");
  }

  // 2. Canonical Skill IDs
  const canonicalSkillIds: string[] = [];
  if (!Array.isArray(evidence.skillIds) || evidence.skillIds.length === 0) {
    errors.push("MISSING_SKILL_IDS");
  } else {
    for (const sid of evidence.skillIds) {
      if (typeof sid === "string" && isCanonicalSkill(sid)) {
        canonicalSkillIds.push(sid);
      } else {
        errors.push(`UNKNOWN_OR_MALFORMED_SKILL_ID: ${sid}`);
      }
    }
  }

  // 3. Timestamp
  const timestamp = typeof evidence.createdAt === "string" ? evidence.createdAt : "";
  if (!timestamp || isNaN(Date.parse(timestamp))) {
    errors.push("INVALID_OR_MISSING_TIMESTAMP");
  }

  // 4. Check for forbidden payload keys (privacy & child safety)
  if (evidence.metadata && typeof evidence.metadata === "object") {
    for (const forbiddenKey of FORBIDDEN_EVIDENCE_PAYLOAD_KEYS) {
      if (forbiddenKey in evidence.metadata || forbiddenKey in evidence) {
        errors.push(`FORBIDDEN_PAYLOAD_KEY_DETECTED: ${forbiddenKey}`);
      }
    }
  }

  const { authorityClass } = evaluateEvidenceAuthority(evidence);

  return {
    isValid: errors.length === 0,
    sourceId,
    canonicalSkillIds,
    timestamp,
    authorityClass,
    errors,
  };
}

/**
 * Check if a new evidence submission is a duplicate of an existing record
 */
export function isDuplicateEvidence(
  existingEvidences: LearningEvidence[],
  newEvidence: Partial<LearningEvidence>
): boolean {
  if (!Array.isArray(existingEvidences) || !newEvidence) return false;

  // 1. Idempotency Key Match
  if (newEvidence.idempotencyKey) {
    const keyMatch = existingEvidences.some((e) => e.idempotencyKey === newEvidence.idempotencyKey);
    if (keyMatch) return true;
  }

  // 2. Exact signature match within 500ms (debounce protection)
  if (newEvidence.sourceId && newEvidence.createdAt) {
    const newTime = new Date(newEvidence.createdAt).getTime();
    return existingEvidences.some((e) => {
      if (e.sourceId !== newEvidence.sourceId) return false;
      const existingTime = new Date(e.createdAt).getTime();
      return Math.abs(newTime - existingTime) < 500 && e.score === newEvidence.score;
    });
  }

  return false;
}
