/**
 * Central Progress, XP & Streak Domain Logic
 * 
 * Enforces:
 * 1. XP Event Idempotency
 * 2. Calendar-Day Streak Integrity (Qualifying learning activities only)
 * 3. Deterministic Level Derivation
 * 4. Completion & Badge Set-like Deduplication
 * 5. Weekly Goal Single-Claim Safety
 */

export * from "./types";
export * from "./level";
export * from "./streak";
export * from "./progression";
