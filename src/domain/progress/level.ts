/**
 * Central Deterministic Level Calculation Policy
 * Level is derived exclusively from cumulative XP.
 */

export const XP_PER_LEVEL = 200;

/**
 * Calculates current developer/student level based purely on cumulative XP.
 * Deterministic: calculateLevel(XP) always produces the identical level.
 */
export function calculateLevel(xp: number): number {
  if (typeof xp !== "number" || isNaN(xp) || xp < 0) {
    return 1;
  }
  return Math.floor(xp / XP_PER_LEVEL) + 1;
}

/**
 * Calculates XP required to reach the next level.
 */
export function getXpRequiredForLevel(level: number): number {
  const targetLevel = Math.max(1, level);
  return (targetLevel - 1) * XP_PER_LEVEL;
}

/**
 * Calculates percentage progress (0 - 100) toward the subsequent level.
 */
export function getLevelProgressPercentage(xp: number): number {
  const safeXP = Math.max(0, xp);
  const currentLevelXP = safeXP % XP_PER_LEVEL;
  return Math.min(100, Math.floor((currentLevelXP / XP_PER_LEVEL) * 100));
}
