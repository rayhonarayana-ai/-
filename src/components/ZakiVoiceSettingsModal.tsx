import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useLanguageContext } from "../context/LanguageContext";
import { VOICE_PRESETS, speakText, stopSpeech, replayLastSpeech } from "../data/mascot";
import { ttsManager } from "../data/speech/ttsManager";
import { TTSVoiceInfo, TTSProviderType, VoiceGender, SpeechSpeedPreset, VoiceEngineDiagnosis } from "../data/speech/types";
import {
  Mic,
  SlidersHorizontal,
  Play,
  Square,
  Check,
  Sparkles,
  Volume2,
  X,
  Wand2,
  RotateCcw,
  Gauge,
  User,
  Radio,
  Cpu,
  Layers,
  Sparkle,
  Activity,
  CheckCircle2,
  AlertCircle,
  Headphones,
} from "lucide-react";

interface ZakiVoiceSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ZakiVoiceSettingsModal: React.FC<ZakiVoiceSettingsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { voiceConfig, setVoiceConfig, selectedLanguage } = useLanguageContext();
  const [isPlayingSample, setIsPlayingSample] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"presets" | "custom" | "providers" | "diagnosis">("presets");
  const [availableVoices, setAvailableVoices] = useState<TTSVoiceInfo[]>([]);
  const [diagnosis, setDiagnosis] = useState<VoiceEngineDiagnosis | null>(null);

  useEffect(() => {
    if (isOpen) {
      ttsManager.getAvailableVoices().then((voices) => {
        setAvailableVoices(voices);
      });
      setDiagnosis(ttsManager.getDiagnosis(selectedLanguage.speechLang, voiceConfig.gender));
    }
  }, [isOpen, selectedLanguage.speechLang, voiceConfig.gender]);

  if (!isOpen) return null;

  const currentSpeedPreset: SpeechSpeedPreset = voiceConfig.speedPreset || (
    voiceConfig.rate <= 0.8 ? "slow" : voiceConfig.rate >= 1.0 ? "fast" : "normal"
  );

  const currentGender: VoiceGender = voiceConfig.gender || "boy";

  const handleSpeedPresetSelect = (preset: SpeechSpeedPreset) => {
    let rate = 0.85;
    if (preset === "slow") rate = 0.76;
    else if (preset === "normal") rate = 0.85;
    else if (preset === "fast") rate = 1.05;

    setVoiceConfig({
      ...voiceConfig,
      rate,
      speedPreset: preset,
    });
    ttsManager.saveConfig({ rate, speedPreset: preset });
    setDiagnosis(ttsManager.getDiagnosis(selectedLanguage.speechLang, voiceConfig.gender));
  };

  const handleGenderSelect = (gender: VoiceGender) => {
    let pitch = 1.08;
    if (gender === "boy") pitch = 1.08;
    else if (gender === "girl") pitch = 1.15;
    else if (gender === "robot") pitch = 0.88;
    else if (gender === "teacher") pitch = 1.0;

    setVoiceConfig({
      ...voiceConfig,
      gender,
      pitch,
    });
    ttsManager.saveConfig({ gender, pitch });
    setDiagnosis(ttsManager.getDiagnosis(selectedLanguage.speechLang, gender));
  };

  const handleSelectPreset = (preset: (typeof VOICE_PRESETS)[0]) => {
    const updated = {
      ...voiceConfig,
      voicePreset: preset.id as any,
      pitch: preset.pitch,
      rate: preset.rate,
      gender: preset.gender,
    };
    setVoiceConfig(updated);
    ttsManager.saveConfig(updated);
    setDiagnosis(ttsManager.getDiagnosis(selectedLanguage.speechLang, preset.gender));
  };

  const playPresetSample = (preset: (typeof VOICE_PRESETS)[0]) => {
    stopSpeech();
    setIsPlayingSample(preset.id);

    let sampleText = preset.samplePhrase;
    if (selectedLanguage.id === "darija") {
      sampleText = `مرحباً بيك أ صاحبي المبدع! أنا زكي فنمط ${preset.name}! دابا غادي نتعلمو ونبرمجو أحسن مشاريع بالذكاء الاصطناعي تبارك الله عليك!`;
    } else if (selectedLanguage.id === "fr") {
      sampleText = `Bonjour ! Je suis Zaki dans mon mode ${preset.name}! Prêt pour une aventure en IA ?`;
    } else if (selectedLanguage.id === "en") {
      sampleText = `Hello there! I am Zaki in my ${preset.name} voice mode! Let's build AI projects together!`;
    }

    speakText(
      sampleText,
      () => {
        setIsPlayingSample(null);
      },
      {
        pitch: preset.pitch,
        rate: preset.rate,
        gender: preset.gender,
        lang: selectedLanguage.speechLang,
      }
    );
  };

  const handleTestCustomVoice = () => {
    if (isPlayingSample === "custom") {
      stopSpeech();
      setIsPlayingSample(null);
      return;
    }

    stopSpeech();
    setIsPlayingSample("custom");

    let text = "مرحباً يا بطل! هذا صوتي المخصص بعد تحسين النطق وسرعة الكلام لتكون طبيعية ومريحة لك!";
    if (selectedLanguage.id === "darija") {
      text = "مرحباً بيك أ صاحبي! هذا صوتي بالدارجة المغربية، دابا كنهضرو بطريقة واضحة ومزيانة بفضل التحسينات الصوتية الجديدة!";
    }

    if (currentGender === "girl") {
      text = selectedLanguage.id === "darija"
        ? "أهلاً أ صاحبي! أنا سلمى، فرحانة بزاف حيت كنتعلمو ونبتكرو معاً في المنصة!"
        : "أهلاً يا صديقي المبدع! أنا سلمى، سعيدة بالتعلم والاستكشاف معك اليوم!";
    } else if (currentGender === "robot") {
      text = "تم ضبط وحدات الصوت الذكي والترددات الدافئة! جاهز لحل المسائل وبرمجة المشاريع معك!";
    }

    if (selectedLanguage.id === "fr") {
      text = "Bonjour mon ami ! Voici ma voix personnalisée avec un rythme naturel et chaleureux !";
    } else if (selectedLanguage.id === "en") {
      text = "Hello my friend! Here is my custom warm voice tuned with natural human pacing!";
    }

    speakText(
      text,
      () => {
        setIsPlayingSample(null);
      },
      {
        ...voiceConfig,
        lang: selectedLanguage.speechLang,
      }
    );
  };

  const handleResetDefaults = () => {
    const defaultPreset = VOICE_PRESETS[0];
    const def = {
      pitch: 1.08,
      rate: 0.85,
      voicePreset: defaultPreset.id as any,
      lang: selectedLanguage.speechLang,
      speedPreset: "normal" as const,
      gender: "boy" as const,
    };
    setVoiceConfig(def);
    ttsManager.saveConfig(def);
    setDiagnosis(ttsManager.getDiagnosis(selectedLanguage.speechLang, "boy"));
  };

  const activePreset = VOICE_PRESETS.find((p) => p.id === voiceConfig.voicePreset) || VOICE_PRESETS[0];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md dir-rtl overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="w-full max-w-2xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl shadow-2xl border border-indigo-500/30 overflow-hidden flex flex-col my-auto"
        >
          {/* Header */}
          <div className="p-5 sm:p-6 bg-gradient-to-r from-amber-500/20 via-indigo-500/20 to-purple-500/20 border-b border-indigo-800/60 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-400 to-orange-500 flex items-center justify-center text-2xl shadow-lg shadow-amber-500/20 shrink-0">
                🎙️
              </div>
              <div>
                <h3 className="text-xl font-black text-white flex items-center gap-2">
                  <span>إعدادات وجودة صوت زكي</span>
                  <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
                </h3>
                <p className="text-xs text-slate-300 font-bold mt-0.5">
                  صوت دافئ وطبيعي للأطفال (0.85x)، دعم الدارجة المغربية والفصحى! 🌟
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                stopSpeech();
                onClose();
              }}
              className="p-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-2 p-2 bg-slate-950/60 border-b border-indigo-950/60 px-5 overflow-x-auto no-scrollbar">
            <button
              onClick={() => setActiveTab("presets")}
              className={`py-2 px-3 rounded-xl text-xs font-black transition flex items-center justify-center gap-1.5 shrink-0 cursor-pointer ${
                activeTab === "presets"
                  ? "bg-amber-500 text-slate-950 shadow-md"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Sparkle className="w-3.5 h-3.5" />
              <span>الشخصيات الصوتية</span>
            </button>

            <button
              onClick={() => setActiveTab("custom")}
              className={`py-2 px-3 rounded-xl text-xs font-black transition flex items-center justify-center gap-1.5 shrink-0 cursor-pointer ${
                activeTab === "custom"
                  ? "bg-amber-500 text-slate-950 shadow-md"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>السرعة ونوع الصوت (ولد / بنت)</span>
            </button>

            <button
              onClick={() => setActiveTab("diagnosis")}
              className={`py-2 px-3 rounded-xl text-xs font-black transition flex items-center justify-center gap-1.5 shrink-0 cursor-pointer ${
                activeTab === "diagnosis"
                  ? "bg-amber-500 text-slate-950 shadow-md"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>تشخيص جودة الصوت 🔍</span>
            </button>

            <button
              onClick={() => setActiveTab("providers")}
              className={`py-2 px-3 rounded-xl text-xs font-black transition flex items-center justify-center gap-1.5 shrink-0 cursor-pointer ${
                activeTab === "providers"
                  ? "bg-amber-500 text-slate-950 shadow-md"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Cpu className="w-3.5 h-3.5" />
              <span>الترقية (Azure / ElevenLabs)</span>
            </button>
          </div>

          {/* Body Content */}
          <div className="p-5 sm:p-6 space-y-6 overflow-y-auto max-h-[65vh]">
            {/* Quick Test Bar */}
            <div className="p-4 rounded-2xl bg-indigo-900/40 border border-indigo-500/40 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{activePreset.icon}</span>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-amber-300 font-extrabold uppercase tracking-wider">
                      الصوت المختار:
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-amber-400/20 text-amber-300 text-[10px] font-black">
                      {currentGender === "girl" ? "بنت 👧" : currentGender === "robot" ? "روبوت 🤖" : currentGender === "teacher" ? "معلم 🎓" : "ولد 👦"}
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-cyan-400/20 text-cyan-300 text-[10px] font-black">
                      {currentSpeedPreset === "slow" ? "بطيء 🐢 (0.76x)" : currentSpeedPreset === "fast" ? "سريع ⚡ (1.05x)" : "طبيعي للأطفال 🚶 (0.85x)"}
                    </span>
                  </div>
                  <h4 className="font-extrabold text-sm text-white mt-0.5">{activePreset.name}</h4>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleTestCustomVoice}
                  className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl text-xs font-black transition flex items-center gap-1.5 cursor-pointer shadow-md shrink-0 active:scale-95"
                >
                  {isPlayingSample === "custom" ? (
                    <>
                      <Square className="w-3.5 h-3.5 fill-slate-950 animate-pulse" />
                      <span>إيقاف الصوت</span>
                    </>
                  ) : (
                    <>
                      <Volume2 className="w-3.5 h-3.5" />
                      <span>تجربة الصوت 🔊</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => replayLastSpeech()}
                  className="p-2.5 bg-slate-800 hover:bg-slate-700 text-amber-300 rounded-xl transition cursor-pointer border border-slate-700"
                  title="إعادة الاستماع لآخر رسالة"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Tab 1: Presets */}
            {activeTab === "presets" && (
              <div className="space-y-3">
                <h4 className="text-sm font-black text-amber-300 flex items-center gap-2">
                  <Mic className="w-4 h-4 text-amber-400" />
                  <span>اختر نبرة وشخصية زكي المفضلة:</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {VOICE_PRESETS.map((preset) => {
                    const isSelected = voiceConfig.voicePreset === preset.id;
                    const isPlaying = isPlayingSample === preset.id;

                    return (
                      <motion.div
                        key={preset.id}
                        whileHover={{ scale: 1.01 }}
                        className={`p-3.5 rounded-2xl border-2 transition flex flex-col justify-between gap-3 ${
                          isSelected
                            ? "bg-amber-500/15 border-amber-400 ring-2 ring-amber-400/20 shadow-lg shadow-amber-500/10"
                            : "bg-slate-800/80 border-slate-700 hover:bg-slate-800"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2.5">
                            <span className="text-2xl">{preset.icon}</span>
                            <div>
                              <div className="flex items-center gap-1.5">
                                <h5 className="font-extrabold text-sm text-white">{preset.name}</h5>
                              </div>
                              <p className="text-[11px] text-slate-300 font-medium leading-tight mt-0.5">
                                {preset.description}
                              </p>
                            </div>
                          </div>

                          {isSelected && (
                            <div className="w-6 h-6 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center shrink-0 font-bold">
                              <Check className="w-4 h-4 stroke-[3]" />
                            </div>
                          )}
                        </div>

                        {/* Action buttons inside preset card */}
                        <div className="flex items-center justify-between pt-2 border-t border-slate-700/60">
                          <button
                            onClick={() => playPresetSample(preset)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-black transition flex items-center gap-1.5 cursor-pointer ${
                              isPlaying
                                ? "bg-rose-500 text-white"
                                : "bg-slate-700 hover:bg-slate-600 text-amber-300"
                            }`}
                          >
                            {isPlaying ? (
                              <>
                                <Square className="w-3 h-3 fill-white" />
                                <span>جاري الاستماع...</span>
                              </>
                            ) : (
                              <>
                                <Play className="w-3 h-3 fill-amber-300" />
                                <span>استمع لعينة 🔊</span>
                              </>
                            )}
                          </button>

                          {!isSelected && (
                            <button
                              onClick={() => handleSelectPreset(preset)}
                              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-black transition cursor-pointer"
                            >
                              اختيار الشخصية ✓
                            </button>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Tab 2: Custom Speed & Gender Controls */}
            {activeTab === "custom" && (
              <div className="space-y-6">
                {/* 1. Speech Speed Selector */}
                <div className="p-4 bg-slate-900/90 rounded-2xl border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-amber-300 flex items-center gap-2">
                      <Gauge className="w-4 h-4 text-amber-400" />
                      <span>سرعة الكلام (معايرة للأطفال 0.82–0.88):</span>
                    </span>
                    <span className="text-xs font-bold text-cyan-400">
                      معدل القراءة: {voiceConfig.rate.toFixed(2)}x
                    </span>
                  </div>

                  {/* 3 Speed Preset Buttons */}
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => handleSpeedPresetSelect("slow")}
                      className={`p-3 rounded-2xl border-2 text-center transition cursor-pointer ${
                        currentSpeedPreset === "slow"
                          ? "bg-cyan-500/20 border-cyan-400 text-white font-black ring-2 ring-cyan-400/30"
                          : "bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700"
                      }`}
                    >
                      <span className="text-xl block mb-1">🐢</span>
                      <span className="text-xs font-black block">بطيء</span>
                      <span className="text-[10px] text-slate-400">0.76x واضح جداً</span>
                    </button>

                    <button
                      onClick={() => handleSpeedPresetSelect("normal")}
                      className={`p-3 rounded-2xl border-2 text-center transition cursor-pointer ${
                        currentSpeedPreset === "normal"
                          ? "bg-amber-500/20 border-amber-400 text-white font-black ring-2 ring-amber-400/30"
                          : "bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700"
                      }`}
                    >
                      <span className="text-xl block mb-1">🚶</span>
                      <span className="text-xs font-black block">عادي (موصى به)</span>
                      <span className="text-[10px] text-amber-300/90">0.85x نبرة دافئة</span>
                    </button>

                    <button
                      onClick={() => handleSpeedPresetSelect("fast")}
                      className={`p-3 rounded-2xl border-2 text-center transition cursor-pointer ${
                        currentSpeedPreset === "fast"
                          ? "bg-purple-500/20 border-purple-400 text-white font-black ring-2 ring-purple-400/30"
                          : "bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700"
                      }`}
                    >
                      <span className="text-xl block mb-1">⚡</span>
                      <span className="text-xs font-black block">سريع</span>
                      <span className="text-[10px] text-slate-400">1.05x حماسي</span>
                    </button>
                  </div>
                </div>

                {/* 2. Voice Gender Selector */}
                <div className="p-4 bg-slate-900/90 rounded-2xl border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-amber-300 flex items-center gap-2">
                      <User className="w-4 h-4 text-amber-400" />
                      <span>نوع الصوت ونبرة المتحدث (Voice Gender):</span>
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <button
                      onClick={() => handleGenderSelect("boy")}
                      className={`p-3 rounded-2xl border-2 text-center transition cursor-pointer ${
                        currentGender === "boy"
                          ? "bg-indigo-500/20 border-indigo-400 text-white font-black ring-2 ring-indigo-400/30"
                          : "bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700"
                      }`}
                    >
                      <span className="text-2xl block mb-1">👦</span>
                      <span className="text-xs font-black block">صوت ولد</span>
                      <span className="text-[10px] text-indigo-300">فتى ذكي ومرح</span>
                    </button>

                    <button
                      onClick={() => handleGenderSelect("girl")}
                      className={`p-3 rounded-2xl border-2 text-center transition cursor-pointer ${
                        currentGender === "girl"
                          ? "bg-pink-500/20 border-pink-400 text-white font-black ring-2 ring-pink-400/30"
                          : "bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700"
                      }`}
                    >
                      <span className="text-2xl block mb-1">👧</span>
                      <span className="text-xs font-black block">صوت بنت (سلمى)</span>
                      <span className="text-[10px] text-pink-300">فتاة لطيفة ومبدعة</span>
                    </button>

                    <button
                      onClick={() => handleGenderSelect("robot")}
                      className={`p-3 rounded-2xl border-2 text-center transition cursor-pointer ${
                        currentGender === "robot"
                          ? "bg-cyan-500/20 border-cyan-400 text-white font-black ring-2 ring-cyan-400/30"
                          : "bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700"
                      }`}
                    >
                      <span className="text-2xl block mb-1">🤖</span>
                      <span className="text-xs font-black block">روبوت ذكي</span>
                      <span className="text-[10px] text-cyan-300">نبرة تكنولوجية</span>
                    </button>

                    <button
                      onClick={() => handleGenderSelect("teacher")}
                      className={`p-3 rounded-2xl border-2 text-center transition cursor-pointer ${
                        currentGender === "teacher"
                          ? "bg-amber-500/20 border-amber-400 text-white font-black ring-2 ring-amber-400/30"
                          : "bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700"
                      }`}
                    >
                      <span className="text-2xl block mb-1">👨‍🏫</span>
                      <span className="text-xs font-black block">المعلم زكي</span>
                      <span className="text-[10px] text-amber-300">وقور ومدروس</span>
                    </button>
                  </div>
                </div>

                {/* 3. Fine Tuning Sliders */}
                <div className="p-4 bg-slate-950/80 rounded-2xl border border-slate-800 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <span className="text-xs font-black text-cyan-300 flex items-center gap-2">
                      <SlidersHorizontal className="w-4 h-4 text-cyan-400" />
                      <span>الضبط الدقيق المتقدم:</span>
                    </span>
                    <button
                      onClick={handleResetDefaults}
                      className="text-[11px] text-slate-400 hover:text-slate-200 flex items-center gap-1 font-bold cursor-pointer"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>إعادة للافتراضي</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-bold text-slate-300">
                    <div className="space-y-1.5">
                      <div className="flex justify-between">
                        <span>درجة الصوت (Pitch):</span>
                        <span className="text-amber-400">{voiceConfig.pitch.toFixed(2)}</span>
                      </div>
                      <input
                        type="range"
                        min="0.7"
                        max="1.4"
                        step="0.02"
                        value={voiceConfig.pitch}
                        onChange={(e) => {
                          const pitch = parseFloat(e.target.value);
                          setVoiceConfig({ ...voiceConfig, pitch });
                          ttsManager.saveConfig({ pitch });
                        }}
                        className="w-full accent-amber-400 cursor-pointer"
                      />
                      <div className="flex justify-between text-[10px] text-slate-400 font-medium">
                        <span>عميق ووقور (0.85)</span>
                        <span>مرح ودافئ (1.08)</span>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex justify-between">
                        <span>سرعة القراءة (Rate):</span>
                        <span className="text-cyan-400">{voiceConfig.rate.toFixed(2)}</span>
                      </div>
                      <input
                        type="range"
                        min="0.7"
                        max="1.2"
                        step="0.02"
                        value={voiceConfig.rate}
                        onChange={(e) => {
                          const rate = parseFloat(e.target.value);
                          setVoiceConfig({ ...voiceConfig, rate });
                          ttsManager.saveConfig({ rate });
                        }}
                        className="w-full accent-cyan-400 cursor-pointer"
                      />
                      <div className="flex justify-between text-[10px] text-slate-400 font-medium">
                        <span>هادئ للأطفال (0.85)</span>
                        <span>سريع (1.05)</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 3: Diagnosis Card */}
            {activeTab === "diagnosis" && (
              <div className="space-y-4">
                <div className="p-4 bg-slate-900/90 rounded-2xl border border-indigo-500/40 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-black text-amber-300 flex items-center gap-2">
                      <Headphones className="w-4 h-4 text-amber-400" />
                      <span>تقرير المحرك الصوتي النشط (Active Voice Diagnosis):</span>
                    </h4>
                    <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-black">
                      جودة عالية ⭐⭐⭐⭐⭐
                    </span>
                  </div>

                  {diagnosis && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 space-y-1">
                        <span className="text-slate-400 text-[11px] block">اسم الصوت المكتشف بالمتصفح:</span>
                        <span className="font-extrabold text-white text-sm block truncate">
                          {diagnosis.selectedVoiceName}
                        </span>
                        <span className="text-[10px] text-slate-400">اللغة: {diagnosis.selectedVoiceLang}</span>
                      </div>

                      <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 space-y-1">
                        <span className="text-slate-400 text-[11px] block">تصنيف محرك الصوت:</span>
                        <div className="flex flex-wrap gap-1.5 mt-1">
                          {diagnosis.isMoroccan && (
                            <span className="px-2 py-0.5 rounded-md bg-rose-500/20 text-rose-300 text-[10px] font-bold">
                              🇲🇦 صوت مغربي مخصص
                            </span>
                          )}
                          {diagnosis.isNaturalNeural && (
                            <span className="px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-300 text-[10px] font-bold">
                              🧠 نبرة عصبية طبيعية (Neural)
                            </span>
                          )}
                          <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 text-[10px] font-bold">
                            🗣️ {diagnosis.totalArabicVoicesFound} أصوات عربية متاحة
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Phonetic & Chunking Pipeline info */}
                  <div className="p-3.5 bg-indigo-950/60 rounded-xl border border-indigo-800/60 text-xs space-y-2 text-slate-300">
                    <div className="flex items-center gap-2 text-amber-300 font-bold">
                      <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                      <span>نظام المعالجة الصوتية الدقيقة (Acoustic Pipeline):</span>
                    </div>
                    <ul className="space-y-1 text-[11px] text-slate-300 pr-5 list-disc">
                      <li>تجزئة النصوص الطويلة إلى جمل قصيرة (35-75 حرف) لإعطاء فترات تنفس طبيعية (90ms).</li>
                      <li>التشكيل الصوتي التلقائي لكلمات الدارجة المغربية (دْيَالَكْ، مْزْيَانْ، بْزَّافْ، شْنُو، كِيفَاشْ) لنطق سليم.</li>
                      <li>ضبط سرعة القراءة تلقائياً على 0.85x لتجنب السرعة الآلية ومنح نبرة دافئة وودية.</li>
                      <li>إلغاء فوري للكلام السابق بنقرة واحدة لتفادي تداخل الأصوات.</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 4: Providers & Upgrades (Azure / ElevenLabs / WebSpeech) */}
            {activeTab === "providers" && (
              <div className="space-y-4">
                <div className="p-4 bg-slate-900/90 rounded-2xl border border-indigo-500/30 space-y-2">
                  <h4 className="text-sm font-black text-amber-300 flex items-center gap-2">
                    <Layers className="w-4 h-4 text-amber-400" />
                    <span>هيكلية محركات الصوت الاصطناعي (TTS Architecture):</span>
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    تم تصميم نظام زكي بنمط المزودات المنفصلة (Provider Pattern) لدعم المتصفح الحالي مع جاهزية فورية للترقية للأصوات العصبية السحابية فائقة الجودة.
                  </p>
                </div>

                <div className="space-y-3">
                  {/* Provider 1: Web Speech API */}
                  <div className="p-3.5 bg-slate-800/80 rounded-2xl border border-emerald-500/40 flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-black">
                          ● نشط حالياً (Active Engine)
                        </span>
                        <h5 className="font-extrabold text-sm text-white">المتصفح الذكي المحسّن (Web Speech API)</h5>
                      </div>
                      <p className="text-xs text-slate-300">
                        مجهز بأفضل خوارزمية للعثور على الصوت المغربي (ar-MA) والعربي الفصيح، تقسيم الجمل، وتطبيق الإيقاع الطبيعي للأطفال.
                      </p>
                    </div>
                  </div>

                  {/* Provider 2: Azure Neural Voices */}
                  <div className="p-3.5 bg-slate-800/60 rounded-2xl border border-blue-500/30 flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 text-[10px] font-black">
                          🚀 جاهز للربط (Ready Adapter)
                        </span>
                        <h5 className="font-extrabold text-sm text-white">أصوات مايكروسوفت أزور العصبية (Azure Neural)</h5>
                      </div>
                      <p className="text-xs text-slate-300">
                        يدعم أصوات <code className="text-amber-300">ar-MA-MounaNeural</code> و <code className="text-amber-300">ar-SA-ZariyahNeural</code> مع تحكم كامل بـ SSML.
                      </p>
                    </div>
                  </div>

                  {/* Provider 3: ElevenLabs */}
                  <div className="p-3.5 bg-slate-800/60 rounded-2xl border border-purple-500/30 flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-[10px] font-black">
                          ✨ جاهز للربط (Ready Adapter)
                        </span>
                        <h5 className="font-extrabold text-sm text-white">إليفن لابس للأطفال (ElevenLabs AI Voice)</h5>
                      </div>
                      <p className="text-xs text-slate-300">
                        محول مخصص لنبرات المساعدين الكرتونيين والشخصيات التعليمية مع معاملات الاستقرار العالية.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer controls */}
          <div className="p-4 sm:p-5 bg-slate-900 border-t border-indigo-900/80 flex items-center justify-between gap-4">
            <div className="text-xs text-slate-400 font-bold hidden sm:flex items-center gap-2">
              <span>اللغة المفضلة:</span>
              <span className="text-amber-300 font-black">{selectedLanguage.nativeName}</span>
            </div>

            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => {
                stopSpeech();
                onClose();
              }}
              className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-600 hover:to-orange-600 text-white rounded-2xl text-sm font-black transition shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Wand2 className="w-4 h-4 text-amber-200" />
              <span>تأكيد وحفظ إعدادات الصوت 🚀</span>
            </motion.button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
