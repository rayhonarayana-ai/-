import { UserProgress, Certificate } from "../types";
import { LabResult } from "../data/labs";
import { LearningEvidence } from "../types/learningEvidence";

/**
 * Data Persistence Classification
 * Categorizes application data according to its authority, durability, and synchronization needs.
 */
export type PersistenceClass =
  | "authoritative_learning" // Formal assessments, verified learning evidence, completed accredited milestones
  | "user_state"            // XP, level, streak, earned badges, local profile configuration
  | "ui_preference"         // Audio toggle, TTS voice preferences, language UI selection
  | "cache";                // Ephemeral responses, generated quizzes, temporary image pre-renders

/**
 * Progress Storage Contract
 * Handles user progression, XP, streaks, and completed lesson identifiers.
 */
export interface ProgressStore {
  readonly persistenceClass: PersistenceClass;
  loadProgress(): UserProgress;
  saveProgress(progress: UserProgress): boolean;
}

/**
 * Learning Evidence Storage Contract
 * Handles decoupled assessment evidence records underpinning skill mastery.
 */
export interface LearningEvidenceStore {
  readonly persistenceClass: PersistenceClass;
  loadEvidence(): LearningEvidence[];
  appendEvidence(
    evidence: Omit<LearningEvidence, "id" | "createdAt">
  ): LearningEvidence;
  clearEvidence?(): void;
}

/**
 * Labs and Practical Projects Storage Contract
 * Handles hands-on lab projects, accuracies, and attempt iterations.
 */
export interface LabsStore {
  readonly persistenceClass: PersistenceClass;
  loadLabs(): LabResult[];
  saveLabs(labs: LabResult[]): boolean;
  addLabResult(lab: LabResult): LabResult[];
  improveLabResult(labId: string, improveBonus?: number): LabResult[];
  removeLabResult(id: string): LabResult[];
  resetLabsToSeed(): LabResult[];
}

/**
 * Graduation Certificate Storage Contract
 * Handles official graduation credentials and unique certificate serial identifiers.
 */
export interface CertificateStore {
  readonly persistenceClass: PersistenceClass;
  loadCertificate(): Certificate | null;
  saveCertificate(cert: Certificate): boolean;
  clearCertificate(): boolean;
}

/**
 * Starred Projects Storage Contract
 * Handles bookmarked/pinned project references in the portfolio.
 */
export interface StarredProjectsStore {
  readonly persistenceClass: PersistenceClass;
  loadStarredProjects(): string[];
  saveStarredProjects(ids: string[]): boolean;
  toggleStarredProject(id: string): string[];
}

/**
 * Unified Persistence Container Interface
 * Provides a provider-neutral facade over all domain stores.
 */
export interface AppPersistenceService {
  progress: ProgressStore;
  evidence: LearningEvidenceStore;
  labs: LabsStore;
  certificate: CertificateStore;
  starred: StarredProjectsStore;
}
