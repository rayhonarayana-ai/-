import { LabResult, COMPLETED_LABS } from "./labs";
import { Certificate } from "../types";

export const STORAGE_KEY = "moallem_completed_labs_v1";
export const CERTIFICATE_STORAGE_KEY = "moallem_certificate_v1";
export const STARRED_STORAGE_KEY = "moallem_starred_projects_v1";

/**
 * Checks if browser localStorage is available and functioning
 */
export function isStorageAvailable(): boolean {
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
 * Loads the lab results from localStorage.
 * If none exists, saves the initial seed data (COMPLETED_LABS) and returns it.
 */
export function loadLabs(): LabResult[] {
  if (!isStorageAvailable()) {
    return COMPLETED_LABS;
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      // First time initialization with seed completed labs
      saveLabs(COMPLETED_LABS);
      return COMPLETED_LABS;
    }
    const parsed = JSON.parse(stored);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    // If empty array found, re-initialize with seed
    saveLabs(COMPLETED_LABS);
    return COMPLETED_LABS;
  } catch (error) {
    console.error("Failed to read labs from localStorage:", error);
    return COMPLETED_LABS;
  }
}

/**
 * Saves the given array of lab results to localStorage
 */
export function saveLabs(labs: LabResult[]): boolean {
  if (!isStorageAvailable()) return false;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(labs));
    return true;
  } catch (error) {
    console.error("Failed to save labs to localStorage:", error);
    return false;
  }
}

/**
 * Adds a new lab result or updates an existing one by id (newest at the front)
 */
export function addLabResult(lab: LabResult): LabResult[] {
  const current = loadLabs();
  // Filter out if already exists, then prepend
  const filtered = current.filter((item) => item.id !== lab.id && item.labKey !== lab.labKey);
  const updated = [lab, ...filtered];
  saveLabs(updated);
  return updated;
}

/**
 * Improves an existing lab result: increments attempts and boosts accuracy by bonus (capped at 100)
 */
export function improveLabResult(labId: string, improveBonus: number = 3): LabResult[] {
  const current = loadLabs();
  const updated = current.map((lab) => {
    if (lab.id === labId || lab.labKey === labId) {
      const currentAcc = lab.accuracy ?? 90;
      const newAcc = Math.min(100, currentAcc + improveBonus);
      return {
        ...lab,
        accuracy: newAcc,
        attempts: (lab.attempts || 1) + 1,
        completedAt: new Date().toISOString(),
        resultSummaryAr: `${lab.resultSummaryAr} (تم إجراء تحسين وتدريب إضافي بنجاح، ارتفعت الدقة إلى ${newAcc}% بعد ${lab.attempts + 1} محاولات).`,
      };
    }
    return lab;
  });
  saveLabs(updated);
  return updated;
}

/**
 * Removes a lab result by id
 */
export function removeLabResult(id: string): LabResult[] {
  const current = loadLabs();
  const updated = current.filter((item) => item.id !== id);
  saveLabs(updated);
  return updated;
}

/**
 * Resets stored labs to the initial seed collection
 */
export function resetLabsToSeed(): LabResult[] {
  saveLabs(COMPLETED_LABS);
  return COMPLETED_LABS;
}

/**
 * Loads the issued graduation certificate from localStorage
 */
export function loadCertificate(): Certificate | null {
  if (!isStorageAvailable()) return null;
  try {
    const stored = localStorage.getItem(CERTIFICATE_STORAGE_KEY);
    if (!stored) return null;
    return JSON.parse(stored) as Certificate;
  } catch (error) {
    console.error("Failed to load certificate from localStorage:", error);
    return null;
  }
}

/**
 * Saves the issued graduation certificate to localStorage
 */
export function saveCertificate(cert: Certificate): boolean {
  if (!isStorageAvailable()) return false;
  try {
    localStorage.setItem(CERTIFICATE_STORAGE_KEY, JSON.stringify(cert));
    return true;
  } catch (error) {
    console.error("Failed to save certificate to localStorage:", error);
    return false;
  }
}

/**
 * Clears the stored graduation certificate
 */
export function clearCertificate(): boolean {
  if (!isStorageAvailable()) return false;
  try {
    localStorage.removeItem(CERTIFICATE_STORAGE_KEY);
    return true;
  } catch (error) {
    console.error("Failed to clear certificate from localStorage:", error);
    return false;
  }
}

/**
 * Loads the list of starred project IDs from localStorage.
 */
export function loadStarredProjects(): string[] {
  if (!isStorageAvailable()) {
    return ["lab-res-01"];
  }

  try {
    const stored = localStorage.getItem(STARRED_STORAGE_KEY);
    if (!stored) {
      const initial = ["lab-res-01"];
      saveStarredProjects(initial);
      return initial;
    }
    const parsed = JSON.parse(stored);
    if (Array.isArray(parsed)) {
      return parsed;
    }
    return ["lab-res-01"];
  } catch (error) {
    console.error("Failed to read starred projects from localStorage:", error);
    return ["lab-res-01"];
  }
}

/**
 * Saves the array of starred project IDs to localStorage.
 */
export function saveStarredProjects(ids: string[]): boolean {
  if (!isStorageAvailable()) return false;
  try {
    localStorage.setItem(STARRED_STORAGE_KEY, JSON.stringify(ids));
    return true;
  } catch (error) {
    console.error("Failed to save starred projects to localStorage:", error);
    return false;
  }
}

/**
 * Toggles a project's starred status and returns the updated array of IDs.
 */
export function toggleStarredProject(id: string): string[] {
  const current = loadStarredProjects();
  const exists = current.includes(id);
  const updated = exists ? current.filter((item) => item !== id) : [id, ...current];
  saveStarredProjects(updated);
  return updated;
}
