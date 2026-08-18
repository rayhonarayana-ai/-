import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { LabResult, LabDefinition, ProjectCategory } from "../types";
import { LAB_CATALOG, getLabDefinition } from "../data/labCatalog";
import { getAchievementCardText } from "../data/graduation";
import {
  FlaskConical,
  Sparkles,
  CheckCircle2,
  Play,
  RotateCcw,
  ArrowRight,
  Code2,
  Copy,
  Check,
  FolderGit2,
  Wrench,
  Milestone,
  HelpCircle,
  Lightbulb,
  Terminal,
} from "lucide-react";

interface LabCompletionProps {
  initialLabKey?: string;
  improveLabId?: string | null;
  labs: LabResult[];
  onSaveLabResult: (labResult: LabResult) => void;
  onImproveLab: (labId: string, bonus: number) => void;
  onNavigateToProjects: () => void;
  onNavigateToPath: () => void;
  childName?: string;
}

export const LabCompletion: React.FC<LabCompletionProps> = ({
  initialLabKey = "fruit-classifier",
  improveLabId = null,
  labs,
  onSaveLabResult,
  onImproveLab,
  onNavigateToProjects,
  onNavigateToPath,
  childName = "البطل المبتكر",
}) => {
  const [selectedLabKey, setSelectedLabKey] = useState<string>(initialLabKey);
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>("all");
  
  // Running Phases: "setup" | "training" | "completed"
  const [phase, setPhase] = useState<"setup" | "training" | "completed">("setup");
  const [trainProgress, setTrainProgress] = useState<number>(0);
  const [currentTipIndex, setCurrentTipIndex] = useState<number>(0);
  const [currentAccuracy, setCurrentAccuracy] = useState<number>(95);
  const [attemptsCount, setAttemptsCount] = useState<number>(1);
  const [copiedCard, setCopiedCard] = useState<boolean>(false);

  // Interactive setup state based on lab type
  const [userPromptInput, setUserPromptInput] = useState<string>("");
  const [userPythonCode, setUserPythonCode] = useState<string>("");
  const [visionThreshold, setVisionThreshold] = useState<number>(75);
  const [datasetCount, setDatasetCount] = useState<number>(20);

  // Improvement mode detection
  const isImprovementMode = !!improveLabId;
  const targetLabDef: LabDefinition = getLabDefinition(selectedLabKey) || LAB_CATALOG[0];

  useEffect(() => {
    if (initialLabKey) {
      setSelectedLabKey(initialLabKey);
    }
  }, [initialLabKey]);

  useEffect(() => {
    const existing = labs.find((l) => l.labKey === targetLabDef.key || l.id === improveLabId);
    if (existing) {
      setCurrentAccuracy(existing.accuracy || targetLabDef.baseAccuracy);
      setAttemptsCount(existing.attempts || 1);
    } else {
      setCurrentAccuracy(targetLabDef.baseAccuracy);
      setAttemptsCount(1);
    }
    setUserPromptInput(targetLabDef.starterPrompt || "");
    setUserPythonCode(targetLabDef.starterCode || "");
    setPhase("setup");
  }, [selectedLabKey, improveLabId]);

  // Handle training simulation with tips
  const handleStartTraining = () => {
    setPhase("training");
    setTrainProgress(0);
    setCurrentTipIndex(0);

    const interval = setInterval(() => {
      setTrainProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setPhase("completed");
          const bonus = isImprovementMode ? targetLabDef.improveBonus : 0;
          const finalAcc = Math.min(100, (currentAccuracy || targetLabDef.baseAccuracy) + bonus);
          setCurrentAccuracy(finalAcc);
          setAttemptsCount((prevAtt) => prevAtt + 1);

          // Build LabResult and persist
          const newLabResult: LabResult = {
            id: improveLabId || `lab-res-${targetLabDef.key}-${Date.now().toString(36)}`,
            labKey: targetLabDef.key,
            titleAr: targetLabDef.titleAr,
            titleEn: targetLabDef.titleEn,
            category: targetLabDef.category,
            levelId: targetLabDef.levelId,
            difficulty: targetLabDef.difficulty,
            completedAt: new Date().toISOString(),
            accuracy: finalAcc,
            attempts: attemptsCount + 1,
            durationMinutes: targetLabDef.estimatedMinutes,
            resultSummaryAr: targetLabDef.explanationAr,
            resultSummaryEn: `Model completed with ${finalAcc}% accuracy after ${attemptsCount + 1} iterations.`,
            codeSnippet: targetLabDef.starterCode || targetLabDef.starterPrompt,
            explanationAr: targetLabDef.explanationAr,
            tags: targetLabDef.tags,
            thumbnail: targetLabDef.thumbnail,
            childId: "child-001",
          };

          if (isImprovementMode && improveLabId) {
            onImproveLab(improveLabId, targetLabDef.improveBonus);
          } else {
            onSaveLabResult(newLabResult);
          }

          return 100;
        }
        // Rotate tips every 30%
        if (prev % 30 === 0 && targetLabDef.tipsAr.length > 0) {
          setCurrentTipIndex((prevIdx) => (prevIdx + 1) % targetLabDef.tipsAr.length);
        }
        return prev + 10;
      });
    }, 250);
  };

  const handleCopyAchievement = () => {
    const labRes: LabResult = {
      id: targetLabDef.key,
      labKey: targetLabDef.key,
      titleAr: targetLabDef.titleAr,
      titleEn: targetLabDef.titleEn,
      category: targetLabDef.category,
      completedAt: new Date().toISOString(),
      accuracy: currentAccuracy,
      attempts: attemptsCount,
      durationMinutes: targetLabDef.estimatedMinutes,
      resultSummaryAr: targetLabDef.explanationAr,
      resultSummaryEn: "",
      tags: targetLabDef.tags,
      thumbnail: targetLabDef.thumbnail,
    };

    const text = getAchievementCardText(labRes, childName);
    navigator.clipboard.writeText(text);
    setCopiedCard(true);
    setTimeout(() => setCopiedCard(false), 3000);
  };

  const filteredCatalog = LAB_CATALOG.filter((lab) => {
    if (selectedCategoryFilter === "all") return true;
    return lab.category === selectedCategoryFilter;
  });

  return (
    <div className="space-y-8" dir="rtl">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-white/10 text-purple-300 border border-white/20">
            <FlaskConical className="w-4 h-4" />
            <span>مختبر الذكاء الاصطناعي التفاعلي 🧪</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black">
            {isImprovementMode ? "🔧 وضع تحسين وإعادة تدريب النموذج" : "تجارب وتطبيقات المطور الصغير"}
          </h2>

          <p className="text-xs sm:text-sm text-slate-300">
            اختر مختبراً، جهز البيانات أو صغ الأوامر البرمجية، واختبر دقة نموذجك الرياضي في الزمن الحقيقي لتسجيله في محفظتك الرقمية.
          </p>
        </div>

        {/* Quick navigation */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onNavigateToPath}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-black border border-white/20 transition cursor-pointer flex items-center gap-1.5"
          >
            <Milestone className="w-4 h-4" />
            <span>المسار التعليمي</span>
          </button>

          <button
            onClick={onNavigateToProjects}
            className="px-4 py-2 bg-purple-500 hover:bg-purple-400 text-white rounded-xl text-xs font-black transition cursor-pointer flex items-center gap-1.5 shadow-md"
          >
            <FolderGit2 className="w-4 h-4" />
            <span>محفظة المشاريع ({labs.length})</span>
          </button>
        </div>
      </div>

      {/* Catalog Selector Strip */}
      <div className="bg-white rounded-3xl p-4 sm:p-6 border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h3 className="font-black text-sm text-slate-800 flex items-center gap-2">
            <span>اختر تجربة من كتالوج المختبرات:</span>
          </h3>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {[
              { id: "all", label: "الكل" },
              { id: "classification", label: "التصنيف 🍎" },
              { id: "computer-vision", label: "الرؤية الحاسوبية 👁️" },
              { id: "prompt-engineering", label: "هندسة الأوامر 🔮" },
              { id: "python-code", label: "كود بايثون 🐍" },
            ].map((filter) => (
              <button
                key={filter.id}
                onClick={() => setSelectedCategoryFilter(filter.id)}
                className={`px-3 py-1 rounded-xl text-xs font-black transition cursor-pointer ${
                  selectedCategoryFilter === filter.id
                    ? "bg-purple-600 text-white shadow-xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>

        {/* Lab Buttons Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
          {filteredCatalog.map((lab) => {
            const isSelected = lab.key === selectedLabKey;
            const isCompleted = labs.some((l) => l.labKey === lab.key);

            return (
              <button
                key={lab.key}
                onClick={() => {
                  setSelectedLabKey(lab.key);
                  setPhase("setup");
                }}
                className={`p-3 rounded-2xl border text-right transition cursor-pointer flex flex-col justify-between h-28 ${
                  isSelected
                    ? "bg-purple-50 border-purple-400 ring-2 ring-purple-500/20 shadow-xs"
                    : "bg-slate-50 hover:bg-slate-100 border-slate-200"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xl">{lab.thumbnail}</span>
                  {isCompleted && (
                    <span className="text-[10px] font-black text-emerald-700 bg-emerald-100 px-1.5 py-0.2 rounded-md">
                      ✓ منجز
                    </span>
                  )}
                </div>
                <p className="font-black text-xs text-slate-900 line-clamp-2 leading-tight">
                  {lab.titleAr}
                </p>
                <span className="text-[10px] text-slate-500">المستوى {lab.levelId}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Lab Runner Screen */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-md">
        {/* Lab Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div className="flex items-center gap-3.5">
            <span className="w-14 h-14 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center text-3xl shrink-0">
              {targetLabDef.thumbnail}
            </span>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800">
                  المستوى {targetLabDef.levelId}
                </span>
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
                  {targetLabDef.category}
                </span>
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                  ⏱️ {targetLabDef.estimatedMinutes} دقائق
                </span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
                {targetLabDef.titleAr}
              </h3>
              <p className="text-xs sm:text-sm text-slate-600">
                {targetLabDef.descriptionAr}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="bg-slate-50 px-4 py-2 rounded-2xl border border-slate-200 text-center">
              <span className="block text-[10px] font-bold text-slate-500">الدقة المستهدفة</span>
              <span className="text-lg font-black text-emerald-600 font-mono">
                {currentAccuracy}%
              </span>
            </div>

            <div className="bg-slate-50 px-4 py-2 rounded-2xl border border-slate-200 text-center">
              <span className="block text-[10px] font-bold text-slate-500">المحاولات</span>
              <span className="text-lg font-black text-indigo-600 font-mono">
                {attemptsCount}
              </span>
            </div>
          </div>
        </div>

        {/* Phase 1: Setup & Interactive Action Area */}
        {phase === "setup" && (
          <div className="py-6 space-y-6">
            <div className="bg-amber-50/80 border border-amber-200/80 rounded-2xl p-4 flex items-start gap-3">
              <Lightbulb className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-black text-amber-900">الهدف التعليمي للتجربة:</h4>
                <p className="text-xs text-amber-800 mt-0.5 leading-relaxed">
                  {targetLabDef.learningGoalAr}
                </p>
              </div>
            </div>

            {/* Classification interactive settings */}
            {targetLabDef.category === "classification" && (
              <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 space-y-4">
                <h4 className="text-xs sm:text-sm font-black text-slate-800">
                  📊 ضبط عينات التدريب (Training Dataset):
                </h4>
                <div className="flex items-center gap-4 flex-wrap">
                  <span className="text-xs font-bold text-slate-600">عدد العينات التدريبية:</span>
                  <div className="flex items-center gap-2">
                    {[10, 25, 50, 100].map((count) => (
                      <button
                        key={count}
                        onClick={() => setDatasetCount(count)}
                        className={`px-3 py-1 rounded-xl text-xs font-black cursor-pointer transition ${
                          datasetCount === count
                            ? "bg-purple-600 text-white"
                            : "bg-white border border-slate-200 text-slate-700"
                        }`}
                      >
                        {count} عينة
                      </button>
                    ))}
                  </div>
                </div>
                <p className="text-[11px] text-slate-500">
                  💡 تلميح: تزويد النموذج بعدد كافٍ من العينات المتنوعة يرفع من قدرته على تعميم التصنيف بدقة!
                </p>
              </div>
            )}

            {/* Prompt Engineering interactive editor */}
            {targetLabDef.category === "prompt-engineering" && (
              <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 space-y-3">
                <h4 className="text-xs sm:text-sm font-black text-slate-800 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-purple-600" />
                  <span>هيكلة الأمر الخماسي (Prompt System):</span>
                </h4>
                <textarea
                  value={userPromptInput}
                  onChange={(e) => setUserPromptInput(e.target.value)}
                  rows={5}
                  className="w-full p-3.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm font-sans text-slate-800 focus:outline-hidden focus:border-purple-500"
                  dir="rtl"
                />
              </div>
            )}

            {/* Computer Vision interactive slider */}
            {targetLabDef.category === "computer-vision" && (
              <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between text-xs font-black text-slate-800">
                  <span>عتبة كشف الملامح والحواف (Vision Threshold):</span>
                  <span className="font-mono text-purple-600">{visionThreshold}%</span>
                </div>
                <input
                  type="range"
                  min={30}
                  max={95}
                  value={visionThreshold}
                  onChange={(e) => setVisionThreshold(Number(e.target.value))}
                  className="w-full accent-purple-600 cursor-pointer"
                />
                <div className="flex items-center justify-between text-[11px] text-slate-500">
                  <span>حساسية واسعة (التقاط عام)</span>
                  <span>حساسية دقيقة (تحديد حاد للمربعات)</span>
                </div>
              </div>
            )}

            {/* Python code editor */}
            {targetLabDef.category === "python-code" && (
              <div className="bg-slate-900 rounded-2xl p-4 border border-slate-800 text-slate-100 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-400">
                  <span className="flex items-center gap-1.5">
                    <Terminal className="w-4 h-4 text-emerald-400" />
                    <span>محرر كود بايثون التفاعلي (Python 3.11 Runtime)</span>
                  </span>
                  <span className="text-emerald-400 font-mono text-[10px]">جاهز للتشغيل ✓</span>
                </div>
                <textarea
                  value={userPythonCode}
                  onChange={(e) => setUserPythonCode(e.target.value)}
                  rows={7}
                  className="w-full bg-slate-950 p-3 rounded-xl font-mono text-xs text-emerald-300 border border-slate-800 focus:outline-hidden focus:border-purple-500 leading-relaxed"
                  dir="ltr"
                />
              </div>
            )}

            {/* Action Start Button */}
            <div className="pt-2 flex justify-end">
              <button
                onClick={handleStartTraining}
                className="px-8 py-3.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black text-sm rounded-2xl transition cursor-pointer shadow-lg shadow-purple-200 flex items-center gap-2"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>
                  {isImprovementMode
                    ? "🚀 بدء إعادة التدريب وتحسين الدقة"
                    : "🚀 تدريب واختبار النموذج الآن"}
                </span>
              </button>
            </div>
          </div>
        )}

        {/* Phase 2: Simulation & Pedagogical Tips */}
        {phase === "training" && (
          <div className="py-12 space-y-8 max-w-xl mx-auto text-center">
            <div className="space-y-3">
              <div className="w-20 h-20 mx-auto rounded-3xl bg-purple-50 text-purple-600 flex items-center justify-center text-4xl shadow-inner animate-pulse">
                {targetLabDef.thumbnail}
              </div>
              <h4 className="text-lg font-black text-slate-900">
                جاري تدريب النموذج وحساب مصفوفات التعلّم...
              </h4>
              <p className="text-xs text-slate-500">
                يقوم المحرك الرياضي الآن بتشغيل خوارزميات التنبؤ واختبار العينات.
              </p>
            </div>

            {/* Progress bar */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-black text-slate-700">
                <span>نسبة المعالجة</span>
                <span className="font-mono text-purple-600">{trainProgress}%</span>
              </div>
              <div className="w-full h-3.5 bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200">
                <motion.div
                  style={{ width: `${trainProgress}%` }}
                  className="h-full bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full transition-all duration-300"
                />
              </div>
            </div>

            {/* Pedagogical Rotating Tip */}
            {targetLabDef.tipsAr.length > 0 && (
              <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-4 text-xs text-indigo-900 font-medium">
                <span className="font-black block mb-1">💡 معلومة ذكية للمطور الصغير:</span>
                <p>{targetLabDef.tipsAr[currentTipIndex]}</p>
              </div>
            )}
          </div>
        )}

        {/* Phase 3: Completion, Accuracy Metric & Achievement Card */}
        {phase === "completed" && (
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            className="py-6 space-y-6"
          >
            {/* Success Banner */}
            <div className="bg-emerald-50 border border-emerald-200 rounded-3xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-white flex items-center justify-center text-2xl shrink-0 shadow-md">
                  ✓
                </div>
                <div>
                  <h4 className="text-lg font-black text-emerald-950">
                    تم تدريب وتوثيق النموذج بنجاح تام! 🎉
                  </h4>
                  <p className="text-xs text-emerald-800 mt-0.5">
                    تمت إضافة المشروع تلقائياً إلى محفظتك الرقمية وربطه بمسارك التعليمي.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="bg-white px-4 py-2 rounded-2xl border border-emerald-200 text-center shadow-2xs">
                  <span className="block text-[10px] font-bold text-slate-500">الدقة النهائية</span>
                  <span className="text-xl font-black text-emerald-600 font-mono">
                    {currentAccuracy}%
                  </span>
                </div>
                <div className="bg-white px-4 py-2 rounded-2xl border border-emerald-200 text-center shadow-2xs">
                  <span className="block text-[10px] font-bold text-slate-500">المحاولات</span>
                  <span className="text-xl font-black text-indigo-600 font-mono">
                    {attemptsCount}
                  </span>
                </div>
              </div>
            </div>

            {/* What you just learned explanation */}
            <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 space-y-2">
              <h5 className="font-black text-xs text-slate-800 flex items-center gap-1.5">
                <Lightbulb className="w-4 h-4 text-amber-500" />
                <span>ماذا تعلمت للتو؟ 💡</span>
              </h5>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                {targetLabDef.explanationAr}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={handleCopyAchievement}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-black rounded-xl transition cursor-pointer flex items-center gap-1.5"
                >
                  {copiedCard ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedCard ? "تم نسخ بطاقة الإنجاز!" : "نسخ بطاقة الإنجاز 📋"}</span>
                </button>

                <button
                  onClick={() => {
                    setPhase("setup");
                  }}
                  className="px-4 py-2.5 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 text-xs font-black rounded-xl transition cursor-pointer flex items-center gap-1.5"
                >
                  <Wrench className="w-4 h-4" />
                  <span>تحسين إضافي وإعادة تدريب (+{targetLabDef.improveBonus}%)</span>
                </button>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={onNavigateToPath}
                  className="px-4 py-2.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 text-xs font-black rounded-xl transition cursor-pointer flex items-center gap-1.5"
                >
                  <Milestone className="w-4 h-4 text-blue-600" />
                  <span>العودة للمسار</span>
                </button>

                <button
                  onClick={onNavigateToProjects}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black rounded-xl transition cursor-pointer flex items-center gap-1.5 shadow-md"
                >
                  <FolderGit2 className="w-4 h-4" />
                  <span>الانتقال للمحفظة واستعراض المشاريع 🚀</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};
