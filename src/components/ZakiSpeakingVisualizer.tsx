import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ttsManager, stopSpeech, replayLastSpeech } from "../data/speech/ttsManager";
import { Volume2, Square, RotateCcw, Sparkles, Mic, SlidersHorizontal } from "lucide-react";
import { useLanguageContext } from "../context/LanguageContext";

interface ZakiSpeakingVisualizerProps {
  onOpenSettings?: () => void;
  className?: string;
  variant?: "floating" | "inline" | "banner";
}

export const ZakiSpeakingVisualizer: React.FC<ZakiSpeakingVisualizerProps> = ({
  onOpenSettings,
  className = "",
  variant = "inline",
}) => {
  const [isSpeaking, setIsSpeaking] = useState(ttsManager.isSpeaking);
  const { selectedPersona, selectedLanguage, voiceConfig } = useLanguageContext();

  useEffect(() => {
    const unsub = ttsManager.onSpeakingChange((speaking) => {
      setIsSpeaking(speaking);
    });
    return unsub;
  }, []);

  const diagnosis = ttsManager.getDiagnosis(selectedLanguage.speechLang, voiceConfig.gender);

  if (!isSpeaking && variant !== "inline") return null;

  if (variant === "inline") {
    return (
      <div
        className={`flex items-center justify-between gap-3 px-4 py-2.5 rounded-2xl transition-all duration-300 ${
          isSpeaking
            ? "bg-gradient-to-r from-amber-500/15 via-orange-500/15 to-purple-500/15 border border-amber-400/40 text-amber-900 shadow-sm"
            : "bg-slate-50 border border-slate-200/80 text-slate-600"
        } ${className}`}
      >
        <div className="flex items-center gap-2.5">
          {/* Animated Wave / Speaker Icon */}
          <div
            className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm shadow-xs ${
              isSpeaking
                ? "bg-amber-500 text-white animate-pulse"
                : "bg-slate-200 text-slate-600"
            }`}
          >
            {isSpeaking ? <Volume2 className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </div>

          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-black text-slate-800">
                {isSpeaking ? `زكي يتحدث الآن (${selectedPersona.name})` : "صوت زكي جاهز"}
              </span>
              {isSpeaking && (
                <span className="flex items-center gap-0.5 px-1.5 py-0.5 bg-amber-100 text-amber-800 rounded-full text-[10px] font-bold">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping"></span>
                  {voiceConfig.speedPreset === "slow" ? "بطيء 0.76x" : voiceConfig.speedPreset === "fast" ? "سريع 1.05x" : "طبيعي 0.85x"}
                </span>
              )}
            </div>

            {/* Visualizer Sound Waves */}
            {isSpeaking ? (
              <div className="flex items-center gap-1 h-3 mt-1">
                {[12, 24, 16, 28, 20, 14, 26, 18, 22].map((height, idx) => (
                  <motion.span
                    key={idx}
                    className="w-1 bg-amber-500 rounded-full"
                    animate={{
                      height: ["4px", `${height}px`, "4px"],
                    }}
                    transition={{
                      repeat: Infinity,
                      duration: 0.6 + (idx % 3) * 0.2,
                      ease: "easeInOut",
                      delay: idx * 0.08,
                    }}
                  />
                ))}
              </div>
            ) : (
              <span className="text-[11px] text-slate-500 truncate max-w-[200px]">
                {diagnosis.selectedVoiceName || "صوت طبيعي للأطفال"}
              </span>
            )}
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5">
          {isSpeaking ? (
            <button
              onClick={() => stopSpeech()}
              className="px-3 py-1.5 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-xs font-black flex items-center gap-1 shadow-xs transition active:scale-95 cursor-pointer"
              title="إيقاف الصوت فوراً"
            >
              <Square className="w-3.5 h-3.5 fill-current" />
              <span>إيقاف 🛑</span>
            </button>
          ) : (
            <button
              onClick={() => replayLastSpeech()}
              className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-xl text-xs font-black flex items-center gap-1 shadow-2xs transition active:scale-95 cursor-pointer"
              title="إعادة قراءة آخر رسالة"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>إعادة الاستماع 🔄</span>
            </button>
          )}

          {onOpenSettings && (
            <button
              onClick={onOpenSettings}
              className="p-1.5 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-600 transition cursor-pointer"
              title="إعدادات الصوت"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    );
  }

  // Floating Pill Variant
  return (
    <AnimatePresence>
      {isSpeaking && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-5 py-3 bg-slate-900/90 backdrop-blur-md text-white rounded-full shadow-2xl border border-amber-400/40 ${className}`}
        >
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-amber-400 rounded-full animate-ping"></span>
            {/* Animated Equalizer Wave */}
            <div className="flex items-center gap-1 h-4">
              {[8, 16, 10, 18, 14, 20, 12].map((h, i) => (
                <motion.span
                  key={i}
                  className="w-1 bg-gradient-to-t from-amber-400 to-orange-300 rounded-full"
                  animate={{
                    height: ["3px", `${h}px`, "3px"],
                  }}
                  transition={{
                    repeat: Infinity,
                    duration: 0.5 + (i % 3) * 0.15,
                    ease: "easeInOut",
                    delay: i * 0.06,
                  }}
                />
              ))}
            </div>
            <span className="text-xs font-black text-amber-200">
              زكي يتحدث الآن...
            </span>
          </div>

          <button
            onClick={() => stopSpeech()}
            className="px-3 py-1 bg-rose-500 hover:bg-rose-600 text-white rounded-full text-xs font-black flex items-center gap-1 transition cursor-pointer"
          >
            <Square className="w-3 h-3 fill-current" />
            <span>إيقاف</span>
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
