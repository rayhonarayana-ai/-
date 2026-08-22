/**
 * Learning Evidence & Assessment Types
 * Distinguishes Engagement, Completion, Reward, and Assessment Evidence.
 *
 * Core Principle:
 * XP != Mastery
 * Completion != Mastery
 * Badge != Mastery
 * Streak != Mastery
 * AI praise != Mastery
 */

export type LearningEventType =
  | "LESSON_COMPLETED"
  | "QUIZ_ATTEMPTED"
  | "LAB_COMPLETED"
  | "PROJECT_COMPLETED"
  | "SKILL_ASSESSED"
  | "REMEDIATION_COMPLETED";

export type MasteryStatus =
  | "not_assessed"
  | "developing"
  | "demonstrated";

export interface LearningEvidence {
  id: string;
  type: LearningEventType;
  sourceId: string;
  skillIds: string[];
  score?: number; // Normalized percentage score (0-100) if assessed
  correct?: number;
  total?: number;
  attempts?: number;
  assessed: boolean; // TRUE only if formal/evaluated assessment criteria was verified
  passed?: boolean; // Evaluated assessment pass status
  masteryEligible?: boolean; // TRUE only if evidence explicitly satisfies activity-specific mastery rubric
  createdAt: string; // ISO date timestamp
  idempotencyKey?: string; // Optional idempotency key to prevent accidental duplicate submission
  metadata?: Record<string, any>;
}

export interface SkillMastery {
  skillId: string;
  titleAr: string;
  status: MasteryStatus;
  evidenceCount: number;
  assessedEvidenceCount: number;
  averageScore?: number;
  lastAssessedAt?: string;
}
