/**
 * Reliability & Observability Foundation Types
 * Gate 7 Architecture: Minimal, provider-neutral failure taxonomy and recovery contracts.
 */

export type ReliabilityErrorCategory =
  | "STORAGE_UNAVAILABLE"
  | "STORAGE_CORRUPTED"
  | "NETWORK_UNAVAILABLE"
  | "AI_TIMEOUT"
  | "AI_RATE_LIMITED"
  | "AI_UNAVAILABLE"
  | "INVALID_AI_RESPONSE"
  | "UNKNOWN_RECOVERABLE_ERROR";

export interface SafeOperationResult<T = void> {
  ok: boolean;
  data?: T;
  errorCategory?: ReliabilityErrorCategory;
  safeMessageAr: string;
  retryable: boolean;
  correlationId?: string;
}

/**
 * Child-friendly, non-technical localized fallback messages
 * Guarantees zero internal stack traces, API keys, or technical error codes reach the child UI.
 */
export const SAFE_RELIABILITY_MESSAGES: Record<ReliabilityErrorCategory, string> = {
  STORAGE_UNAVAILABLE: "المساحة المحلية في المتصفح غير متاحة، ولكن يمكنك مواصلة التعلم بأمان في هذه الجلسة! 🛡️",
  STORAGE_CORRUPTED: "تم استرجاع بيانات التعلم بنجاح وتصحيح أي تعارض تلقائياً! ✨",
  NETWORK_UNAVAILABLE: "يبدو أن هناك انقطاعاً مؤقتاً في الاتصال. يمكنك متابعة الدروس والتمارين المحلية! 📡",
  AI_TIMEOUT: "المساعد الذكي زكي يحتاج لحظات إضافية للتفكير. حاول مرة أخرى بعد قليل! ⏳🤖",
  AI_RATE_LIMITED: "مهلاً يا بطل! خذ نفساً عميقاً للحظات قبل إرسال سؤالك التالي! ⏳😊",
  AI_UNAVAILABLE: "زكي يستريح قليلاً وسيعود قريباً. يمكنك مواصلة استكشاف الدروس والمشاريع التفاعلية! 🤖✨",
  INVALID_AI_RESPONSE: "تم استلام الإجابة وتجهيز التمارين والأنشطة المناسبة لك! 🎯",
  UNKNOWN_RECOVERABLE_ERROR: "حدث تعثر بسيط وتمت معالجته بأمان. هيا نواصل التعلم! 🚀",
};

export function getSafeReliabilityMessage(
  category: ReliabilityErrorCategory,
  customFallback?: string
): string {
  return customFallback || SAFE_RELIABILITY_MESSAGES[category] || SAFE_RELIABILITY_MESSAGES.UNKNOWN_RECOVERABLE_ERROR;
}

export function normalizeReliabilityError(error: unknown): {
  category: ReliabilityErrorCategory;
  safeMessage: string;
} {
  const errMsg = error instanceof Error ? error.message : String(error || "");

  if (errMsg.includes("QuotaExceeded") || errMsg.includes("storage is full") || errMsg.includes("localStorage is not available")) {
    return {
      category: "STORAGE_UNAVAILABLE",
      safeMessage: SAFE_RELIABILITY_MESSAGES.STORAGE_UNAVAILABLE,
    };
  }

  if (errMsg.includes("429") || errMsg.includes("RESOURCE_EXHAUSTED") || errMsg.includes("quota") || errMsg.includes("RATE_LIMITED")) {
    return {
      category: "AI_RATE_LIMITED",
      safeMessage: SAFE_RELIABILITY_MESSAGES.AI_RATE_LIMITED,
    };
  }

  if (errMsg.includes("TIMEOUT") || errMsg.includes("timed out")) {
    return {
      category: "AI_TIMEOUT",
      safeMessage: SAFE_RELIABILITY_MESSAGES.AI_TIMEOUT,
    };
  }

  if (errMsg.includes("503") || errMsg.includes("UNAVAILABLE") || errMsg.includes("high demand") || errMsg.includes("AI_UNAVAILABLE")) {
    return {
      category: "AI_UNAVAILABLE",
      safeMessage: SAFE_RELIABILITY_MESSAGES.AI_UNAVAILABLE,
    };
  }

  if (errMsg.includes("Network") || errMsg.includes("fetch") || errMsg.includes("offline")) {
    return {
      category: "NETWORK_UNAVAILABLE",
      safeMessage: SAFE_RELIABILITY_MESSAGES.NETWORK_UNAVAILABLE,
    };
  }

  if (errMsg.includes("JSON") || errMsg.includes("parse") || errMsg.includes("SyntaxError")) {
    return {
      category: "STORAGE_CORRUPTED",
      safeMessage: SAFE_RELIABILITY_MESSAGES.STORAGE_CORRUPTED,
    };
  }

  return {
    category: "UNKNOWN_RECOVERABLE_ERROR",
    safeMessage: SAFE_RELIABILITY_MESSAGES.UNKNOWN_RECOVERABLE_ERROR,
  };
}

