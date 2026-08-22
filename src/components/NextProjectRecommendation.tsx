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
  BookOpen,
  HelpCircle,
  FlaskConical,
  Target,
} from "lucide-react";
import { LabResult, Project, ProjectCategory, ProjectDifficulty, UserProgress } from "../types";
import { loadLearningEvidences } from "../utils/learningEvidence";
import { loadLabs } from "../data/storage";
import {
  recommendNextLearningAction,
  getDifficultyLabel,
  getDifficultyDescription,
  LearningRecommendation,
} from "../domain/adaptive";

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
      "مغامرة الرؤية الحاسوبية بانتظارك! تعلّم كيف تفهم الكاميرا العالم وتحول مصفوفات البكسلات إلى وجوج وأشكال ذكية في أجزاء من الثانية.",
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
  progress?: UserProgress;
  labs?: LabResult[];
  onOpenLab?: (labKey: string) => void;
  onSelectLesson?: (lessonId: string) => void;
  onStartQuiz?: (topic: string) => void;
  onAwardXP?: (amount: number, reason: string) => void;
}

export const NextProjectRecommendation: React.FC<NextProjectRecommendationProps> = ({
  projects,
  childName,
  progress,
  labs,
  onOpenLab,
  onSelectLesson,
  onStartQuiz,
  onAwardXP,
}) => {
  const [cycleIndex, setCycleIndex] = useState(0);

  // Derive Authoritative Adaptive Recommendation from Gate 9 Engine
  const recommendation: LearningRecommendation = useMemo(() => {
    const evidences = loadLearningEvidences();
    const storedLabs = labs || loadLabs();
    return recommendNextLearningAction({
      childName,
      progress,
      evidences,
      labs: storedLabs,
    });
  }, [childName, progress, labs]);

  // Domain Stats for secondary portfolio diversity breakdown
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

  const candidateDomains = useMemo(() => {
    if (domainStats.unexploredDomains.length > 0) {
      return domainStats.unexploredDomains;
    }
    return [...AI_LEARNING_DOMAINS].sort((a, b) => {
      const countA = domainStats.counts[a.category] || 0;
      const countB = domainStats.counts[b.category] || 0;
      return countA - countB;
    });
  }, [domainStats]);

  const currentDomain =
    candidateDomains[cycleIndex % candidateDomains.length] || AI_LEARNING_DOMAINS[0];

  const handleNextSuggestion = () => {
    setCycleIndex((prev) => prev + 1);
  };

  const handleExecuteRecommendation = () => {
    if (onAwardXP) {
      onAwardXP(10, `بدء تنفيذ التوصية الذكية: ${recommendation.targetTitleAr}`);
    }

    if (recommendation.targetType === "quiz" && onStartQuiz && recommendation.suggestedTopic) {
      onStartQuiz(recommendation.suggestedTopic);
    } else if (recommendation.targetType === "lesson" && onSelectLesson && recommendation.lessonId) {
      onSelectLesson(recommendation.lessonId);
    } else if (recommendation.targetType === "lab" && onOpenLab) {
      onOpenLab(recommendation.labKey || "train");
    } else if (onOpenLab) {
      onOpenLab(currentDomain.labKey);
    }
  };

  const getActionBadge = (actionType: string) => {
    switch (actionType) {
      case "assess":
        return {
          label: "تقييم إثبات الإتقان 📝",
          className: "bg-amber-100 text-amber-900 border-amber-300",
          icon: <Award className="w-3.5 h-3.5 text-amber-600" />,
        };
      case "review":
        return {
          label: "مراجعة تثبيت المهارة 🔄",
          className: "bg-indigo-100 text-indigo-900 border-indigo-300",
          icon: <RotateCcw className="w-3.5 h-3.5 text-indigo-600" />,
        };
      case "practice":
      case "project":
        return {
          label: "ممارسة تطبيقية عملية 🧪",
          className: "bg-emerald-100 text-emerald-900 border-emerald-300",
          icon: <FlaskConical className="w-3.5 h-3.5 text-emerald-600" />,
        };
      case "learn":
      default:
        return {
          label: "درس استكشافي جديد 📖",
          className: "bg-blue-100 text-blue-900 border-blue-300",
          icon: <BookOpen className="w-3.5 h-3.5 text-blue-600" />,
        };
    }
  };

  const actionBadge = getActionBadge(recommendation.actionType);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden p-5 sm:p-7 space-y-6"
    >
      {/* Top Header Strip: Coach Badge & Deterministic State Indicator */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-2xs">
              <Compass className="w-3.5 h-3.5 text-indigo-600" />
              <span>الموجّه الذكي للبطل {childName} 🎯</span>
            </span>

            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-black border ${actionBadge.className}`}>
              {actionBadge.icon}
              <span>{actionBadge.label}</span>
            </span>

            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-black bg-slate-100 text-slate-700 border border-slate-200">
              <span>{getDifficultyLabel(recommendation.difficulty, "ar")}</span>
            </span>
          </div>

          <h3 className="text-lg sm:text-xl font-black text-slate-900 flex items-center gap-2 pt-1">
            <span>توصيتك المخصصة التالية: {recommendation.targetTitleAr}</span>
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-2xl">
            {recommendation.explanationAr}
          </p>
        </div>

        {/* Action Button */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={handleExecuteRecommendation}
            className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs sm:text-sm font-black rounded-2xl shadow-lg shadow-indigo-200 transition cursor-pointer flex items-center gap-2"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>ابدأ الخطوة المقترحة 🚀</span>
          </button>
        </div>
      </div>

      {/* Secondary Card: Domain Explorer & Practical Lab Portfolio */}
      <div className="relative rounded-2xl bg-gradient-to-br from-slate-50 to-indigo-50/40 p-4 sm:p-5 border border-slate-200 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-600" />
            <h4 className="text-xs sm:text-sm font-black text-slate-800">
              تنوّع الخبرات في المحفظة العملية:
            </h4>
          </div>
          <span className="text-[11px] font-bold text-slate-500">
            {domainStats.diversityPercentage}% تغطية ({domainStats.exploredDomains.length}/4 مجالات)
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {AI_LEARNING_DOMAINS.map((domain) => {
            const count = domainStats.counts[domain.category] || 0;
            const isDone = count > 0;

            return (
              <div
                key={domain.category}
                className={`p-3 rounded-xl border transition flex flex-col justify-between ${
                  isDone
                    ? "bg-emerald-50/70 border-emerald-200 text-emerald-950"
                    : "bg-white border-slate-200 text-slate-800"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xl">{domain.icon}</span>
                    {isDone ? (
                      <span className="text-[10px] font-black px-1.5 py-0.5 rounded-full bg-emerald-200 text-emerald-900">
                        {count} منجز ✓
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-600">
                        متاح للبدء
                      </span>
                    )}
                  </div>
                  <h5 className="text-xs font-black leading-snug">{domain.titleAr}</h5>
                </div>

                <button
                  onClick={() => {
                    if (onOpenLab) onOpenLab(domain.labKey);
                  }}
                  className="mt-2.5 w-full py-1 text-[11px] font-black rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 transition flex items-center justify-center gap-1 cursor-pointer"
                >
                  <span>{isDone ? "إعادة التجربة" : "خوض المختبر"}</span>
                  <ChevronLeft className="w-3 h-3" />
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
};
