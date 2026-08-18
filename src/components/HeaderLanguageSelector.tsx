import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { useLanguageContext, LANGUAGES, LanguageCode } from "../context/LanguageContext";
import { Globe, Check, Volume2, Sparkles, X, ChevronDown } from "lucide-react";
import { speakText, stopSpeech } from "../data/mascot";

export const HeaderLanguageSelector: React.FC = () => {
  const {
    selectedLanguage,
    changeLanguage,
    isLanguageModalOpen,
    setIsLanguageModalOpen,
    direction,
    t,
  } = useLanguageContext();

  const handleSelect = (langId: LanguageCode) => {
    stopSpeech();
    changeLanguage(langId, true);
  };

  const handlePreviewVoice = (langId: LanguageCode, e: React.MouseEvent) => {
    e.stopPropagation();
    stopSpeech();
    const target = LANGUAGES.find((l) => l.id === langId) || LANGUAGES[0];

    let previewPhrase = "مرحباً بيك أ صاحبي فـ مُعلِّمُ الذَّكاءِ بالدارجة المغربية!";
    if (langId === "ar") {
      previewPhrase = "أهلاً بك يا صديقي المبدع في مُعلِّمُ الذَّكاءِ بالعربية الفصحى!";
    } else if (langId === "fr") {
      previewPhrase = "Bonjour mon ami ! Bienvenue dans l'Académie d'IA en français !";
    } else if (langId === "en") {
      previewPhrase = "Hello my friend! Welcome to the AI Academy in English!";
    }

    speakText(previewPhrase, undefined, {
      lang: target.speechLang,
    });
  };

  return (
    <>
      {/* Prominent Header Trigger Button */}
      <motion.button
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.96 }}
        onClick={() => setIsLanguageModalOpen(true)}
        className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500/15 via-indigo-500/15 to-purple-500/15 hover:from-amber-500/25 hover:to-purple-500/25 border-2 border-indigo-200/80 text-slate-800 text-xs font-black transition-all shadow-xs cursor-pointer group"
        title={t.header.languageModalTitle}
      >
        <span className="text-base leading-none group-hover:scale-110 transition-transform">
          {selectedLanguage.flag}
        </span>
        <span className="max-w-[70px] sm:max-w-[110px] truncate text-slate-800">
          {selectedLanguage.id === "darija"
            ? "الدارجة 🇲🇦"
            : selectedLanguage.id === "ar"
            ? "الفصحى 🇸🇦"
            : selectedLanguage.id === "fr"
            ? "Français 🇫🇷"
            : "English 🇬🇧"}
        </span>
        <ChevronDown className="w-3.5 h-3.5 text-indigo-600 opacity-70 group-hover:opacity-100 transition-opacity" />
      </motion.button>

      {/* Synchronous Language Selection Modal */}
      <AnimatePresence>
        {isLanguageModalOpen && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto"
            dir={direction}
            onClick={() => setIsLanguageModalOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 15 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border-2 border-indigo-100 overflow-hidden flex flex-col my-auto"
            >
              {/* Modal Header */}
              <div className="p-5 sm:p-6 bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-700 text-white flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-white/20 border border-white/30 flex items-center justify-center text-2xl shadow-xs shrink-0">
                    <Globe className="w-6 h-6 text-amber-300 animate-spin-slow" />
                  </div>
                  <div>
                    <h3 className="text-lg sm:text-xl font-black flex items-center gap-2">
                      <span>{t.header.languageModalTitle}</span>
                      <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
                    </h3>
                    <p className="text-xs text-indigo-100 font-medium mt-0.5">
                      {t.header.languageModalSubtitle}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setIsLanguageModalOpen(false)}
                  className="p-2 rounded-xl bg-white/15 hover:bg-white/25 text-white transition cursor-pointer"
                  title={t.header.close}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Real-time Sync Guarantee Banner */}
              <div className="px-5 py-2.5 bg-amber-50 border-b border-amber-200 text-amber-900 text-xs font-black flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                <span>تزامن فوري وتام: الواجهة + ردود زكي + محرك النطق الصوتي (TTS) 🚀</span>
              </div>

              {/* 4 Language Options Grid */}
              <div className="p-5 sm:p-6 space-y-3">
                {LANGUAGES.filter((l) => l.id !== "amazigh").map((lang) => {
                  const isSelected = selectedLanguage.id === lang.id;

                  return (
                    <motion.div
                      key={lang.id}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      onClick={() => handleSelect(lang.id)}
                      className={`p-4 rounded-2xl border-2 transition-all flex items-center justify-between gap-3 cursor-pointer ${
                        isSelected
                          ? "bg-indigo-50/90 border-indigo-600 ring-2 ring-indigo-500/20 shadow-md"
                          : "bg-slate-50 border-slate-200 hover:bg-slate-100 hover:border-slate-300"
                      }`}
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        <span className="text-3xl sm:text-4xl shrink-0 p-1 bg-white rounded-xl shadow-2xs border border-slate-200">
                          {lang.flag}
                        </span>

                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="font-black text-sm sm:text-base text-slate-900">
                              {lang.name}
                            </h4>
                            {isSelected && (
                              <span className="px-2 py-0.5 rounded-md bg-indigo-600 text-white text-[10px] font-black">
                                النشطة حالياً ✓
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-600 font-medium mt-0.5 line-clamp-1">
                            {lang.description}
                          </p>
                        </div>
                      </div>

                      {/* Right Action: Voice Preview & Active Checkmark */}
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={(e) => handlePreviewVoice(lang.id, e)}
                          className="p-2 rounded-xl bg-white hover:bg-amber-100 border border-slate-200 hover:border-amber-300 text-amber-700 transition shadow-2xs cursor-pointer"
                          title="تجربة نطق الصوت بهذه اللغة"
                        >
                          <Volume2 className="w-4 h-4" />
                        </button>

                        <div
                          className={`w-7 h-7 rounded-full flex items-center justify-center font-black transition-colors ${
                            isSelected
                              ? "bg-indigo-600 text-white shadow-xs"
                              : "bg-slate-200 text-transparent"
                          }`}
                        >
                          <Check className="w-4 h-4 stroke-[3]" />
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* Modal Footer */}
              <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-500 font-bold">
                  يتم حفظ اختيارك تلقائياً في المتصفح 💾
                </span>

                <button
                  onClick={() => setIsLanguageModalOpen(false)}
                  className="px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-black transition cursor-pointer shadow-xs"
                >
                  {t.header.close}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
