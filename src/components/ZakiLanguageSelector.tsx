import React from "react";
import { motion } from "motion/react";
import { useLanguageContext, LANGUAGES, LanguageOption } from "../context/LanguageContext";
import { ZAKI_TEACHER_PERSONAS, ZakiTeacherPersona } from "../data/zakiPersonas";
import { speakText, VOICE_PRESETS } from "../data/mascot";
import { Globe, SlidersHorizontal, Check, Play, Sparkles, MessageCircleHeart, GraduationCap, UserCheck } from "lucide-react";

interface ZakiLanguageSelectorProps {
  onStartChat?: () => void;
}

export const ZakiLanguageSelector: React.FC<ZakiLanguageSelectorProps> = ({ onStartChat }) => {
  const {
    selectedLanguage,
    setSelectedLanguage,
    selectedPersona,
    setSelectedPersona,
    voiceConfig,
    setVoiceConfig,
    confirmLanguageSelection,
  } = useLanguageContext();

  const handleSelectLanguage = (lang: LanguageOption) => {
    setSelectedLanguage(lang);
  };

  const handleConfirm = () => {
    confirmLanguageSelection();
    if (onStartChat) onStartChat();
  };

  const testVoiceSample = () => {
    let sampleText = selectedPersona.greetingText[selectedLanguage.id] || selectedPersona.greetingText.ar;

    speakText(sampleText, undefined, {
      ...voiceConfig,
      lang: selectedLanguage.speechLang,
    });
  };

  return (
    <div className="w-full h-full min-h-[600px] bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white p-6 sm:p-8 rounded-3xl shadow-2xl flex flex-col justify-between space-y-6 dir-rtl overflow-y-auto">
      {/* Top Banner Header */}
      <div className="flex items-center gap-4 border-b border-indigo-800/80 pb-5">
        <div className={`w-16 h-16 rounded-2xl bg-gradient-to-tr ${selectedPersona.bgGradient} flex items-center justify-center text-3xl shadow-lg ${selectedPersona.glowClass} shrink-0`}>
          {selectedPersona.faceEmoji}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-black text-white">اختر لغة وشخصية الأستاذ زكي</h2>
            <Sparkles className="w-5 h-5 text-amber-400 animate-bounce" />
          </div>
          <p className="text-xs sm:text-sm text-slate-300 font-bold mt-1">
            اختر وجه الأستاذ زكي المفضّل لديك ولغتك ونبرة الصوت قبل البدء 🌟
          </p>
        </div>
      </div>

      {/* Step 1: Teacher Persona Selection (4 Faces / Personas) */}
      <div className="space-y-3">
        <h3 className="text-sm font-black text-amber-300 flex items-center gap-2">
          <GraduationCap className="w-4 h-4 text-amber-400" />
          <span>1. اختر وجه وشخصية الأستاذ زكي (Teacher Persona):</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {ZAKI_TEACHER_PERSONAS.map((persona) => {
            const isSelected = selectedPersona.id === persona.id;
            return (
              <motion.button
                key={persona.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedPersona(persona)}
                className={`p-4 rounded-2xl border-2 text-right transition flex items-start gap-3 cursor-pointer ${
                  isSelected
                    ? "bg-amber-500/20 border-amber-400 text-white ring-2 ring-amber-400/30 shadow-lg shadow-amber-500/10"
                    : "bg-slate-800/80 border-slate-700 text-slate-200 hover:bg-slate-800"
                }`}
              >
                <div
                  className={`w-12 h-12 rounded-xl bg-gradient-to-tr ${persona.bgGradient} flex items-center justify-center text-2xl shadow-md shrink-0`}
                >
                  {persona.faceEmoji}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="font-extrabold text-sm text-white">{persona.name}</h4>
                    {isSelected && (
                      <div className="w-5 h-5 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center shrink-0">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </div>
                    )}
                  </div>
                  <p className="text-[11px] font-bold text-amber-300 mt-0.5">{persona.title}</p>
                  <p className="text-[11px] text-slate-300 font-medium leading-relaxed mt-1 line-clamp-2">
                    {persona.description}
                  </p>
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Step 2: Language Selection Cards */}
      <div className="space-y-3">
        <h3 className="text-sm font-black text-cyan-300 flex items-center gap-2">
          <Globe className="w-4 h-4 text-cyan-400" />
          <span>2. اختر لغة أو دارجة الحوار (Language & Dialect):</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {LANGUAGES.map((lang) => {
            const isSelected = selectedLanguage.id === lang.id;
            return (
              <motion.button
                key={lang.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleSelectLanguage(lang)}
                className={`p-3.5 rounded-2xl border-2 text-right transition flex flex-col justify-between gap-2 cursor-pointer ${
                  isSelected
                    ? "bg-cyan-500/20 border-cyan-400 text-white ring-2 ring-cyan-400/30 shadow-lg shadow-cyan-500/10"
                    : "bg-slate-800/80 border-slate-700 text-slate-200 hover:bg-slate-800"
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{lang.flag}</span>
                    <span className="font-extrabold text-sm">{lang.nativeName}</span>
                  </div>
                  {isSelected && (
                    <div className="w-5 h-5 rounded-full bg-cyan-400 text-slate-950 flex items-center justify-center shrink-0 font-bold">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                  )}
                </div>

                <p className="text-[11px] text-slate-300 font-medium leading-relaxed">
                  {lang.description}
                </p>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Step 3: Voice Tone Selection */}
      <div className="space-y-3">
        <h3 className="text-sm font-black text-purple-300 flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-purple-400" />
          <span>3. نبرة صوت الأستاذ زكي (Voice Pitch & Speed):</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {VOICE_PRESETS.map((preset) => {
            const isSelected = voiceConfig.voicePreset === preset.id;
            return (
              <motion.button
                key={preset.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() =>
                  setVoiceConfig({
                    ...voiceConfig,
                    voicePreset: preset.id as any,
                    pitch: preset.pitch,
                    rate: preset.rate,
                  })
                }
                className={`p-3 rounded-2xl border-2 text-right transition flex items-center justify-between cursor-pointer ${
                  isSelected
                    ? "bg-purple-500/20 border-purple-400 text-white ring-2 ring-purple-400/30"
                    : "bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-800"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{preset.icon}</span>
                  <div>
                    <h4 className="font-extrabold text-xs text-white">{preset.name}</h4>
                    <p className="text-[10px] text-slate-400 font-medium line-clamp-1">
                      {preset.description}
                    </p>
                  </div>
                </div>

                {isSelected && (
                  <div className="w-4 h-4 rounded-full bg-purple-400 text-slate-950 flex items-center justify-center shrink-0">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                )}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Footer Controls & Confirm Button */}
      <div className="pt-4 flex flex-wrap items-center justify-between gap-4 border-t border-indigo-900">
        <button
          onClick={testVoiceSample}
          className="px-4 py-3 bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-400/40 rounded-2xl text-xs sm:text-sm font-black transition flex items-center gap-2 cursor-pointer shadow-md"
        >
          <Play className="w-4 h-4 fill-amber-300" />
          <span>استمع لصوت {selectedPersona.name} 🔊</span>
        </button>

        <motion.button
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          onClick={handleConfirm}
          className="px-8 py-3.5 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-600 hover:to-orange-600 text-white rounded-2xl text-base font-black transition shadow-xl shadow-amber-500/25 flex items-center gap-2 cursor-pointer"
        >
          <MessageCircleHeart className="w-5 h-5 text-amber-100" />
          <span>ابدأ التعلم والمحادثة الآن 🚀</span>
        </motion.button>
      </div>
    </div>
  );
};
