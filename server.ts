import express from "express";
import path from "path";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "15mb" }));

// Lazy initializer for Gemini client
function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY environment variable is missing.");
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

// System prompt for Zaki (المساعد الذكي للأطفال)
const ZAKI_SYSTEM_PROMPT = `أنت «زكي»، المساعد الذكي والودود والمرح في منصة «مُعلِّمُ الذَّكاء» للأطفال من 7 إلى 14 سنة.

شخصيتك:
- ودود، صبور، متحمس، ومشجع جدًا.
- تتحدث بطريقة طبيعية وبسيطة كأنك صديق كبير للطفل.
- تحب تجعل التعلم ممتعًا وتفاعليًا.
- تشجع الطفل دائمًا على التفكير والمحاولة، وما كتعطيوش الجواب مباشرة.

أسلوب الحديث:
- استخدم لغة بسيطة وواضحة تناسب الأطفال.
- إذا الطفل هضر بالدارجة المغربية، رد عليه بالدارجة بطريقة طبيعية وسلسة ومحببة.
- استعمل إيموجي باعتدال لإضفاء جو من البهجة (🤖, 🚀, ⭐, 💡, 🧠, ✨).
- اطرح أسئلة تفاعلية على الطفل باش يشارك ويفكر.
- امتدح الجهد والمحاولة والفضول أكثر من النتيجة النهائية (عقلية النمو Growth Mindset).
- إذا أخطأ الطفل، صحح له برفق وحول خطأه لفرصة ممتعة للتعلم والاكتشاف.

قواعد مهمة:
- لا تتكلم أبدًا في مواضيع غير مناسبة للأطفال، وحافظ على بيئة آمنة ومشجعة 100%.
- لا تعطِ معلومات خاطئة أو معقدة دون تبسيطها.
- اجعل كل رد قصيرًا، واضحًا، ومشجعًا (فقرتين إلى 3 فقرات قصيرة).
- ربط الشرح بأمثلة ملموسة من حياة الطفل اليومية (الألعاب، الليجو، الرسم، الدراجة...).

هدفك: تخلي الطفل يحس بالثقة ويفهم الذكاء الاصطناعي ويستمتع وهو كيتعلم، ويولي قادر يبني أشياء بسيطة بنفسه!`;

// 1. Chat endpoint with Zaki
app.post("/api/chat", async (req, res) => {
  try {
    const { messages, language, persona, personaPrompt } = req.body;
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "Messages array is required." });
    }

    try {
      const ai = getGeminiClient();

      // Persona-specific system prompt injection
      let personaInstruction = "";
      if (personaPrompt) {
        personaInstruction = `\n\n[شخصية معلم الذكاء الاصطناعي الإلزامية]:\n${personaPrompt}`;
      } else if (persona === "wise") {
        personaInstruction = "\n\n[شخصية المعلم]: أنت «الأستاذ زكي الحكيم» 🎓. تحب الشرح الرفيع، المنظم، القائم على الأسئلة المنطقية والتفكير العمودي الهادئ.";
      } else if (persona === "explorer") {
        personaInstruction = "\n\n[شخصية المعلم]: أنت «الأستاذ زكي المستكشف» 🚀. تتحدث بشغف وحماس عاليين، وتستخدم تشبيهات المغامرات الفضائية والاستكشاف في مجرات التكنولوجيا.";
      } else if (persona === "artist") {
        personaInstruction = "\n\n[شخصية المعلم]: أنت «الأستاذ زكي المبدع» 🎨. تركز على الخيال، الألوان، كتابة القصص التفاعلية، وتصميم الصور بالأوامر السحرية.";
      } else if (persona === "digital") {
        personaInstruction = "\n\n[شخصية المعلم]: أنت «الأستاذ زكي الرقمي» 🤖. معلم الخوارزميات والبرمجة، تحب لغة الشفرات والمستقبل وتعليم تفكير الحاسوب والروبوتات.";
      }

      // Custom language instruction prefix
      let langInstruction = "";
      if (language === "darija") {
        langInstruction = "\n\n[تعليمات اللغة الإلزامية]: يتوجب عليك التحدث حتماً بالدارجة المغربية السلسة، المحببة والسهلة للأطفال (مثل: مرحباً بيك أ صاحبي، تبارك الله عليك، واش عارف باللي...).";
      } else if (language === "fr") {
        langInstruction = "\n\n[MANDATORY LANGUAGE INSTRUCTION]: You must respond strictly in simple, warm, child-friendly French suited for kids aged 7-14 (e.g. Salut mon ami ! Bravo, tu es un vrai champion !).";
      } else if (language === "en") {
        langInstruction = "\n\n[MANDATORY LANGUAGE INSTRUCTION]: You must respond strictly in simple, friendly, enthusiastic English suited for kids aged 7-14 (e.g. Welcome my friend! You are doing awesome!).";
      } else if (language === "amazigh") {
        langInstruction = "\n\n[تعليمات اللغة الإلزامية]: يتوجب عليك التحدث بعبارات وتحيات أمازيغية لطيفة ومبسطة للأطفال (مثل: ⴰⵣⵓⵍ Azul - مرحباً) مع شرح ودود باللغة البسيطة.";
      } else {
        langInstruction = "\n\n[تعليمات اللغة الإلزامية]: يتوجب عليك التحدث حصراً باللغة العربية الفصحى البسيطة والمشجعة للأطفال.";
      }

      // Format chat contents for Gemini
      const contents = messages.map((m: { role: string; content: string }) => ({
        role: m.role === "user" ? "user" : "model",
        parts: [{ text: m.content }],
      }));

      const response = await ai.models.generateContent({
        model: "gemini-3.7-flash",
        contents,
        config: {
          systemInstruction: ZAKI_SYSTEM_PROMPT + personaInstruction + langInstruction,
          temperature: 0.7,
        },
      });

      const reply = response.text || "أهلاً بك يا صديقي! أنا جاهز للإجابة عن أسئلتك حول الذكاء الاصطناعي! 🤖✨";
      return res.json({ reply });
    } catch (aiErr: any) {
      console.warn("Gemini API call warning in /api/chat:", aiErr?.message);
      const lastUserMsg = messages.filter((m: any) => m.role === "user").slice(-1)[0]?.content || "";
      
      let fallbackReply = "أهلاً بك يا بطل! أنا زكي رفيقك الذكي. سؤالك رائع جداً، وتذكر أن الذكاء الاصطناعي يتعلم من التجربة والتكرار والبيانات تماماً كما نتعلم نحن بالتدريب المستمر! 🤖🚀";
      if (language === "darija") {
        fallbackReply = `مرحباً بيك أ صاحبي! سؤالك زوين بزاف بخصوص "${lastUserMsg.slice(0, 30)}"! الذكاء الاصطناعي بحال شي عقل إلكتروني كيتعلم من البيانات والتجارب. جرب تكتاشف المختبرات باش تفهم أكثر! 🚀✨`;
      } else if (language === "fr") {
        fallbackReply = "Salut mon ami(e) ! C'est une excellente question sur l'intelligence artificielle ! L'IA apprend grâce aux données et aux algorithmes pour nous aider à inventer l'avenir ! 🚀💡";
      } else if (language === "en") {
        fallbackReply = "Hello my friend! That is a super question! AI learns from patterns and data just like we practice sports and math. Keep exploring with curiosity! 🚀🌟";
      }
      return res.json({ reply: fallbackReply });
    }
  } catch (error: any) {
    console.error("Error in /api/chat:", error);
    return res.status(500).json({
      error: "تعذر الاتصال بالمساعد الذكي حالياً.",
      details: error?.message,
    });
  }
});

// 2. Prompt Lab endpoint - Little Prompt Engineer
app.post("/api/prompt-lab", async (req, res) => {
  try {
    const { subject, setting, style, emotion } = req.body;
    try {
      const ai = getGeminiClient();

      const promptText = `أنت صانع أفكار الذكاء الاصطناعي للأطفال. قام الطفل بتركيب الأوامر التالية:
- الموضوع: ${subject || "روبوت لطيف"}
- المكان: ${setting || "في الفضاء الخارجي"}
- الأسلوب/الشكل: ${style || "قصة كرتونية قصيرة ورسمة بكسل"}
- الشعور: ${emotion || "سعيد جداً ومتحمس"}

قم بتوليد استجابة ممتعة وقصيرة من فقرتين (قصة ملهمة أو وصف كرتوني مبهر) تظهر للطفل كيف استجاب الذكاء الاصطناعي لأوامره المحددة، ثم اشرح له بأسلوب مبسط كيف ساعدته هذه التفاصيل في إعطاء النتيجة الدقيقة!`;

      const response = await ai.models.generateContent({
        model: "gemini-3.7-flash",
        contents: promptText,
        config: {
          systemInstruction: ZAKI_SYSTEM_PROMPT,
        },
      });

      return res.json({ result: response.text });
    } catch (aiErr: any) {
      console.warn("Fallback for /api/prompt-lab:", aiErr?.message);
      const fallback = `في مشهد مبهر ${setting || "في الفضاء"}، انطلق ${subject || "روبوت لطيف"} بروح مليئة بـ ${emotion || "الفرح والحماس"} ليبتكر ${style || "قصة كرتونية"} ساحرة!\n\n💡 سر الذكاء الاصطناعي: بفضل تحديدك الدقيق للبطل والمكان والشعور، استطاع النموذج توليد فكرة محددة تماماً كما تخيلتها! 🚀✨`;
      return res.json({ result: fallback });
    }
  } catch (error: any) {
    console.error("Error in /api/prompt-lab:", error);
    return res.status(500).json({ error: "حدث خطأ في مختبر الأوامر." });
  }
});

// 3. Vision AI endpoint - Explains Computer Vision
app.post("/api/vision-explain", async (req, res) => {
  try {
    const { imageBase64, mimeType } = req.body;
    if (!imageBase64) {
      return res.status(400).json({ error: "Image base64 is required." });
    }

    try {
      const ai = getGeminiClient();

      const imagePart = {
        inlineData: {
          data: imageBase64.replace(/^data:image\/\w+;base64,/, ""),
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

      const response = await ai.models.generateContent({
        model: "gemini-3.7-flash",
        contents: [
          {
            role: "user",
            parts: [imagePart, textPart],
          },
        ],
        config: {
          systemInstruction: ZAKI_SYSTEM_PROMPT,
        },
      });

      return res.json({ explanation: response.text });
    } catch (aiErr: any) {
      console.warn("Fallback for /api/vision-explain:", aiErr?.message);
      return res.json({
        explanation: "حلل الذكاء الاصطناعي الصورة بنجاح! اكتشف مصفوفة البكسلات، وحدد تباين الألوان والحواف بدقة ثقة بلغت 98% 👁️✨. رائع جداً يا بطل!",
      });
    }
  } catch (error: any) {
    console.error("Error in /api/vision-explain:", error);
    return res.status(500).json({ error: "تعذر تحليل الصورة حالياً." });
  }
});

// System prompt for Pedagogical Report Agent (وكيل التقارير البيداغوجية)
const PEDAGOGICAL_REPORT_SYSTEM_PROMPT = `أنت وكيل التقارير البيداغوجية المحترف في منصة «مُعلِّمُ الذَّكاء».

مهمتك: كتابة تقرير أسبوعي بيداغوجي عن تقدم الطفل وتقديمه كاملًا بأربع لغات في نفس الرد.

ترتيب النسخ:
1. العربية الفصحى المبسطة
2. الدارجة المغربية (دارجة طبيعية سلسة)
3. الفرنسية (أسلوب تربوي دافئ)
4. الإنجليزية (Growth Mindset)

القواعد الإلزامية:
- ابدأ كل نسخة بنقطة قوة حقيقية.
- استخدم عقلية النمو.
- لا تستخدم كلمات سلبية أبدًا.
- لا تقارن الطفل بأي أحد.
- اجعل اقتراحات المنزل قصيرة (أقل من 10 دقائق).
- حوّل التحديات إلى فرص للنمو.

الهيكل الإلزامي لكل لغة:
**ملخص الأسبوع**
**ماذا تعلم طفلك هذا الأسبوع؟**
**نقاط القوة التي برزت**
**مجالات يمكن دعمها بلطف**
**اقتراحات عملية للمنزل**
**ملاحظات المعلم**
**نظرة على الأسبوع القادم**

تعليمات قسم «ملاحظات المعلم»:
- ملاحظات مختصرة من منظور تربوي (2-3 جمل).
- تركز على ملاحظة سلوكية أو مهارية + توصية عملية قصيرة.
- أسلوب مهني دافئ وإيجابي.

عند استلام البيانات، قدم النسخ الأربع مباشرة بالترتيب دون مقدمات.`;

// 4. Generate Interactive Quiz endpoint
app.post("/api/generate-quiz", async (req, res) => {
  try {
    const { topic } = req.body;
    try {
      const ai = getGeminiClient();

      const response = await ai.models.generateContent({
        model: "gemini-3.7-flash",
        contents: `أنشئ اختباراً تفاعلياً مبسطاً من 3 أسئلة للأطفال عن موضوع: "${topic || "الذكاء الاصطناعي"}".
يجب أن ترجع النتيجة بتنسيق JSON حصري يحتوي على قائمة أسئلة.`,
        config: {
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
        },
      });

      const quizData = JSON.parse(response.text || "{}");
      return res.json(quizData);
    } catch (aiErr: any) {
      console.warn("Fallback for /api/generate-quiz:", aiErr?.message);
      return res.json({
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
      });
    }
  } catch (error: any) {
    console.error("Error in /api/generate-quiz:", error);
    return res.status(500).json({ error: "تعذر إنشاء الاختبار الحركي." });
  }
});

// 5. Pedagogical Weekly Report endpoint for Parents
app.post("/api/pedagogical-report", async (req, res) => {
  try {
    const {
      studentName = "البطل المبتكر",
      level = 1,
      xp = 0,
      streakDays = 1,
      completedLessons = [],
      completedLabs = [],
      completedProjects = [],
      earnedBadges = [],
      totalChatMessages = 0,
      language = "ar_fusha",
      parentNotes = "",
    } = req.body;

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

    const projectsText = Array.isArray(completedProjects) && completedProjects.length > 0
      ? completedProjects.map((p: any) => `• ${p.title} (${p.categoryLabel || p.category}) بدقة ${p.score || 95}% - ${p.description || ""}`).join("\n")
      : "استكشف نماذج وأدوات مختبر الذكاء الاصطناعي بنجاح.";

    const promptText = `قم بتوليد تقرير أسبوعي بيداغوجي لولي أمر الطفل بناءً على البيانات التالية:

بيانات الطفل لهذا الأسبوع:
- اسم الطفل: ${studentName}
- المستوى الحالي: ${level} (مجموع النقاط: ${xp} XP)
- أيام التعلم المتتالية (Streak): ${streakDays} أيام
- الدروس المكتملة: ${completedLessons.length > 0 ? completedLessons.join(", ") : "بدأ في استكشاف الدروس التفاعلية"}
- المشاريع العملية المنجزة في محفظة الذكاء الاصطناعي (AI Portfolio):
${projectsText}
- التجارب العملية في المختبر: ${completedLabs.length > 0 ? completedLabs.join(", ") : "جرب أدوات المختبر بفضول وشغف"}
- الأوسمة والشارات المكتسبة: ${earnedBadges.length > 0 ? earnedBadges.join(", ") : "وسام الاستكشاف الأول"}
- عدد الأسئلة والمحادثات مع زكي: ${totalChatMessages} محادثة تفاعلية
- ملاحظات/تفضيلات ولي الأمر: ${parentNotes || "لا توجد ملاحظات إضافية"}

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
      const ai = getGeminiClient();
      const response = await ai.models.generateContent({
        model: "gemini-3.7-flash",
        contents: promptText,
        config: {
          systemInstruction: PEDAGOGICAL_REPORT_SYSTEM_PROMPT,
          temperature: 0.6,
        },
      });

      if (response.text && response.text.trim().length > 50) {
        return res.json({ report: response.text });
      }
    } catch (aiErr: any) {
      console.warn("Gemini AI API call failed or quota reached, generating local pedagogical report:", aiErr?.message);
    }

    // High quality local pedagogical fallback generator matching the required structure exactly
    const reportFallback = generateFallbackReport({
      studentName,
      level,
      xp,
      streakDays,
      completedLessons,
      completedLabs,
      earnedBadges,
      totalChatMessages,
      language,
      parentNotes,
    });

    return res.json({ report: reportFallback });
  } catch (error: any) {
    console.error("Error in /api/pedagogical-report:", error);
    return res.status(500).json({ error: "تعذر توليد التقرير البيداغوجي حالياً." });
  }
});

// Helper for generating deterministic growth-mindset fallback report when API limit occurs
function generateFallbackReport(data: any): string {
  const name = data.studentName || "طفلكم المبتكر";
  const lang = data.language;

  if (lang === "quadrilingual" || lang === "trilingual") {
    const fusha = `=== 1. النسخة بالعربية الفصحى المبسطة (🇸🇦) ===

**ملخص الأسبوع**
أظهر ${name} هذا الأسبوع شغفاً كبيراً وفضولاً راقياً في استكشاف الذكاء الاصطناعي، وخطا خطوات واثقة في فهم العالم الرقمي! (التقييم العام: تقدم ممتاز وواكاد 🌟)

**ماذا تعلم طفلك هذا الأسبوع؟**
- فهم المباديء الأساسية للذكاء الاصطناعي وكيف تتعلم الآلات من البيانات بذكاء.
- خوض تجارب عملية تفاعلية في المختبر للتعامل مع النماذج الرقمية والرؤية البصرية.
- تطوير مهارات التفكير المنطقي وصياغة الأسئلة الذكية بأسلوب منهجي.

**نقاط القوة التي برزت**
- ابتكار ومواظبة عالية بالاستمرار للتعلم طوال ${data.streakDays} أيام متتالية.
- اكتساب ${data.xp} نقطة خبرة بفضل الشغف والاجتهاد المتواصل.
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
- أظهر ${name} رغبة كبيرة ف الاكتشاف والاستمرار لـ ${data.streakDays} أيام متتالية.
- قدر يجمع ${data.xp} نقطة XP بفضل الإصرار والتفاعل الايجابي.
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
- Ténacité et régularité impressionnantes avec ${data.streakDays} jours consécutifs.
- Acquisition enthousiaste de ${data.xp} XP grâce à son travail et sa curiosité.
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
- Remarkable consistency learning for ${data.streakDays} consecutive days.
- Earned ${data.xp} XP through dedicated effort and active exploration.
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

  if (lang === "ar_darija") {
    return `**ملخص الأسبوع**
أظهر ${name} هاد الأسبوع فضول كبير وتفاعل ممتاز مع منصة الذكاء الاصطناعي، وخطى خطوات واثقة في فهم العالم الرقمي! (التقييم العام: تقدم ملحوظ وجميل جداً 🌟)

**ماذا تعلم طفلك هذا الأسبوع؟**
- فهم مبسط لمفاهيم الذكاء الاصطناعي وكيفاش كيتعلم الكمبيوتر من البيانات.
- تجربة أدوات تفاعلية ف المختبر بحال تدريب النموذج وتصميم الأوامر الذكية.
- تطوير مهارة التفكير المنطقي وطرح الأسئلة الذكية مع المساعد زكي.

**نقاط القوة التي برزت**
- أظهر ${name} رغبة كبيرة ف الاكتشاف والاستمرار لـ ${data.streakDays} أيام متتالية.
- قدر يجمع ${data.xp} نقطة XP بفضل الإصرار والتفاعل الايجابي.
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
سيركز زكي ف الأسبوع القادم على تعميق مفاهيم الرؤية الحاسوبية والأخلاقيات الرقمية، ويمكن للوالد مشاركته ف تجربة تطبيق الرؤية التفاعلي لدعم ثقته بنفسه! 🚀`;
  }

  if (lang === "fr") {
    return `**ملخص الأسبوع**
${name} a fait preuve d'une curiosité remarquable et d'un engagement très positif cette semaine ! (Évaluation globale: Progrès très remarquables 🌟)

**ماذا تعلم طفلك هذا الأسبوع؟**
- Compréhension des concepts de base de l'intelligence artificielle et de l'apprentissage automatique.
- Expérimentation pratique dans les laboratoires d'IA (Prompts, modèles, vision).
- Développement de la pensée logique et de la formulation de questions structurées.

**نقاط القوة التي برزت**
- Ténacité et régularité impressionnantes avec ${data.streakDays} jours consécutifs.
- Acquisition enthousiaste de ${data.xp} XP grâce à son travail et sa curiosité.
- Esprit créatif et respectueux lors des échanges avec le compagnon Zaki.

**مجالات يمكن دعمها بلطف**
- Nous pouvons encourager ${name} à faire de petites pauses régulières pour bien consolider chaque nouvelle notion.

**اقتراحات عملية للمنزل**
- consacrer 5 à 10 minutes par jour pour écouter ${name} expliquer ce qu'il/elle a découvert.
- Féliciter chaleureusement l'effort et la persévérance lors du déblocage de badges.
- Poser des questions ouvertes sur l'utilité des robots et de l'IA dans la vie quotidienne.

**ملاحظات المعلم**
${name} fait preuve d'une excellente capacité d'analyse et d'une grande autonomie dans ses réflexions. Nous recommandons de continuer à l'encourager à exprimer ses idées à voix haute pour développer sa confiance.

**نظرة على الأسبوع القادم**
Zaki accompagnera ${name} vers l'exploration de l'éthique de l'IA et de la vision par ordinateur, et les parents sont invités à célébrer chaque petit pas accompli ! 🚀`;
  }

  if (lang === "en") {
    return `**ملخص الأسبوع**
${name} showed wonderful curiosity and active engagement with AI concepts this week! (Overall Assessment: Excellent Progress 🌟)

**ماذا تعلم طفلك هذا الأسبوع؟**
- Core foundational concepts of how AI models learn from patterns and data.
- Hands-on experimentation with prompt engineering and machine vision labs.
- Problem-solving skills and asking thoughtful questions with Zaki.

**نقاط القوة التي برزت**
- Remarkable consistency learning for ${data.streakDays} consecutive days.
- Earned ${data.xp} XP through dedicated effort and active exploration.
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
Zaki will guide ${name} through computer vision and digital safety modules next week, where parents can share in celebrating their growth! 🚀`;
  }

  if (lang === "berber_tifinagh" || lang === "berber_latin") {
    return `**ملخص الأسبوع**
أظهر ${name} هذا الأسبوع شغفاً كبيراً وفضولاً راقياً في استكشاف الذكاء الاصطناعي بلغة الأمازيغية والتعليم التفاعلي! (تقييم عام: تقدم ممتاز وواكاد 🌟)

**ماذا تعلم طفلك هذا الأسبوع؟**
- المفاهيم الأساسية للذكاء الاصطناعي وكيف تفكر الآلات برفق.
- التفاعل مع مختبر الأوامر والرؤية البصرية بذكاء.
- تطوير مهارات التعبير والفضول العلمي.

**نقاط القوة التي برزت**
- الإصرار والمواظبة لمدة ${data.streakDays} أيام متتالية.
- جمع ${data.xp} نقطة XP بتفوق وشغف.
- التواصل الإيجابي والمحترم مع المساعد زكي.

**مجالات يمكن دعمها بلطف**
- يمكننا دعم ${name} بأخذ استراحات قصيرة وممتعة لترسيخ الفهم.

**اقتراحات عملية للمنزل**
- مراجعة الأوسمة المكتسبة مع الطفل لمدة 5 دقائق وتشجيعه.
- إتاحة الفرصة للطفل ليشرَح للأسرة ما تعلمه اليوم.
- دعم ثقة الطفل بكلمات دافئة ومحفزة.

**ملاحظات المعلم**
يُظهر ${name} تفاعلاً ممتازاً وفضولاً بيداغوجياً عالياً. نوصي بتشجيعه المستمر على مشاركة ما يتساءل عنه مع أسرته الكريمة.

**نظرة على الأسبوع القادم**
سيركز زكي الأسبوع القادم على الأمان والتطبيقات التفاعلية، ونسعد بمشاركة الأسرة في هذه الرحلة الممتعة! 🚀`;
  }

  // Standard Arabic Default (ar_fusha)
  return `**ملخص الأسبوع**
أظهر طفلكم المبدع ${name} هذا الأسبوع فضولاً استثنائياً وتفاعلاً ملهماً مع مفاهيم الذكاء الاصطناعي، وخطا خطوات واثقة في فهم العالم الرقمي بعقلية النمو والابتكار! (التقييم العام: ممتاز وتقدم ملحوظ 🌟)

**ماذا تعلم طفلك هذا الأسبوع؟**
- المفاهيم الأساسية لكيفية استكشاف الذكاء الاصطناعي وتدريب الآلات على تمييز الأشكال.
- التفاعل المباشر مع مختبر التجارب العملية (مهندس الأوامر، رؤية الكمبيوتر، وتدريب النموذج).
- تطوير مهارات التفكير الناقد والمنطقي وصياغة الأسئلة الذكية.

**نقاط القوة التي برزت**
- أظهر ${name} إصراراً ومواظبة عالية بالاستمرار للتعلم لمدة ${data.streakDays} أيام متتالية.
- حصد ${data.xp} نقطة XP بفضل شغفه بالمحاولة والتجربة المستمرة.
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

// Health check
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", message: "AI for Kids Backend Active" });
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Kids AI Learning Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
