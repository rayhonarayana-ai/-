import React from "react";
import { motion } from "motion/react";
import { LabResult, LearningLevel, LabDefinition } from "../types";
import { computeLearningPath, getLearningPathProgress } from "../data/learningPath";
import { getLabsByLevel } from "../data/labCatalog";
import {
  Milestone,
  CheckCircle2,
  Lock,
  Sparkles,
  ArrowLeft,
  Flame,
  Target,
  GraduationCap,
  Play,
  Layers,
  Award,
} from "lucide-react";

interface LearningPathProps {
  labs: LabResult[];
  onOpenLab?: (labKey: string) => void;
  onSelectLab?: (lab: LabDefinition) => void;
  onNavigateToProjects: () => void;
  onNavigateToGraduation: () => void;
  childName?: string;
  progress?: any;
}

export const LearningPath: React.FC<LearningPathProps> = ({
  labs,
  onOpenLab,
  onSelectLab,
  onNavigateToProjects,
  onNavigateToGraduation,
  childName = "البطل المبتكر",
}) => {
  const levels = computeLearningPath(labs);
  const pathProgress = getLearningPathProgress(labs);

  const getStatusBadge = (level: LearningLevel) => {
    switch (level.status) {
      case "completed":
        return {
          label: "مكتمل بنجاح ✅",
          className: "bg-emerald-50 text-emerald-800 border-emerald-200",
          icon: <CheckCircle2 className="w-4 h-4 text-emerald-600" />,
        };
      case "in-progress":
        return {
          label: `قيد التقدم (${level.completedCount}/${level.requiredProjects}) ⏳`,
          className: "bg-indigo-50 text-indigo-800 border-indigo-200 animate-pulse",
          icon: <Flame className="w-4 h-4 text-indigo-600" />,
        };
      case "available":
        return {
          label: "متاح للبدء 🔓",
          className: "bg-blue-50 text-blue-800 border-blue-200",
          icon: <Sparkles className="w-4 h-4 text-blue-600" />,
        };
      case "locked":
      default:
        return {
          label: "مقفل حتى إكمال السابق 🔒",
          className: "bg-slate-100 text-slate-500 border-slate-200",
          icon: <Lock className="w-4 h-4 text-slate-400" />,
        };
    }
  };

  return (
    <div className="space-y-8" dir="rtl">
      {/* Top Banner: Path Progress & Graduation Outlook */}
      <div className="relative bg-gradient-to-r from-indigo-900 via-slate-900 to-purple-950 rounded-3xl p-6 sm:p-8 text-white overflow-hidden shadow-xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/15 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-purple-500/15 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-white/10 text-amber-300 border border-white/20">
              <Milestone className="w-4 h-4" />
              <span>خارطة طريق المطور الصغير 🚀</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-white leading-tight">
              مسار التعلّم الذكي للبطل {childName}
            </h2>

            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
              3 مستويات متسلسلة مصممة بعناية: من فهم النماذج ورؤية الكمبيوتر، إلى هندسة الأوامر، وصولاً لبناء خوارزميات بايثون الحقيقية والتخرج بشهادة معتمدة!
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-3">
              <button
                onClick={onNavigateToGraduation}
                className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-black rounded-xl transition cursor-pointer flex items-center gap-1.5 shadow-md"
              >
                <GraduationCap className="w-4 h-4" />
                <span>شروط التخرج والشهادة 🎓</span>
              </button>

              <button
                onClick={onNavigateToProjects}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-xl border border-white/20 transition cursor-pointer flex items-center gap-1.5"
              >
                <Layers className="w-4 h-4" />
                <span>استعراض مشاريعي المنجزة ({labs.length})</span>
              </button>
            </div>
          </div>

          {/* Progress Card */}
          <div className="w-full lg:w-80 bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/20 space-y-3 shrink-0">
            <div className="flex items-center justify-between text-xs font-black">
              <span className="text-slate-200 flex items-center gap-1">
                <Target className="w-4 h-4 text-emerald-400" />
                <span>إجمالي الإنجاز في المسار:</span>
              </span>
              <span className="text-amber-300 font-mono text-sm">{pathProgress.overallPercentage}%</span>
            </div>

            {/* Overall Bar */}
            <div className="w-full h-3 bg-black/30 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${pathProgress.overallPercentage}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="h-full bg-gradient-to-r from-indigo-400 via-purple-400 to-amber-400 rounded-full"
              />
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-300 pt-1">
              <span>المستويات المكتملة: {pathProgress.completedLevels} من 3</span>
              <span>المشاريع المطلوبة: {pathProgress.totalEffectiveCompleted}/{pathProgress.totalRequiredProjects}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3 Levels Sequential Interactive Cards */}
      <div className="space-y-6">
        {levels.map((level, idx) => {
          const badge = getStatusBadge(level);
          const isLocked = level.status === "locked";
          const isCompleted = level.status === "completed";
          const levelLabs = getLabsByLevel(level.id);

          return (
            <motion.div
              key={level.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1, duration: 0.3 }}
              className={`relative rounded-3xl p-6 sm:p-8 border transition-all ${
                isCompleted
                  ? "bg-white border-emerald-300 shadow-lg shadow-emerald-50"
                  : level.status === "in-progress" || level.status === "available"
                  ? "bg-white border-indigo-300 shadow-xl shadow-indigo-100/40 ring-2 ring-indigo-500/10"
                  : "bg-slate-50 border-slate-200 opacity-80"
              }`}
            >
              {/* Level Top Header */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
                <div className="flex items-start gap-4">
                  <div
                    className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shrink-0 shadow-md ${
                      isCompleted
                        ? "bg-emerald-500 text-white"
                        : !isLocked
                        ? `bg-gradient-to-tr ${level.colorTheme} text-white`
                        : "bg-slate-200 text-slate-400"
                    }`}
                  >
                    <span>{level.icon}</span>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black border ${badge.className}`}>
                        {badge.icon}
                        <span>{badge.label}</span>
                      </span>

                      <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
                        {level.badgeTitleAr}
                      </span>
                    </div>

                    <h3 className="text-xl sm:text-2xl font-black text-slate-900">
                      {level.titleAr}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 max-w-2xl">
                      {level.descriptionAr}
                    </p>
                  </div>
                </div>

                {/* Level Progress Gauge */}
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 min-w-[240px] space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                    <span>مشاريع المستوى:</span>
                    <span className="text-indigo-600 font-mono font-black">
                      {level.completedCount} / {level.requiredProjects} مشاريع
                    </span>
                  </div>

                  <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      style={{
                        width: `${Math.min(
                          100,
                          (level.completedCount / level.requiredProjects) * 100
                        )}%`,
                      }}
                      className={`h-full rounded-full transition-all duration-500 ${
                        isCompleted ? "bg-emerald-500" : "bg-indigo-600"
                      }`}
                    />
                  </div>

                  <p className="text-[11px] text-slate-500 text-center font-medium">
                    {isCompleted
                      ? "تم استيفاء متطلبات هذا المستوى بنجاح! ⭐"
                      : isLocked
                      ? "أكمل المستوى السابق لفتح هذه التحديات 🔒"
                      : `أنجز ${Math.max(0, level.requiredProjects - level.completedCount)} مشروع إضافي لإكمال المستوى`}
                  </p>
                </div>
              </div>

              {/* Labs Catalog Available for this level */}
              <div className="pt-5 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs sm:text-sm font-black text-slate-700 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    <span>مختبرات وتجارب {level.titleAr}:</span>
                  </h4>
                  <span className="text-xs text-slate-400 font-medium">
                    {levelLabs.length} تجارب متاحة
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {levelLabs.map((lab) => {
                    const isDone = labs.some((l) => l.labKey === lab.key);

                    return (
                      <div
                        key={lab.key}
                        className={`p-3.5 rounded-2xl border transition-all flex flex-col justify-between space-y-2.5 ${
                          isDone
                            ? "bg-emerald-50/60 border-emerald-200"
                            : !isLocked
                            ? "bg-white hover:bg-indigo-50/40 border-slate-200 hover:border-indigo-300 shadow-2xs"
                            : "bg-slate-100 border-slate-200 opacity-60"
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-2xl">{lab.thumbnail}</span>
                            {isDone ? (
                              <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                                منجز ✓
                              </span>
                            ) : (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                                {lab.estimatedMinutes} دقائق
                              </span>
                            )}
                          </div>

                          <h5 className="font-black text-xs sm:text-sm text-slate-900 leading-snug">
                            {lab.titleAr}
                          </h5>
                          <p className="text-[11px] text-slate-500 line-clamp-2 mt-1">
                            {lab.learningGoalAr}
                          </p>
                        </div>

                        {!isLocked ? (
                          <button
                            onClick={() => {
                              if (onSelectLab) {
                                onSelectLab(lab);
                              } else if (onOpenLab) {
                                onOpenLab(lab.key);
                              }
                            }}
                            className={`w-full py-1.5 px-2 rounded-xl text-xs font-black flex items-center justify-center gap-1 cursor-pointer transition ${
                              isDone
                                ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                                : "bg-indigo-600 hover:bg-indigo-700 text-white"
                            }`}
                          >
                            <Play className="w-3 h-3 fill-current" />
                            <span>{isDone ? "إعادة التجربة / تحسين" : "ابدأ المختبر"}</span>
                          </button>
                        ) : (
                          <div className="text-center py-1 text-[11px] font-bold text-slate-400 flex items-center justify-center gap-1">
                            <Lock className="w-3 h-3" />
                            <span>مقفل</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
