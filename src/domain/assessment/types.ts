/**
 * Assessment Quality, Coverage & Competency Mapping Types
 * Gate 10 Architecture: Formal competency definitions, assessment authority, and evidence validation.
 */

export type AssessmentSourceType =
  | "quiz"
  | "lab_rubric"
  | "interactive_test"
  | "lesson_step_quiz";

export type AssessmentAuthorityClass =
  | "INSTRUCTIONAL_ONLY"
  | "PRACTICE_EVIDENCE"
  | "ASSESSMENT_EVIDENCE"
  | "GRADUATION_ELIGIBLE_EVIDENCE";

export type GraduationRelevance = "mandatory_core" | "elective_advanced";

export interface CompetencyMapping {
  skillId: string;
  titleAr: string;
  titleEn: string;
  category: string;
  taughtLessons: string[];
  practicedLabs: string[];
  assessedSources: string[];
  assessmentTopics: string[];
  graduationRelevance: GraduationRelevance;
  minimumAssessedItemsForMastery: number;
  masteryAccuracyThreshold: number; // e.g. 85 for quizzes, 100 for rubrics
}

export interface AssessmentQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface ValidatedAssessmentQuiz {
  title: string;
  canonicalSkillId: string;
  topic: string;
  questions: AssessmentQuestion[];
  isAiGenerated: boolean;
  validatedAt: string;
}

export interface QuestionValidationResult {
  isValid: boolean;
  reason?: string;
  violations?: string[];
}

export interface QuizValidationResult {
  isValid: boolean;
  reason?: string;
  violations?: string[];
  sanitizedQuiz?: ValidatedAssessmentQuiz;
}

export interface AssessmentScoringResult {
  score: number; // 0-100 percentage
  correct: number;
  total: number;
  passed: boolean;
  masteryEligible: boolean;
  error?: string;
}

export interface EvidenceProvenanceRecord {
  isValid: boolean;
  sourceId: string;
  canonicalSkillIds: string[];
  timestamp: string;
  authorityClass: AssessmentAuthorityClass;
  errors: string[];
}

export interface MappingIntegrityReport {
  isValid: boolean;
  totalSkills: number;
  totalLessonsMapped: number;
  totalLabsMapped: number;
  totalAssessmentsMapped: number;
  errors: string[];
  warnings: string[];
}
