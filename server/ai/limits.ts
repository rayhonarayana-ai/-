/**
 * Server AI Gateway - Centralized Limits and Configuration
 * Gate 5 Architecture: Bounded, predictable resource consumption.
 */

export const AI_LIMITS = {
  // Input constraints
  maxMessageChars: 800,
  maxHistoryMessages: 10,
  maxPromptLabFieldChars: 120,
  maxTopicChars: 100,
  maxStudentNameChars: 60,
  maxParentNotesChars: 300,
  maxArrayItems: 50,

  // Image & Vision constraints
  maxImageSizeBytes: 4 * 1024 * 1024, // 4MB binary
  maxImageBase64Length: 6 * 1024 * 1024, // ~6MB base64
  allowedImageMimeTypes: ["image/jpeg", "image/png", "image/webp", "image/gif"] as const,

  // Provider Execution constraints
  defaultTimeoutMs: 12000, // 12 seconds per provider attempt
  maxAttempts: 2, // At most 2 model attempts before fallback
  maxOutputTokens: 1024,

  // Temperature defaults
  defaultTemperature: 0.7,
  structuredTemperature: 0.2,
  reportTemperature: 0.5,
} as const;

export const RATE_LIMIT_CONFIGS = {
  chat: { windowMs: 60 * 1000, maxRequests: 20 },
  prompt_lab: { windowMs: 60 * 1000, maxRequests: 15 },
  vision_explain: { windowMs: 60 * 1000, maxRequests: 10 },
  quiz_generation: { windowMs: 60 * 1000, maxRequests: 10 },
  pedagogical_report: { windowMs: 60 * 1000, maxRequests: 6 },
} as const;
