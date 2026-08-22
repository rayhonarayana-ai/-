/**
 * LocalStorage Persistence Adapter
 * 
 * CRITICAL SECURITY & ARCHITECTURAL BOUNDARY:
 * LocalStorage adapter is NOT authoritative production storage.
 * Data stored in the browser's localStorage is client-controlled, transient,
 * and prone to clearing or tampering.
 * 
 * In Gate 3, this adapter isolates browser storage from application domain logic,
 * establishing provider-neutral contracts so that future Remote Persistence Adapters
 * (e.g. Supabase, Firebase, or Custom APIs) can be swapped seamlessly without rewriting components.
 */

import { UserProgress, Certificate } from "../types";
import { LabResult, COMPLETED_LABS } from "../data/labs";
import { LearningEvidence } from "../types/learningEvidence";
import { calculateLevel, deduplicateIds } from "../domain/progress";
import {
  ProgressStore,
  LearningEvidenceStore,
  LabsStore,
  CertificateStore,
  StarredProjectsStore,
  AppPersistenceService,
} from "./types";

// Canonical Legacy Storage Keys
export const STORAGE_KEYS = {
  PROGRESS: "kids_ai_progress",
  LEARNING_EVIDENCE: "kids_ai_learning_evidence",
  LABS: "moallem_completed_labs_v1",
  CERTIFICATE: "moallem_certificate_v1",
  STARRED_PROJECTS: "moallem_starred_projects_v1",
} as const;

/**
 * Default fallback progress for new sessions or corrupted state recovery
 */
export const DEFAULT_PROGRESS: UserProgress = {
  xp: 120,
  level: 1,
  streakDays: 3,
  completedLessons: ["lesson-1"],
  completedLabs: [],
  earnedBadges: ["badge-first-step"],
  totalChatMessages: 0,
  studentName: "المستكشف الصغير",
  zakiCustomization: {
    colorId: "indigo",
    accessoryId: "glasses",
    expressionId: "happy",
  },
};

/**
 * Utility to safely test if localStorage is accessible in the current runtime environment
 */
export function isLocalStorageAvailable(): boolean {
  if (typeof localStorage === "undefined") {
    return false;
  }
  try {
    const testKey = "__moallem_storage_test__";
    localStorage.setItem(testKey, "1");
    localStorage.removeItem(testKey);
    return true;
  } catch (e) {
    return false;
  }
}

/**
 * Safe JSON parser with graceful fallback to prevent application crashes
 */
function safeJsonParse<T>(raw: string | null, fallback: T, logContext: string): T {
  if (!raw) return fallback;
  try {
    const parsed = JSON.parse(raw);
    return parsed !== null && parsed !== undefined ? (parsed as T) : fallback;
  } catch (error) {
    console.warn(`[PersistenceAdapter] Corrupted JSON in ${logContext}, returning fallback.`, error);
    return fallback;
  }
}

// ----------------------------------------------------------------------------
// 1. Progress Store (user_state)
// ----------------------------------------------------------------------------
export class LocalStorageProgressStore implements ProgressStore {
  readonly persistenceClass = "user_state" as const;

  loadProgress(): UserProgress {
    if (!isLocalStorageAvailable()) return { ...DEFAULT_PROGRESS };
    const raw = localStorage.getItem(STORAGE_KEYS.PROGRESS);
    if (!raw) return { ...DEFAULT_PROGRESS };

    const parsed = safeJsonParse<any>(raw, null, "loadProgress");
    if (!parsed || typeof parsed !== "object") {
      return { ...DEFAULT_PROGRESS };
    }
    
    // Ensure deterministic level and deduplicated collections, recovering valid fields safely
    const rawXp = typeof parsed.xp === "number" && !isNaN(parsed.xp) ? parsed.xp : 0;
    const cleanXP = Math.max(0, Math.floor(rawXp));

    const cleanStreak = typeof parsed.streakDays === "number" && !isNaN(parsed.streakDays)
      ? Math.max(0, Math.floor(parsed.streakDays))
      : 0;

    const cleanChatCount = typeof parsed.totalChatMessages === "number" && !isNaN(parsed.totalChatMessages)
      ? Math.max(0, Math.floor(parsed.totalChatMessages))
      : 0;

    const cleanName = typeof parsed.studentName === "string" && parsed.studentName.trim().length > 0
      ? parsed.studentName.trim().slice(0, 50)
      : "المستكشف الصغير";

    const cleanCompletedLessons = Array.isArray(parsed.completedLessons)
      ? deduplicateIds(parsed.completedLessons.filter((x: unknown) => typeof x === "string" && x.trim().length > 0))
      : [];

    const cleanCompletedLabs = Array.isArray(parsed.completedLabs)
      ? deduplicateIds(parsed.completedLabs.filter((x: unknown) => typeof x === "string" && x.trim().length > 0))
      : [];

    const cleanEarnedBadges = Array.isArray(parsed.earnedBadges)
      ? deduplicateIds(parsed.earnedBadges.filter((x: unknown) => typeof x === "string" && x.trim().length > 0))
      : [];

    const result: UserProgress = {
      xp: cleanXP,
      level: calculateLevel(cleanXP),
      streakDays: cleanStreak,
      completedLessons: cleanCompletedLessons,
      completedLabs: cleanCompletedLabs,
      earnedBadges: cleanEarnedBadges,
      totalChatMessages: cleanChatCount,
      studentName: cleanName,
      lastLearningActivityDate: typeof parsed.lastLearningActivityDate === "string"
        ? parsed.lastLearningActivityDate
        : (typeof parsed.lastActiveDate === "string" ? parsed.lastActiveDate : undefined),
      zakiCustomization: parsed.zakiCustomization && typeof parsed.zakiCustomization === "object"
        ? parsed.zakiCustomization
        : {
            colorId: "indigo",
            accessoryId: "glasses",
            expressionId: "happy",
          },
    };

    if (Array.isArray(parsed.appliedXpEventIds)) {
      result.appliedXpEventIds = deduplicateIds(
        parsed.appliedXpEventIds.filter((x: unknown) => typeof x === "string" && x.trim().length > 0)
      );
    }

    if (parsed.weeklyGoal && typeof parsed.weeklyGoal === "object") {
      result.weeklyGoal = parsed.weeklyGoal;
    }

    return result;
  }

  saveProgress(progress: UserProgress): boolean {
    if (!isLocalStorageAvailable()) return false;
    try {
      localStorage.setItem(STORAGE_KEYS.PROGRESS, JSON.stringify(progress));
      return true;
    } catch (error) {
      console.error("[PersistenceAdapter] Failed to save progress:", error);
      return false;
    }
  }
}

// ----------------------------------------------------------------------------
// 2. Learning Evidence Store (authoritative_learning)
// ----------------------------------------------------------------------------
/**
 * Sanitizes untrusted metadata recursively, stripping base64 image strings,
 * oversized strings (>300 chars), and deeply nested binary payloads.
 */
function sanitizeEvidenceMetadata(input: unknown, depth = 0): any {
  if (depth > 4 || input === null || input === undefined) return undefined;
  if (typeof input === "string") {
    if (
      input.startsWith("data:image/") ||
      input.includes(";base64,") ||
      input.length > 300 ||
      (input.length > 100 && /^[A-Za-z0-9+/=]{100,}$/.test(input))
    ) {
      return undefined;
    }
    return input;
  }
  if (typeof input === "number" || typeof input === "boolean") {
    return input;
  }
  if (Array.isArray(input)) {
    const sanitizedArray = input
      .map((item) => sanitizeEvidenceMetadata(item, depth + 1))
      .filter((item) => item !== undefined);
    return sanitizedArray.slice(0, 20); // Bound array length
  }
  if (typeof input === "object") {
    const sanitizedObj: Record<string, any> = {};
    for (const [k, v] of Object.entries(input)) {
      // Bound key length and limit keys
      if (k.length > 50) continue;
      const cleanVal = sanitizeEvidenceMetadata(v, depth + 1);
      if (cleanVal !== undefined) {
        sanitizedObj[k] = cleanVal;
      }
    }
    return Object.keys(sanitizedObj).length > 0 ? sanitizedObj : undefined;
  }
  return undefined;
}

export class LocalStorageLearningEvidenceStore implements LearningEvidenceStore {
  readonly persistenceClass = "authoritative_learning" as const;

  loadEvidence(): LearningEvidence[] {
    if (!isLocalStorageAvailable()) return [];
    const raw = localStorage.getItem(STORAGE_KEYS.LEARNING_EVIDENCE);
    const parsed = safeJsonParse<LearningEvidence[]>(raw, [], "loadEvidence");
    if (!Array.isArray(parsed)) return [];

    // Filter out severely malformed entries and sanitize metadata
    return parsed.filter(
      (e) => e && typeof e === "object" && typeof e.id === "string" && typeof e.type === "string"
    );
  }

  appendEvidence(
    evidenceInput: Omit<LearningEvidence, "id" | "createdAt">
  ): LearningEvidence {
    const current = this.loadEvidence();

    // Idempotency check 1: Exact idempotency key match
    if (evidenceInput.idempotencyKey) {
      const existing = current.find((e) => e.idempotencyKey === evidenceInput.idempotencyKey);
      if (existing) {
        return existing;
      }
    }

    // Gate 6 Data Minimization: strip any base64 image or large private payloads recursively from metadata
    const sanitizedMetadata = evidenceInput.metadata && typeof evidenceInput.metadata === "object"
      ? sanitizeEvidenceMetadata(evidenceInput.metadata)
      : undefined;

    const newEntry: LearningEvidence = {
      id: `ev-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      createdAt: new Date().toISOString(),
      ...evidenceInput,
      metadata: sanitizedMetadata,
    };

    if (!isLocalStorageAvailable()) return newEntry;

    try {
      const updated = [...current, newEntry];
      localStorage.setItem(STORAGE_KEYS.LEARNING_EVIDENCE, JSON.stringify(updated));

      if (typeof window !== "undefined" && typeof window.dispatchEvent === "function") {
        window.dispatchEvent(
          new CustomEvent("learning_evidence_recorded", { detail: newEntry })
        );
      }
    } catch (error) {
      console.warn("[PersistenceAdapter] Failed to append learning evidence:", error);
    }

    return newEntry;
  }

  clearEvidence(): void {
    if (!isLocalStorageAvailable()) return;
    try {
      localStorage.removeItem(STORAGE_KEYS.LEARNING_EVIDENCE);
    } catch (error) {
      console.error("[PersistenceAdapter] Failed to clear evidence:", error);
    }
  }
}

// ----------------------------------------------------------------------------
// 3. Labs Store (authoritative_learning)
// ----------------------------------------------------------------------------
export class LocalStorageLabsStore implements LabsStore {
  readonly persistenceClass = "authoritative_learning" as const;

  loadLabs(): LabResult[] {
    if (!isLocalStorageAvailable()) return COMPLETED_LABS;
    const raw = localStorage.getItem(STORAGE_KEYS.LABS);
    if (!raw) {
      this.saveLabs(COMPLETED_LABS);
      return COMPLETED_LABS;
    }
    const parsed = safeJsonParse<LabResult[]>(raw, COMPLETED_LABS, "loadLabs");
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    this.saveLabs(COMPLETED_LABS);
    return COMPLETED_LABS;
  }

  saveLabs(labs: LabResult[]): boolean {
    if (!isLocalStorageAvailable()) return false;
    try {
      localStorage.setItem(STORAGE_KEYS.LABS, JSON.stringify(labs));
      return true;
    } catch (error) {
      console.error("[PersistenceAdapter] Failed to save labs:", error);
      return false;
    }
  }

  addLabResult(lab: LabResult): LabResult[] {
    const current = this.loadLabs();
    const filtered = current.filter((item) => item.id !== lab.id && item.labKey !== lab.labKey);
    const updated = [lab, ...filtered];
    this.saveLabs(updated);
    return updated;
  }

  improveLabResult(labId: string, improveBonus: number = 3): LabResult[] {
    const current = this.loadLabs();
    const updated = current.map((lab) => {
      if (lab.id === labId || lab.labKey === labId) {
        const newAttempts = (lab.attempts || 1) + 1;
        if (lab.accuracy === undefined) {
          return {
            ...lab,
            attempts: newAttempts,
            completedAt: new Date().toISOString(),
          };
        }
        const newAcc = Math.min(100, lab.accuracy + improveBonus);
        return {
          ...lab,
          accuracy: newAcc,
          attempts: newAttempts,
          completedAt: new Date().toISOString(),
          resultSummaryAr: `${lab.resultSummaryAr} (تم إجراء تحسين وتدريب إضافي، أصبحت الدقة ${newAcc}% بعد ${newAttempts} محاولات).`,
        };
      }
      return lab;
    });
    this.saveLabs(updated);
    return updated;
  }

  removeLabResult(id: string): LabResult[] {
    const current = this.loadLabs();
    const updated = current.filter((item) => item.id !== id);
    this.saveLabs(updated);
    return updated;
  }

  resetLabsToSeed(): LabResult[] {
    this.saveLabs(COMPLETED_LABS);
    return COMPLETED_LABS;
  }
}

// ----------------------------------------------------------------------------
// 4. Certificate Store (authoritative_learning)
// ----------------------------------------------------------------------------
export class LocalStorageCertificateStore implements CertificateStore {
  readonly persistenceClass = "authoritative_learning" as const;

  loadCertificate(): Certificate | null {
    if (!isLocalStorageAvailable()) return null;
    const raw = localStorage.getItem(STORAGE_KEYS.CERTIFICATE);
    return safeJsonParse<Certificate | null>(raw, null, "loadCertificate");
  }

  saveCertificate(cert: Certificate): boolean {
    if (!isLocalStorageAvailable()) return false;
    try {
      localStorage.setItem(STORAGE_KEYS.CERTIFICATE, JSON.stringify(cert));
      return true;
    } catch (error) {
      console.error("[PersistenceAdapter] Failed to save certificate:", error);
      return false;
    }
  }

  clearCertificate(): boolean {
    if (!isLocalStorageAvailable()) return false;
    try {
      localStorage.removeItem(STORAGE_KEYS.CERTIFICATE);
      return true;
    } catch (error) {
      console.error("[PersistenceAdapter] Failed to clear certificate:", error);
      return false;
    }
  }
}

// ----------------------------------------------------------------------------
// 5. Starred Projects Store (user_state)
// ----------------------------------------------------------------------------
export class LocalStorageStarredProjectsStore implements StarredProjectsStore {
  readonly persistenceClass = "user_state" as const;

  loadStarredProjects(): string[] {
    if (!isLocalStorageAvailable()) return ["lab-res-01"];
    const raw = localStorage.getItem(STORAGE_KEYS.STARRED_PROJECTS);
    if (!raw) {
      const initial = ["lab-res-01"];
      this.saveStarredProjects(initial);
      return initial;
    }
    const parsed = safeJsonParse<string[]>(raw, ["lab-res-01"], "loadStarredProjects");
    return Array.isArray(parsed) ? parsed : ["lab-res-01"];
  }

  saveStarredProjects(ids: string[]): boolean {
    if (!isLocalStorageAvailable()) return false;
    try {
      localStorage.setItem(STORAGE_KEYS.STARRED_PROJECTS, JSON.stringify(ids));
      return true;
    } catch (error) {
      console.error("[PersistenceAdapter] Failed to save starred projects:", error);
      return false;
    }
  }

  toggleStarredProject(id: string): string[] {
    const current = this.loadStarredProjects();
    const exists = current.includes(id);
    const updated = exists ? current.filter((item) => item !== id) : [id, ...current];
    this.saveStarredProjects(updated);
    return updated;
  }
}

// ----------------------------------------------------------------------------
// 6. Default App Persistence Service Singleton
// ----------------------------------------------------------------------------
export const defaultLocalStorageAdapter: AppPersistenceService = {
  progress: new LocalStorageProgressStore(),
  evidence: new LocalStorageLearningEvidenceStore(),
  labs: new LocalStorageLabsStore(),
  certificate: new LocalStorageCertificateStore(),
  starred: new LocalStorageStarredProjectsStore(),
};
