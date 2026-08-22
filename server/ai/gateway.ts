/**
 * Server AI Gateway - Central Orchestrator
 * Gate 5 Architecture: Validated pipeline, safety boundaries, fallback execution.
 */

import { Type } from "@google/genai";
import {
  AIProvider,
  GatewayResult,
  ChatRequestPayload,
  PromptLabPayload,
  VisionExplainPayload,
  QuizGenerationPayload,
  GeneratedQuiz,
  PedagogicalReportPayload,
} from "./types.js";
import { defaultGeminiProvider } from "./provider.js";
import { aiRateLimiter } from "./rateLimiter.js";
import { AI_LIMITS } from "./limits.js";
import {
  composeSystemInstruction,
  PEDAGOGICAL_REPORT_SYSTEM_PROMPT,
  ZAKI_BASE_PERSONA,
  BASE_CHILD_SAFETY_RULES,
} from "./safety.js";
import {
  validateChatInput,
  validatePromptLabInput,
  validateVisionInput,
  validateQuizInput,
  validateQuizOutput,
  validatePedagogicalReportInput,
} from "./validation.js";

export class AIGateway {
  constructor(private provider: AIProvider = defaultGeminiProvider) {}

  /**
   * Handle Chat with Zaki
   */
  public async handleChat(
    body: any,
    clientIp: string,
    requestId?: string
  ): Promise<GatewayResult<{ reply: string }>> {
    const reqId = requestId || `req-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
    const startTime = Date.now();

    // 1. Rate Limit
    const rateCheck = aiRateLimiter.checkLimit(clientIp, "chat");
    if (!rateCheck.allowed) {
      return {
        success: false,
        requestId: reqId,
        error: {
          category: "RATE_LIMITED",
          message: "Too many chat requests.",
          safeUserMessage: "مهلاً يا بطل! خذ نفساً عميقاً للحظات قبل إرسال سؤالك التالي! ⏳😊",
          retryAfterSeconds: rateCheck.retryAfterSeconds,
        },
        fallbackData: {
          reply: "مهلاً يا بطل! خذ نفساً عميقاً للحظات قبل إرسال سؤالك التالي! ⏳😊",
        },
        aiGenerated: false,
      };
    }

    // 2. Input Validation
    const validation = validateChatInput(body);
    if (!validation.isValid || !validation.sanitizedData) {
      return {
        success: false,
        requestId: reqId,
        error: {
          category: "INVALID_INPUT",
          message: validation.errorMessage || "Invalid chat payload",
          safeUserMessage: "عذراً يا صديقي، يرجى كتابة رسالتك بشكل واضح للمساعد زكي! 🤖",
        },
        fallbackData: {
          reply: "عذراً يا صديقي، يرجى كتابة رسالتك بشكل واضح للمساعد زكي! 🤖",
        },
        aiGenerated: false,
      };
    }

    const { messages, language, persona, personaPrompt } = validation.sanitizedData;

    // 3. Server-authoritative System Instruction
    const systemInstruction = composeSystemInstruction({
      persona,
      personaPrompt,
      language,
    });

    // 4. Format contents
    const contents = messages.map((m) => ({
      role: m.role === "user" ? "user" : "model",
      parts: [{ text: m.content }],
    }));

    // 5. Provider Call with Fallback
    try {
      const response = await this.provider.generate({
        task: "chat",
        contents,
        systemInstruction,
        temperature: AI_LIMITS.defaultTemperature,
        preferredModel: "gemini-3.7-flash",
        requestId: reqId,
      });

      const reply = response.text?.trim() || this.getChatFallback(messages, language);
      return {
        success: true,
        requestId: reqId,
        data: { reply },
        aiGenerated: true,
        metadata: {
          latencyMs: response.latencyMs,
          modelUsed: response.modelUsed,
          attempts: 1,
        },
      };
    } catch (err: any) {
      const fallbackReply = this.getChatFallback(messages, language);
      return {
        success: false,
        requestId: reqId,
        error: {
          category: "AI_UNAVAILABLE",
          message: err?.message || "AI unavailable",
          safeUserMessage: fallbackReply,
        },
        fallbackData: { reply: fallbackReply },
        aiGenerated: false,
        metadata: {
          latencyMs: Date.now() - startTime,
          attempts: 2,
        },
      };
    }
  }

  /**
   * Handle Prompt Lab (Little Prompt Engineer)
   */
  public async handlePromptLab(
    body: any,
    clientIp: string,
    requestId?: string
  ): Promise<GatewayResult<{ result: string }>> {
    const reqId = requestId || `req-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
    const startTime = Date.now();

    const rateCheck = aiRateLimiter.checkLimit(clientIp, "prompt_lab");
    if (!rateCheck.allowed) {
      return {
        success: false,
        requestId: reqId,
        error: {
          category: "RATE_LIMITED",
          message: "Too many prompt lab requests.",
          safeUserMessage: "يرجى الانتظار قليلاً قبل تجربة أمر جديد في المختبر! ⏳✨",
          retryAfterSeconds: rateCheck.retryAfterSeconds,
        },
        fallbackData: {
          result: "يرجى الانتظار قليلاً قبل تجربة أمر جديد في المختبر! ⏳✨",
        },
        aiGenerated: false,
      };
    }

    const validation = validatePromptLabInput(body);
    if (!validation.isValid || !validation.sanitizedData) {
      return {
        success: false,
        requestId: reqId,
        error: {
          category: "INVALID_INPUT",
          message: validation.errorMessage || "Invalid prompt lab input",
          safeUserMessage: "يرجى ملء تفاصيل الأمر بأسلوب سليم ومناسب! 💡",
        },
        aiGenerated: false,
      };
    }

    const { subject, setting, style, emotion } = validation.sanitizedData;
    const promptText = `أنت صانع أفكار الذكاء الاصطناعي للأطفال. قام الطفل بتركيب الأوامر التالية:
- الموضوع: ${subject}
- المكان: ${setting}
- الأسلوب/الشكل: ${style}
- الشعور: ${emotion}

قم بتوليد استجابة ممتعة وقصيرة من فقرتين (قصة ملهمة أو وصف كرتوني مبهر) تظهر للطفل كيف استجاب الذكاء الاصطناعي لأوامره المحددة، ثم اشرح له بأسلوب مبسط كيف ساعدته هذه التفاصيل في إعطاء النتيجة الدقيقة!`;

    try {
      const response = await this.provider.generate({
        task: "prompt_lab",
        contents: promptText,
        systemInstruction: `${ZAKI_BASE_PERSONA}\n\n${BASE_CHILD_SAFETY_RULES}`,
        temperature: AI_LIMITS.defaultTemperature,
        preferredModel: "gemini-3.7-flash",
        requestId: reqId,
      });

      return {
        success: true,
        requestId: reqId,
        data: { result: response.text },
        aiGenerated: true,
        metadata: {
          latencyMs: response.latencyMs,
          modelUsed: response.modelUsed,
          attempts: 1,
        },
      };
    } catch (err: any) {
      const fallback = `في مشهد مبهر ${setting}، انطلق ${subject} بروح مليئة بـ ${emotion} ليبتكر ${style} ساحرة!\n\n💡 سر الذكاء الاصطناعي: بفضل تحديدك الدقيق للبطل والمكان والشعور، استطاع النموذج توليد فكرة محددة تماماً كما تخيلتها! 🚀✨`;
      return {
        success: false,
        requestId: reqId,
        error: {
          category: "AI_UNAVAILABLE",
          message: err?.message || "AI unavailable",
          safeUserMessage: fallback,
        },
        fallbackData: { result: fallback },
        aiGenerated: false,
        metadata: {
          latencyMs: Date.now() - startTime,
          attempts: 2,
        },
      };
    }
  }

  /**
   * Handle Vision AI Explanations
   */
  public async handleVisionExplain(
    body: any,
    clientIp: string,
    requestId?: string
  ): Promise<GatewayResult<{ explanation: string; aiGenerated: boolean }>> {
    const reqId = requestId || `req-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
    const startTime = Date.now();

    const rateCheck = aiRateLimiter.checkLimit(clientIp, "vision_explain");
    if (!rateCheck.allowed) {
      return {
        success: false,
        requestId: reqId,
        error: {
          category: "RATE_LIMITED",
          message: "Too many vision requests.",
          safeUserMessage: "يرجى الانتظار للحظات قبل تحليل صورة جديدة! ⏳📷",
          retryAfterSeconds: rateCheck.retryAfterSeconds,
        },
        fallbackData: {
          explanation: "يرجى الانتظار للحظات قبل تحليل صورة جديدة! ⏳📷",
          aiGenerated: false,
        },
        aiGenerated: false,
      };
    }

    const validation = validateVisionInput(body);
    if (!validation.isValid || !validation.sanitizedData) {
      return {
        success: false,
        requestId: reqId,
        error: {
          category: "INVALID_INPUT",
          message: validation.errorMessage || "Invalid image input",
          safeUserMessage: validation.errorMessage || "يرجى اختيار صورة صالحة للتحليل.",
        },
        fallbackData: {
          explanation: validation.errorMessage || "يرجى اختيار صورة صالحة للتحليل.",
          aiGenerated: false,
        },
        aiGenerated: false,
      };
    }

    const { imageBase64, mimeType } = validation.sanitizedData;

    try {
      const imagePart = {
        inlineData: {
          data: imageBase64,
          mimeType: mimeType || "image/jpeg",
        },
      };

      const textPart = {
        text: `أنت معلم الذكاء الاصطناعي للأطفال. حلل هذه الصورة واشرح للطفل كيف رآها الكمبيوتر عبر "رؤية الكمبيوتر" (Computer Vision):
1. ما هي الأشياء والألوان الأساسية التي اكتشفها الذكاء الاصطناعي؟
2. كيف تمكنت الخوارزمية من تمييز الأشكال والحدود (Edges)؟
3. إعطاء درجة ثقة تفاعلية (مثال: 98% ثقة بوجود قطة).
4. كلمة تشجيعية للطفل بأسلوب مبسط وشيق باللغة العربية مع إيموجيز!`,
      };

      const response = await this.provider.generate({
        task: "vision_explain",
        contents: [
          {
            role: "user",
            parts: [imagePart, textPart],
          },
        ],
        systemInstruction: `${ZAKI_BASE_PERSONA}\n\n${BASE_CHILD_SAFETY_RULES}`,
        temperature: AI_LIMITS.defaultTemperature,
        preferredModel: "gemini-3.7-flash",
        requestId: reqId,
      });

      return {
        success: true,
        requestId: reqId,
        data: { explanation: response.text, aiGenerated: true },
        aiGenerated: true,
        metadata: {
          latencyMs: response.latencyMs,
          modelUsed: response.modelUsed,
          attempts: 1,
        },
      };
    } catch (err: any) {
      const fallbackText = "تعذر تشغيل تحليل الذكاء الاصطناعي السحابي للصورة حالياً بسبب انشغال مؤقت في الخادم. يمكنك استكشاف مصفوفة الحواف والألوان بالضغط على زر 'عرض خطوط الحواف' للتجربة البصرية المباشرة! 👁️💡";
      return {
        success: false,
        requestId: reqId,
        error: {
          category: "AI_UNAVAILABLE",
          message: err?.message || "AI vision unavailable",
          safeUserMessage: fallbackText,
        },
        fallbackData: {
          explanation: fallbackText,
          aiGenerated: false,
        },
        aiGenerated: false,
        metadata: {
          latencyMs: Date.now() - startTime,
          attempts: 2,
        },
      };
    }
  }

  /**
   * Handle Dynamic Quiz Generation
   */
  public async handleQuizGeneration(
    body: any,
    clientIp: string,
    requestId?: string
  ): Promise<GatewayResult<GeneratedQuiz>> {
    const reqId = requestId || `req-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
    const startTime = Date.now();

    const rateCheck = aiRateLimiter.checkLimit(clientIp, "quiz_generation");
    if (!rateCheck.allowed) {
      const fallback = this.getQuizFallback("الذكاء الاصطناعي");
      return {
        success: false,
        requestId: reqId,
        error: {
          category: "RATE_LIMITED",
          message: "Too many quiz generation requests.",
          safeUserMessage: "يرجى الانتظار قليلاً قبل توليد اختبار جديد.",
          retryAfterSeconds: rateCheck.retryAfterSeconds,
        },
        fallbackData: fallback,
        aiGenerated: false,
      };
    }

    const validation = validateQuizInput(body);
    const topic = validation.sanitizedData?.topic || "الذكاء الاصطناعي";

    try {
      const response = await this.provider.generate({
        task: "quiz_generation",
        contents: `أنشئ اختباراً تفاعلياً مبسطاً من 3 أسئلة للأطفال عن موضوع: "${topic}". يجب أن ترجع النتيجة بتنسيق JSON حصري يحتوي على قائمة أسئلة.`,
        systemInstruction: `${ZAKI_BASE_PERSONA}\n\n${BASE_CHILD_SAFETY_RULES}`,
        temperature: AI_LIMITS.structuredTemperature,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING, description: "عنوان الاختبار" },
            questions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  question: { type: Type.STRING, description: "نص السؤال بأسلوب ممتع للأطفال" },
                  options: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: "4 خيارات إجابة",
                  },
                  correctIndex: { type: Type.INTEGER, description: "رقم الإجابة الصحيحة (0 إلى 3)" },
                  explanation: { type: Type.STRING, description: "شرح مشجع ولطيف للإجابة الصحيحة" },
                },
                required: ["question", "options", "correctIndex", "explanation"],
              },
            },
          },
          required: ["title", "questions"],
        },
        preferredModel: "gemini-3.7-flash",
        requestId: reqId,
      });

      const validatedQuiz = validateQuizOutput(response.text);
      if (validatedQuiz) {
        return {
          success: true,
          requestId: reqId,
          data: validatedQuiz,
          aiGenerated: true,
          metadata: {
            latencyMs: response.latencyMs,
            modelUsed: response.modelUsed,
            attempts: 1,
          },
        };
      }

      throw new Error("INVALID_AI_RESPONSE: Generated quiz output did not match expected schema.");
    } catch (err: any) {
      const fallback = this.getQuizFallback(topic);
      return {
        success: false,
        requestId: reqId,
        error: {
          category: err?.message?.includes("INVALID_AI_RESPONSE") ? "INVALID_AI_RESPONSE" : "AI_UNAVAILABLE",
          message: err?.message || "AI quiz unavailable",
          safeUserMessage: "تم توفير الاختبار التعليمي بنجاح!",
        },
        fallbackData: fallback,
        aiGenerated: false,
        metadata: {
          latencyMs: Date.now() - startTime,
          attempts: 2,
        },
      };
    }
  }

  /**
   * Handle Pedagogical Weekly Report Generation
   */
  public async handlePedagogicalReport(
    body: any,
    clientIp: string,
    requestId?: string
  ): Promise<GatewayResult<{ report: string }>> {
    const reqId = requestId || `req-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
    const startTime = Date.now();

    const rateCheck = aiRateLimiter.checkLimit(clientIp, "pedagogical_report");
    if (!rateCheck.allowed) {
      const fallback = this.generateFallbackReport(body);
      return {
        success: false,
        requestId: reqId,
        error: {
          category: "RATE_LIMITED",
          message: "Too many pedagogical report requests.",
          safeUserMessage: "يرجى الانتظار قليلاً قبل إعادة إنشاء التقرير.",
          retryAfterSeconds: rateCheck.retryAfterSeconds,
        },
        fallbackData: { report: fallback },
        aiGenerated: false,
      };
    }

    const validation = validatePedagogicalReportInput(body);
    const data = validation.sanitizedData || {};
    const studentName = data.studentName || "البطل المبتكر";
    const language = data.language || "ar_fusha";

    const langMap: Record<string, string> = {
      quadrilingual: "تقديم أربع نسخ كاملة في نفس الرد بالترتيب الحرفي التالي: 1. العربية الفصحى المبسطة، 2. الدارجة المغربية (دارجة طبيعية سلسة)، 3. الفرنسية (أسلوب تربوي دافئ ومهني)، 4. الإنجليزية (Growth Mindset style).",
      trilingual: "تقديم ثلاث نسخ كاملة في نفس الرد بالترتيب التالي: 1. الدارجة المغربية، 2. الفرنسية، 3. الإنجليزية.",
      ar_fusha: "اللغة العربية الفصحى المبسطة والدافئة",
      ar_darija: "الدارجة المغربية الطبيعية والمفهومة دون ترجمة حرفية",
      berber_tifinagh: "اللغة الأمازيغية بحروف تيفيناغ الاصيلة (Tifinagh)",
      berber_latin: "اللغة الأمازيغية بالحروف اللاتينية المفهومة (Amazigh/Tamazight)",
      fr: "اللغة الفرنسية (Français) بأسلوب بيداغوجي مشجع",
      en: "اللغة الإنجليزية (English) بأسلوب مشجع وعقلية النمو",
    };

    const targetLangDesc = langMap[language] || langMap.quadrilingual;

    const projectsText = Array.isArray(data.completedProjects) && data.completedProjects.length > 0
      ? data.completedProjects.map((p) => `• ${p.title} (${p.categoryLabel || p.category || ""}) بدقة ${p.score || 95}% - ${p.description || ""}`).join("\n")
      : "استكشف نماذج وأدوات مختبر الذكاء الاصطناعي بنجاح.";

    const promptText = `قم بتوليد تقرير أسبوعي بيداغوجي لولي أمر الطفل بناءً على البيانات التالية:

بيانات الطفل لهذا الأسبوع:
- اسم الطفل: ${studentName}
- المستوى الحالي: ${data.level || 1} (مجموع النقاط: ${data.xp || 0} XP)
- أيام التعلم المتتالية (Streak): ${data.streakDays || 1} أيام
- الدروس المكتملة: ${data.completedLessons?.length ? data.completedLessons.join(", ") : "بدأ في استكشاف الدروس التفاعلية"}
- المشاريع العملية المنجزة في محفظة الذكاء الاصطناعي (AI Portfolio):
${projectsText}
- التجارب العملية في المختبر: ${data.completedLabs?.length ? data.completedLabs.join(", ") : "جرب أدوات المختبر بفضول وشغف"}
- الأوسمة والشارات المكتسبة: ${data.earnedBadges?.length ? data.earnedBadges.join(", ") : "وسام الاستكشاف الأول"}
- عدد الأسئلة والمحادثات مع زكي: ${data.totalChatMessages || 0} محادثة تفاعلية
- ملاحظات/تفضيلات ولي الأمر: ${data.parentNotes || "لا توجد ملاحظات إضافية"}

الخيار المطلوب للغات: ${targetLangDesc}

التزم بنسبة 100% بالهيكل البيداغوجي الصارم التالي لكل لغة/نسخة:

**ملخص الأسبوع**
(جملة إيجابية رئيسية + تقييم عام: ممتاز / جيد جدًا / تقدم ملحوظ)

**ماذا تعلم طفلك هذا الأسبوع؟**
- المفاهيم الأساسية بلغة بسيطة
- المشاريع أو التجارب التي أنجزها
- المهارات التي طورها

**نقاط القوة التي برزت**
(2 إلى 4 نقاط محددة مع أمثلة)

**مجالات يمكن دعمها بلطف**
(صياغة إيجابية فقط)

**اقتراحات عملية للمنزل**
(3 إلى 5 اقتراحات قصيرة وواقعية)

**ملاحظات المعلم**
(ملاحظات مختصرة من منظور تربوي من 2-3 جمل تركز على ملاحظة سلوكية أو مهارية + توصية عملية قصيرة بأسلوب مهني دافئ)

**نظرة على الأسبوع القادم**
(ما سيركز عليه زكي + كيف يمكن للوالد المشاركة)`;

    try {
      const response = await this.provider.generate({
        task: "pedagogical_report",
        contents: promptText,
        systemInstruction: `${PEDAGOGICAL_REPORT_SYSTEM_PROMPT}\n\n${BASE_CHILD_SAFETY_RULES}`,
        temperature: AI_LIMITS.reportTemperature,
        preferredModel: "gemini-3.7-flash",
        requestId: reqId,
      });

      if (response.text && response.text.trim().length > 50) {
        return {
          success: true,
          requestId: reqId,
          data: { report: response.text },
          aiGenerated: true,
          metadata: {
            latencyMs: response.latencyMs,
            modelUsed: response.modelUsed,
            attempts: 1,
          },
        };
      }
      throw new Error("Empty report output received from provider.");
    } catch (err: any) {
      const fallbackReport = this.generateFallbackReport(data);
      return {
        success: false,
        requestId: reqId,
        error: {
          category: "AI_UNAVAILABLE",
          message: err?.message || "AI pedagogical report unavailable",
          safeUserMessage: "تم إعداد التقرير البيداغوجي بنجاح.",
        },
        fallbackData: { report: fallbackReport },
        aiGenerated: false,
        metadata: {
          latencyMs: Date.now() - startTime,
          attempts: 2,
        },
      };
    }
  }

  // --- Helpers for Fallbacks ---

  private getChatFallback(messages: any[], language?: string): string {
    const lastUserMsg = messages?.filter((m: any) => m.role === "user").slice(-1)[0]?.content || "";
    if (language === "darija") {
      return `مرحباً بيك أ صاحبي! سؤالك زوين بزاف بخصوص "${lastUserMsg.slice(0, 30)}"! الذكاء الاصطناعي بحال شي عقل إلكتروني كيتعلم من البيانات والتجارب. جرب تكتاشف المختبرات باش تفهم أكثر! 🚀✨`;
    }
    if (language === "fr") {
      return "Salut mon ami(e) ! C'est une excellente question sur l'intelligence artificielle ! L'IA apprend grâce aux données et aux algorithmes pour nous aider à inventer l'avenir ! 🚀💡";
    }
    if (language === "en") {
      return "Hello my friend! That is a super question! AI learns from patterns and data just like we practice sports and math. Keep exploring with curiosity! 🚀🌟";
    }
    return "أهلاً بك يا بطل! أنا زكي رفيقك الذكي. سؤالك رائع جداً، وتذكر أن الذكاء الاصطناعي يتعلم من التجربة والتكرار والبيانات تماماً كما نتعلم نحن بالتدريب المستمر! 🤖🚀";
  }

  private getQuizFallback(topic?: string): GeneratedQuiz {
    return {
      title: `تحدي الأذكياء الصغار: ${topic || "الذكاء الاصطناعي"} 🧠⚡`,
      questions: [
        {
          question: "كيف يتعلم الذكاء الاصطناعي تمييز الأشياء؟",
          options: ["بالتخمين العشوائي فقط", "بتدريب النماذج على الكثير من البيانات والأمثلة", "بقراءة الأفكار سحرياً", "بدون أي بيانات"],
          correctIndex: 1,
          explanation: "أحسنت! يتعلم الذكاء الاصطناعي تماماً مثلنا من خلال كثرة الأمثلة والبيانات والتدريب المستمر! 🌟",
        },
        {
          question: "ما هي رؤية الكمبيوتر (Computer Vision)؟",
          options: ["نظارة يرتديها الحاسوب", "قدرة الحاسوب على فهم الصور ومصفوفة البكسلات", "شاشة التلفاز", "كاميرا معطلة"],
          correctIndex: 1,
          explanation: "ممتاز! رؤية الكمبيوتر هي خوارزميات ذكية تفكك الصور إلى بكسلات وأشكال واضحة! 👁️",
        },
        {
          question: "ما هو التصرف الصحيح عند استخدام برامج الذكاء الاصطناعي؟",
          options: ["مشاركة أسرار المنزل", "عدم إخبار الوالدين", "الحفاظ على الخصوصية والأمان واستخدامها بصدق وإبداع", "تصديق كل صورة دون تفكير"],
          correctIndex: 2,
          explanation: "بطل حقيقي! حماية الخصوصية والأمان الرقمي هما علامة المبتكر الذكي والمسؤول! 🛡️✨",
        },
      ],
    };
  }

  public generateFallbackReport(data: any): string {
    const name = data.studentName || "طفلكم المبتكر";
    const lang = data.language;
    const streakDays = data.streakDays || 1;
    const xp = data.xp || 0;

    if (lang === "quadrilingual" || lang === "trilingual") {
      const fusha = `=== 1. النسخة بالعربية الفصحى المبسطة (🇸🇦) ===

**ملخص الأسبوع**
أظهر ${name} هذا الأسبوع شغفاً كبيراً وفضولاً راقياً في استكشاف الذكاء الاصطناعي، وخطا خطوات واثقة في فهم العالم الرقمي! (التقييم العام: تقدم ممتاز وواكاد 🌟)

**ماذا تعلم طفلك هذا الأسبوع؟**
- فهم المباديء الأساسية للذكاء الاصطناعي وكيف تتعلم الآلات من البيانات بذكاء.
- خوض تجارب عملية تفاعلية في المختبر للتعامل مع النماذج الرقمية والرؤية البصرية.
- تطوير مهارات التفكير المنطقي وصياغة الأسئلة الذكية بأسلوب منهجي.

**نقاط القوة التي برزت**
- ابتكار ومواظبة عالية بالاستمرار للتعلم طوال ${streakDays} أيام متتالية.
- اكتساب ${xp} نقطة خبرة بفضل الشغف والاجتهاد المتواصل.
- تواصل ذكي ومحترم مع المساعد زكي أظهر روحاً إيجابية وعقلية نمو واعدة.

**مجالات يمكن دعمها بلطف**
- تشجيع ${name} على أخذ استراحات قصيرة ومنتظمة لترسيخ الفهم واكتساب أقصى فائدة من الدرس.

**اقتراحات عملية للمنزل**
- تخصيص 5 دقائق يومياً للاستماع إلى ${name} وهو يشرح فكرة جديدة تعلمها.
- الثناء والتشجيع الإيجابي عند حصوله على شارات وأوسمة إنجاز جديدة.
- مناقشة تطبيقات الذكاء الاصطناعي في حياتنا اليومية بأسلوب تفاعلي ممتع.

**ملاحظات المعلم**
يُظهر ${name} استيعاباً سريعاً وقدرة ممتازة على ربط المفاهيم المنطقية بالحلول العملية. يُوصى بالاستمرار في تشجيعه على شرح أفكاره بصوت عالٍ لتعزيز مهارات التواصل والتفكير التجريدي لديه.

**نظرة على الأسبوع القادم**
سيركز زكي في الأسبوع القادم على تعميق مفاهيم الرؤية الحاسوبية والأخلاقيات الرقمية! 🚀`;

      const darija = `=== 2. النسخة بالدارجة المغربية (🇲🇦) ===

**ملخص الأسبوع**
أظهر ${name} هاد الأسبوع فضول كبير وتفاعل ممتاز مع منصة الذكاء الاصطناعي، وخطى خطوات واثقة في فهم العالم الرقمي! (التقييم العام: تقدم ملحوظ وجميل جداً 🌟)

**ماذا تعلم طفلك هذا الأسبوع؟**
- فهم مبسط لمفاهيم الذكاء الاصطناعي وكيفاش كيتعلم الكمبيوتر من البيانات.
- تجربة أدوات تفاعلية ف المختبر بحال تدريب النموذج وتصميم الأوامر الذكية.
- تطوير مهارة التفكير المنطقي وطرح الأسئلة الذكية مع المساعد زكي.

**نقاط القوة التي برزت**
- أظهر ${name} رغبة كبيرة ف الاكتشاف والاستمرار لـ ${streakDays} أيام متتالية.
- قدر يجمع ${xp} نقطة XP بفضل الإصرار والتفاعل الايجابي.
- حوارات ذكية ومحترمة مع زكي أظهرت طاقة إبداعية عالية.

**مجالات يمكن دعمها بلطف**
- يمكننا مساعدة ${name} على أخذ استراحات قصيرة بين الدروس لتثبيت الفهم والاستمتاع أكثر بالتعلم.

**اقتراحات عملية للمنزل**
- تخصيص 5 دقائق يومياً للحديث مع ${name} عن أكثر شيء أعجبه ف درس اليوم.
- التفكير معاً ف فكرة مشروع بسيط يمكن للذكاء الاصطناعي مساعدتنا فيه.
- تشجيع ${name} بكلمات دافئة عند الحصول على أوسمة جديدة.

**ملاحظات المعلم**
كيظهر ${name} تركيز عالي ورغبة كبيرة ف الفهم والتحليل التفاعلي مع كل درس جديد. كنزكيو تشجيعه باش يعاود للدار شنو تعلم بكلماته الخاصة باش يرسخ المفاهيم أكثر.

**نظرة على الأسبوع القادم**
سيركز زكي ف الأسبوع القادم على تعميق مفاهيم الرؤية الحاسوبية والأخلاقيات الرقمية! 🚀`;

      const french = `=== 3. النسخة بالفرنسية (🇫🇷) ===

**ملخص الأسبوع**
${name} a fait preuve d'une curiosité remarquable et d'un engagement très positif cette semaine ! (Évaluation globale: Progrès très remarquables 🌟)

**ماذا تعلم طفلك هذا الأسبوع؟**
- Compréhension des concepts de base de l'intelligence artificielle.
- Expérimentation pratique dans les laboratoires d'IA (Prompts, modèles, vision).
- Développement de la pensée logique et de la formulation de questions structurées.

**نقاط القوة التي برزت**
- Ténacité et régularité impressionnantes avec ${streakDays} jours consécutifs.
- Acquisition enthousiaste de ${xp} XP grâce à son travail et sa curiosité.
- Esprit créatif et respectueux lors des échanges avec le compagnon Zaki.

**مجالات يمكن دعمها بلطف**
- Nous pouvons encourager ${name} à faire de petites pauses régulières pour bien consolider chaque nouvelle notion.

**اقتراحات عملية للمنزل**
- Consacrer 5 à 10 minutes par jour pour écouter ${name} expliquer ce qu'il/elle a découvert.
- Féliciter chaleureusement l'effort et la persévérance lors du déblocage de badges.
- Poser des questions ouvertes sur l'utilité des robots et de l'IA dans la vie quotidienne.

**ملاحظات المعلم**
${name} fait preuve d'une excellente capacité d'analyse et d'une grande autonomie dans ses réflexions. Nous recommandons de continuer à l'encourager à exprimer ses idées à voix haute pour développer sa confiance.

**نظرة على الأسبوع القادم**
Zaki accompagnera ${name} vers l'exploration de l'éthique de l'IA et de la vision par ordinateur ! 🚀`;

      const english = `=== 4. النسخة بالإنجليزية (🇬🇧) ===

**ملخص الأسبوع**
${name} showed wonderful curiosity and active engagement with AI concepts this week! (Overall Assessment: Excellent Progress 🌟)

**ماذا تعلم طفلك هذا الأسبوع؟**
- Core foundational concepts of how AI models learn from patterns and data.
- Hands-on experimentation with prompt engineering and machine vision labs.
- Problem-solving skills and asking thoughtful questions with Zaki.

**نقاط القوة التي برزت**
- Remarkable consistency learning for ${streakDays} consecutive days.
- Earned ${xp} XP through dedicated effort and active exploration.
- Great curiosity and positive growth mindset during interactive sessions.

**مجالات يمكن دعمها بلطف**
- We can gently support ${name} by encouraging short relaxing breaks between modules to enhance long-term retention.

**اقتراحات عملية للمنزل**
- Spend 5-10 minutes asking ${name} to share their favorite AI experiment of the day.
- Praise effort and curiosity rather than just final scores.
- Explore everyday technology together at home in a fun, interactive way.

**ملاحظات المعلم**
${name} demonstrates impressive critical thinking skills and active problem-solving during interactive exercises. We encourage continuing to foster their confidence by praising their problem-solving process.

**نظرة على الأسبوع القادم**
Zaki will guide ${name} through computer vision and digital safety modules next week! 🚀`;

      return `${fusha}\n\n${darija}\n\n${french}\n\n${english}`;
    }

    // Standard Arabic Default
    return `**ملخص الأسبوع**
أظهر طفلكم المبدع ${name} هذا الأسبوع فضولاً استثنائياً وتفاعلاً ملهماً مع مفاهيم الذكاء الاصطناعي، وخطا خطوات واثقة في فهم العالم الرقمي بعقلية النمو والابتكار! (التقييم العام: ممتاز وتقدم ملحوظ 🌟)

**ماذا تعلم طفلك هذا الأسبوع؟**
- المفاهيم الأساسية لكيفية استكشاف الذكاء الاصطناعي وتدريب الآلات على تمييز الأشكال.
- التفاعل المباشر مع مختبر التجارب العملية (مهندس الأوامر، رؤية الكمبيوتر، وتدريب النموذج).
- تطوير مهارات التفكير الناقد والمنطقي وصياغة الأسئلة الذكية.

**نقاط القوة التي برزت**
- أظهر ${name} إصراراً ومواظبة عالية بالاستمرار للتعلم لمدة ${streakDays} أيام متتالية.
- حصد ${xp} نقطة XP بفضل شغفه بالمحاولة والتجربة المستمرة.
- أظهر أسلوباً راقياً وفضولاً معبراً خلال حواراته التفاعلية مع المساعد زكي.

**مجالات يمكن دعمها بلطف**
- لاحظنا أن ${name} يحب الغوص عميقاً في التحديات، ويمكننا دعمه بشدة من خلال تشجيعه على أخذ استراحات قصيرة بين الدروس لتثبيت المفاهيم بكل راحة.

**اقتراحات عملية للمنزل**
- تخصيص 5 إلى 10 دقائق يومياً للحديث اللطيف مع ${name} وسؤاله: "ما أغرب شيء اكتشفته مع زكي اليوم؟".
- الاحتفال بالأوسمة الجديدة المكتسبة وتعزيز ثقة الطفل بجهده وإصراره وليس فقط بالنتيجة.
- ربط الذكاء الاصطناعي بالحياة اليومية (مثل التفكير في كيفية مساعدة التكنولوجيا للمستشفيات أو المدارس).

**ملاحظات المعلم**
يُظهر ${name} استيعاباً سريعاً وقدرة ممتازة على ربط المفاهيم المنطقية بالحلول العملية. يُوصى بالاستمرار في تشجيعه على شرح أفكاره بصوت عالٍ لتعزيز مهارات التواصل والتفكير التجريدي لديه.

**نظرة على الأسبوع القادم**
سيركز زكي في الأسبوع القادم على الاستكشاف العملي لأخلاقيات الذكاء الاصطناعي والتطبيق التفاعلي، ويمكن لولي الأمر مشاركة طفله بالاستماع إلى أفكاره الملهمة وتشجيعه دائمًا! 🚀`;
  }
}

export const defaultAIGateway = new AIGateway();
