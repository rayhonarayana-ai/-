/**
 * Legacy Storage Module (Backward-Compatibility Bridge)
 * 
 * Re-exports domain operations through the new provider-neutral persistence architecture.
 * Existing code importing from `../data/storage` continues to work without disruption.
 */

import { LabResult } from "./labs";
import { Certificate } from "../types";
import {
  labsStore,
  certificateStore,
  starredProjectsStore,
  isLocalStorageAvailable,
  STORAGE_KEYS,
} from "../persistence";

export const STORAGE_KEY = STORAGE_KEYS.LABS;
export const CERTIFICATE_STORAGE_KEY = STORAGE_KEYS.CERTIFICATE;
export const STARRED_STORAGE_KEY = STORAGE_KEYS.STARRED_PROJECTS;

export const isStorageAvailable = isLocalStorageAvailable;

export function loadLabs(): LabResult[] {
  return labsStore.loadLabs();
}

export function saveLabs(labs: LabResult[]): boolean {
  return labsStore.saveLabs(labs);
}

export function addLabResult(lab: LabResult): LabResult[] {
  return labsStore.addLabResult(lab);
}

export function improveLabResult(labId: string, improveBonus: number = 3): LabResult[] {
  return labsStore.improveLabResult(labId, improveBonus);
}

export function removeLabResult(id: string): LabResult[] {
  return labsStore.removeLabResult(id);
}

export function resetLabsToSeed(): LabResult[] {
  return labsStore.resetLabsToSeed();
}

export function loadCertificate(): Certificate | null {
  return certificateStore.loadCertificate();
}

export function saveCertificate(cert: Certificate): boolean {
  return certificateStore.saveCertificate(cert);
}

export function clearCertificate(): boolean {
  return certificateStore.clearCertificate();
}

export function loadStarredProjects(): string[] {
  return starredProjectsStore.loadStarredProjects();
}

export function saveStarredProjects(ids: string[]): boolean {
  return starredProjectsStore.saveStarredProjects(ids);
}

export function toggleStarredProject(id: string): string[] {
  return starredProjectsStore.toggleStarredProject(id);
}
