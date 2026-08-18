import React, { useState } from "react";
import { ZakiCustomization, UserProgress } from "../types";
import {
  ZAKI_COLORS,
  ZAKI_ACCESSORIES,
  ZAKI_EXPRESSIONS,
  DEFAULT_ZAKI_CUSTOMIZATION,
} from "../data/zakiCustomizationData";
import { ZAKI_TEACHER_PERSONAS, ZakiTeacherPersona } from "../data/zakiPersonas";
import { useLanguageContext } from "../context/LanguageContext";
import { speakText, stopSpeech } from "../data/mascot";
import { ttsManager } from "../data/speech/ttsManager";
import { SpeechSpeedPreset, VoiceGender } from "../data/speech/types";
import {
  X,
  Sparkles,
  Lock,
  Check,
  Wand2,
  GraduationCap,
  UserCheck,
  Mic,
  Volume2,
  Gauge,
  User,
} from "lucide-react";

interface ZakiCustomizerModalProps {
  progress: UserProgress;
  onSaveCustomization: (customization: ZakiCustomization) => void;
  onClose: () => void;
}

export const ZakiCustomizerModal: React.FC<ZakiCustomizerModalProps> = ({
  progress,
  onSaveCustomization,
  onClose,
}) => {
  const currentLevel = progress.level;
  const initialCustomization = progress.zakiCustomization || DEFAULT_ZAKI_CUSTOMIZATION;

  const { selectedPersona, setSelectedPersona, voiceConfig, setVoiceConfig, selectedLanguage } =
    useLanguageContext();

  const [selectedColorId, setSelectedColorId] = useState(initialCustomization.colorId);
  const [selectedAccessoryId, setSelectedAccessoryId] = useState(initialCustomization.accessoryId);
  const [selectedExpressionId, setSelectedExpressionId] = useState(initialCustomization.expressionId);

  const [activeSubTab, setActiveSubTab] = useState<
    "personas" | "voice" | "colors" | "accessories" | "expressions"
  >("personas");

  const activeColor = ZAKI_COLORS.find((c) => c.id === selectedColorId) || ZAKI_COLORS[0];
  const activeAccessory = ZAKI_ACCESSORIES.find((a) => a.id === selectedAccessoryId) || ZAKI_ACCESSORIES[0];
  const activeExpression = ZAKI_EXPRESSIONS.find((e) => e.id === selectedExpressionId) || ZAKI_EXPRESSIONS[0];

  const currentSpeedPreset: SpeechSpeedPreset =
    voiceConfig.speedPreset || (voiceConfig.rate <= 0.8 ? "slow" : voiceConfig.rate >= 1.05 ? "fast" : "normal");

  const currentGender: VoiceGender = voiceConfig.gender || "boy";

  const handleSpeedPresetSelect = (preset: SpeechSpeedPreset) => {
    let rate = 0.85;
    if (preset === "slow") rate = 0.76;
    else if (preset === "normal") rate = 0.85;
    else if (preset === "fast") rate = 1.05;

    const updated = { ...voiceConfig, rate, speedPreset: preset };
    setVoiceConfig(updated);
    ttsManager.saveConfig({ rate, speedPreset: preset });
  };

  const handleGenderSelect = (gender: VoiceGender) => {
    let pitch = 1.08;
    if (gender === "boy") pitch = 1.08;
    else if (gender === "girl") pitch = 1.15;
    else if (gender === "robot") pitch = 0.88;
    else if (gender === "teacher") pitch = 1.0;

    const updated = { ...voiceConfig, gender, pitch };
    setVoiceConfig(updated);
    ttsManager.saveConfig({ gender, pitch });
  };


  const handleSave = () => {
    const updated: ZakiCustomization = {
      colorId: selectedColorId,
      accessoryId: selectedAccessoryId,
      expressionId: selectedExpressionId,
    };
    onSaveCustomization(updated);
    speakText(`رائع جداً! أنا الآن ${selectedPersona.name}! جاهز للتعلم والابتكار معك! 🚀✨`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto dir-rtl">
      <div className="bg-white rounded-[32px] max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl relative border border-slate-100 my-8">
        {/* Header & Close Button */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
              <Wand2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900">خزانة وهوية زكي • خيارات التخصيص والصوت 🎨</h2>
              <p className="text-xs font-bold text-slate-500">
                خصص شخصية زكي، نبرة صوته وسرعة كلامه للمستوى <span className="text-indigo-600 font-black">{currentLevel}</span>!
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Zaki Avatar Preview Stage */}
        <div className="p-6 bg-gradient-to-br from-indigo-50/80 via-slate-50 to-purple-50/50 rounded-3xl border border-indigo-100/80 flex flex-col sm:flex-row items-center gap-6 relative overflow-hidden shadow-sm">
          {/* Avatar Graphic */}
          <div className="relative flex-shrink-0">
            <div
              className={`w-32 h-32 sm:w-36 sm:h-36 rounded-3xl bg-gradient-to-tr ${selectedPersona.bgGradient} p-1 shadow-xl ${selectedPersona.glowClass} transition-all duration-300 transform hover:scale-105`}
            >
              <div className="w-full h-full bg-slate-900/10 rounded-[22px] flex flex-col items-center justify-center relative overflow-hidden backdrop-blur-xs">
                {/* Antennae */}
                <div className="absolute top-2 flex gap-10">
                  <div className="w-2.5 h-4 bg-white/80 rounded-full animate-pulse"></div>
                  <div className="w-2.5 h-4 bg-white/80 rounded-full animate-pulse delay-150"></div>
                </div>

                {/* Face Emoji */}
                <span className="text-5xl sm:text-6xl select-none mt-2">
                  {selectedPersona.faceEmoji}
                </span>

                {/* Accessory Overlay Badge */}
                {activeAccessory.emoji && (
                  <div className="absolute top-1 right-2 text-2xl animate-bounce-gentle">
                    {activeAccessory.emoji}
                  </div>
                )}
              </div>
            </div>

            {/* Online Sparkle Badge */}
            <div className="absolute -bottom-2 -left-2 bg-emerald-500 w-6 h-6 rounded-full border-2 border-white flex items-center justify-center text-white text-[10px]">
              ✓
            </div>
          </div>

          {/* Preview Details */}
          <div className="flex-1 text-center sm:text-right space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-black">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span>شخصية ومظهر زكي الحالي</span>
            </div>

            <h3 className="text-xl font-black text-slate-900">{selectedPersona.name}</h3>
            <p className="text-xs font-bold text-indigo-600">{selectedPersona.title}</p>
            <p className="text-xs text-slate-500 font-medium line-clamp-2">{selectedPersona.description}</p>
          </div>
        </div>

        {/* Customization Sub-Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-2xl overflow-x-auto">
          <button
            onClick={() => setActiveSubTab("personas")}
            className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-black transition whitespace-nowrap cursor-pointer ${
              activeSubTab === "personas"
                ? "bg-white text-indigo-600 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            🎓 الشخصيات ({ZAKI_TEACHER_PERSONAS.length})
          </button>

          <button
            onClick={() => setActiveSubTab("voice")}
            className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-black transition whitespace-nowrap cursor-pointer ${
              activeSubTab === "voice"
                ? "bg-white text-amber-600 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            🎙️ الصوت والنطق
          </button>

          <button
            onClick={() => setActiveSubTab("colors")}
            className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-black transition whitespace-nowrap cursor-pointer ${
              activeSubTab === "colors"
                ? "bg-white text-indigo-600 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            🎨 الألوان ({ZAKI_COLORS.filter((c) => c.minLevel <= currentLevel).length}/{ZAKI_COLORS.length})
          </button>

          <button
            onClick={() => setActiveSubTab("accessories")}
            className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-black transition whitespace-nowrap cursor-pointer ${
              activeSubTab === "accessories"
                ? "bg-white text-indigo-600 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            🎩 الإكسسوارات ({ZAKI_ACCESSORIES.filter((a) => a.minLevel <= currentLevel).length}/{ZAKI_ACCESSORIES.length})
          </button>

          <button
            onClick={() => setActiveSubTab("expressions")}
            className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-black transition whitespace-nowrap cursor-pointer ${
              activeSubTab === "expressions"
                ? "bg-white text-indigo-600 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            😃 التعبيرات ({ZAKI_EXPRESSIONS.filter((e) => e.minLevel <= currentLevel).length}/{ZAKI_EXPRESSIONS.length})
          </button>
        </div>

        {/* Tab 0: Personas */}
        {activeSubTab === "personas" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-64 overflow-y-auto p-1">
            {ZAKI_TEACHER_PERSONAS.map((persona) => {
              const isSelected = selectedPersona.id === persona.id;

              return (
                <button
                  key={persona.id}
                  onClick={() => setSelectedPersona(persona)}
                  className={`p-3.5 rounded-2xl border-2 text-right transition flex items-start gap-3 cursor-pointer ${
                    isSelected
                      ? "border-indigo-600 bg-indigo-50/70 shadow-md ring-2 ring-indigo-500/20"
                      : "border-slate-200 bg-white hover:border-indigo-300 hover:bg-slate-50"
                  }`}
                >
                  <div
                    className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${persona.bgGradient} flex items-center justify-center text-2xl shadow-md shrink-0`}
                  >
                    {persona.faceEmoji}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="font-extrabold text-sm text-slate-900">{persona.name}</h4>
                      {isSelected && (
                        <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-black shrink-0">
                          ✓
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] font-bold text-indigo-600 mt-0.5">{persona.title}</p>
                    <p className="text-[11px] text-slate-500 font-medium leading-relaxed mt-1 line-clamp-2">
                      {persona.description}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* Tab 1: Voice Speed & Gender */}
        {activeSubTab === "voice" && (
          <div className="space-y-4 max-h-64 overflow-y-auto p-1">
            {/* Speed Selector */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                  <Gauge className="w-4 h-4 text-amber-500" />
                  <span>سرعة الكلام (Speech Speed):</span>
                </span>
                <span className="text-xs font-bold text-indigo-600">
                  {voiceConfig.rate.toFixed(2)}x
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => handleSpeedPresetSelect("slow")}
                  className={`p-2.5 rounded-xl border-2 text-center transition cursor-pointer ${
                    currentSpeedPreset === "slow"
                      ? "bg-amber-50 border-amber-500 text-amber-900 font-black shadow-xs"
                      : "bg-white border-slate-200 text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  <span className="text-lg block">🐢</span>
                  <span className="text-xs font-black block">بطيء (0.76x)</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSpeedPresetSelect("normal")}
                  className={`p-2.5 rounded-xl border-2 text-center transition cursor-pointer ${
                    currentSpeedPreset === "normal"
                      ? "bg-amber-50 border-amber-500 text-amber-900 font-black shadow-xs"
                      : "bg-white border-slate-200 text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  <span className="text-lg block">🚶</span>
                  <span className="text-xs font-black block">عادي (0.85x)</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSpeedPresetSelect("fast")}
                  className={`p-2.5 rounded-xl border-2 text-center transition cursor-pointer ${
                    currentSpeedPreset === "fast"
                      ? "bg-amber-50 border-amber-500 text-amber-900 font-black shadow-xs"
                      : "bg-white border-slate-200 text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  <span className="text-lg block">⚡</span>
                  <span className="text-xs font-black block">سريع (1.05x)</span>
                </button>
              </div>
            </div>

            {/* Voice Gender */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2.5">
              <span className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                <User className="w-4 h-4 text-indigo-500" />
                <span>نوع الصوت (ولد / بنت):</span>
              </span>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <button
                  type="button"
                  onClick={() => handleGenderSelect("boy")}
                  className={`p-2.5 rounded-xl border-2 text-center transition cursor-pointer ${
                    currentGender === "boy"
                      ? "bg-indigo-50 border-indigo-600 text-indigo-900 font-black shadow-xs"
                      : "bg-white border-slate-200 text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  <span className="text-xl block">👦</span>
                  <span className="text-xs font-black block">ولد مرح</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleGenderSelect("girl")}
                  className={`p-2.5 rounded-xl border-2 text-center transition cursor-pointer ${
                    currentGender === "girl"
                      ? "bg-pink-50 border-pink-500 text-pink-900 font-black shadow-xs"
                      : "bg-white border-slate-200 text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  <span className="text-xl block">👧</span>
                  <span className="text-xs font-black block">بنت مبدعة</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleGenderSelect("robot")}
                  className={`p-2.5 rounded-xl border-2 text-center transition cursor-pointer ${
                    currentGender === "robot"
                      ? "bg-cyan-50 border-cyan-500 text-cyan-900 font-black shadow-xs"
                      : "bg-white border-slate-200 text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  <span className="text-xl block">🤖</span>
                  <span className="text-xs font-black block">روبوت ذكي</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleGenderSelect("teacher")}
                  className={`p-2.5 rounded-xl border-2 text-center transition cursor-pointer ${
                    currentGender === "teacher"
                      ? "bg-amber-50 border-amber-500 text-amber-900 font-black shadow-xs"
                      : "bg-white border-slate-200 text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  <span className="text-xl block">👨‍🏫</span>
                  <span className="text-xs font-black block">المعلم زكي</span>
                </button>
              </div>
            </div>

            {/* Test Voice Button */}
            <button
              type="button"
              onClick={() => {
                stopSpeech();
                speakText(
                  currentGender === "girl"
                    ? "مرحباً يا بطل! أنا سلمى، سعيدة جداً بالتعلم والابتكار معك!"
                    : currentGender === "robot"
                    ? "تم تفعيل الصوت الرقمي! جاهز للمغامرة البرمجية!"
                    : "مرحباً يا بطل! هذا صوتي الممتع والمخصص لك!",
                  undefined,
                  { ...voiceConfig, lang: selectedLanguage.speechLang }
                );
              }}
              className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-black transition flex items-center justify-center gap-2 cursor-pointer shadow-md"
            >
              <Volume2 className="w-4 h-4" />
              <span>استمع لتجربة هذا الصوت الآن 🔊</span>
            </button>
          </div>
        )}

        {/* Tab 2: Colors */}
        {activeSubTab === "colors" && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-60 overflow-y-auto p-1">
            {ZAKI_COLORS.map((c) => {
              const isUnlocked = currentLevel >= c.minLevel;
              const isSelected = selectedColorId === c.id;

              return (
                <button
                  key={c.id}
                  disabled={!isUnlocked}
                  onClick={() => setSelectedColorId(c.id)}
                  className={`p-3 rounded-2xl border-2 text-right transition flex flex-col gap-2 relative overflow-hidden cursor-pointer ${
                    isSelected
                      ? "border-indigo-600 bg-indigo-50/50 shadow-md ring-2 ring-indigo-500/20"
                      : isUnlocked
                      ? "border-slate-200 bg-white hover:border-indigo-300"
                      : "border-slate-200 bg-slate-50 opacity-60 cursor-not-allowed"
                  }`}
                >
                  <div className={`w-full h-10 rounded-xl bg-gradient-to-r ${c.bgGradient} flex items-center justify-end px-2`}>
                    {isSelected && (
                      <div className="w-5 h-5 rounded-full bg-white text-indigo-600 flex items-center justify-center text-xs font-black shadow-xs">
                        ✓
                      </div>
                    )}
                  </div>

                  <span className="text-xs font-black text-slate-800 line-clamp-1">{c.name}</span>

                  {!isUnlocked && (
                    <span className="text-[10px] font-bold text-amber-600 flex items-center gap-1">
                      <Lock className="w-3 h-3" /> يفتح عند المستوى {c.minLevel}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}

        {/* Tab 3: Accessories */}
        {activeSubTab === "accessories" && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-60 overflow-y-auto p-1">
            {ZAKI_ACCESSORIES.map((a) => {
              const isUnlocked = currentLevel >= a.minLevel;
              const isSelected = selectedAccessoryId === a.id;

              return (
                <button
                  key={a.id}
                  disabled={!isUnlocked}
                  onClick={() => setSelectedAccessoryId(a.id)}
                  className={`p-3 rounded-2xl border-2 text-right transition flex flex-col gap-2 relative overflow-hidden cursor-pointer ${
                    isSelected
                      ? "border-indigo-600 bg-indigo-50/50 shadow-md ring-2 ring-indigo-500/20"
                      : isUnlocked
                      ? "border-slate-200 bg-white hover:border-indigo-300"
                      : "border-slate-200 bg-slate-50 opacity-60 cursor-not-allowed"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-2xl">{a.emoji || "🤖"}</span>
                    {isSelected && (
                      <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-black">
                        ✓
                      </span>
                    )}
                  </div>

                  <div>
                    <h4 className="text-xs font-black text-slate-800">{a.name}</h4>
                    <p className="text-[10px] text-slate-500 font-bold line-clamp-1">{a.description}</p>
                  </div>

                  {!isUnlocked && (
                    <span className="text-[10px] font-bold text-amber-600 flex items-center gap-1">
                      <Lock className="w-3 h-3" /> يفتح عند المستوى {a.minLevel}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}

        {/* Tab 4: Expressions */}
        {activeSubTab === "expressions" && (
          <div className="grid grid-cols-2 sm:grid-cols-2 gap-3 max-h-60 overflow-y-auto p-1">
            {ZAKI_EXPRESSIONS.map((e) => {
              const isUnlocked = currentLevel >= e.minLevel;
              const isSelected = selectedExpressionId === e.id;

              return (
                <button
                  key={e.id}
                  disabled={!isUnlocked}
                  onClick={() => setSelectedExpressionId(e.id)}
                  className={`p-3 rounded-2xl border-2 text-right transition flex items-center justify-between gap-3 cursor-pointer ${
                    isSelected
                      ? "border-indigo-600 bg-indigo-50/50 shadow-md ring-2 ring-indigo-500/20"
                      : isUnlocked
                      ? "border-slate-200 bg-white hover:border-indigo-300"
                      : "border-slate-200 bg-slate-50 opacity-60 cursor-not-allowed"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{e.emoji}</span>
                    <span className="text-xs font-black text-slate-800">{e.name}</span>
                  </div>

                  {isSelected ? (
                    <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-black">
                      ✓
                    </span>
                  ) : (
                    !isUnlocked && (
                      <span className="text-[10px] font-bold text-amber-600 flex items-center gap-1">
                        <Lock className="w-3 h-3" /> م. {e.minLevel}
                      </span>
                    )
                  )}
                </button>
              );
            })}
          </div>
        )}

        {/* Action Controls */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-4">
          <button
            onClick={onClose}
            className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-2xl font-black text-xs transition cursor-pointer"
          >
            إلغاء
          </button>

          <button
            onClick={handleSave}
            className="px-8 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black text-sm shadow-lg shadow-indigo-200 transition flex items-center gap-2 cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>تأكيد شخصية ومظهر وصوت زكي 🎨</span>
          </button>
        </div>
      </div>
    </div>
  );
};

