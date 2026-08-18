import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Lesson, LessonStep, LabType } from "../types";
import { LESSONS } from "../data/lessons";
import { speakText, stopSpeech } from "../data/mascot";
import { playTtsChime } from "../data/audioEffects";
import { LessonInteractiveWidget } from "./LessonInteractiveWidget";
import {
  BookOpen,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Volume2,
  VolumeX,
  HelpCircle,
  Trophy,
  Lightbulb,
  Award,
  X,
  Hammer,
  FlaskConical,
  CheckSquare,
  Zap,
  Target,
  Clock,
  Flag,
  TrendingUp,
  Search,
  Filter,
  Layers,
  Terminal,
  Code2
} from "lucide-react";

interface LessonViewerProps {
  onCompleteLesson: (lessonId: string, xp: number) => void;
  onStartQuiz: (topic: string) => void;
  onOpenLab?: (labType: LabType) => void;
  completedLessons: string[];
}

export const LessonViewer: React.FC<LessonViewerProps> = ({
  onCompleteLesson,
  onStartQuiz,
  onOpenLab,
  completedLessons,
}) => {
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(LESSONS[0]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [selectedQuizAnswers, setSelectedQuizAnswers] = useState<{ [key: string]: number }>({});
  const [showExplanation, setShowExplanation] = useState<{ [key: string]: boolean }>({});
  const [completedModalData, setCompletedModalData] = useState<{ lessonTitle: string; xp: number } | null>(null);
  const [completedProjectSteps, setCompletedProjectSteps] = useState<{ [lessonId: string]: number[] }>({});

  // Curriculum Filter & Search State
  const [selectedLevelFilter, setSelectedLevelFilter] = useState<number | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  const toggleProjectStep = (lessonId: string, stepIdx: number) => {
    setCompletedProjectSteps((prev) => {
      const current = prev[lessonId] || [];
      const updated = current.includes(stepIdx)
        ? current.filter((i) => i !== stepIdx)
        : [...current, stepIdx];
      
      const totalSteps = selectedLesson?.practicalProject?.stepsToBuild.length || 0;
      if (updated.length === totalSteps && current.length < totalSteps) {
        speakText("أحسنت يا بطل! تم إنجاز جميع خطوات هذا المشروع التطبيقي بنجاح 🎉");
      }
      
      return { ...prev, [lessonId]: updated };
    });
  };

  const currentStep: LessonStep | undefined = selectedLesson?.steps[currentStepIndex];
  const isLastStep = selectedLesson ? currentStepIndex === selectedLesson.steps.length - 1 : false;
  const isLessonCompleted = selectedLesson ? completedLessons.includes(selectedLesson.id) : false;

  const handleNextStep = () => {
    if (!selectedLesson) return;
    if (currentStepIndex < selectedLesson.steps.length - 1) {
      setCurrentStepIndex((prev) => prev + 1);
      stopSpeech();
    } else {
      // Finished lesson!
      if (!isLessonCompleted) {
        onCompleteLesson(selectedLesson.id, selectedLesson.xpReward);
      }
      speakText(`مبارك يا بطل! أكملت درس ${selectedLesson.title} وبنيت مشروعك بنجاح! وحصلت على ${selectedLesson.xpReward} نقطة!`);
      setCompletedModalData({
        lessonTitle: selectedLesson.title,
        xp: selectedLesson.xpReward,
      });
    }
  };

  const handlePrevStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1);
      stopSpeech();
    }
  };

  const handleQuizAnswer = (stepId: string, optionIdx: number) => {
    setSelectedQuizAnswers((prev) => ({ ...prev, [stepId]: optionIdx }));
    setShowExplanation((prev) => ({ ...prev, [stepId]: true }));
    if (currentStep?.quizQuestion && optionIdx === currentStep.quizQuestion.correctIndex) {
      speakText("إجابة ممتازة وصحيحة يا بطل!");
    } else {
      speakText("حاول مرة أخرى في المرة القادمة!");
    }
  };

  // Filter & Search Logic
  const filteredLessons = LESSONS.filter((lesson) => {
    const matchesLevel = selectedLevelFilter === "all" || lesson.level === selectedLevelFilter;
    const matchesSearch =
      searchQuery.trim() === "" ||
      lesson.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lesson.subtitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lesson.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesLevel && matchesSearch;
  });

  const totalPages = Math.max(1, Math.ceil(filteredLessons.length / itemsPerPage));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const paginatedLessons = filteredLessons.slice(
    (safeCurrentPage - 1) * itemsPerPage,
    safeCurrentPage * itemsPerPage
  );

  const LEVEL_NAMES: { [key: number]: { title: string; desc: string; icon: string } } = {
    1: { title: "المستوى 1: فهم الذكاء والرؤية الحاسوبية", desc: "8 دروس تفاعلية في المفاهيم الأساسية، تدريب البيانات، والرؤية الرقمية", icon: "🧠" },
    2: { title: "المستوى 2: هندسة الأوامر والذكاء التوليدي", desc: "8 دروس تطبيقية في صياغة البرومبت، النماذج اللغوية، والإبداع التوليدي", icon: "🔮" },
    3: { title: "المستوى 3: برمجة بايثون وأخلاقيات الروبوتات", desc: "8 دروس برمجية في كود بايثون، الخوارزميات، والنزاهة الرقمية", icon: "💻" },
  };

  return (
    <div className="space-y-8 dir-rtl">
      {/* Lessons Header & Level Filter Dashboard */}
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/10 border border-amber-400/30 text-amber-700 text-xs font-black mb-2">
              <Terminal className="w-4 h-4 text-amber-600" />
              <span>أكاديمية إعداد المطور الصغير المعتمدة</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 flex items-center gap-2">
              <BookOpen className="w-7 h-7 text-amber-500" />
              <span>منهج الذكاء الاصطناعي التفاعلي الممتع (24 درساً تطبيقياً) 🚀</span>
            </h2>
            <p className="text-sm font-bold text-slate-500 max-w-2xl mt-1">
              منهج مركز وعالي الجودة مقسم على 3 مستويات متدرجة، يجمع بين الشرح المبسط والتشبيهات الممتعة والمشاريع التطبيقية الحقيقية!
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-2xl text-xs font-black shadow-lg shadow-amber-500/20 border border-amber-300/40 flex items-center gap-2">
              <Award className="w-4 h-4" />
              <span>إنجازك: {completedLessons.length} / {LESSONS.length} درس</span>
            </span>
          </div>
        </div>

        {/* Level Tabs Selection Grid */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          <button
            onClick={() => {
              setSelectedLevelFilter("all");
              setCurrentPage(1);
            }}
            className={`px-4 py-2.5 rounded-2xl text-xs font-black cursor-pointer transition border shrink-0 flex items-center gap-2 ${
              selectedLevelFilter === "all"
                ? "bg-slate-900 text-white border-slate-900 shadow-md"
                : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
            }`}
          >
            <Layers className="w-4 h-4 text-amber-400" />
            <span>جميع الدروس ({LESSONS.length} درس)</span>
          </button>

          {[1, 2, 3].map((lvl) => {
            const isSelected = selectedLevelFilter === lvl;
            const meta = LEVEL_NAMES[lvl];

            return (
              <button
                key={lvl}
                onClick={() => {
                  setSelectedLevelFilter(lvl);
                  setCurrentPage(1);
                }}
                className={`px-4 py-2.5 rounded-2xl text-xs font-black cursor-pointer transition border shrink-0 flex items-center gap-2 ${
                  isSelected
                    ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white border-amber-400 shadow-lg shadow-amber-500/20"
                    : "bg-white text-slate-700 border-slate-200 hover:border-amber-300 hover:bg-amber-50/50"
                }`}
              >
                <span>{meta.icon}</span>
                <span>{meta.title}</span>
              </button>
            );
          })}
        </div>

        {/* Search Bar & Stats Ribbon */}
        <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-white rounded-2xl border border-slate-200 shadow-sm">
          <div className="relative flex-1 min-w-[260px]">
            <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="ابحث برمز الدرس، بايثون، الشبكات العصبية، الرؤية، الأوامر..."
              className="w-full pl-4 pr-10 py-2.5 bg-slate-50 rounded-xl text-xs font-bold border border-slate-200 focus:outline-none focus:border-amber-500 focus:bg-white transition text-slate-800"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-3 text-xs font-bold text-slate-500">
            <span>عرض {filteredLessons.length} درس متاح</span>
            {selectedLevelFilter !== "all" && (
              <span className="px-2.5 py-1 bg-amber-100 text-amber-900 rounded-lg text-[11px] font-black">
                {LEVEL_NAMES[selectedLevelFilter as number]?.title}
              </span>
            )}
          </div>
        </div>

        {/* Lessons Cards Navigation Grid */}
        {paginatedLessons.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {paginatedLessons.map((lesson, idx) => {
              const isCompleted = completedLessons.includes(lesson.id);
              const isSelected = selectedLesson?.id === lesson.id;

              return (
                <motion.button
                  key={lesson.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: idx * 0.02 }}
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setSelectedLesson(lesson);
                    setCurrentStepIndex(0);
                    stopSpeech();
                  }}
                  className={`p-5 rounded-3xl text-right transition-all duration-200 border-2 relative overflow-hidden cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? "bg-white border-amber-500 shadow-xl ring-2 ring-amber-400/30"
                      : "bg-white border-slate-200 hover:border-amber-300 hover:shadow-md"
                  }`}
                >
                  <div>
                    {/* Level Ribbon */}
                    <div className="flex items-center justify-between mb-3">
                      <span className="px-3 py-1 rounded-xl bg-slate-100 text-slate-700 text-xs font-black">
                        المستوى {lesson.level}
                      </span>
                      {isCompleted && (
                        <span className="flex items-center gap-1 text-xs font-black text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-xl border border-emerald-200">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500" /> مكتمل
                        </span>
                      )}
                    </div>

                    <h3 className="font-extrabold text-base text-slate-900 mb-1 leading-snug line-clamp-2">
                      {lesson.title}
                    </h3>
                    <p className="text-xs text-slate-500 font-medium line-clamp-2 mb-3">{lesson.subtitle}</p>

                    {/* Practical Project Badge */}
                    {lesson.practicalProject && (
                      <div className="p-2.5 bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-500/5 border border-amber-300/80 rounded-2xl mb-4 text-xs font-black text-amber-900 flex items-center gap-2">
                        <Hammer className="w-4 h-4 text-amber-600 shrink-0" />
                        <span className="truncate">{lesson.practicalProject.title}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-xs font-bold text-slate-400 pt-3 border-t border-slate-100">
                    <span>⏱️ {lesson.estimatedMinutes} دقائق</span>
                    <span className="text-amber-600 font-black">+ {lesson.xpReward} XP</span>
                  </div>
                </motion.button>
              );
            })}
          </div>
        ) : (
          <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 space-y-3">
            <Search className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="text-lg font-black text-slate-700">لم نجد دروساً تطابق بحثك</h3>
            <p className="text-xs font-bold text-slate-400 max-w-sm mx-auto">
              جرب تغيير كلمات البحث أو اختر مستوى آخر من شريط المستويات المتاحة بالأعلى!
            </p>
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedLevelFilter("all");
              }}
              className="px-4 py-2 bg-amber-500 text-slate-950 rounded-xl text-xs font-black hover:bg-amber-400 transition"
            >
              عرض جميع الدروس
            </button>
          </div>
        )}

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-200">
            <button
              disabled={safeCurrentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 rounded-xl text-xs font-black text-slate-700 flex items-center gap-1 cursor-pointer transition"
            >
              <ChevronRight className="w-4 h-4" />
              <span>الصفحة السابقة</span>
            </button>

            <span className="text-xs font-black text-slate-600">
              الصفحة {safeCurrentPage} من {totalPages}
            </span>

            <button
              disabled={safeCurrentPage === totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 rounded-xl text-xs font-black text-slate-700 flex items-center gap-1 cursor-pointer transition"
            >
              <span>الصفحة التالية</span>
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Active Lesson Content Player */}
      <AnimatePresence mode="wait">
        {selectedLesson && currentStep && (
          <motion.div
            key={`${selectedLesson.id}-${currentStepIndex}`}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="p-6 sm:p-8 bg-white rounded-3xl border-2 border-slate-200 shadow-xl space-y-6 relative overflow-hidden"
          >
            {/* Header Bar */}
            <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-black text-amber-600 bg-amber-50 px-3 py-1 rounded-xl border border-amber-200">
                    المستوى {selectedLesson.level} • الخطوة {currentStepIndex + 1} من {selectedLesson.steps.length}
                  </span>
                  {isLessonCompleted && (
                    <span className="text-xs font-black text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-xl border border-emerald-200 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> درس ومباشرة مشروع مكتمل
                    </span>
                  )}
                </div>
                <h3 className="text-2xl font-black text-slate-900">{currentStep.title}</h3>
              </div>

              {/* Listen Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => speakText(`${currentStep.title}. ${currentStep.content}`)}
                className="flex items-center gap-2 px-4 py-2.5 bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-900 rounded-2xl text-xs font-black transition shadow-xs cursor-pointer"
              >
                <Volume2 className="w-4 h-4 text-amber-600 animate-pulse" />
                <span>استمع للدرس 🔊</span>
              </motion.button>
            </div>

            {/* Visual Lesson Progress Bar (شريط تقدم الدرس ومرحلة مشروعك الآن) */}
            <div className="p-4 bg-slate-900 rounded-2xl text-white space-y-3 border border-slate-800 shadow-md">
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-black">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-amber-400" />
                  <span className="text-amber-300">شريط تقدم الدرس:</span>
                  <span className="text-slate-300">
                    الخطوة {currentStepIndex + 1} من {selectedLesson.steps.length}
                  </span>
                </div>

                {/* Remaining Steps to Project Badge */}
                <div className="flex items-center gap-2">
                  {currentStepIndex < selectedLesson.steps.length - 1 ? (
                    <span className="px-2.5 py-1 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-400/40 text-[11px] font-black flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-amber-400" />
                      <span>متبقي {selectedLesson.steps.length - 1 - currentStepIndex} خطوات للوصول لمشروعك التطبيقي! 🛠️</span>
                    </span>
                  ) : (
                    <span className="px-2.5 py-1 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 text-[11px] font-black flex items-center gap-1 animate-pulse">
                      <Hammer className="w-3.5 h-3.5 text-amber-300" />
                      <span>أنت الآن في مرحلة تطبيق مشروعك! 🚀</span>
                    </span>
                  )}

                  <span className="px-2.5 py-1 rounded-xl bg-indigo-950 text-indigo-300 border border-indigo-700/60 text-[11px] font-black">
                    {Math.round(((currentStepIndex + 1) / selectedLesson.steps.length) * 100)}%
                  </span>
                </div>
              </div>

              {/* Progress Bar Track */}
              <div className="w-full bg-slate-800 h-3 rounded-full overflow-hidden p-0.5 border border-slate-700 relative">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{
                    width: `${((currentStepIndex + 1) / selectedLesson.steps.length) * 100}%`,
                  }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                  className="h-full rounded-full bg-gradient-to-r from-amber-500 via-orange-400 to-emerald-400 shadow-sm relative"
                >
                  <div className="absolute inset-0 bg-white/20 animate-pulse rounded-full"></div>
                </motion.div>
              </div>

              {/* Interactive Step Milestone Buttons & Practical Project Milestone */}
              <div className="flex items-center justify-between gap-2 pt-1 overflow-x-auto">
                {selectedLesson.steps.map((st, idx) => {
                  const isCurrent = idx === currentStepIndex;
                  const isPassed = idx < currentStepIndex;

                  return (
                    <motion.button
                      key={st.id}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => {
                        setCurrentStepIndex(idx);
                        stopSpeech();
                      }}
                      className={`flex-1 min-w-[110px] p-2 rounded-xl text-right transition cursor-pointer border flex flex-col justify-between gap-1 ${
                        isCurrent
                          ? "bg-amber-500/20 border-amber-400 text-amber-200 ring-2 ring-amber-400/30"
                          : isPassed
                          ? "bg-emerald-950/60 border-emerald-500/50 text-emerald-300"
                          : "bg-slate-800/60 border-slate-700/60 text-slate-400 hover:border-slate-600"
                      }`}
                    >
                      <div className="flex items-center justify-between text-[10px] font-black">
                        <span>الخطوة {idx + 1}</span>
                        {isPassed ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        ) : isCurrent ? (
                          <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
                        ) : null}
                      </div>
                      <span className="text-[11px] font-extrabold truncate leading-tight block">
                        {st.title}
                      </span>
                    </motion.button>
                  );
                })}

                {/* Project Milestone Flag */}
                {selectedLesson.practicalProject && (
                  <div
                    className={`min-w-[130px] p-2 rounded-xl text-right transition border flex flex-col justify-between gap-1 ${
                      currentStepIndex === selectedLesson.steps.length - 1
                        ? "bg-gradient-to-r from-amber-500/30 via-orange-500/30 to-amber-500/20 border-amber-300 text-amber-200 ring-2 ring-amber-400/50"
                        : "bg-slate-800/40 border-slate-700/50 text-slate-400"
                    }`}
                  >
                    <div className="flex items-center justify-between text-[10px] font-black text-amber-300">
                      <span className="flex items-center gap-1">
                        <Hammer className="w-3 h-3 text-amber-400" />
                        <span>المشروع</span>
                      </span>
                      <Flag className="w-3.5 h-3.5 text-amber-400" />
                    </div>
                    <span className="text-[11px] font-extrabold truncate leading-tight block text-white">
                      {selectedLesson.practicalProject.title}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Main Lesson Content Text - Clickable for TTS */}
            <div
              onClick={() => {
                playTtsChime();
                speakText(currentStep.content);
              }}
              className="p-5 bg-slate-50 hover:bg-amber-50/60 rounded-2xl border border-slate-200/80 hover:border-amber-300 text-slate-800 text-base sm:text-lg font-bold leading-relaxed cursor-pointer transition-all group relative"
              title="انقر للاستماع إلى هذه الفقرة بصوت زكي 🗣️"
            >
              <div className="flex items-start justify-between gap-3">
                <p className="flex-1">{currentStep.content}</p>
                <button
                  type="button"
                  className="p-2 rounded-xl bg-white border border-slate-200 text-amber-600 group-hover:bg-amber-500 group-hover:text-white transition shrink-0 shadow-xs"
                  title="استمع للفقرة"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              </div>
              <span className="text-[11px] font-bold text-amber-600/80 mt-2 block group-hover:text-amber-700">
                🔊 انقر على النص ليستمع زكي معك ويقرأه بصوت مرح وواضح!
              </span>
            </div>

            {/* Analogy Box - Clickable for TTS */}
            {currentStep.analogyTitle && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                onClick={() => {
                  playTtsChime();
                  speakText(`${currentStep.analogyTitle}. ${currentStep.analogyContent}`);
                }}
                className="p-5 bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-500/5 hover:from-amber-500/20 hover:to-orange-500/15 rounded-2xl border-2 border-amber-300/80 space-y-2 cursor-pointer transition-all group"
                title="انقر للاستماع إلى التشبيه الذكي بصوت زكي 🗣️"
              >
                <div className="flex items-center justify-between gap-2">
                  <h4 className="font-black text-amber-900 text-base flex items-center gap-2">
                    <Lightbulb className="w-5 h-5 text-amber-500 fill-amber-400" />
                    <span>{currentStep.analogyTitle}</span>
                  </h4>
                  <Volume2 className="w-4 h-4 text-amber-600 opacity-60 group-hover:opacity-100 group-hover:scale-110 transition" />
                </div>
                <p className="text-sm font-bold text-amber-950 leading-relaxed">
                  {currentStep.analogyContent}
                </p>
              </motion.div>
            )}

            {/* Interactive Hands-On Widget for current step */}
            <LessonInteractiveWidget
              interactiveType={currentStep.interactiveType}
              lessonId={selectedLesson.id}
            />

            {/* Interactive Flowchart Diagram fallback if diagramData exists */}
            {currentStep.diagramData && !currentStep.interactiveType && (
              <div className="p-6 bg-slate-900 rounded-3xl text-white space-y-4">
                <h4 className="text-xs font-black text-amber-400 uppercase tracking-wider text-center">
                  مخطط تدفق الذكاء الاصطناعي التفاعلي 🔄
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-center">
                  <div className="p-4 bg-slate-800 rounded-2xl border border-slate-700">
                    <span className="text-2xl">📥</span>
                    <p className="font-extrabold text-sm text-slate-200 mt-2">{currentStep.diagramData.inputLabel}</p>
                  </div>
                  <div className="p-4 bg-amber-500/20 border-2 border-amber-400/80 rounded-2xl flex flex-col items-center justify-center">
                    <span className="text-2xl animate-spin-slow">⚙️</span>
                    <p className="font-black text-sm text-amber-300 mt-2">{currentStep.diagramData.processLabel}</p>
                  </div>
                  <div className="p-4 bg-emerald-500/20 border-2 border-emerald-400/80 rounded-2xl flex flex-col items-center justify-center">
                    <span className="text-2xl">🚀</span>
                    <p className="font-black text-sm text-emerald-300 mt-2">{currentStep.diagramData.outputLabel}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Mini Checkpoint Quiz */}
            {currentStep.quizQuestion && (
              <div className="p-6 bg-purple-50 rounded-3xl border-2 border-purple-200 space-y-4">
                <h4 className="font-black text-purple-900 text-base flex items-center gap-2">
                  <HelpCircle className="w-5 h-5 text-purple-600" />
                  <span>سؤال تفاعلي سريع: {currentStep.quizQuestion.question}</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {currentStep.quizQuestion.options.map((option, idx) => {
                    const stepId = currentStep.id;
                    const isAnswered = selectedQuizAnswers[stepId] !== undefined;
                    const isSelected = selectedQuizAnswers[stepId] === idx;
                    const isCorrect = idx === currentStep.quizQuestion?.correctIndex;

                    let buttonStyle = "bg-white border-purple-200 text-purple-950 hover:bg-purple-100";
                    if (isAnswered) {
                      if (isCorrect) buttonStyle = "bg-emerald-500 text-white border-emerald-600 font-extrabold";
                      else if (isSelected) buttonStyle = "bg-rose-500 text-white border-rose-600 font-extrabold";
                    }

                    return (
                      <motion.button
                        key={idx}
                        disabled={isAnswered}
                        whileHover={!isAnswered ? { scale: 1.02 } : {}}
                        whileTap={!isAnswered ? { scale: 0.98 } : {}}
                        onClick={() => handleQuizAnswer(stepId, idx)}
                        className={`p-4 rounded-2xl border-2 text-right text-sm font-bold transition shadow-xs cursor-pointer ${buttonStyle}`}
                      >
                        {option}
                      </motion.button>
                    );
                  })}
                </div>

                {showExplanation[currentStep.id] && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 bg-white rounded-2xl border border-purple-200 text-sm font-bold text-purple-900"
                  >
                    🎉 {currentStep.quizQuestion.explanation}
                  </motion.div>
                )}
              </div>
            )}

            {/* Key Takeaway Banner */}
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3 text-emerald-900 text-sm font-extrabold">
              <Sparkles className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>ما نستفيده: {currentStep.keyTakeaway}</span>
            </div>

            {/* DEDICATED PRACTICAL PROJECT SECTION ("مشروعك الآن") */}
            {selectedLesson.practicalProject && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="p-6 sm:p-8 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 rounded-3xl text-white space-y-6 border-4 border-amber-400/80 shadow-2xl relative overflow-hidden"
              >
                {/* Ribbon Tag */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-indigo-800/80 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-amber-400/20 border-2 border-amber-400 flex items-center justify-center text-amber-300 shadow-lg">
                      <Hammer className="w-6 h-6 animate-pulse" />
                    </div>
                    <div>
                      <span className="text-xs font-black text-amber-400 bg-amber-500/10 px-3 py-1 rounded-xl border border-amber-400/30">
                        مشروعك الآن التطبيقي 🛠️
                      </span>
                      <h4 className="text-xl sm:text-2xl font-black text-white mt-1">
                        {selectedLesson.practicalProject.title}
                      </h4>
                    </div>
                  </div>

                  {/* Optional Lab Jump Button */}
                  {selectedLesson.practicalProject.labTypeLink && onOpenLab && (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => onOpenLab(selectedLesson.practicalProject.labTypeLink!)}
                      className="px-4 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-2xl text-xs font-black transition shadow-lg flex items-center gap-2 cursor-pointer"
                    >
                      <FlaskConical className="w-4 h-4 text-amber-300" />
                      <span>الانتقال للمختبر الشامل 🧪</span>
                    </motion.button>
                  )}
                </div>

                <p className="text-sm font-bold text-slate-200 leading-relaxed">
                  {selectedLesson.practicalProject.description}
                </p>

                {/* Objective Card */}
                <div className="p-4 bg-indigo-950/80 rounded-2xl border border-indigo-500/40 space-y-1">
                  <div className="flex items-center gap-2 text-xs font-black text-amber-300">
                    <Target className="w-4 h-4 text-amber-400" />
                    <span>الهدف الرئيسي للمشروع:</span>
                  </div>
                  <p className="text-xs font-bold text-slate-300 leading-relaxed">
                    {selectedLesson.practicalProject.objective}
                  </p>
                </div>

                {/* How to Build Checklist Steps */}
                <div className="p-5 bg-slate-900/90 rounded-2xl border border-slate-700/80 space-y-3">
                  <div className="flex items-center justify-between">
                    <h5 className="text-sm font-black text-cyan-300 flex items-center gap-2">
                      <CheckSquare className="w-4 h-4 text-cyan-400" />
                      <span>خطوات إنجاز مشروعك (انقر لإكمال الخطوة 🎯):</span>
                    </h5>
                    <span className="text-xs font-black px-2.5 py-1 bg-cyan-950 text-cyan-300 border border-cyan-800 rounded-xl">
                      {(completedProjectSteps[selectedLesson.id] || []).length} / {selectedLesson.practicalProject.stepsToBuild.length} مكتملة
                    </span>
                  </div>

                  <div className="space-y-2">
                    {selectedLesson.practicalProject.stepsToBuild.map((stepText, idx) => {
                      const isChecked = (completedProjectSteps[selectedLesson.id] || []).includes(idx);
                      return (
                        <motion.button
                          key={idx}
                          whileHover={{ scale: 1.01 }}
                          whileTap={{ scale: 0.99 }}
                          onClick={() => toggleProjectStep(selectedLesson.id, idx)}
                          className={`w-full p-3.5 rounded-xl text-xs font-bold transition flex items-start gap-3 text-right cursor-pointer border ${
                            isChecked
                              ? "bg-emerald-950/80 border-emerald-500/80 text-emerald-200"
                              : "bg-slate-800/90 border-slate-700 hover:border-slate-500 text-slate-200"
                          }`}
                        >
                          <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 font-black text-[11px] transition ${
                            isChecked
                              ? "bg-emerald-500 text-white"
                              : "bg-amber-500/20 border border-amber-400 text-amber-300"
                          }`}>
                            {isChecked ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                          </div>
                          <span className={`pt-0.5 leading-relaxed flex-1 ${isChecked ? "line-through opacity-80" : ""}`}>
                            {stepText}
                          </span>
                        </motion.button>
                      );
                    })}
                  </div>
                </div>

                {/* Interactive Project Widget Embedded */}
                <div className="pt-2">
                  <span className="text-xs font-black text-amber-300 mb-3 block flex items-center gap-1.5">
                    <Zap className="w-4 h-4 text-amber-400 animate-bounce" />
                    <span>جرب جودة بناء وتطبيق مشروعك مباشرة هنا:</span>
                  </span>
                  <LessonInteractiveWidget
                    interactiveType={selectedLesson.practicalProject.interactiveType}
                    lessonId={selectedLesson.id}
                  />
                </div>
              </motion.div>
            )}

            {/* Controls Footer */}
            <div className="flex items-center justify-between pt-6 border-t border-slate-100">
              <button
                onClick={handlePrevStep}
                disabled={currentStepIndex === 0}
                className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 disabled:opacity-40 text-slate-700 font-extrabold text-sm transition cursor-pointer"
              >
                <ChevronRight className="w-5 h-5" />
                <span>الخطوة السابقة</span>
              </button>

              <div className="flex items-center gap-3">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => onStartQuiz(selectedLesson.title)}
                  className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-sm transition shadow-md shadow-purple-600/20 cursor-pointer"
                >
                  <Trophy className="w-5 h-5 text-amber-300" />
                  <span>اختبار ذكي بـ AI 🤖</span>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleNextStep}
                  className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-sm transition shadow-lg shadow-amber-500/20 cursor-pointer"
                >
                  <span>{isLastStep ? "إكمال الدرس والمشروع وحصد XP 🏆" : "الخطوة التالية"}</span>
                  <ChevronLeft className="w-5 h-5" />
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Lesson Completed Celebration Modal */}
      <AnimatePresence>
        {completedModalData && (
          <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 dir-rtl">
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 20 }}
              transition={{ type: "spring", damping: 20, stiffness: 300 }}
              className="bg-white rounded-3xl max-w-md w-full p-6 text-center space-y-5 relative shadow-2xl border-4 border-amber-300"
            >
              <button
                onClick={() => setCompletedModalData(null)}
                className="absolute top-4 left-4 p-2 text-slate-400 hover:text-slate-600 rounded-full cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 260, damping: 20 }}
                className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-tr from-amber-400 to-amber-200 flex items-center justify-center text-amber-900 shadow-xl shadow-amber-400/30 text-4xl"
              >
                🏆
              </motion.div>

              <div className="space-y-2">
                <h3 className="text-2xl font-black text-slate-900">إنجاز وبناء عملي رائع! 🎉</h3>
                <p className="text-sm font-bold text-slate-600">
                  أكملت درس ومباشرة مشروع <span className="text-amber-600 font-black">"{completedModalData.lessonTitle}"</span> بنجاح وتفوق!
                </p>
              </div>

              <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-center justify-center gap-3">
                <Award className="w-8 h-8 text-amber-500" />
                <div className="text-right">
                  <span className="text-xs font-bold text-amber-800 block">المكافأة المكتسبة:</span>
                  <span className="text-xl font-black text-amber-600">+ {completedModalData.xp} XP</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  onClick={() => {
                    setCompletedModalData(null);
                    if (selectedLesson) {
                      onStartQuiz(selectedLesson.title);
                    }
                  }}
                  className="py-3 px-4 bg-purple-600 hover:bg-purple-700 text-white font-extrabold rounded-2xl text-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Trophy className="w-4 h-4 text-amber-300" />
                  <span>اختبر مهاراتك بـ AI</span>
                </button>

                <button
                  onClick={() => setCompletedModalData(null)}
                  className="py-3 px-4 bg-amber-500 hover:bg-amber-600 text-white font-extrabold rounded-2xl text-xs transition cursor-pointer"
                >
                  متابعة الدروس والمشاريع 🚀
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
