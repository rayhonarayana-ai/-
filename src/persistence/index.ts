/**
 * Provider-Neutral Persistence Layer
 * 
 * Exposes storage interfaces, classifications, and current active adapter instances.
 * This decouples domain services and UI components from low-level browser storage APIs.
 */

export * from "./types";
export * from "./localStorageAdapter";

import { defaultLocalStorageAdapter } from "./localStorageAdapter";
import { AppPersistenceService } from "./types";

// Active persistence provider instance (defaults to LocalStorage in browser/local dev)
let activePersistenceService: AppPersistenceService = defaultLocalStorageAdapter;

/**
 * Returns the currently active persistence service instance.
 */
export function getPersistenceService(): AppPersistenceService {
  return activePersistenceService;
}

/**
 * Registers a new persistence service provider (e.g. RemotePersistenceAdapter, MockTestAdapter)
 * Enables seamless switching without modifying consumer code.
 */
export function setPersistenceService(service: AppPersistenceService): void {
  activePersistenceService = service;
}

// Direct store accessors for ergonomic consumption across the app
export const progressStore = {
  loadProgress: () => getPersistenceService().progress.loadProgress(),
  saveProgress: (p: Parameters<AppPersistenceService["progress"]["saveProgress"]>[0]) =>
    getPersistenceService().progress.saveProgress(p),
};

export const learningEvidenceStore = {
  loadEvidence: () => getPersistenceService().evidence.loadEvidence(),
  appendEvidence: (
    e: Parameters<AppPersistenceService["evidence"]["appendEvidence"]>[0]
  ) => getPersistenceService().evidence.appendEvidence(e),
  clearEvidence: () => getPersistenceService().evidence.clearEvidence?.(),
};

export const labsStore = {
  loadLabs: () => getPersistenceService().labs.loadLabs(),
  saveLabs: (l: Parameters<AppPersistenceService["labs"]["saveLabs"]>[0]) =>
    getPersistenceService().labs.saveLabs(l),
  addLabResult: (l: Parameters<AppPersistenceService["labs"]["addLabResult"]>[0]) =>
    getPersistenceService().labs.addLabResult(l),
  improveLabResult: (
    id: string,
    bonus?: number
  ) => getPersistenceService().labs.improveLabResult(id, bonus),
  removeLabResult: (id: string) => getPersistenceService().labs.removeLabResult(id),
  resetLabsToSeed: () => getPersistenceService().labs.resetLabsToSeed(),
};

export const certificateStore = {
  loadCertificate: () => getPersistenceService().certificate.loadCertificate(),
  saveCertificate: (
    c: Parameters<AppPersistenceService["certificate"]["saveCertificate"]>[0]
  ) => getPersistenceService().certificate.saveCertificate(c),
  clearCertificate: () => getPersistenceService().certificate.clearCertificate(),
};

export const starredProjectsStore = {
  loadStarredProjects: () => getPersistenceService().starred.loadStarredProjects(),
  saveStarredProjects: (
    ids: Parameters<AppPersistenceService["starred"]["saveStarredProjects"]>[0]
  ) => getPersistenceService().starred.saveStarredProjects(ids),
  toggleStarredProject: (id: string) =>
    getPersistenceService().starred.toggleStarredProject(id),
};
