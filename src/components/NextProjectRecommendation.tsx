import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Sparkles,
  ArrowLeft,
  Compass,
  CheckCircle2,
  Clock,
  Zap,
  RotateCcw,
  Lightbulb,
  Award,
  ChevronLeft,
  ShieldCheck,
  Brain,
  Eye,
  Wand2,
  Play,
  Flame,
} from "lucide-react";
import { Project, ProjectCategory, ProjectDifficulty } from "../types";

export interface AIRecommendationDomain {
  category: ProjectCategory;
  labKey: string;
  titleAr: string;
  titleEn: string;
  topicAr: string;
  icon: string;
  categoryIcon: React.ReactNode;
  difficulty: ProjectDifficulty;
  xpReward: number;
  durationMinutes: number;
  unexploredReasonAr: string;
  exploredReasonAr: string;
  whatYouWillLearnAr: string[];
  tags: string[];
  gradientTheme: string;
  accentBorder: string;
  badgeBg: string;
  glowColor: string;
}

export const AI_LEARNING_DOMAINS: AIRecommendationDomain[] = [
  {
    category: "classification",
    labKey: "train",
    titleAr: "مختبر تدريب نموذج تصنيف الفواكه والكائنات 🍎",
    titleEn: "Supervised Learning & Fruit Classification Lab",
    topicAr: "تعلّم الآلة والتصنيف الإشرافي (Machine Learning)",
    icon: "🧠",
    categoryIcon: <Brain className="w-4 h-4 text-blue-500" />,
    difficulty: "easy",
    xpReward: 100,
    durationMinutes: 10,
    unexploredReasonAr:
      "لم توثّق بعد أي مشروع في تعلّم الآلة وتصنيف البيانات! ابدأ بتدريب نموذجك الذكي على عينات ملونة ليميّز بين الفواكه بدقة عالية كالعقل البشري.",
    exploredReasonAr:
      "أنت بطل في تصنيف البيانات! يمكنك إعادة التحدي وإضافة عينات جديدة لتجربة أسرع خوارزمية تمييز بدقة 100%.",
    whatYouWillLearnAr: [
      "مفهوم التعلّم الإشرافي (Supervised Learning)",
      "تجهيز وتغذية البيانات (Feature Datasets)",
      "اختبار نسبة الدقة (Accuracy Score)",
    ],
    tags: ["Supervised ML", "Classification", "Model Training", "Data Features"],
    gradientTheme: "from-blue-600 via-indigo-600 to-sky-600",
    accentBorder: "border-blue-400/80 ring-blue-500/20",
    badgeBg: "bg-blue-50 text-blue-800 border-blue-200",
    glowColor: "shadow-blue-500/20",
  },
  {
    category: "prompt-engineering",
    labKey: "prompt",
    titleAr: "مختبر هندسة الأوامر وصناعة القصص التوليدية 🔮",
    titleEn: "Generative AI Prompt Architecture Lab",
    topicAr: "الذكاء التوليدي وهندسة الأوامر (Generative AI)",
    icon: "🔮",
    categoryIcon: <Wand2 className="w-4 h-4 text-purple-500" />,
    difficulty: "easy",
    xpReward: 100,
    durationMinutes: 8,
    unexploredReasonAr:
      "لم تستكشف بعد قوة الأوامر الخمسة السحرية في توجيه الذكاء التوليدي! تعلّم صياغة أوامر احترافية لتوليد مغامرات وقصص خيال علمي متناسقة.",
    exploredReasonAr:
      "لديك مهارة متميزة في الأوامر! جرّب الآن صياغة قيود أسلوبية جديدة واكتشف أسرار درجة الإبداع (Temperature).",
    whatYouWillLearnAr: [
      "معادلة الأوامر الخماسية (الدور، المهمة، السياق، القيود، الأسلوب)",
      "التحكم في درجة الإبداع والمنطق",
      "توليد مخرجات أدبية وعلمية منسقة",
    ],
    tags: ["Prompt Engineering", "Generative AI", "LLM Control", "Storytelling"],
    gradientTheme: "from-purple-600 via-fuchsia-600 to-indigo-600",
    accentBorder: "border-purple-400/80 ring-purple-500/20",
    badgeBg: "bg-purple-50 text-purple-800 border-purple-200",
    glowColor: "shadow-purple-500/20",
  },
  {
    category: "computer-vision",
    labKey: "vision",
    titleAr: "مختبر رؤية الكمبيوتر وكشف الوجوه والكائنات 👁️",
    titleEn: "Computer Vision & Object Detection Lab",
    topicAr: "رؤية الكمبيوتر ومعالجة الصور (Computer Vision)",
    icon: "👁️",
    categoryIcon: <Eye className="w-4 h-4 text-emerald-500" />,
    difficulty: "medium",
    xpReward: 120,
    durationMinutes: 12,
    unexploredReasonAr:
      "مغامرة الرؤية الحاسوبية بانتظارك! تعلّم كيف تفهم الكاميرا العالم وتحول مصفوفات البكسلات إلى وجوه وأشكال ذكية في أجزاء من الثانية.",
    exploredReasonAr:
      "أتقنت كشف الملامح! اختبر نموذجك في ظروف إضاءة مختلفة لترى كيف تتكيف خوارزميات الرؤية الذكية.",
    whatYouWillLearnAr: [
      "مصفوفات البكسلات واستخراج الملامح (Feature Maps)",
      "كشف المربعات المحيطة بالوجه (Bounding Boxes)",
      "معالجة الصور في الزمن الحقيقي (Real-Time Vision)",
    ],
    tags: ["Computer Vision", "Bounding Box", "Pixel Matrix", "Feature Detection"],
    gradientTheme: "from-emerald-600 via-teal-600 to-cyan-600",
    accentBorder: "border-emerald-400/80 ring-emerald-500/20",
    badgeBg: "bg-emerald-50 text-emerald-800 border-emerald-200",
    glowColor: "shadow-emerald-500/20",
  },
  {
    category: "other", // mapped to AI ethics and safety
    labKey: "ethics",
    titleAr: "مختبر حارس الأمان وصياغة ميثاق الأخلاقيات 🛡️",
    titleEn: "AI Safety & Ethical Charter Lab",
    topicAr: "الأمان الرقمي وأخلاقيات الذكاء (AI Safety & Ethics)",
    icon: "🛡️",
    categoryIcon: <ShieldCheck className="w-4 h-4 text-rose-500" />,
    difficulty: "easy",
    xpReward: 90,
    durationMinutes: 8,
    unexploredReasonAr:
      "المهندس العظيم هو مهندس ذكي ومسؤول! خض سيناريوهات تمييز التزييف وحماية الخصوصية وصِغ ميثاق الأمان الرقمي المعتمد.",
    exploredReasonAr:
      "أنت حارس أمان رقمي متميز! راجع معايير الخصوصية لتعزيز مسؤولية نماذج الذكاء الاصطناعي التي تبنيها مستقبلاً.",
    whatYouWillLearnAr: [
      "حماية الخصوصية والبيانات الشخصية",
      "كشف التزييف العميق وتدقيق الحقائق (Deepfake Awareness)",
      "مبادئ الاستخدام الإيجابي للذكاء الاصطناعي",
    ],
    tags: ["AI Ethics", "Data Privacy", "Digital Trust", "Safety Charter"],
    gradientTheme: "from-rose-600 via-pink-600 to-purple-600",
    accentBorder: "border-rose-400/80 ring-rose-500/20",
    badgeBg: "bg-rose-50 text-rose-800 border-rose-200",
    glowColor: "shadow-rose-500/20",
  },
];

interface NextProjectRecommendationProps {
  projects: Project[];
  childName: string;
  onOpenLab?: (labKey: string) => void;
  onAwardXP?: (amount: number, reason: string) => void;
}

export const NextProjectRecommendation: React.FC<NextProjectRecommendationProps> = ({
  projects,
  childName,
  onOpenLab,
  onAwardXP,
}) => {
  const [cycleIndex, setCycleIndex] = useState(0);

  // 1. Calculate stats per domain
  const domainStats = useMemo(() => {
    const counts: Record<string, number> = {
      classification: 0,
      "prompt-engineering": 0,
      "computer-vision": 0,
      other: 0,
    };

    projects.forEach((p) => {
      if (counts[p.category] !== undefined) {
        counts[p.category]++;
      } else {
        counts.other++;
      }
    });

    const exploredDomains = AI_LEARNING_DOMAINS.filter(
      (d) => (counts[d.category] || 0) > 0
    );
    const unexploredDomains = AI_LEARNING_DOMAINS.filter(
      (d) => (counts[d.category] || 0) === 0
    );

    const diversityPercentage = Math.round(
      (exploredDomains.length / AI_LEARNING_DOMAINS.length) * 100
    );

    return {
      counts,
      exploredDomains,
      unexploredDomains,
      diversityPercentage,
      isFullyDiverse: unexploredDomains.length === 0,
    };
  }, [projects]);

  // 2. Determine pool of recommendations (prioritize unexplored domains first)
  const candidateDomains = useMemo(() => {
    if (domainStats.unexploredDomains.length > 0) {
      return domainStats.unexploredDomains;
    }
    // If all explored, sort by least projects completed
    return [...AI_LEARNING_DOMAINS].sort((a, b) => {
      const countA = domainStats.counts[a.category] || 0;
      const countB = domainStats.counts[b.category] || 0;
      return countA - countB;
    });
  }, [domainStats]);

  // Current active recommended domain
  const currentDomain =
    candidateDomains[cycleIndex % candidateDomains.length] || AI_LEARNING_DOMAINS[0];
  const isUnexplored = (domainStats.counts[currentDomain.category] || 0) === 0;

  const handleNextSuggestion = () => {
    setCycleIndex((prev) => prev + 1);
  };

  const handleLaunchLab = () => {
    if (onAwardXP) {
      onAwardXP(10, `بدء استكشاف المشروع المقترح: ${currentDomain.titleAr}`);
    }
    if (onOpenLab) {
      onOpenLab(currentDomain.labKey);
    }
  };

  const diffLabel =
    currentDomain.difficulty === "easy"
      ? "سهل 🟢"
      : currentDomain.difficulty === "medium"
      ? "متوسط 🟡"
      : "متقدم 🔴";

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden p-5 sm:p-7 space-y-6"
    >
      {/* Top Header Strip: Coach Badge & Diversity Meter */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-2xs">
              <Compass className="w-3.5 h-3.5 text-indigo-600 animate-spin-slow" />
              <span>المشروع المقترح التالي للبطل {childName} 🎯</span>
            </span>

            {domainStats.isFullyDiverse ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-black bg-amber-100 text-amber-900 border border-amber-300">
                <Award className="w-3.5 h-3.5 text-amber-600" />
                <span>شمولية كاملة 100% ⭐</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-black bg-emerald-50 text-emerald-800 border border-emerald-200">
                <Flame className="w-3.5 h-3.5 text-emerald-600" />
                <span>تنويع المهارات الذكية 🚀</span>
              </span>
            )}
          </div>

          <h3 className="text-lg sm:text-xl font-black text-slate-900 flex items-center gap-2">
            <span>مُوجِّه التعلّم الذكي: خطوتك القادمة في عالم AI</span>
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-2xl">
            {domainStats.isFullyDiverse
              ? "مبارك! لقد أنجزت مشاريع في جميع مجالات الذكاء الاصطناعي الأساسية. نقترح عليك المختبر التالي لتعزيز سرعتك ودقتك!"
              : "يقوم النظام الذكي بتحليل محفظتك واقتراح مختبرات في المجالات التي لم تستكشفها بعد، لتصبح مهندساً شاملاً ومبدعاً!"}
          </p>
        </div>

        {/* Diversity Progress Gauge */}
        <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 min-w-[280px] space-y-2">
          <div className="flex items-center justify-between text-xs font-black">
            <span className="text-slate-700 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-500" />
              <span>مقياس تنوع المجالات:</span>
            </span>
            <span className="text-indigo-600 font-extrabold font-mono">
              {domainStats.diversityPercentage}% ({domainStats.exploredDomains.length}/{AI_LEARNING_DOMAINS.length} مجالات)
            </span>
          </div>

          {/* Mini Progress Bar */}
          <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${domainStats.diversityPercentage}%` }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-500 rounded-full"
            />
          </div>

          {/* 4 Domains Visual Indicator Chips */}
          <div className="grid grid-cols-4 gap-1.5 pt-1">
            {AI_LEARNING_DOMAINS.map((dom) => {
              const isDone = (domainStats.counts[dom.category] || 0) > 0;
              const isCurrent = currentDomain.category === dom.category;
              return (
                <div
                  key={dom.category}
                  title={`${dom.topicAr}: ${isDone ? "تم إنجاز مشاريع ✅" : "بانتظار الاستكشاف ⏳"}`}
                  className={`text-center py-1 px-1 rounded-lg text-[10px] font-black transition-all border ${
                    isCurrent
                      ? "bg-indigo-600 text-white border-indigo-600 shadow-xs scale-105"
                      : isDone
                      ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                      : "bg-white text-slate-400 border-slate-200 opacity-70"
                  }`}
                >
                  <span className="block text-xs">{dom.icon}</span>
                  <span className="truncate block font-mono text-[9px]">
                    {isDone ? "منجز ✓" : "مقترح"}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Recommendation Feature Card with Smooth Transition */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentDomain.category}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 10 }}
          transition={{ duration: 0.25 }}
          className={`relative rounded-3xl p-6 sm:p-8 bg-gradient-to-br ${currentDomain.gradientTheme} text-white shadow-xl ${currentDomain.glowColor} overflow-hidden`}
        >
          {/* Subtle Backlight Radial Glow */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-black/15 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2 pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            {/* Left/Main Column: Project Details & Personalized Coaching Note */}
            <div className="space-y-4 max-w-3xl">
              {/* Badges strip */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-white/20 backdrop-blur-md text-white border border-white/30">
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  <span>{currentDomain.topicAr}</span>
                </span>

                <span className="px-3 py-1 rounded-full text-xs font-black bg-amber-400 text-slate-950 shadow-xs">
                  مستوى: {diffLabel}
                </span>

                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black bg-white/15 text-white border border-white/20">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{currentDomain.durationMinutes} دقائق</span>
                </span>

                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black bg-emerald-400/90 text-slate-950 font-bold shadow-xs">
                  <Zap className="w-3.5 h-3.5 fill-current" />
                  <span>+{currentDomain.xpReward} XP</span>
                </span>
              </div>

              {/* Title & English Subtitle */}
              <div className="space-y-1">
                <h4 className="text-xl sm:text-3xl font-black text-white leading-tight flex items-center gap-2">
                  <span>{currentDomain.titleAr}</span>
                </h4>
                <p className="text-xs sm:text-sm text-white/80 font-mono">
                  {currentDomain.titleEn}
                </p>
              </div>

              {/* Zaki AI Coach Reasoning Box */}
              <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-white space-y-2">
                <div className="flex items-center gap-2 text-xs font-black text-amber-300">
                  <Lightbulb className="w-4 h-4" />
                  <span>لماذا نقترح عليك هذا المختبر بالتحديد؟ 💡</span>
                </div>
                <p className="text-xs sm:text-sm leading-relaxed text-slate-100 font-medium">
                  {isUnexplored
                    ? currentDomain.unexploredReasonAr
                    : currentDomain.exploredReasonAr}
                </p>

                {/* Key takeaways bullet pills */}
                <div className="pt-2 border-t border-white/15 flex flex-wrap items-center gap-2">
                  <span className="text-[11px] font-bold text-white/90">ماذا ستتعلم:</span>
                  {currentDomain.whatYouWillLearnAr.map((item, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-black/20 text-[11px] font-medium text-white/95"
                    >
                      <CheckCircle2 className="w-3 h-3 text-emerald-300" />
                      <span>{item}</span>
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column: Prominent Action Buttons */}
            <div className="flex flex-col sm:flex-row md:flex-col items-stretch gap-3 w-full md:w-auto shrink-0 pt-2 md:pt-0">
              {/* Main Launch Button */}
              <button
                onClick={handleLaunchLab}
                className="px-6 py-3.5 bg-amber-400 hover:bg-amber-300 active:scale-95 text-slate-950 font-black rounded-2xl transition-all shadow-xl shadow-black/20 flex items-center justify-center gap-2.5 text-sm cursor-pointer group"
              >
                <Play className="w-4 h-4 fill-current group-hover:translate-x-0.5 transition-transform" />
                <span>ابدأ المختبر المقترح الآن 🚀</span>
              </button>

              {/* Cycle Alternative Suggestion Button */}
              {candidateDomains.length > 1 && (
                <button
                  onClick={handleNextSuggestion}
                  className="px-4 py-2.5 bg-white/15 hover:bg-white/25 active:scale-95 text-white font-bold rounded-2xl transition-colors border border-white/25 flex items-center justify-center gap-2 text-xs cursor-pointer"
                  title="عرض مقترح من مجال آخر"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>اقتراح مجال آخر ({candidateDomains.length} خيارات)</span>
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
};
