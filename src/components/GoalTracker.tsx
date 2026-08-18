import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { UserProgress, WeeklyGoal } from "../types";
import {
  Target,
  Trophy,
  Sparkles,
  Award,
  CheckCircle2,
  Edit2,
  Plus,
  Rocket,
  Zap,
  Flame,
  Star,
  ChevronLeft,
  X,
  TrendingUp,
} from "lucide-react";
import { speakText } from "../data/mascot";

interface GoalTrackerProps {
  progress: UserProgress;
  onSetGoal: (newGoal: WeeklyGoal) => void;
  onClaimGoalReward?: (rewardXP: number) => void;
  soundEnabled?: boolean;
}

const PRESET_GOALS = [
  {
    title: "🚀 بطل المبتدئين: تعلم 1 درساً جديداً وجمع 100 نقطة",
    targetXP: 100,
    icon: "🌱",
    desc: "مناسب للبدايات السريعة والتعرف على أساسيات الذكاء الاصطناعي",
  },
  {
    title: "📚 المستكشف النشط: تعلم 2 مفهومين جديدين وجمع 150 نقطة",
    targetXP: 150,
    icon: "🚀",
    desc: "هدف أسبوعي متوازن يضمن لك التطور والوصول لمستويات أعلى",
  },
  {
    title: "🧪 بطل المختبر: إنجاز تجارب المختبر وجمع 200 نقطة",
    targetXP: 200,
    icon: "🧪",
    desc: "تحدٍ ممتع يتضمن التدريب العملي ونماذج الرؤية الحاسوبية",
  },
  {
    title: "🏆 عبقري الذكاء الاصطناعي: إكمال المنهج وجمع 300 نقطة",
    targetXP: 300,
    icon: "👑",
    desc: "أعلى مستوى تحدٍ أسبوعي للأبطال الشغوفين المتميزين!",
  },
];

export const GoalTracker: React.FC<GoalTrackerProps> = ({
  progress,
  onSetGoal,
  onClaimGoalReward,
  soundEnabled = true,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPresetIndex, setSelectedPresetIndex] = useState<number | null>(1);
  const [customTitle, setCustomTitle] = useState("");
  const [customTargetXP, setCustomTargetXP] = useState(150);
  const [isCustomMode, setIsCustomMode] = useState(false);

  const activeGoal = progress.weeklyGoal;

  // Calculate Progress
  const earnedXP = activeGoal ? Math.max(0, progress.xp - activeGoal.startXP) : 0;
  const targetXP = activeGoal ? activeGoal.targetXP : 150;
  const progressPercent = activeGoal
    ? Math.min(100, Math.round((earnedXP / targetXP) * 100))
    : 0;

  const isGoalCompleted = activeGoal ? progressPercent >= 100 : false;

  const handleSaveGoal = () => {
    let titleToSet = "";
    let targetXPToSet = 150;

    if (isCustomMode && customTitle.trim()) {
      titleToSet = customTitle.trim();
      targetXPToSet = customTargetXP;
    } else if (selectedPresetIndex !== null) {
      const preset = PRESET_GOALS[selectedPresetIndex];
      titleToSet = preset.title;
      targetXPToSet = preset.targetXP;
    } else {
      titleToSet = "تعلم مفهومين جديدين وجمع 150 نقطة XP هذا الأسبوع 🚀";
      targetXPToSet = 150;
    }

    const newGoal: WeeklyGoal = {
      id: "goal-" + Date.now(),
      title: titleToSet,
      targetXP: targetXPToSet,
      startXP: progress.xp,
      startLessonsCount: progress.completedLessons.length,
      createdAt: new Date().toISOString(),
      isCompleted: false,
    };

    onSetGoal(newGoal);
    setIsModalOpen(false);

    if (soundEnabled) {
      speakText(`ممتاز يا بطل! تم حديد هدفك الأسبوعي بنجاح: ${titleToSet}. انطلق وحققه الآن! 🚀🎯`);
    }
  };

  const handleClaimReward = () => {
    if (onClaimGoalReward && activeGoal && !activeGoal.isCompleted) {
      onClaimGoalReward(50); // Give 50 XP bonus
      // Mark active goal as completed
      onSetGoal({
        ...activeGoal,
        isCompleted: true,
      });

      if (soundEnabled) {
        speakText("ألف مبروك يا بطل! تم إنجاز هدفك الأسبوعي كاملاً وحصلت على +50 XP مكافأة التحدي! 🎉🏆");
      }
    }
  };

  return (
    <div className="dir-rtl w-full">
      {/* Main Container Card */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="p-6 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 rounded-[32px] border border-indigo-500/30 text-white shadow-2xl relative overflow-hidden"
      >
        {/* Glow Background Decor */}
        <div className="absolute top-0 left-1/4 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 right-0 w-60 h-60 bg-purple-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 space-y-5">
          {/* Header Row */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 p-0.5 shadow-lg shadow-amber-500/20">
                <div className="w-full h-full bg-slate-900 rounded-[14px] flex items-center justify-center">
                  <Target className="w-6 h-6 text-amber-400" />
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-black text-white">هدف التحدي الأسبوعي 🎯</h3>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-indigo-500/30 text-indigo-200 border border-indigo-400/30">
                    هدف خاص بالطفل
                  </span>
                </div>
                <p className="text-xs font-bold text-slate-300">
                  حدد أهدافك الشخصية وراقب إنجازك خطوة بخطوة
                </p>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-black text-xs rounded-xl shadow-md transition flex items-center gap-2 cursor-pointer border border-indigo-400/30"
            >
              {activeGoal ? (
                <>
                  <Edit2 className="w-3.5 h-3.5 text-amber-300" />
                  <span>تعديل الهدف</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 text-amber-300" />
                  <span>تحديد هدف جديد</span>
                </>
              )}
            </motion.button>
          </div>

          {/* Active Goal Display OR Empty State */}
          {activeGoal ? (
            <div className="space-y-4">
              {/* Goal Title Box */}
              <div className="p-4 bg-slate-800/80 rounded-2xl border border-slate-700/80 flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-amber-300 font-extrabold text-xs">
                    <Rocket className="w-4 h-4" />
                    <span>الهدف المحدد حالياً:</span>
                  </div>
                  <h4 className="text-base font-black text-white leading-relaxed">
                    {activeGoal.title}
                  </h4>
                </div>

                <div className="text-left shrink-0 bg-slate-900/90 px-3 py-1.5 rounded-xl border border-slate-700">
                  <span className="text-[10px] text-slate-400 block font-bold">المطلوب</span>
                  <span className="text-xs font-black text-emerald-400">{activeGoal.targetXP} XP</span>
                </div>
              </div>

              {/* Progress Bar & Numerical Metrics */}
              <div className="p-4 bg-slate-900/90 rounded-2xl border border-indigo-500/20 space-y-3">
                <div className="flex items-center justify-between text-xs font-black">
                  <span className="text-slate-300 flex items-center gap-1.5">
                    <TrendingUp className="w-4 h-4 text-cyan-400" />
                    <span>التقدم المحقق:</span>
                    <strong className="text-cyan-300">{earnedXP} XP</strong>
                    <span className="text-slate-500">من {targetXP} XP</span>
                  </span>

                  <span className={`px-3 py-1 rounded-full text-xs font-black border ${
                    isGoalCompleted
                      ? "bg-emerald-500/20 border-emerald-400 text-emerald-300"
                      : "bg-amber-500/20 border-amber-400 text-amber-300"
                  }`}>
                    {progressPercent}% مكتمل
                  </span>
                </div>

                {/* Main Progress Bar Track */}
                <div className="w-full bg-slate-800 h-4 rounded-full overflow-hidden p-0.5 border border-slate-700 relative">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPercent}%` }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className={`h-full rounded-full transition-all relative ${
                      isGoalCompleted
                        ? "bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 shadow-lg shadow-emerald-500/50"
                        : "bg-gradient-to-r from-amber-400 via-orange-400 to-indigo-500"
                    }`}
                  >
                    {/* Animated shine line */}
                    <div className="absolute inset-0 bg-white/20 animate-pulse rounded-full"></div>
                  </motion.div>
                </div>

                {/* Milestone Stepper */}
                <div className="grid grid-cols-4 gap-2 pt-1 text-center text-[10px] font-extrabold text-slate-400">
                  <div className={`p-1.5 rounded-lg border ${earnedXP >= targetXP * 0.25 ? "bg-indigo-950/80 border-indigo-500 text-indigo-300" : "bg-slate-800/50 border-slate-700"}`}>
                    <span>25% (البداية)</span>
                  </div>
                  <div className={`p-1.5 rounded-lg border ${earnedXP >= targetXP * 0.5 ? "bg-indigo-950/80 border-indigo-500 text-indigo-300" : "bg-slate-800/50 border-slate-700"}`}>
                    <span>50% (نصف الطريق)</span>
                  </div>
                  <div className={`p-1.5 rounded-lg border ${earnedXP >= targetXP * 0.75 ? "bg-indigo-950/80 border-indigo-500 text-indigo-300" : "bg-slate-800/50 border-slate-700"}`}>
                    <span>75% (اقتربت!)</span>
                  </div>
                  <div className={`p-1.5 rounded-lg border ${isGoalCompleted ? "bg-emerald-950/80 border-emerald-500 text-emerald-300" : "bg-slate-800/50 border-slate-700"}`}>
                    <span>100% (إنجاز! 🏆)</span>
                  </div>
                </div>
              </div>

              {/* Goal Reached Celebration Banner */}
              {isGoalCompleted && (
                <motion.div
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="p-4 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 rounded-2xl text-white shadow-xl border border-amber-300/50 flex flex-col sm:flex-row items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center text-2xl shrink-0">
                      🎉
                    </div>
                    <div>
                      <h5 className="font-black text-sm text-yellow-200">مبروك يا بطل! حققت هدفك الأسبوعي بنجاح 🏆</h5>
                      <p className="text-xs text-emerald-100 font-bold">
                        أثبت أنك قادر على التحدي والوصول إلى أهدافك بجد واجتهاد!
                      </p>
                    </div>
                  </div>

                  {!activeGoal.isCompleted ? (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleClaimReward}
                      className="px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-900 font-black text-xs rounded-xl shadow-lg transition flex items-center gap-2 cursor-pointer shrink-0"
                    >
                      <Sparkles className="w-4 h-4 text-orange-600" />
                      <span>استلام المكافأة (+50 XP) 🎁</span>
                    </motion.button>
                  ) : (
                    <span className="px-3 py-1.5 bg-white/20 rounded-xl text-xs font-black text-yellow-200 flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4 text-emerald-200" />
                      <span>تم استلام المكافأة!</span>
                    </span>
                  )}
                </motion.div>
              )}
            </div>
          ) : (
            /* Empty State: No goal set yet */
            <div className="p-6 bg-slate-800/60 rounded-2xl border border-dashed border-slate-700 text-center space-y-3">
              <div className="w-12 h-12 mx-auto bg-indigo-500/20 text-indigo-300 rounded-2xl flex items-center justify-center">
                <Target className="w-6 h-6 text-amber-300" />
              </div>
              <h4 className="font-black text-sm text-white">لم تحدد هدفاً أسبوعياً بعد!</h4>
              <p className="text-xs text-slate-300 font-bold max-w-md mx-auto">
                تحديد الأهداف يساعدك على تركيز حماسك ومتابعة إنجازاتك اليومية للحصول على المزيد من المكافآت والأوسمة!
              </p>
              <button
                onClick={() => setIsModalOpen(true)}
                className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-black text-xs rounded-xl shadow-md transition inline-flex items-center gap-2 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>اختر هدفك الأسبوعي الآن 🚀</span>
              </button>
            </div>
          )}
        </div>
      </motion.div>

      {/* Goal Setting Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 dir-rtl">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-indigo-100 relative overflow-hidden"
            >
              {/* Top Banner Header */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-5">
                <div className="flex items-center gap-2.5">
                  <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-2xl">
                    <Target className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-slate-900">تحديد هدفك الأسبوعي 🎯</h3>
                    <p className="text-xs font-bold text-slate-500">اختر من الأهداف الجاهزة أو اكتب هدفك المخصص</p>
                  </div>
                </div>

                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 hover:bg-slate-100 text-slate-400 rounded-full transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Goal Presets vs Custom Mode Tabs */}
              <div className="flex rounded-2xl bg-slate-100 p-1 mb-5">
                <button
                  onClick={() => setIsCustomMode(false)}
                  className={`flex-1 py-2 text-xs font-black rounded-xl transition cursor-pointer ${
                    !isCustomMode
                      ? "bg-white text-indigo-700 shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  أهداف مقترحة 🌟
                </button>
                <button
                  onClick={() => setIsCustomMode(true)}
                  className={`flex-1 py-2 text-xs font-black rounded-xl transition cursor-pointer ${
                    isCustomMode
                      ? "bg-white text-indigo-700 shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  كتابة هدف مخصص ✏️
                </button>
              </div>

              {/* Mode 1: Presets Selection */}
              {!isCustomMode ? (
                <div className="space-y-3 mb-6 max-h-[280px] overflow-y-auto p-1">
                  {PRESET_GOALS.map((preset, idx) => {
                    const isSelected = selectedPresetIndex === idx;
                    return (
                      <motion.div
                        key={idx}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        onClick={() => setSelectedPresetIndex(idx)}
                        className={`p-4 rounded-2xl border transition cursor-pointer flex items-start gap-3 ${
                          isSelected
                            ? "bg-indigo-50/90 border-indigo-500 text-indigo-950 ring-2 ring-indigo-400/30"
                            : "bg-slate-50 border-slate-200 hover:border-slate-300 text-slate-700"
                        }`}
                      >
                        <span className="text-2xl shrink-0 p-1 bg-white rounded-xl shadow-2xs">{preset.icon}</span>
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center justify-between">
                            <h5 className="font-black text-xs text-slate-900">{preset.title}</h5>
                            <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                              {preset.targetXP} XP
                            </span>
                          </div>
                          <p className="text-[11px] font-bold text-slate-500 leading-normal">
                            {preset.desc}
                          </p>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              ) : (
                /* Mode 2: Custom Title & Target XP Slider */
                <div className="space-y-4 mb-6 p-1">
                  <div className="space-y-1.5">
                    <label className="text-xs font-black text-slate-700 block">عنوان هدفك الخاص:</label>
                    <input
                      type="text"
                      value={customTitle}
                      onChange={(e) => setCustomTitle(e.target.value)}
                      placeholder="مثال: قراءة درسي الرؤية الحاسوبية وإنهاء اختبارين..."
                      className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                    />
                  </div>

                  <div className="space-y-2 p-4 bg-slate-50 rounded-2xl border border-slate-200">
                    <div className="flex items-center justify-between text-xs font-black text-slate-700">
                      <span>النقاط المطلوبة للهدف (XP Target):</span>
                      <span className="text-indigo-600 font-black text-sm">{customTargetXP} XP</span>
                    </div>

                    <input
                      type="range"
                      min={50}
                      max={500}
                      step={25}
                      value={customTargetXP}
                      onChange={(e) => setCustomTargetXP(Number(e.target.value))}
                      className="w-full accent-indigo-600 cursor-pointer"
                    />

                    <div className="flex justify-between text-[10px] text-slate-400 font-bold">
                      <span>50 XP (سهل)</span>
                      <span>250 XP (متوسط)</span>
                      <span>500 XP (تحدي أسطوري)</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center gap-3">
                <button
                  onClick={handleSaveGoal}
                  className="flex-1 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-2xl font-black text-xs shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Rocket className="w-4 h-4 text-amber-300" />
                  <span>اعتماد الهدف وبدء التحدي 🚀</span>
                </button>

                <button
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl font-black text-xs transition cursor-pointer"
                >
                  إلغاء
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
