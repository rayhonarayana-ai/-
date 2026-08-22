import { Badge } from "../types";

export const INITIAL_BADGES: Badge[] = [
  {
    id: "badge-first-step",
    title: "مستكشف مبتدئ",
    description: "أكملت درسك الأول في الذكاء الاصطناعي!",
    icon: "🚀",
    unlocked: true,
    unlockedAt: "اليوم",
    category: "lesson"
  },
  {
    id: "badge-chat-friend",
    title: "صديق ذكي",
    description: "تحدثت مع المساعد الذكي زكي وسألته أسئلة ذكية!",
    icon: "🤖",
    unlocked: false,
    category: "chat"
  },
  {
    id: "badge-trainer",
    title: "مدرب النماذج",
    description: "قمت بتدريب نموذجك الأول واختبار دقته في المختبر!",
    icon: "🎓",
    unlocked: false,
    category: "lab"
  },
  {
    id: "badge-prompt-master",
    title: "مهندس الأوامر الصغير",
    description: "ركبت أوامرك الخاصة وأنتجت قصصاً إبداعية!",
    icon: "🔮",
    unlocked: false,
    category: "lab"
  },
  {
    id: "badge-vision-expert",
    title: "خبير الرؤية الذكية",
    description: "جربت مختبر رؤية الكمبيوتر وحللت الصور!",
    icon: "👁️",
    unlocked: false,
    category: "lab"
  },
  {
    id: "badge-ethics-guardian",
    title: "حارس الأمان الذكي",
    description: "اجتزت تحدي الأخلاقيات والاستخدام الآمن!",
    icon: "🛡️",
    unlocked: false,
    category: "lab"
  },
  {
    id: "badge-master-explorer",
    title: "عالم الذكاء الاصطناعي الصغير",
    description: "أكملت كافة الدروس والمختبرات بنجاح مبهر!",
    icon: "👑",
    unlocked: false,
    category: "master"
  }
];

export const KID_PROMPT_SUGGESTIONS = [
  {
    text: "كيف يستطيع الذكاء الاصطناعي رؤية الصور؟ 📸",
    category: "رؤية الكمبيوتر"
  },
  {
    text: "هل يمكن للروبوت أن يصبح صديقاً للإنسان؟ 🤖",
    category: "علاقات وآلات"
  },
  {
    text: "كيف يتعلم الحاسوب التحدث باللغة العربية؟ 🗣️",
    category: "معالجة اللغة"
  },
  {
    text: "ما هو الفرق بين لعبة عادية ولعبة تعمل بالذكاء الاصطناعي؟ 🎮",
    category: "الألعاب"
  },
  {
    text: "احكِ لي قصة خيالية قصيرة عن روبوت يتعلم الرسم! 🎨",
    category: "قصص وتخيل"
  }
];

import { ttsManager } from "./speech/ttsManager";
import { EnhancedVoiceConfig, VoiceGender } from "./speech/types";

export interface VoiceConfig {
  pitch: number; // 0.7 - 1.5
  rate: number; // 0.7 - 1.3
  voicePreset: "friendly" | "robot" | "teacher" | "adventurer" | "superhero" | "thinker";
  lang: "ar-SA" | "ar-MA" | "fr-FR" | "en-US" | string;
  speedPreset?: "slow" | "normal" | "fast";
  gender?: VoiceGender;
}

export const DEFAULT_VOICE_CONFIG: VoiceConfig = {
  pitch: 1.08, // Warm child-friendly pitch
  rate: 0.85,  // Calm natural child rate (0.82 - 0.88 range)
  voicePreset: "friendly",
  lang: "ar-MA",
  speedPreset: "normal",
  gender: "boy",
};

export const VOICE_PRESETS = [
  {
    id: "friendly",
    name: "زكي الصديق المرح 🎉",
    pitch: 1.08,
    rate: 0.85,
    gender: "boy" as const,
    description: "صوت ودرجة دافئة ومرحة تزرع الحماس والابتسامة للأطفال!",
    icon: "🌟",
    samplePhrase: "مرحباً يا بطل! أنا زكي، صديقك المرح والمستعد لمساعدتك في كل خطوة!",
  },
  {
    id: "girl",
    name: "سلمى الصديقة الذكية 👧",
    pitch: 1.15,
    rate: 0.85,
    gender: "girl" as const,
    description: "صوت فتاة مبدعة لطيف وواضح ومشجع للأطفال في كل المهام!",
    icon: "🌸",
    samplePhrase: "أهلاً يا صديقي! أنا سلمى، سعيدة جداً بالتعلم والابتكار معك اليوم!",
  },
  {
    id: "robot",
    name: "زكي الروبوت المستقبلي 🤖",
    pitch: 0.88,
    rate: 0.88,
    gender: "robot" as const,
    description: "نبرة رقمية هادئة تشبه أبطال التكنولوجيا والمستقبل!",
    icon: "🤖",
    samplePhrase: "تم تفعيل نمط الذكاء الاصطناعي المستقبلي! جاهز لاكتشاف العالم معاً!",
  },
  {
    id: "superhero",
    name: "زكي البطل الخارق ⚡",
    pitch: 1.1,
    rate: 0.95,
    gender: "boy" as const,
    description: "صوت حماسي وقوي يمنح الطفل الشجاعة لاستكشاف المستحيل!",
    icon: "⚡",
    samplePhrase: "يا أبطال المستقبل! لننطلق في مغامرة ذكية خارقة الآن!",
  },
  {
    id: "teacher",
    name: "زكي المعلم المشجع 🎓",
    pitch: 1.0,
    rate: 0.83,
    gender: "teacher" as const,
    description: "صوت هادئ ورصين يساعد على التركيز والفهم الشامل للدروس.",
    icon: "🎓",
    samplePhrase: "أهلاً بك يا صديقي الذكي. دعنا نتعلم شيئاً جديداً وممتعاً اليوم.",
  },
  {
    id: "adventurer",
    name: "زكي المغامر الجريء 🚀",
    pitch: 1.12,
    rate: 0.92,
    gender: "boy" as const,
    description: "صوت سريع وحيوي مليء بالطاقة والاندفاع نحو الاكتشافات!",
    icon: "🚀",
    samplePhrase: "احزم أمتعتك الإبداعية! تنتظرنا استكشافات مذهلة في عالم الذكاء الاصطناعي!",
  },
  {
    id: "thinker",
    name: "زكي المفكر العميق 💡",
    pitch: 0.95,
    rate: 0.82,
    gender: "teacher" as const,
    description: "نبرة هادئة وحكيمة تطرح التساؤلات وتحفز التفكير النقدي.",
    icon: "💡",
    samplePhrase: "ممم... سؤالك رائع جداً! دعنا نفكر ونحلل الإجابة معاً خطوة بخطوة.",
  },
];

// Unified Text to speech helper delegating to TTS Manager with chunking & normalization
export function speakText(text: string, onEnd?: () => void, customConfig?: Partial<VoiceConfig>) {
  ttsManager.speak(text, {
    pitch: customConfig?.pitch,
    rate: customConfig?.rate,
    speedPreset: customConfig?.speedPreset,
    gender: customConfig?.gender,
    lang: customConfig?.lang || "ar-MA",
    voicePresetId: customConfig?.voicePreset,
    onEnd,
  });
}

export function stopSpeech() {
  ttsManager.stop();
}

export function replayLastSpeech() {
  ttsManager.replayLast();
}


