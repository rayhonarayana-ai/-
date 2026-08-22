/**
 * Server AI Gateway - Strict Input & Output Validation
 * Gate 5 Architecture: Validated boundaries for child AI requests.
 */

import {
  ChatRequestPayload,
  PromptLabPayload,
  VisionExplainPayload,
  QuizGenerationPayload,
  PedagogicalReportPayload,
  GeneratedQuiz,
  ChatMessage,
} from "./types.js";
import { AI_LIMITS } from "./limits.js";
import { sanitizeText } from "./safety.js";

export interface ValidationResult<T> {
  isValid: boolean;
  sanitizedData?: T;
  errorMessage?: string;
}

export function validateChatInput(body: any): ValidationResult<ChatRequestPayload> {
  if (!body || typeof body !== "object") {
    return { isValid: false, errorMessage: "طلب غير صالح: محتوى غير معرّف." };
  }

  if (!Array.isArray(body.messages) || body.messages.length === 0) {
    return { isValid: false, errorMessage: "قائمة الرسائل غير موجودة أو فارغة." };
  }

  // Bound history to recent messages
  const boundedMessages = body.messages.slice(-AI_LIMITS.maxHistoryMessages);
  const sanitizedMessages: ChatMessage[] = [];

  for (const msg of boundedMessages) {
    if (!msg || typeof msg !== "object") {
      return { isValid: false, errorMessage: "تنسيق رسالة غير صالح." };
    }
    const role = msg.role === "assistant" || msg.role === "model" ? "model" : "user";
    const content = sanitizeText(msg.content, AI_LIMITS.maxMessageChars);

    if (content.length === 0 && role === "user") {
      return { isValid: false, errorMessage: "الرسالة لا يمكن أن تكون فارغة." };
    }

    sanitizedMessages.push({ role, content });
  }

  const language = typeof body.language === "string" ? sanitizeText(body.language, 20) : "ar_fusha";
  const persona = typeof body.persona === "string" ? sanitizeText(body.persona, 20) : "default";
  const personaPrompt = typeof body.personaPrompt === "string" ? sanitizeText(body.personaPrompt, 300) : undefined;

  return {
    isValid: true,
    sanitizedData: {
      messages: sanitizedMessages,
      language,
      persona,
      personaPrompt,
    },
  };
}

export function validatePromptLabInput(body: any): ValidationResult<PromptLabPayload> {
  if (!body || typeof body !== "object") {
    return { isValid: false, errorMessage: "محتوى الطلب غير صالح." };
  }

  return {
    isValid: true,
    sanitizedData: {
      subject: sanitizeText(body.subject, AI_LIMITS.maxPromptLabFieldChars) || "روبوت لطيف ومساعد",
      setting: sanitizeText(body.setting, AI_LIMITS.maxPromptLabFieldChars) || "في الفضاء الخارجي",
      style: sanitizeText(body.style, AI_LIMITS.maxPromptLabFieldChars) || "قصة كرتونية قصيرة",
      emotion: sanitizeText(body.emotion, AI_LIMITS.maxPromptLabFieldChars) || "سعيد جداً ومتحمس",
    },
  };
}

export function validateVisionInput(body: any): ValidationResult<VisionExplainPayload> {
  if (!body || typeof body !== "object" || !body.imageBase64 || typeof body.imageBase64 !== "string") {
    return { isValid: false, errorMessage: "الصورة غير موجودة أو بتنسيق غير صالح." };
  }

  const cleanBase64 = body.imageBase64.replace(/^data:image\/[a-zA-Z0-9.+-]+;base64,/, "").trim();
  if (cleanBase64.length === 0) {
    return { isValid: false, errorMessage: "بيانات الصورة فارغة." };
  }

  if (cleanBase64.length > AI_LIMITS.maxImageBase64Length) {
    return { isValid: false, errorMessage: "حجم الصورة يتجاوز الحد المسموح به (4 ميغابايت)." };
  }

  // Validate Base64 characters
  const isBase64 = /^[A-Za-z0-9+/=]+$/.test(cleanBase64.replace(/[\r\n\s]/g, ""));
  if (!isBase64) {
    return { isValid: false, errorMessage: "تشفير Base64 للصورة غير سليم." };
  }

  let mimeType = "image/jpeg";
  if (typeof body.mimeType === "string") {
    const rawMime = body.mimeType.toLowerCase().trim();
    if ((AI_LIMITS.allowedImageMimeTypes as readonly string[]).includes(rawMime)) {
      mimeType = rawMime;
    }
  }

  return {
    isValid: true,
    sanitizedData: {
      imageBase64: cleanBase64,
      mimeType,
    },
  };
}

export function validateQuizInput(body: any): ValidationResult<QuizGenerationPayload> {
  if (!body || typeof body !== "object") {
    return { isValid: false, errorMessage: "محتوى الطلب غير صالح." };
  }

  const topic = sanitizeText(body.topic, AI_LIMITS.maxTopicChars) || "الذكاء الاصطناعي";
  return {
    isValid: true,
    sanitizedData: { topic },
  };
}

export function validateQuizOutput(rawText: string): GeneratedQuiz | null {
  if (!rawText || typeof rawText !== "string") return null;

  try {
    // Strip markdown code block wrappers if any
    let cleanJson = rawText.trim();
    if (cleanJson.startsWith("```json")) {
      cleanJson = cleanJson.replace(/^```json\s*/, "").replace(/```$/, "").trim();
    } else if (cleanJson.startsWith("```")) {
      cleanJson = cleanJson.replace(/^```\s*/, "").replace(/```$/, "").trim();
    }

    const parsed = JSON.parse(cleanJson);
    if (!parsed || typeof parsed !== "object") return null;

    const title = typeof parsed.title === "string" ? sanitizeText(parsed.title, 120) : "تحدي الأذكياء الصغار 🧠⚡";
    if (!Array.isArray(parsed.questions) || parsed.questions.length === 0) {
      return null;
    }

    const questions: GeneratedQuiz["questions"] = [];
    for (const q of parsed.questions.slice(0, 5)) {
      if (!q || typeof q !== "object") continue;
      const questionText = sanitizeText(q.question, 300);
      if (!questionText || questionText.length < 10) continue;

      if (!Array.isArray(q.options) || q.options.length < 2) continue;
      const rawOptions = q.options.slice(0, 4).map((opt: any) => sanitizeText(opt, 120)).filter(Boolean);
      if (rawOptions.length < 2) continue;

      // Reject questions with duplicate options
      const seenOpts = new Set<string>();
      let hasDuplicates = false;
      for (const opt of rawOptions) {
        const norm = opt.toLowerCase();
        if (seenOpts.has(norm)) {
          hasDuplicates = true;
          break;
        }
        seenOpts.add(norm);
      }
      if (hasDuplicates) continue;

      const rawIndex = typeof q.correctIndex === "number" ? q.correctIndex : 0;
      if (rawIndex < 0 || rawIndex >= rawOptions.length) continue;
      const correctIndex = rawIndex;
      const explanation = sanitizeText(q.explanation, 300) || "إجابة ذكية وممتازة! أحسنت! 🌟";

      questions.push({
        question: questionText,
        options: rawOptions,
        correctIndex,
        explanation,
      });
    }

    if (questions.length === 0) return null;

    return {
      title,
      questions,
    };
  } catch (err) {
    return null;
  }
}

export function validatePedagogicalReportInput(body: any): ValidationResult<PedagogicalReportPayload> {
  if (!body || typeof body !== "object") {
    return { isValid: false, errorMessage: "محتوى الطلب غير صالح." };
  }

  const studentName = sanitizeText(body.studentName, AI_LIMITS.maxStudentNameChars) || "البطل المبتكر";
  const level = typeof body.level === "number" && body.level > 0 ? Math.min(body.level, 100) : 1;
  const xp = typeof body.xp === "number" && body.xp >= 0 ? Math.min(body.xp, 100000) : 0;
  const streakDays = typeof body.streakDays === "number" && body.streakDays >= 0 ? Math.min(body.streakDays, 3650) : 1;
  const totalChatMessages = typeof body.totalChatMessages === "number" && body.totalChatMessages >= 0 ? Math.min(body.totalChatMessages, 10000) : 0;
  const language = typeof body.language === "string" ? sanitizeText(body.language, 30) : "ar_fusha";
  const parentNotes = typeof body.parentNotes === "string" ? sanitizeText(body.parentNotes, AI_LIMITS.maxParentNotesChars) : "";

  const completedLessons = Array.isArray(body.completedLessons)
    ? body.completedLessons.slice(0, AI_LIMITS.maxArrayItems).map((s: any) => sanitizeText(s, 60)).filter(Boolean)
    : [];

  const completedLabs = Array.isArray(body.completedLabs)
    ? body.completedLabs.slice(0, AI_LIMITS.maxArrayItems).map((s: any) => sanitizeText(s, 60)).filter(Boolean)
    : [];

  const earnedBadges = Array.isArray(body.earnedBadges)
    ? body.earnedBadges.slice(0, AI_LIMITS.maxArrayItems).map((s: any) => sanitizeText(s, 60)).filter(Boolean)
    : [];

  const completedProjects = Array.isArray(body.completedProjects)
    ? body.completedProjects.slice(0, AI_LIMITS.maxArrayItems).map((p: any) => ({
        title: sanitizeText(p?.title, 80) || "مشروع تفاعلي",
        category: sanitizeText(p?.category, 40),
        categoryLabel: sanitizeText(p?.categoryLabel, 60),
        score: typeof p?.score === "number" ? Math.min(Math.max(p.score, 0), 100) : 95,
        description: sanitizeText(p?.description, 150),
      }))
    : [];

  return {
    isValid: true,
    sanitizedData: {
      studentName,
      level,
      xp,
      streakDays,
      completedLessons,
      completedLabs,
      completedProjects,
      earnedBadges,
      totalChatMessages,
      language,
      parentNotes,
    },
  };
}
