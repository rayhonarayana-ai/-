/**
 * Local Educational Data Reset Service
 * Gate 6: Data Deletion & Privacy Foundation
 * 
 * Capability to completely clear and reset authoritative and local educational state
 * WITHOUT wiping unrelated browser storage belonging to other applications.
 */

import {
  progressStore,
  learningEvidenceStore,
  labsStore,
  certificateStore,
  starredProjectsStore,
  STORAGE_KEYS,
  DEFAULT_PROGRESS,
  isLocalStorageAvailable,
} from "../../persistence";
import { COMPLETED_LABS } from "../../data/labs";

export interface ResetOptions {
  /**
   * If true, also resets client UI preferences (e.g. language, TTS voice settings)
   * Defaults to false (preserves UI preferences like selected dialect/voice)
   */
  resetUIPreferences?: boolean;
}

export interface ResetResult {
  readonly success: boolean;
  readonly clearedStores: string[];
  readonly timestamp: string;
}

// Scoped keys for UI preferences
export const UI_PREFERENCE_KEYS = {
  LANGUAGE: "moallem_selected_language",
  LANGUAGE_CONFIRMED: "moallem_language_confirmed",
  VOICE_SETTINGS: "moallem_voice_settings_v1",
} as const;

/**
 * Resets all educational learning data scoped strictly to this application.
 * 
 * Scope:
 * - Resets progress to default state (level 1, default display nickname, zero custom XP)
 * - Clears all learning evidence records
 * - Resets completed labs to baseline seed
 * - Clears graduation certificate
 * - Clears starred projects list
 * 
 * Invariant:
 * Does NOT call localStorage.clear(), protecting unrelated browser storage.
 */
export function resetEducationalData(options: ResetOptions = {}): ResetResult {
  const clearedStores: string[] = [];

  try {
    // 1. Reset progress store to clean initial state
    progressStore.saveProgress({ ...DEFAULT_PROGRESS });
    clearedStores.push("progress");

    // 2. Clear learning evidence
    learningEvidenceStore.clearEvidence();
    clearedStores.push("learning_evidence");

    // 3. Reset labs to default seed
    labsStore.saveLabs([...COMPLETED_LABS]);
    clearedStores.push("labs");

    // 4. Clear certificate
    certificateStore.clearCertificate();
    clearedStores.push("certificate");

    // 5. Reset starred projects
    starredProjectsStore.saveStarredProjects(["lab-res-01"]);
    clearedStores.push("starred_projects");

    // 6. Optional UI preferences reset
    if (options.resetUIPreferences && isLocalStorageAvailable()) {
      localStorage.removeItem(UI_PREFERENCE_KEYS.LANGUAGE);
      localStorage.removeItem(UI_PREFERENCE_KEYS.LANGUAGE_CONFIRMED);
      localStorage.removeItem(UI_PREFERENCE_KEYS.VOICE_SETTINGS);
      clearedStores.push("ui_preferences");
    }

    return {
      success: true,
      clearedStores,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    return {
      success: false,
      clearedStores,
      timestamp: new Date().toISOString(),
    };
  }
}
