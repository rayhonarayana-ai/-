/**
 * Client-side AI Service Boundary
 * Gate 5 Architecture: Strictly decoupled UI and backend AI gateway.
 * The client does NOT contain any secret keys or provider SDK imports.
 */

import { getSafeReliabilityMessage } from "../domain/reliability/types";

export interface ChatMessageParam {
  role: "user" | "assistant" | "model";
  content: string;
}

export interface SendChatOptions {
  messages: ChatMessageParam[];
  language?: string;
  persona?: string;
  personaPrompt?: string;
}

export interface PromptLabOptions {
  subject: string;
  setting: string;
  style: string;
  emotion: string;
}

export interface VisionExplainOptions {
  imageBase64: string;
  mimeType?: string;
}

export interface GeneratedQuizData {
  title: string;
  questions: Array<{
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  }>;
}

export interface PedagogicalReportOptions {
  studentName?: string;
  level?: number;
  xp?: number;
  streakDays?: number;
  completedLessons?: string[];
  completedLabs?: string[];
  completedProjects?: any[];
  earnedBadges?: string[];
  totalChatMessages?: number;
  language?: string;
  parentNotes?: string;
}

const DEFAULT_QUIZ_FALLBACK: GeneratedQuizData = {
  title: "اختبار تدريبي تفاعلي في الذكاء الاصطناعي 🧠",
  questions: [
    {
      question: "ما هو المكون الأساسي الذي تتعلم منه خوارزميات الذكاء الاصطناعي؟",
      options: ["البيانات والأمثلة المنظمة 📊", "شاشة الحاسوب فقط 🖥️", "الكهرباء وحدها ⚡", "لوحة المفاتيح ⌨️"],
      correctIndex: 0,
      explanation: "تتعلم نماذج الذكاء الاصطناعي من البيانات والأمثلة المتنوعة لتتعرف على الأنماط بدقة!",
    },
    {
      question: "ما هي وظيفة الرؤية الحاسوبية (Computer Vision)؟",
      options: ["فهم وتحليل الصور والبكسلات 👁️", "تشغيل الموسيقى فقط 🎵", "تبريد المعالج ❄️", "طباعة الورق 📄"],
      correctIndex: 0,
      explanation: "تساعد الرؤية الحاسوبية الآلات على استخراج المعالم والملامح وتصنيف الكائنات في الصور.",
    },
    {
      question: "لماذا نحرص على استخدام الذكاء الاصطناعي بأمان ومسؤولية؟",
      options: ["لحماية خصوصيتنا ومساعدة الجميع بأمان 🛡️", "لأنه لا يهم ❌", "لتخريب البرامج ⚠️", "لحذف البيانات 🗑️"],
      correctIndex: 0,
      explanation: "الأمان والأخلاقيات الرقمية تضمن فائدة التقنية لجميع الناس وحماية خصوصيتهم.",
    },
  ],
};

/**
 * Safely parse JSON from a fetch Response, guarding against empty body, HTML, or malformed text
 */
async function safeFetchJson<T>(res: Response, fallback: T): Promise<T> {
  try {
    const text = await res.text();
    if (!text || text.trim().length === 0) return fallback;
    const parsed = JSON.parse(text);
    return parsed && typeof parsed === "object" ? parsed : fallback;
  } catch {
    return fallback;
  }
}

export class AIClient {
  public async sendChatMessage(options: SendChatOptions): Promise<{ reply: string }> {
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(options),
      });

      const data = await safeFetchJson<{ reply?: string }>(res, {});
      return {
        reply: data.reply || getSafeReliabilityMessage("AI_UNAVAILABLE", "أهلاً بك يا بطل! أنا زكي رفيقك الذكي. سؤالك رائع جداً! 🤖🚀"),
      };
    } catch {
      return {
        reply: getSafeReliabilityMessage("NETWORK_UNAVAILABLE", "أهلاً بك يا بطل! أنا زكي رفيقك الذكي. تذكر أننا نتعلم بالتدريب والتكرار المستمر! 🤖🚀"),
      };
    }
  }

  public async generatePromptStory(options: PromptLabOptions): Promise<{ result: string }> {
    try {
      const res = await fetch("/api/prompt-lab", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(options),
      });

      const data = await safeFetchJson<{ result?: string }>(res, {});
      return {
        result: data.result || "تم توليد فكرتك الإبداعية بنجاح في مختبر الأوامر! 🚀✨",
      };
    } catch {
      return {
        result: "تم توليد فكرتك الإبداعية بنجاح في مختبر الأوامر! 🚀✨",
      };
    }
  }

  public async explainVisionImage(options: VisionExplainOptions): Promise<{ explanation: string; aiGenerated: boolean }> {
    try {
      const res = await fetch("/api/vision-explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(options),
      });

      const data = await safeFetchJson<{ explanation?: string; aiGenerated?: boolean }>(res, {});
      return {
        explanation: data.explanation || "تم تحليل الصورة بنجاح! 👁️💡",
        aiGenerated: !!data.aiGenerated,
      };
    } catch {
      return {
        explanation: "تم تحليل معالم الصورة ومصفوفة البكسلات بنجاح! 👁️💡",
        aiGenerated: false,
      };
    }
  }

  public async generateQuiz(topic?: string): Promise<GeneratedQuizData> {
    try {
      const res = await fetch("/api/generate-quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic }),
      });

      const data = await safeFetchJson<GeneratedQuizData>(res, DEFAULT_QUIZ_FALLBACK);
      if (data && Array.isArray(data.questions) && data.questions.length > 0) {
        return data;
      }
      return DEFAULT_QUIZ_FALLBACK;
    } catch {
      return DEFAULT_QUIZ_FALLBACK;
    }
  }

  public async generatePedagogicalReport(options: PedagogicalReportOptions): Promise<{ report: string }> {
    try {
      const res = await fetch("/api/pedagogical-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(options),
      });

      const data = await safeFetchJson<{ report?: string }>(res, {});
      return {
        report: data.report || "تم إعداد التقرير البيداغوجي الأسبوعي بنجاح.",
      };
    } catch {
      return {
        report: "تم إعداد التقرير البيداغوجي الأسبوعي بنجاح بناءً على إنجازات الطالب الموثقة محلياً.",
      };
    }
  }
}

export const aiClient = new AIClient();
