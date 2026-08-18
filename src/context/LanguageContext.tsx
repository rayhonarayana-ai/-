import React, { createContext, useContext, useState, useEffect } from "react";
import { VoiceConfig, DEFAULT_VOICE_CONFIG, speakText } from "../data/mascot";
import { ZAKI_TEACHER_PERSONAS, ZakiTeacherPersona } from "../data/zakiPersonas";
import { TRANSLATIONS, TranslationDict, AppLanguage } from "../data/translations";
import { ttsManager } from "../data/speech/ttsManager";

export type LanguageCode = "darija" | "ar" | "fr" | "en" | "amazigh";

export interface LanguageOption {
  id: LanguageCode;
  name: string;
  nativeName: string;
  flag: string;
  description: string;
  greeting: string;
  suggestions: { text: string; category: string }[];
  speechLang: "ar-SA" | "ar-MA" | "fr-FR" | "en-US";
}

export const LANGUAGES: LanguageOption[] = [
  {
    id: "darija",
    name: "الدارجة المغربية",
    nativeName: "الدارجة المغربية 🇲🇦",
    flag: "🇲🇦",
    description: "تحدث وسول زكي بالدارجة المغربية المحببة والسلسة للأطفال!",
    greeting:
      "مرحباً بيك أ صاحبي المبدع! 🤖✨ أنا زكي، المساعد ديالك فتعليم الذكاء الاصطناعي.\nسولني على أي حاجة طاحت ليك فبالك: كيفاش الكمبيوتر كيشوف الصور؟ كيفاش كيتعلم الألعاب؟ ولا اطلب مني نعاود ليك قصة زوينة!",
    suggestions: [
      { text: "كيفاش الذكاء الاصطناعي كيشوف الصور؟ 📸", category: "رؤية الكمبيوتر" },
      { text: "واش الروبوت يقدر يولي صاحبي؟ 🤖", category: "علاقات وآلات" },
      { text: "كيفاش الكمبيوتر كيتعلم الهضرة بالدارجة؟ 🗣️", category: "معالجة اللغة" },
      { text: "عاود ليا قصة زوينة على روبوت كيتعلم الرسم! 🎨", category: "قصص وتخيل" },
    ],
    speechLang: "ar-MA",
  },
  {
    id: "ar",
    name: "العربية الفصحى",
    nativeName: "العربية الفصحى 🇸🇦",
    flag: "🇸🇦",
    description: "لغة عربية بسيطة، مشجعة ومبسطة ومناسبة للأطفال!",
    greeting:
      "أهلاً بك يا صديقي المبدع! 🤖✨ أنا زكي، مساعدك الشخصي في تعليم الذكاء الاصطناعي.\nاسألني عن أي شيء يخطر ببالك: كيف ترى أجهزة الكمبيوتر؟ كيف تعمل الألعاب الذكية؟ أو اطلب مني قصة قصيرة!",
    suggestions: [
      { text: "كيف يستطيع الذكاء الاصطناعي رؤية الصور؟ 📸", category: "رؤية الكمبيوتر" },
      { text: "هل يمكن للروبوت أن يصبح صديقاً للإنسان؟ 🤖", category: "علاقات وآلات" },
      { text: "كيف يتعلم الحاسوب التحدث باللغة العربية؟ 🗣️", category: "معالجة اللغة" },
      { text: "احكِ لي قصة خيالية قصيرة عن روبوت يتعلم الرسم! 🎨", category: "قصص وتخيل" },
    ],
    speechLang: "ar-SA",
  },
  {
    id: "fr",
    name: "Français pour enfants",
    nativeName: "Français 🇫🇷",
    flag: "🇫🇷",
    description: "Apprends l'Intelligence Artificielle en français facile !",
    greeting:
      "Bienvenue mon ami(e) créatif(ve) ! 🤖✨ Je suis Zaki, ton assistant intelligent pour apprendre l'IA.\nPose-moi toutes tes questions : Comment l'ordinateur voit les images ? Comment fonctionnent les jeux intelligents ? Ou demande-moi une histoire !",
    suggestions: [
      { text: "Comment l'IA voit les images ? 📸", category: "Vision" },
      { text: "Un robot peut-il devenir mon ami ? 🤖", category: "Robots" },
      { text: "Comment l'ordinateur apprend les langues ? 🗣️", category: "Langues" },
      { text: "Raconte-moi une histoire d'un robot artiste ! 🎨", category: "Histoires" },
    ],
    speechLang: "fr-FR",
  },
  {
    id: "en",
    name: "English for Kids",
    nativeName: "English 🇬🇧",
    flag: "🇬🇧",
    description: "Learn Artificial Intelligence with Zaki in simple English!",
    greeting:
      "Welcome my creative friend! 🤖✨ I'm Zaki, your personal AI guide.\nAsk me anything: How do computers see images? How do smart games work? Or ask me for a fun short story!",
    suggestions: [
      { text: "How does AI see pictures? 📸", category: "Vision" },
      { text: "Can a robot be my friend? 🤖", category: "Robots" },
      { text: "How do computers learn languages? 🗣️", category: "NLP" },
      { text: "Tell me a short story about a robot painter! 🎨", category: "Stories" },
    ],
    speechLang: "en-US",
  },
  {
    id: "amazigh",
    name: "الأمازيغية المبسطة",
    nativeName: "ⵜⴰⵎⴰⵣⵉⵖⵜ - الأمازيغية ⵣ",
    flag: "ⵣ",
    description: "تعلم وتبادل الحوار بالأمازيغية مع الشرح المبسط!",
    greeting:
      "Azul أمدلوك المبدع! 🤖✨ ⴰⵣⵓⵍ أنا زكي، المساعد ديالك فتعليم الذكاء الاصطناعي!\nسولني على أي حاجة: كيفاش الكمبيوتر كيشوف وكيتعلم الألعاب؟",
    suggestions: [
      { text: "Azul! كيفاش الذكاء الاصطناعي كيتعلم؟ 🤖", category: "التعلم" },
      { text: "احكِ لي قصة قصيرة بالأمازيغية والعربية! 🎨", category: "قصص" },
    ],
    speechLang: "ar-SA",
  },
];

const LANGUAGE_STORAGE_KEY = "kids_ai_selected_language";
const LANGUAGE_CONFIRMED_KEY = "kids_ai_language_confirmed";

interface LanguageContextType {
  selectedLanguage: LanguageOption;
  selectedPersona: ZakiTeacherPersona;
  voiceConfig: VoiceConfig;
  isLanguageSelected: boolean;
  isLanguageModalOpen: boolean;
  setIsLanguageModalOpen: (open: boolean) => void;
  direction: "rtl" | "ltr";
  t: TranslationDict;
  changeLanguage: (langId: LanguageCode, speakWelcome?: boolean) => void;
  setSelectedLanguage: (lang: LanguageOption) => void;
  setSelectedPersona: (persona: ZakiTeacherPersona) => void;
  setVoiceConfig: (config: VoiceConfig) => void;
  confirmLanguageSelection: () => void;
  resetLanguageSelection: () => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load initial language from localStorage if present
  const [selectedLanguage, setSelectedLanguageState] = useState<LanguageOption>(() => {
    if (typeof window !== "undefined") {
      const savedLangId = localStorage.getItem(LANGUAGE_STORAGE_KEY);
      if (savedLangId) {
        const found = LANGUAGES.find((l) => l.id === savedLangId);
        if (found) return found;
      }
    }
    return LANGUAGES[0]; // Default to Darija
  });

  const [selectedPersona, setSelectedPersonaState] = useState<ZakiTeacherPersona>(ZAKI_TEACHER_PERSONAS[0]);
  const [voiceConfig, setVoiceConfig] = useState<VoiceConfig>(() => ({
    ...DEFAULT_VOICE_CONFIG,
    lang: selectedLanguage.speechLang,
  }));
  const [isLanguageSelected, setIsLanguageSelected] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem(LANGUAGE_CONFIRMED_KEY) === "true";
    }
    return false;
  });
  const [isLanguageModalOpen, setIsLanguageModalOpen] = useState<boolean>(false);

  const direction: "rtl" | "ltr" =
    selectedLanguage.id === "fr" || selectedLanguage.id === "en" ? "ltr" : "rtl";

  const translationKey: AppLanguage =
    selectedLanguage.id === "fr"
      ? "fr"
      : selectedLanguage.id === "en"
      ? "en"
      : selectedLanguage.id === "ar"
      ? "ar"
      : "darija";

  const t = TRANSLATIONS[translationKey] || TRANSLATIONS.darija;

  // Synchronize document dir, lang, and TTS speechLang whenever selectedLanguage changes
  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.dir = direction;
      document.documentElement.lang = selectedLanguage.speechLang.split("-")[0] || "ar";
    }

    // Save in storage
    try {
      localStorage.setItem(LANGUAGE_STORAGE_KEY, selectedLanguage.id);
    } catch (e) {}

    // Update voice config & TTS engine
    setVoiceConfig((prev) => ({
      ...prev,
      lang: selectedLanguage.speechLang,
    }));
    ttsManager.saveConfig({ lang: selectedLanguage.speechLang });
  }, [selectedLanguage, direction]);

  const changeLanguage = (langId: LanguageCode, speakWelcome: boolean = true) => {
    const targetLang = LANGUAGES.find((l) => l.id === langId) || LANGUAGES[0];
    setSelectedLanguageState(targetLang);
    setIsLanguageSelected(true);
    setIsLanguageModalOpen(false);

    try {
      localStorage.setItem(LANGUAGE_STORAGE_KEY, targetLang.id);
      localStorage.setItem(LANGUAGE_CONFIRMED_KEY, "true");
    } catch (e) {}

    // Synchronize TTS immediately
    ttsManager.saveConfig({ lang: targetLang.speechLang });

    if (speakWelcome) {
      // Speak warm acknowledgement in the newly chosen language
      let greetingNotice = "تبارك الله عليك! دابا كنتعلمو بالدارجة المغربية الزوينة!";
      if (targetLang.id === "ar") {
        greetingNotice = "أهلاً بك! تم ضبط لغة التعلم إلى العربية الفصحى المبسطة بنجاح!";
      } else if (targetLang.id === "fr") {
        greetingNotice = "Parfait ! La langue française est activée avec succès pour toute l'interface !";
      } else if (targetLang.id === "en") {
        greetingNotice = "Awesome! English language is now activated for all lessons and Zaki voice!";
      }

      speakText(greetingNotice, undefined, {
        lang: targetLang.speechLang,
        pitch: voiceConfig.pitch,
        rate: voiceConfig.rate,
      });
    }
  };

  const setSelectedLanguage = (lang: LanguageOption) => {
    setSelectedLanguageState(lang);
    try {
      localStorage.setItem(LANGUAGE_STORAGE_KEY, lang.id);
    } catch (e) {}
    ttsManager.saveConfig({ lang: lang.speechLang });
  };

  const setSelectedPersona = (persona: ZakiTeacherPersona) => {
    setSelectedPersonaState(persona);
    setVoiceConfig((prev) => ({
      ...prev,
      voicePreset: persona.voicePresetId,
    }));
  };

  const confirmLanguageSelection = () => {
    setIsLanguageSelected(true);
    try {
      localStorage.setItem(LANGUAGE_CONFIRMED_KEY, "true");
    } catch (e) {}
  };

  const resetLanguageSelection = () => {
    setIsLanguageSelected(false);
    try {
      localStorage.removeItem(LANGUAGE_CONFIRMED_KEY);
    } catch (e) {}
  };

  return (
    <LanguageContext.Provider
      value={{
        selectedLanguage,
        selectedPersona,
        voiceConfig,
        isLanguageSelected,
        isLanguageModalOpen,
        setIsLanguageModalOpen,
        direction,
        t,
        changeLanguage,
        setSelectedLanguage,
        setSelectedPersona,
        setVoiceConfig,
        confirmLanguageSelection,
        resetLanguageSelection,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguageContext = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguageContext must be used within a LanguageProvider");
  }
  return context;
};
