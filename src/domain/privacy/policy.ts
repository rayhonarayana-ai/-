/**
 * Privacy Policy & Data Minimization Architecture
 * Gate 6: Child Safety, Privacy & Engineering Boundaries
 * 
 * CORE PRINCIPLE:
 * Collect less, store less, retain less, expose less, trust less.
 * 
 * NOTE: This is an engineering safety policy for our pre-launch architecture.
 * It does not constitute a legal or regulatory certification.
 */

export interface PrivacyPolicyConfig {
  readonly persistChatHistory: boolean;
  readonly persistUploadedImages: boolean;
  readonly collectLegalIdentity: boolean;
  readonly logChildMessages: boolean;
  readonly logImages: boolean;
  readonly allowThirdPartyTracking: boolean;
  readonly allowBehavioralAds: boolean;
  readonly requireConsentForNormalLearning: boolean;
  readonly maxDisplayNameChars: number;
  readonly defaultStudentDisplayName: string;
}

export const PRIVACY_POLICY: PrivacyPolicyConfig = {
  // AI conversations remain transient in-memory only
  persistChatHistory: false,

  // Images uploaded for vision analysis remain transient in-memory only
  persistUploadedImages: false,

  // Normal learning uses a display nickname, never legal/verified identity
  collectLegalIdentity: false,

  // Server & client logs exclude child messages and raw text
  logChildMessages: false,

  // Server & client logs exclude base64 image strings
  logImages: false,

  // Zero third-party behavioral tracking or analytics SDKs
  allowThirdPartyTracking: false,
  allowBehavioralAds: false,

  // No fake consent checkboxes without a legal account infrastructure
  requireConsentForNormalLearning: false,

  // Bounded display name
  maxDisplayNameChars: 50,
  defaultStudentDisplayName: "المستكشف الصغير",
} as const;

/**
 * Validates whether a given field is strictly allowed in child learning state
 */
export function isAllowedChildStateField(fieldName: string): boolean {
  const allowedFields = new Set([
    "xp",
    "level",
    "streakDays",
    "lastLearningActivityDate",
    "completedLessons",
    "completedLabs",
    "earnedBadges",
    "totalChatMessages",
    "studentName", // Display nickname only
    "zakiCustomization",
  ]);
  return allowedFields.has(fieldName);
}

/**
 * Checks if a string contains base64 image data
 */
export function containsBase64Image(data: unknown): boolean {
  if (typeof data !== "string") return false;
  return data.startsWith("data:image/") || (data.length > 500 && /^[A-Za-z0-9+/=]+$/.test(data));
}
