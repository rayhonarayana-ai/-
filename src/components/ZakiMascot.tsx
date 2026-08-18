import React from "react";
import { ZakiCustomization } from "../types";
import {
  ZAKI_COLORS,
  ZAKI_ACCESSORIES,
  ZAKI_EXPRESSIONS,
  DEFAULT_ZAKI_CUSTOMIZATION,
} from "../data/zakiCustomizationData";
import { ZAKI_TEACHER_PERSONAS, ZakiTeacherPersona } from "../data/zakiPersonas";
import { speakText, stopSpeech } from "../data/mascot";
import { ttsManager } from "../data/speech/ttsManager";
import { useLanguageContext } from "../context/LanguageContext";
import { ZakiVoiceSettingsModal } from "./ZakiVoiceSettingsModal";
import { Volume2, Sparkles, MessageCircle, Wand2, Mic, GraduationCap, Check, Square } from "lucide-react";

interface ZakiMascotProps {
  mood?: "happy" | "thinking" | "excited" | "teaching" | "celebrating";
  message?: string;
  onAskClick?: () => void;
  onOpenCustomizer?: () => void;
  customization?: ZakiCustomization;
  compact?: boolean;
}

export const ZakiMascot: React.FC<ZakiMascotProps> = ({
  mood = "happy",
  message = "مرحباً يا بطل! أنا الأستاذ زكي، معلمك الذكي. ماذا تحب أن نتعلم عن الذكاء الاصطناعي اليوم؟ 🚀",
  onAskClick,
  onOpenCustomizer,
  customization,
  compact = false,
}) => {
  const [speaking, setSpeaking] = React.useState(ttsManager.isSpeaking);
  const [isVoiceModalOpen, setIsVoiceModalOpen] = React.useState(false);

  React.useEffect(() => {
    const unsub = ttsManager.onSpeakingChange((isSpeaking) => {
      setSpeaking(isSpeaking);
    });
    return unsub;
  }, []);

  const { voiceConfig, selectedLanguage, selectedPersona, setSelectedPersona } = useLanguageContext();


  const activeCustom = customization || DEFAULT_ZAKI_CUSTOMIZATION;
  const activeColor = ZAKI_COLORS.find((c) => c.id === activeCustom.colorId) || ZAKI_COLORS[0];
  const activeAccessory = ZAKI_ACCESSORIES.find((a) => a.id === activeCustom.accessoryId) || ZAKI_ACCESSORIES[0];

  const moodDetails = {
    happy: {
      emoji: selectedPersona.faceEmoji || "🎓",
      eyes: "👀",
      title: `${selectedPersona.name} سعيد برؤيتك!`,
    },
    thinking: {
      emoji: "🤔",
      eyes: "💡",
      title: `${selectedPersona.name} يفكر بدقة...`,
    },
    excited: {
      emoji: "🌟",
      eyes: "✨",
      title: `${selectedPersona.name} متحمس جداً!`,
    },
    teaching: {
      emoji: "🎓",
      eyes: "📖",
      title: selectedPersona.title,
    },
    celebrating: {
      emoji: "🎉",
      eyes: "🏆",
      title: "مبروك يا بطل!",
    },
  }[mood];

  const handleSpeak = () => {
    if (speaking) {
      stopSpeech();
      setSpeaking(false);
    } else {
      setSpeaking(true);
      speakText(message, () => setSpeaking(false), {
        ...voiceConfig,
        lang: selectedLanguage.speechLang,
      });
    }
  };

  if (compact) {
    return (
      <div className="flex items-center gap-3 p-3 bg-white rounded-2xl border border-slate-100 shadow-sm">
        <div className={`w-12 h-12 rounded-xl bg-gradient-to-tr ${selectedPersona.bgGradient} flex items-center justify-center text-2xl shadow-md relative shrink-0`}>
          <span>{selectedPersona.faceEmoji}</span>
          {activeAccessory.emoji && (
            <span className="absolute -top-1 -right-1 text-xs">{activeAccessory.emoji}</span>
          )}
        </div>
        <div className="flex-1">
          <p className="text-xs font-black text-indigo-700">{selectedPersona.name}</p>
          <p className="text-[11px] text-slate-600 line-clamp-1">{message}</p>
        </div>
        <button
          onClick={handleSpeak}
          className={`p-2 rounded-xl border text-xs font-bold transition cursor-pointer ${
            speaking
              ? "bg-indigo-600 text-white border-indigo-700 animate-pulse"
              : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
          }`}
        >
          <Volume2 className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="relative p-6 sm:p-8 bg-white rounded-[40px] border border-slate-100 shadow-xl shadow-indigo-100/50 overflow-hidden space-y-6">
      {/* Background Subtle Gradient Blobs */}
      <div className="absolute -top-16 -left-16 w-48 h-48 bg-indigo-50 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-16 -right-16 w-48 h-48 bg-purple-50 rounded-full blur-3xl pointer-events-none"></div>

      {/* Teacher Persona Selector Header Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
        <div className="flex items-center gap-2">
          <GraduationCap className="w-5 h-5 text-indigo-600 shrink-0" />
          <span className="text-xs font-extrabold text-slate-700">وجوه وشخصيات الأستاذ زكي الأربعة:</span>
        </div>

        {/* 4 Teacher Face Pills */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 w-full sm:w-auto">
          {ZAKI_TEACHER_PERSONAS.map((persona) => {
            const isSelected = selectedPersona.id === persona.id;
            return (
              <button
                key={persona.id}
                onClick={() => setSelectedPersona(persona)}
                className={`px-3 py-1.5 rounded-xl text-xs font-black transition flex items-center justify-center gap-1.5 cursor-pointer ${
                  isSelected
                    ? `bg-gradient-to-r ${persona.bgGradient} text-white shadow-md`
                    : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-100"
                }`}
              >
                <span>{persona.faceEmoji}</span>
                <span className="truncate max-w-[90px]">{persona.name.replace("الأستاذ زكي ", "")}</span>
                {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
              </button>
            );
          })}
        </div>
      </div>

      <div className="relative flex flex-col md:flex-row items-center gap-6 sm:gap-8">
        {/* Mascot Avatar Container */}
        <div className="relative flex-shrink-0 group cursor-pointer" onClick={handleSpeak}>
          <div
            className={`w-36 h-36 sm:w-44 sm:h-44 rounded-full bg-gradient-to-tr ${selectedPersona.bgGradient} p-1.5 shadow-xl ${selectedPersona.glowClass} transition-transform group-hover:scale-105 duration-300`}
          >
            <div className="w-full h-full bg-slate-900/10 rounded-full flex flex-col items-center justify-center relative overflow-hidden backdrop-blur-xs">
              {/* Antennae */}
              <div className="absolute top-3 flex gap-12">
                <div className="w-3 h-5 bg-cyan-300 rounded-full shadow-[0_0_10px_#67e8f9] animate-pulse"></div>
                <div className="w-3 h-5 bg-cyan-300 rounded-full shadow-[0_0_10px_#67e8f9] animate-pulse delay-150"></div>
              </div>

              {/* Main Avatar Expression / Face */}
              <span className="text-6xl sm:text-7xl select-none transform transition group-hover:scale-110 mt-2">
                {moodDetails.emoji}
              </span>

              {/* Accessory Overlay Icon */}
              {activeAccessory.emoji && (
                <div className="absolute top-2 right-4 text-2xl animate-bounce-gentle">
                  {activeAccessory.emoji}
                </div>
              )}

              {/* Persona Teacher Badge */}
              <span className="mt-2 px-3 py-0.5 rounded-full bg-white/95 text-slate-900 text-[10px] font-black shadow-sm truncate max-w-[130px]">
                {selectedPersona.name}
              </span>
            </div>
          </div>

          {/* Online Indicator */}
          <div className="absolute -top-1 -right-1 bg-emerald-500 w-7 h-7 rounded-full border-4 border-white shadow-xs flex items-center justify-center text-white text-[10px]">
            ✓
          </div>

          {/* Speaking Sound Icon */}
          {speaking && (
            <div className="absolute -bottom-1 -left-1 p-2 bg-indigo-600 text-white rounded-full shadow-lg animate-bounce">
              <Sparkles className="w-4 h-4" />
            </div>
          )}
        </div>

        {/* Dialogue Bubble */}
        <div className="flex-1 text-center md:text-right space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-100 text-slate-700 text-xs font-black tracking-wide">
            <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
            <span>{selectedPersona.title}</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-slate-800 leading-snug">
            {message}
          </h2>

          <p className="text-xs text-slate-500 font-bold">
            {selectedPersona.description}
          </p>

          {/* Interactive Action Controls */}
          <div className="pt-2 flex flex-wrap items-center justify-center md:justify-start gap-3">
            <button
              onClick={handleSpeak}
              className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-black text-xs sm:text-sm transition-all shadow-md cursor-pointer ${
                speaking
                  ? "bg-rose-500 hover:bg-rose-600 text-white animate-pulse"
                  : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-200"
              }`}
            >
              <Volume2 className="w-4 h-4" />
              <span>{speaking ? "إيقاف الصوت 🛑" : `استمع لـ ${selectedPersona.name} 🔊`}</span>
            </button>

            <button
              onClick={() => setIsVoiceModalOpen(true)}
              className="flex items-center gap-2 px-5 py-3 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200/80 rounded-2xl font-black text-xs sm:text-sm transition shadow-xs cursor-pointer"
            >
              <Mic className="w-4 h-4 text-amber-600" />
              <span>شخصيات الصوت 🎙️</span>
            </button>

            {onAskClick && (
              <button
                onClick={onAskClick}
                className="flex items-center gap-2 px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl font-black text-xs sm:text-sm transition cursor-pointer"
              >
                <MessageCircle className="w-4 h-4 text-indigo-600" />
                <span>دردش مع الأستاذ 💬</span>
              </button>
            )}

            {onOpenCustomizer && (
              <button
                onClick={onOpenCustomizer}
                className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-purple-50 to-indigo-50 hover:from-purple-100 hover:to-indigo-100 text-indigo-800 border border-indigo-200/80 rounded-2xl font-black text-xs sm:text-sm transition shadow-xs cursor-pointer"
              >
                <Wand2 className="w-4 h-4 text-purple-600" />
                <span>تخصيص الشكل 🎨</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Voice Settings Modal */}
      <ZakiVoiceSettingsModal
        isOpen={isVoiceModalOpen}
        onClose={() => setIsVoiceModalOpen(false)}
      />
    </div>
  );
};

