import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Project,
  ProjectCategory,
  ProjectDifficulty,
  ProjectsPortfolioData,
  User,
} from "../types";
import { LabResult, getProjectsFromLabs, getLabsStats, getProjectDifficulty } from "../data/labs";
import {
  loadLabs,
  addLabResult,
  removeLabResult,
  resetLabsToSeed,
  loadStarredProjects,
  toggleStarredProject,
  isStorageAvailable,
} from "../data/storage";
import {
  Sparkles,
  Award,
  CheckCircle2,
  Share2,
  Copy,
  Check,
  Eye,
  Brain,
  Wand2,
  ShieldCheck,
  Code2,
  Layers,
  Star,
  Flame,
  Plus,
  RotateCcw,
  X,
  ExternalLink,
  Calendar,
  Zap,
  Tag,
  FileCode2,
  Database,
  ArrowRight,
  Download,
  Image as ImageIcon,
  Search,
  SlidersHorizontal,
  Filter,
  Pin,
} from "lucide-react";
import { AchievementCardModal } from "./AchievementCardModal";
import { downloadProjectAchievementPNG } from "../utils/cardGenerator";
import { NextProjectRecommendation } from "./NextProjectRecommendation";

interface ProjectsPortfolioProps {
  portfolioData?: ProjectsPortfolioData;
  labs?: LabResult[];
  user?: User;
  onSimulateLab?: () => void;
  onResetSeed?: () => void;
  onOpenLab?: (labKey: string) => void;
  onOpenImprovementLab?: (project: Project) => void;
  onNavigateToParentReport?: () => void;
  onAwardXP?: (amount: number, reason: string) => void;
}

export const ProjectsPortfolio: React.FC<ProjectsPortfolioProps> = ({
  portfolioData: initialPortfolioData,
  labs: initialLabs,
  user,
  onSimulateLab,
  onResetSeed,
  onOpenLab,
  onOpenImprovementLab,
  onNavigateToParentReport,
  onAwardXP,
}) => {
  // Local reactive labs state (if not passed as controlled prop)
  const [internalLabs, setInternalLabs] = useState<LabResult[]>(() => {
    return initialLabs || loadLabs();
  });

  // Keep in sync with parent props if provided
  useEffect(() => {
    if (initialLabs) {
      setInternalLabs(initialLabs);
    }
  }, [initialLabs]);

  // Derive projects & stats
  const activeProjects: Project[] = initialPortfolioData?.projects
    ? initialPortfolioData.projects
    : getProjectsFromLabs(internalLabs);

  const stats = getLabsStats(internalLabs);

  const childName =
    initialPortfolioData?.childName ||
    user?.name ||
    (user?.role === "parent" ? "طفلكم المبدع" : "البطل المبتكر");

  // Filter & Starred state
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("all");
  const [showStarredOnly, setShowStarredOnly] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [starredIds, setStarredIds] = useState<string[]>(() => loadStarredProjects());
  const [activeModalProject, setActiveModalProject] = useState<Project | null>(null);
  const [cardModalProject, setCardModalProject] = useState<Project | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Check if opened via unique share URL parameter
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const shareProjectId = params.get("share_project");
      if (shareProjectId && !cardModalProject) {
        const found = activeProjects.find((p) => p.id === shareProjectId);
        if (found) {
          const studentParam = params.get("student");
          const customFound = studentParam ? { ...found, childName: studentParam } : found;
          setCardModalProject(customFound);
          showToast(`🌟 تم فتح بطاقة إنجاز المشروع المشتركة: ${found.titleAr || found.title}!`);
        }
      }
    }
  }, [activeProjects]);

  const handleToggleStar = (projectId: string, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    const updated = toggleStarredProject(projectId);
    setStarredIds(updated);
    const isNowStarred = updated.includes(projectId);
    const target = activeProjects.find((p) => p.id === projectId);
    const name = target ? target.titleAr || target.title : "المشروع";

    if (isNowStarred) {
      showToast(`⭐ تم تثبيت (${name}) في قائمة مشاريعك المفضلة بالأعلى! 📌`);
      if (onAwardXP) {
        onAwardXP(15, `تثبيت مشروع في المفضلة: ${name}`);
      }
    } else {
      showToast(`💫 تمت إزالة (${name}) من قائمة المفضلة`);
    }
  };

  const handleQuickDownloadPNG = (project: Project, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    downloadProjectAchievementPNG(project, project.childName || childName);
    showToast(`تم تحميل بطاقة إنجاز (${project.titleAr || project.title}) بنجاح كصورة PNG عالية الدقة! 📥✨`);
  };

  const handleOpenCardModal = (project: Project, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setCardModalProject(project);
  };

  // Dynamic Difficulty Counters based on active category & starred filter
  const countAllDiff = activeProjects.filter((p) => {
    const matchCat = selectedCategory === "all" || p.category === selectedCategory;
    const matchStar = !showStarredOnly || starredIds.includes(p.id);
    return matchCat && matchStar;
  }).length;

  const countEasyDiff = activeProjects.filter((p) => {
    const matchCat = selectedCategory === "all" || p.category === selectedCategory;
    const matchDiff = (p.difficulty || getProjectDifficulty(p)) === "easy";
    const matchStar = !showStarredOnly || starredIds.includes(p.id);
    return matchCat && matchDiff && matchStar;
  }).length;

  const countMediumDiff = activeProjects.filter((p) => {
    const matchCat = selectedCategory === "all" || p.category === selectedCategory;
    const matchDiff = (p.difficulty || getProjectDifficulty(p)) === "medium";
    const matchStar = !showStarredOnly || starredIds.includes(p.id);
    return matchCat && matchDiff && matchStar;
  }).length;

  const countHardDiff = activeProjects.filter((p) => {
    const matchCat = selectedCategory === "all" || p.category === selectedCategory;
    const matchDiff = (p.difficulty || getProjectDifficulty(p)) === "hard";
    const matchStar = !showStarredOnly || starredIds.includes(p.id);
    return matchCat && matchDiff && matchStar;
  }).length;

  const countStarredTotal = activeProjects.filter((p) => starredIds.includes(p.id)).length;

  const difficultyList: {
    id: string;
    label: string;
    emoji: string;
    count: number;
    badgeClass: string;
    activeClass: string;
    dotColor: string;
  }[] = [
    {
      id: "all",
      label: "جميع المستويات",
      emoji: "✨",
      count: countAllDiff,
      badgeClass: "border-slate-200 text-slate-700 bg-white hover:bg-slate-50",
      activeClass: "bg-indigo-600 text-white shadow-md shadow-indigo-200 border-indigo-600",
      dotColor: "bg-indigo-400",
    },
    {
      id: "easy",
      label: "سهل",
      emoji: "🟢",
      count: countEasyDiff,
      badgeClass: "border-emerald-200/80 text-emerald-800 bg-emerald-50/60 hover:bg-emerald-100/60",
      activeClass: "bg-emerald-600 text-white shadow-md shadow-emerald-200 border-emerald-600",
      dotColor: "bg-emerald-400",
    },
    {
      id: "medium",
      label: "متوسط",
      emoji: "🟡",
      count: countMediumDiff,
      badgeClass: "border-amber-200/80 text-amber-800 bg-amber-50/60 hover:bg-amber-100/60",
      activeClass: "bg-amber-600 text-white shadow-md shadow-amber-200 border-amber-600",
      dotColor: "bg-amber-400",
    },
    {
      id: "hard",
      label: "متقدم",
      emoji: "🔴",
      count: countHardDiff,
      badgeClass: "border-rose-200/80 text-rose-800 bg-rose-50/60 hover:bg-rose-100/60",
      activeClass: "bg-rose-600 text-white shadow-md shadow-rose-200 border-rose-600",
      dotColor: "bg-rose-400",
    },
  ];

  const categoryList: { id: string; label: string; count: number; icon: React.ReactNode }[] = [
    {
      id: "all",
      label: "جميع المشاريع",
      count: activeProjects.length,
      icon: <Sparkles className="w-4 h-4 text-amber-500" />,
    },
    {
      id: "classification",
      label: "تصنيف البيانات",
      count: stats.byCategory.classification,
      icon: <Brain className="w-4 h-4 text-blue-500" />,
    },
    {
      id: "computer-vision",
      label: "الرؤية الحاسوبية",
      count: stats.byCategory["computer-vision"],
      icon: <Eye className="w-4 h-4 text-emerald-500" />,
    },
    {
      id: "prompt-engineering",
      label: "هندسة الأوامر",
      count: stats.byCategory["prompt-engineering"],
      icon: <Wand2 className="w-4 h-4 text-purple-500" />,
    },
    {
      id: "python-code",
      label: "برمجة بايثون",
      count: stats.byCategory["python-code"],
      icon: <Code2 className="w-4 h-4 text-amber-500" />,
    },
    {
      id: "other",
      label: "الأمان والأخلاقيات",
      count: stats.byCategory.other,
      icon: <ShieldCheck className="w-4 h-4 text-rose-500" />,
    },
  ];

  const filteredProjects = activeProjects.filter((proj) => {
    // 1. Category filter
    if (selectedCategory !== "all" && proj.category !== selectedCategory) {
      return false;
    }

    // 2. Difficulty filter
    const projDifficulty = proj.difficulty || getProjectDifficulty(proj);
    if (selectedDifficulty !== "all" && projDifficulty !== selectedDifficulty) {
      return false;
    }

    // 3. Starred filter
    if (showStarredOnly && !starredIds.includes(proj.id)) {
      return false;
    }

    // 4. Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      const titleMatch =
        (proj.titleAr || "").toLowerCase().includes(q) ||
        (proj.title || "").toLowerCase().includes(q);
      const descMatch =
        (proj.descriptionAr || "").toLowerCase().includes(q) ||
        (proj.description || "").toLowerCase().includes(q);
      const tagMatch = (proj.tags || []).some((t) => t.toLowerCase().includes(q));
      const catLabelMatch = getCategoryLabel(proj.category).toLowerCase().includes(q);
      const diffMeta = getDifficultyMeta(projDifficulty);
      const diffMatch = diffMeta.label.includes(q) || diffMeta.fullLabel.includes(q);

      if (!titleMatch && !descMatch && !tagMatch && !catLabelMatch && !diffMatch) {
        return false;
      }
    }

    return true;
  });

  // Pinned Starred projects always appear at the top
  const sortedProjects = [...filteredProjects].sort((a, b) => {
    const aStarred = starredIds.includes(a.id);
    const bStarred = starredIds.includes(b.id);
    if (aStarred && !bStarred) return -1;
    if (!aStarred && bStarred) return 1;
    return 0;
  });

  const isAnyFilterActive =
    selectedCategory !== "all" ||
    selectedDifficulty !== "all" ||
    showStarredOnly ||
    searchQuery.trim().length > 0;

  const handleClearAllFilters = () => {
    setSelectedCategory("all");
    setSelectedDifficulty("all");
    setShowStarredOnly(false);
    setSearchQuery("");
  };

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Export / Share achievement card text
  const handleExportAchievementCard = (project: Project) => {
    const accuracyText = project.accuracy !== undefined ? `${project.accuracy}%` : "100% (إتقان تام)";
    const dateFormatted = project.completedAt
      ? new Date(project.completedAt).toLocaleDateString("ar-SA", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      : "اليوم";

    const textToCopy = `🌟 ══════════════════════════════ 🌟
      بطاقة إنجاز بطل الذكاء الاصطناعي 🚀
🌟 ══════════════════════════════ 🌟

👤 البطل المبتكر: ${project.childName || childName}
📁 المشروع: ${project.titleAr || project.title}
🏷️ التصنيف: ${getCategoryLabel(project.category)}
🎯 نسبة الإتقان والدقة: ${accuracyText}
📅 تاريخ الإنجاز: ${dateFormatted}

📝 ملخص الإنجاز:
${project.descriptionAr || project.description}

🏷️ الوسوم والمهارات: ${project.tags.join(" • ")}

منصة «مُعلِّمُ الذَّكاء» (Moallem Al-Zaka) 🤖
رحلة التعلم العملي الممتع لعالم الذكاء الاصطناعي للأطفال ✨
🌟 ══════════════════════════════ 🌟`;

    navigator.clipboard.writeText(textToCopy);
    setCopiedId(project.id);
    setTimeout(() => setCopiedId(null), 2500);
    showToast(`تم نسخ بطاقة إنجاز مشروع (${project.titleAr || project.title}) بنجاح! 📋✨`);
  };

  // Local simulator fallback if parent did not provide one
  const handleInternalSimulate = () => {
    if (onSimulateLab) {
      onSimulateLab();
      return;
    }

    const templates: LabResult[] = [
      {
        id: `lab-sim-${Date.now()}-1`,
        labKey: "train-pets-detection",
        titleAr: "مصنّف الحيوانات الأليفة الذكي 🐱🐶",
        titleEn: "Smart Pet Classifier AI",
        category: "classification",
        completedAt: new Date().toISOString(),
        accuracy: 99,
        attempts: 1,
        durationMinutes: 14,
        resultSummaryAr: "تدريب نموذج تصنيف خفيف على التمييز بين القطط والكلاب باستخدام مصفوفة الملامح بدقة 99%.",
        resultSummaryEn: "Trained lightweight model distinguishing cats and dogs using facial feature vectors with 99% precision.",
        codeSnippet: `# تدريب مصنف الحيوانات الأليفة
from sklearn.tree import DecisionTreeClassifier

X = [[0.8, 0.2], [0.9, 0.1], [0.3, 0.7], [0.2, 0.9]] # [حدة الأذن, حجم الأنف]
y = ["قطة", "قطة", "كلب", "كلب"]

clf = DecisionTreeClassifier().fit(X, y)
print("التصنيف الناجح:", clf.predict([[0.85, 0.15]])[0])`,
        tags: ["CNN", "Classification", "Pet Dataset", "Feature Vector"],
        thumbnail: "🐱",
      },
      {
        id: `lab-sim-${Date.now()}-2`,
        labKey: "vision-hand-gestures",
        titleAr: "مترجم إشارات اليد بالرؤية الحاسوبية ✋✌️",
        titleEn: "Hand Gesture Vision Interpreter",
        category: "computer-vision",
        completedAt: new Date().toISOString(),
        accuracy: 97,
        attempts: 2,
        durationMinutes: 12,
        resultSummaryAr: "كشف معالم اليد ومفاصل الأصابع وتصنيف إشارة السلام والنصر بدقة 97% وسرعة فائقة.",
        resultSummaryEn: "Hand landmark tracking and gesture recognition for peace sign detection.",
        codeSnippet: `# تتبع نقاط الأصابع والإشارات
import mediapipe as mp

hands = mp.solutions.hands.Hands(max_num_hands=1)
# تحليل زوايا الأصابع لتحديد إشارة النصر
print("تم التعرف على إشارة النصر ✌️ بدقة 97%")`,
        tags: ["Landmarks", "Gesture AI", "Computer Vision"],
        thumbnail: "✋",
      },
      {
        id: `lab-sim-${Date.now()}-3`,
        labKey: "prompt-eco-game",
        titleAr: "هندسة أوامر لعبة حماية البيئة 🌍🎮",
        titleEn: "Eco Guardian Interactive Story Prompt",
        category: "prompt-engineering",
        completedAt: new Date().toISOString(),
        accuracy: 100,
        attempts: 1,
        durationMinutes: 9,
        resultSummaryAr: "هندسة سيناريو تفاعلي لتقمص دور حارس الغابات وحل ألغاز إعادة التدوير بالذكاء الاصطناعي.",
        resultSummaryEn: "Prompt sequence orchestrating branching eco-adventure game with decision trees.",
        codeSnippet: `[أمر لعبة حامي البيئة]
أنت لعبة نصية تفاعلية. اعرض 3 خيارات لحماية الغابة عند كل خطوة واحسب نقاط الاستدامة.`,
        tags: ["Prompt Engineering", "Eco Game", "Branching Logic"],
        thumbnail: "🌍",
      },
      {
        id: `lab-sim-${Date.now()}-4`,
        labKey: "python-matrix-calc",
        titleAr: "محلل مصفوفات الصور الرقمية ببايثون 🔢🖼️",
        titleEn: "Python Pixel Matrix Analyzer",
        category: "python-code",
        completedAt: new Date().toISOString(),
        accuracy: 98,
        attempts: 1,
        durationMinutes: 15,
        resultSummaryAr: "كتابة سكريبت بايثون لتحويل الصورة إلى مصفوفة 0 و 1 وتطبيق فلتر التوضيح الفوري.",
        resultSummaryEn: "Authored pixel matrix manipulation script to apply edge-detection kernel.",
        codeSnippet: `# تطبيق مصفوفة التوضيح
import numpy as np

kernel = np.array([[0, -1, 0], [-1, 5, -1], [0, -1, 0]])
print("تمت معالجة مصفوفة الصورة بنجاح!")`,
        tags: ["Python", "NumPy", "Pixel Math", "Kernels"],
        thumbnail: "🔢",
      },
    ];

    const randomTemplate = templates[Math.floor(Math.random() * templates.length)];
    const updated = addLabResult(randomTemplate);
    setInternalLabs(updated);
    showToast(`تم إكمال وتوثيق مشروع جديد: ${randomTemplate.titleAr} 🚀`);
    if (onAwardXP) {
      onAwardXP(120, `إكمال مشروع ${randomTemplate.titleAr}`);
    }
  };

  const handleInternalReset = () => {
    if (onResetSeed) {
      onResetSeed();
      return;
    }
    const reset = resetLabsToSeed();
    setInternalLabs(reset);
    showToast("تمت استعادة المشروعات المرجعية الأولية بنجاح 🔄");
  };

  return (
    <div className="w-full space-y-8" dir="rtl">
      {/* 1. HERO HEADER: Indigo -> Purple -> Pink Gradient */}
      <motion.div
        initial={{ opacity: 0, y: -15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 p-6 sm:p-10 text-white shadow-xl shadow-indigo-200/50"
      >
        {/* Subtle decorative shapes */}
        <div className="absolute top-0 left-0 w-72 h-72 bg-white/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-pink-400/20 rounded-full blur-3xl translate-x-1/3 translate-y-1/3 pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-black text-white border border-white/30">
              <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
              <span>محفظة الإنجازات التطبيقية للبطل {childName} 🚀</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight">
              معرض مشاريع الذكاء الاصطناعي
            </h2>
            <p className="text-sm sm:text-base text-purple-100 font-medium leading-relaxed">
              كل نموذج تدربه، أو أمر تهندسه، أو كود بايثون تبرمجه يُحفظ هنا كإنجاز واقعي موثّق جاهز للمشاركة والطباعة!
            </p>
          </div>

          {/* Quick Metrics Bar in Header */}
          <div className="flex flex-wrap items-center gap-3 sm:gap-4 w-full md:w-auto justify-start md:justify-end">
            {/* Completed Projects Count */}
            <div className="flex-1 sm:flex-initial bg-white/15 backdrop-blur-md border border-white/25 rounded-2xl p-4 min-w-[130px] text-center">
              <span className="text-xs font-bold text-purple-200 block mb-1">المشاريع المنجزة</span>
              <div className="flex items-center justify-center gap-1.5 text-2xl sm:text-3xl font-black text-white">
                <Award className="w-6 h-6 text-amber-300" />
                <span>{stats.totalCompleted}</span>
              </div>
            </div>

            {/* Average Accuracy Metric */}
            <div className="flex-1 sm:flex-initial bg-white/15 backdrop-blur-md border border-white/25 rounded-2xl p-4 min-w-[130px] text-center">
              <span className="text-xs font-bold text-purple-200 block mb-1">متوسط الدقة</span>
              <div className="flex items-center justify-center gap-1.5 text-2xl sm:text-3xl font-black text-emerald-300">
                <Zap className="w-6 h-6 text-emerald-300" />
                <span>{stats.averageAccuracy}%</span>
              </div>
            </div>

            {/* Starred Badges Count */}
            <button
              onClick={() => setShowStarredOnly(!showStarredOnly)}
              className={`flex-1 sm:flex-initial backdrop-blur-md border rounded-2xl p-4 min-w-[130px] text-center transition-all cursor-pointer ${
                showStarredOnly
                  ? "bg-amber-400/30 border-amber-300 ring-2 ring-amber-300 scale-105"
                  : "bg-white/15 hover:bg-white/25 border-white/25"
              }`}
              title="اضغط لفلترة المشاريع المفضلة والمثبتة فقط"
            >
              <span className="text-xs font-bold text-purple-200 block mb-1">المشاريع المفضلة</span>
              <div className="flex items-center justify-center gap-1.5 text-2xl sm:text-3xl font-black text-amber-300">
                <Star className="w-6 h-6 fill-amber-300 text-amber-300" />
                <span>{countStarredTotal}</span>
              </div>
            </button>
          </div>
        </div>

        {/* Action Controls in Header Bar */}
        <div className="relative z-10 mt-6 pt-6 border-t border-white/20 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-purple-100 font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>💾 التخزين المحلي التلقائي مفعل (localStorage)</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleInternalSimulate}
              className="px-4 py-2 bg-white text-indigo-900 hover:bg-amber-300 font-black rounded-xl transition-colors shadow-md flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>محاكاة إكمال مختبر جديد</span>
            </button>
            <button
              onClick={handleInternalReset}
              className="px-3.5 py-2 bg-white/20 hover:bg-white/30 text-white font-bold rounded-xl transition-colors border border-white/25 flex items-center gap-1.5 cursor-pointer"
              title="إعادة تعيين البيانات للمشاريع الأولية الخمسة"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>استعادة النماذج الأولية</span>
            </button>
            {onNavigateToParentReport && (
              <button
                onClick={onNavigateToParentReport}
                className="px-3.5 py-2 bg-pink-500/80 hover:bg-pink-600 text-white font-bold rounded-xl transition-colors border border-white/25 flex items-center gap-1.5 cursor-pointer"
              >
                <span>تقرير ولي الأمر 👨‍👩‍👧</span>
              </button>
            )}
          </div>
        </div>
      </motion.div>

      {/* 2. NEXT RECOMMENDED PROJECT COACH (DIVERSITY ENCOURAGEMENT) */}
      <NextProjectRecommendation
        projects={activeProjects}
        childName={childName}
        onOpenLab={onOpenLab}
        onAwardXP={onAwardXP}
      />

      {/* 3. ADVANCED FILTER & SEARCH TOOLBAR */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-sm space-y-4">
        {/* Search Bar & Filter Indicators */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Real-time Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث بالاسم، المهارة، الكود أو الوسم (مثال: فواكه، رؤية، بايثون)..."
              className="w-full pl-9 pr-10 py-2.5 bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-200 rounded-2xl text-xs sm:text-sm font-bold text-slate-800 placeholder-slate-400 outline-none focus:border-indigo-500 focus:ring-3 focus:ring-indigo-100 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute left-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                title="مسح البحث"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Active Filter summary and Reset Button */}
          {isAnyFilterActive && (
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-xs font-bold text-slate-500 hidden md:inline">
                النتائج المعروضة:{" "}
                <span className="text-indigo-600 font-black">{filteredProjects.length}</span> من{" "}
                {activeProjects.length}
              </span>
              <button
                onClick={handleClearAllFilters}
                className="px-3 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl text-xs font-black transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>إعادة ضبط الفلاتر</span>
              </button>
            </div>
          )}
        </div>

        {/* Categories Filter Tabs */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5 text-xs font-black text-slate-500 mb-1">
            <SlidersHorizontal className="w-3.5 h-3.5 text-indigo-600" />
            <span>تصنيف المهارة الذكية:</span>
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-1.5 scrollbar-none">
            {categoryList.map((cat) => {
              const isActive = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-2xl text-xs font-black transition-all whitespace-nowrap cursor-pointer ${
                    isActive
                      ? "bg-slate-900 text-white shadow-md shadow-slate-300 scale-[1.02]"
                      : "bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200/80"
                  }`}
                >
                  <span>{cat.icon}</span>
                  <span>{cat.label}</span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                      isActive ? "bg-white/20 text-white" : "bg-white text-slate-600 border border-slate-200"
                    }`}
                  >
                    {cat.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Difficulty Level & Starred Filter Chips with Dynamic Live Counters */}
        <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="flex items-center gap-1.5 text-xs font-black text-slate-500">
            <Filter className="w-3.5 h-3.5 text-amber-500" />
            <span>مستوى الصعوبة والتحدي:</span>
          </div>

          <div className="flex flex-wrap items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {/* Starred & Pinned Quick Filter Chip */}
            <button
              onClick={() => setShowStarredOnly(!showStarredOnly)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black transition-all border whitespace-nowrap cursor-pointer ${
                showStarredOnly
                  ? "bg-amber-500 text-white shadow-md shadow-amber-200 border-amber-500 scale-[1.02]"
                  : "border-amber-200/90 text-amber-900 bg-amber-50/70 hover:bg-amber-100/90"
              }`}
            >
              <Star className={`w-3.5 h-3.5 ${showStarredOnly ? "fill-white text-white" : "fill-amber-400 text-amber-500"}`} />
              <span>المفضلة فقط</span>
              <span
                className={`px-1.5 py-0.5 rounded-md text-[10px] font-extrabold ${
                  showStarredOnly ? "bg-white/20 text-white" : "bg-amber-100 text-amber-900 shadow-2xs"
                }`}
              >
                {countStarredTotal}
              </span>
            </button>

            {difficultyList.map((diff) => {
              const isActive = selectedDifficulty === diff.id;
              return (
                <button
                  key={diff.id}
                  onClick={() => setSelectedDifficulty(diff.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black transition-all border whitespace-nowrap cursor-pointer ${
                    isActive ? diff.activeClass : diff.badgeClass
                  }`}
                >
                  <span>{diff.emoji}</span>
                  <span>{diff.label}</span>
                  <span
                    className={`px-1.5 py-0.5 rounded-md text-[10px] font-extrabold ${
                      isActive ? "bg-white/20 text-white" : "bg-white/80 text-slate-700 shadow-2xs"
                    }`}
                  >
                    {diff.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 3. PROJECTS GRID: 1 to 3 Columns with Fluid Motion Layout */}
      <AnimatePresence mode="wait">
        {sortedProjects.length === 0 ? (
          <motion.div
            key="empty-state"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="relative overflow-hidden bg-gradient-to-b from-white via-indigo-50/30 to-purple-50/20 rounded-3xl p-8 sm:p-12 text-center border-2 border-dashed border-indigo-200/80 shadow-sm"
          >
            {/* Ambient background glows */}
            <div className="absolute -top-12 -left-12 w-48 h-48 bg-purple-300/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-amber-300/20 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 max-w-lg mx-auto space-y-5">
              {/* Animated Mascot Badge */}
              <motion.div
                animate={{
                  y: [0, -8, 0],
                  rotate: [0, -2, 2, 0],
                }}
                transition={{
                  repeat: Infinity,
                  duration: 4,
                  ease: "easeInOut",
                }}
                className="w-20 h-20 rounded-3xl bg-gradient-to-br from-indigo-500 via-purple-500 to-amber-400 p-0.5 mx-auto shadow-lg shadow-indigo-200 flex items-center justify-center"
              >
                <div className="w-full h-full bg-white rounded-[22px] flex items-center justify-center text-4xl">
                  {showStarredOnly ? "⭐" : "🚀"}
                </div>
              </motion.div>

              <div className="space-y-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-100/80 text-amber-800 border border-amber-200 rounded-full text-xs font-black">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  <span>
                    {showStarredOnly
                      ? "قائمة المشاريع المفضلة والمثبتة"
                      : "مغامرة جديدة بانتظارك يا بطل الذكاء!"}
                  </span>
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900">
                  {showStarredOnly
                    ? "لا توجد مشاريع مضافة للمفضلة بعد"
                    : isAnyFilterActive
                    ? "لم نعثر على مشاريع تطابق هذه الفلاتر"
                    : "لا توجد مشاريع موثقة في هذا التصنيف بعد"}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {showStarredOnly
                    ? "اضغط على أيقونة النجمة ⭐ على أي بطاقة مشروع لتثبيته في قائمة مشاريعك المفضلة بالأعلى!"
                    : "كل مهندس ذكاء اصطناعي عظيم بدأ بتجربة واحدة! اختر مختبراً تفاعلياً ودرّب نموذجك الذكي الآن لتملأ ملفك بإنجازات تبهر بها الجميع."}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                {onOpenLab && (
                  <button
                    onClick={() => onOpenLab("classification")}
                    className="px-5 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-2xl font-black text-xs sm:text-sm transition-all shadow-md shadow-indigo-200 inline-flex items-center gap-2 cursor-pointer transform hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    <span>خوض تجربة مختبر الآن 🧪</span>
                  </button>
                )}

                <button
                  onClick={handleInternalSimulate}
                  className="px-5 py-3 bg-white hover:bg-slate-100 text-slate-800 border border-slate-300/80 rounded-2xl font-black text-xs sm:text-sm transition-all shadow-xs inline-flex items-center gap-2 cursor-pointer"
                >
                  <Plus className="w-4 h-4 text-indigo-600" />
                  <span>محاكاة إكمال مشروع ذكي 🤖</span>
                </button>

                <button
                  onClick={handleClearAllFilters}
                  className="px-4 py-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-2xl font-black text-xs transition-colors cursor-pointer"
                >
                  عرض جميع المشاريع (الكل)
                </button>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            layout
            key="projects-grid"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            <AnimatePresence mode="popLayout">
              {sortedProjects.map((project, idx) => {
                const isStarred = starredIds.includes(project.id);
                const catMeta = getCategoryMeta(project.category);
                const statusMeta = getStatusMeta(project.status, project.accuracy);
                const diff = project.difficulty || getProjectDifficulty(project);
                const diffMeta = getDifficultyMeta(diff);

                return (
                  <motion.div
                    key={project.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.85, y: 20 }}
                    transition={{
                      layout: { type: "spring", stiffness: 350, damping: 30 },
                      opacity: { duration: 0.25 },
                      scale: { duration: 0.25 },
                    }}
                    className={`relative bg-white/85 hover:bg-white/95 backdrop-blur-md hover:backdrop-blur-xl rounded-3xl border shadow-xs hover:shadow-xl hover:shadow-indigo-500/10 transition-all duration-300 transform-gpu hover:-translate-y-1.5 flex flex-col justify-between overflow-hidden group ${
                      isStarred
                        ? "border-amber-300/90 ring-2 ring-amber-200/50 bg-gradient-to-b from-amber-50/20 via-white/90 to-white/95"
                        : "border-slate-200/80 hover:border-indigo-300"
                    }`}
                  >
                    {/* Subtle Ambient Radial Backlight Glow on Hover */}
                    <div
                      className={`absolute -top-10 -left-10 w-36 h-36 bg-gradient-to-br ${catMeta.glowColor} rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none`}
                    />
                    {/* Specular Top Shimmer Line */}
                    <div
                      className={`absolute top-0 inset-x-0 h-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none ${
                        isStarred
                          ? "bg-gradient-to-r from-transparent via-amber-400 to-transparent opacity-100"
                          : "bg-gradient-to-r from-transparent via-indigo-300/60 to-transparent"
                      }`}
                    />

                    {/* Top Header Strip with Badges */}
                    <div className="p-5 pb-3 relative z-10">
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-3.5">
                        {/* Dynamic Category Tag with Lucide Icon */}
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-black border backdrop-blur-sm transition-all duration-200 ${catMeta.style}`}
                        >
                          <span className="shrink-0">{catMeta.icon}</span>
                          <span>{catMeta.label}</span>
                        </span>

                        {/* Badges container: Difficulty & Status */}
                        <div className="flex items-center gap-1.5">
                          {isStarred && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-100 text-amber-900 border border-amber-300/80 shadow-2xs">
                              <Pin className="w-2.5 h-2.5 text-amber-600 rotate-45" />
                              <span>مثبت</span>
                            </span>
                          )}

                          {/* Difficulty Pill Badge */}
                          <span
                            title={diffMeta.description}
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black border transition-colors ${diffMeta.badgeStyle}`}
                          >
                            <span>{diffMeta.badgeText}</span>
                          </span>

                          {/* Status Badge */}
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black border backdrop-blur-xs transition-colors ${statusMeta.style}`}
                          >
                            {statusMeta.icon}
                            <span>{statusMeta.label}</span>
                          </span>

                          {/* Star & Pin Toggle Button */}
                          <button
                            onClick={(e) => handleToggleStar(project.id, e)}
                            title={isStarred ? "إلغاء التثبيت من المفضلة" : "تثبيت المشروع في أعلى القائمة والمفضلة ⭐"}
                            className={`p-1.5 rounded-xl border transition-all duration-200 cursor-pointer flex items-center justify-center ${
                              isStarred
                                ? "bg-amber-500 text-white border-amber-500 shadow-sm shadow-amber-200 hover:bg-amber-600 scale-105"
                                : "bg-white text-slate-400 hover:text-amber-500 hover:bg-amber-50/80 border-slate-200 hover:border-amber-300"
                            }`}
                          >
                            <Star
                              className={`w-3.5 h-3.5 transition-transform active:scale-125 ${
                                isStarred ? "fill-white text-white" : "text-slate-400 hover:fill-amber-400"
                              }`}
                            />
                          </button>
                        </div>
                      </div>

                      {/* Project Avatar & Title Banner */}
                      <div className="flex items-center gap-3 mb-3">
                        {/* Dynamic Mascot Avatar with Glassmorphic Badge */}
                        <div
                          className={`relative w-12 h-12 rounded-2xl ${catMeta.iconBg} border flex items-center justify-center text-2xl shadow-2xs group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300 backdrop-blur-md shrink-0`}
                        >
                          <span>{project.thumbnail || catMeta.emoji}</span>
                          <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-lg bg-white/95 shadow-xs border border-slate-200/80 flex items-center justify-center">
                            {catMeta.icon}
                          </span>
                        </div>

                        <div className="flex-1 min-w-0">
                          <h3 className="text-base font-black text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1">
                            {project.titleAr || project.title}
                          </h3>
                          <span className="text-[11px] font-bold text-slate-400 block line-clamp-1">
                            {catMeta.subLabel}
                          </span>
                        </div>
                      </div>

                      <p className="text-xs text-slate-500 font-medium line-clamp-2 leading-relaxed mb-3.5 group-hover:text-slate-600 transition-colors">
                        {project.descriptionAr || project.description}
                      </p>

                      {/* Animated Accuracy Progress Bar inside Frosted Container */}
                      {project.accuracy !== undefined && (
                        <div className="space-y-1.5 bg-slate-50/80 group-hover:bg-white/90 backdrop-blur-xs p-3 rounded-2xl border border-slate-100 group-hover:border-indigo-100 transition-colors mb-3">
                          <div className="flex items-center justify-between text-xs font-black">
                            <span className="text-slate-600 flex items-center gap-1">
                              <Zap className="w-3.5 h-3.5 text-amber-500" />
                              <span>نسبة الإتقان والدقة:</span>
                            </span>
                            <span className="text-indigo-600 font-extrabold">{project.accuracy}%</span>
                          </div>
                          <div className="w-full h-2.5 bg-slate-200/80 rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${project.accuracy}%` }}
                              transition={{ duration: 0.8, ease: "easeOut" }}
                              className={`h-full rounded-full ${
                                project.accuracy >= 95
                                  ? "bg-gradient-to-r from-emerald-500 to-teal-400"
                                  : project.accuracy >= 85
                                  ? "bg-gradient-to-r from-indigo-500 to-purple-500"
                                  : "bg-gradient-to-r from-amber-500 to-orange-400"
                              }`}
                            />
                          </div>
                        </div>
                      )}

                      {/* Tags */}
                      <div className="flex flex-wrap gap-1.5">
                        {project.tags.slice(0, 3).map((tag, tIdx) => (
                          <span
                            key={tIdx}
                            className="px-2 py-0.5 bg-slate-100/90 group-hover:bg-indigo-50/80 text-slate-600 group-hover:text-indigo-700 border border-slate-200/60 group-hover:border-indigo-200/60 rounded-lg text-[10px] font-bold transition-colors"
                          >
                            #{tag}
                          </span>
                        ))}
                        {project.tags.length > 3 && (
                          <span className="px-1.5 py-0.5 bg-slate-100/90 text-slate-500 rounded-lg text-[10px] font-bold">
                            +{project.tags.length - 3}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Card Footer Actions with Frosted Blur */}
                    <div className="p-3.5 bg-slate-50/80 group-hover:bg-white/90 backdrop-blur-md border-t border-slate-100 flex flex-wrap items-center justify-between gap-1.5 transition-colors relative z-10">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => setActiveModalProject(project)}
                          className="px-2.5 py-1.5 bg-white hover:bg-slate-100 text-slate-800 border border-slate-200 rounded-xl text-xs font-black transition-colors flex items-center gap-1 cursor-pointer shadow-2xs"
                        >
                          <Eye className="w-3.5 h-3.5 text-indigo-600" />
                          <span>تفاصيل</span>
                        </button>

                        {onOpenImprovementLab && (
                          <button
                            onClick={() => onOpenImprovementLab(project)}
                            className="px-2.5 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 rounded-xl text-xs font-black transition-colors flex items-center gap-1 cursor-pointer"
                            title="تحسين النموذج وإعادة التدريب لزيادة الدقة"
                          >
                            <span>🔧 تحسين</span>
                          </button>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={(e) => handleOpenCardModal(project, e)}
                          className="px-3 py-1.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-xl text-xs font-black transition-colors flex items-center gap-1 cursor-pointer shadow-sm shadow-amber-200"
                          title="توليد ومعاينة بطاقة الإنجاز كصورة PNG قابلة للتحميل"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>بطاقة PNG</span>
                        </button>

                        <button
                          onClick={() => handleExportAchievementCard(project)}
                          className="p-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-xl text-xs font-black transition-colors flex items-center justify-center cursor-pointer"
                          title="نسخ ملخص الإنجاز نصياً"
                        >
                          {copiedId === project.id ? (
                            <Check className="w-4 h-4 text-emerald-600" />
                          ) : (
                            <Share2 className="w-4 h-4 text-indigo-600" />
                          )}
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 4. DETAILS MODAL */}
      <AnimatePresence>
        {activeModalProject && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ duration: 0.2 }}
              className="bg-white rounded-3xl border border-slate-100 shadow-2xl w-full max-w-2xl overflow-hidden max-h-[90vh] flex flex-col"
              dir="rtl"
            >
              {/* Modal Header */}
              <div className="p-6 bg-gradient-to-r from-indigo-900 via-purple-900 to-slate-900 text-white flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{activeModalProject.thumbnail || "🚀"}</span>
                    <span className="px-3 py-0.5 rounded-full bg-white/20 text-xs font-black text-white">
                      {getCategoryLabel(activeModalProject.category)}
                    </span>
                    {(() => {
                      const d = activeModalProject.difficulty || getProjectDifficulty(activeModalProject);
                      const dm = getDifficultyMeta(d);
                      return (
                        <span className="px-2.5 py-0.5 rounded-full bg-white/25 text-xs font-black text-white border border-white/30">
                          {dm.fullLabel}
                        </span>
                      );
                    })()}
                  </div>
                  <h3 className="text-xl font-black text-white">
                    {activeModalProject.titleAr || activeModalProject.title}
                  </h3>
                  <p className="text-xs text-purple-200 font-medium">
                    {activeModalProject.title} • منصة مُعلِّمُ الذَّكاء
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {/* Star & Pin Button in Modal Header */}
                  <button
                    onClick={() => handleToggleStar(activeModalProject.id)}
                    title={
                      starredIds.includes(activeModalProject.id)
                        ? "إلغاء التثبيت من المفضلة"
                        : "تثبيت المشروع في أعلى القائمة والمفضلة ⭐"
                    }
                    className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer border ${
                      starredIds.includes(activeModalProject.id)
                        ? "bg-amber-400 text-slate-900 border-amber-300 shadow-md shadow-amber-500/20"
                        : "bg-white/10 hover:bg-white/20 text-white border-white/20"
                    }`}
                  >
                    <Star
                      className={`w-3.5 h-3.5 ${
                        starredIds.includes(activeModalProject.id)
                          ? "fill-slate-900 text-slate-900"
                          : "fill-transparent text-amber-300"
                      }`}
                    />
                    <span>
                      {starredIds.includes(activeModalProject.id) ? "مثبت في المفضلة ⭐" : "إضافة للمفضلة"}
                    </span>
                  </button>

                  <button
                    onClick={() => setActiveModalProject(null)}
                    className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Modal Scrollable Content */}
              <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-800">
                {/* Accuracy and Completion Date Pill */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-4 bg-indigo-50/70 border border-indigo-100 rounded-2xl flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-indigo-700 block">نسبة الإتقان والدقة</span>
                      <span className="text-xl font-black text-indigo-950">
                        {activeModalProject.accuracy !== undefined ? `${activeModalProject.accuracy}%` : "100%"}
                      </span>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center">
                      <Zap className="w-5 h-5" />
                    </div>
                  </div>

                  <div className="p-4 bg-purple-50/70 border border-purple-100 rounded-2xl flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-purple-700 block">تاريخ الإنجاز</span>
                      <span className="text-xs font-black text-purple-950">
                        {activeModalProject.completedAt
                          ? new Date(activeModalProject.completedAt).toLocaleDateString("ar-SA", {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })
                          : "اليوم"}
                      </span>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center">
                      <Calendar className="w-5 h-5" />
                    </div>
                  </div>
                </div>

                {/* Description Arabic & English */}
                <div className="space-y-2">
                  <h4 className="text-xs font-black text-slate-500 uppercase tracking-wider">
                    وصف وملخص المشروع العملي:
                  </h4>
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
                    <p className="text-sm font-bold text-slate-800 leading-relaxed">
                      {activeModalProject.descriptionAr || activeModalProject.description}
                    </p>
                    {activeModalProject.description && activeModalProject.descriptionAr !== activeModalProject.description && (
                      <p className="text-xs text-slate-500 font-medium italic border-t border-slate-200/60 pt-2">
                        {activeModalProject.description}
                      </p>
                    )}
                  </div>
                </div>

                {/* Code Snippet if present */}
                {activeModalProject.codeSnippet && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-black text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                        <FileCode2 className="w-4 h-4 text-indigo-600" />
                        <span>مقتطف الكود البرمجي المطبق:</span>
                      </h4>
                      <button
                        onClick={() => {
                          if (activeModalProject.codeSnippet) {
                            navigator.clipboard.writeText(activeModalProject.codeSnippet);
                            showToast("تم نسخ الكود البرمجي إلى الحافظة! 💻");
                          }
                        }}
                        className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        <span>نسخ الكود</span>
                      </button>
                    </div>
                    <div className="bg-slate-900 text-emerald-400 p-4 rounded-2xl font-mono text-xs overflow-x-auto leading-relaxed border border-slate-800" dir="ltr">
                      <pre>{activeModalProject.codeSnippet}</pre>
                    </div>
                  </div>
                )}

                {/* Tags */}
                <div className="space-y-2">
                  <h4 className="text-xs font-black text-slate-500 uppercase tracking-wider">
                    المهارات والمفاهيم المكتسبة:
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {activeModalProject.tags.map((tag, i) => (
                      <span
                        key={i}
                        className="px-3 py-1 bg-indigo-50 border border-indigo-100 text-indigo-800 rounded-xl text-xs font-bold flex items-center gap-1"
                      >
                        <Tag className="w-3 h-3 text-indigo-500" />
                        <span>{tag}</span>
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Modal Footer Actions */}
              <div className="p-4 bg-slate-50 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                <button
                  onClick={() => setActiveModalProject(null)}
                  className="px-4 py-2.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-black transition-colors cursor-pointer"
                >
                  إغلاق
                </button>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => {
                      handleExportAchievementCard(activeModalProject);
                    }}
                    className="px-3.5 py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-xl text-xs font-black transition-colors flex items-center gap-1.5 cursor-pointer"
                    title="نسخ ملخص الإنجاز للمشاركة عبر واتساب أو البريد"
                  >
                    <Share2 className="w-4 h-4" />
                    <span>نسخ الملخص</span>
                  </button>

                  <button
                    onClick={() => {
                      setCardModalProject(activeModalProject);
                    }}
                    className="px-5 py-2.5 bg-gradient-to-r from-amber-500 via-orange-500 to-indigo-600 hover:opacity-95 text-white rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer shadow-md shadow-amber-200"
                  >
                    <Download className="w-4 h-4" />
                    <span>توليد وتحميل بطاقة الإنجاز (PNG) 🖼️</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 5. ACHIEVEMENT CARD PNG GENERATOR & DOWNLOAD MODAL */}
      <AnimatePresence>
        {cardModalProject && (
          <AchievementCardModal
            project={cardModalProject}
            defaultChildName={cardModalProject.childName || childName}
            onClose={() => setCardModalProject(null)}
            onShowToast={showToast}
            onAwardXP={onAwardXP}
          />
        )}
      </AnimatePresence>

      {/* 6. SUCCESS TOAST NOTIFICATION */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3.5 rounded-2xl shadow-xl border border-slate-700 flex items-center gap-3 max-w-md"
            dir="rtl"
          >
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <p className="text-xs font-bold text-slate-100 leading-snug">{toastMessage}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Helper for Category Metadata (Label, Icon, Color styles, Glow)
function getCategoryMeta(category: ProjectCategory) {
  switch (category) {
    case "classification":
      return {
        label: "تصنيف البيانات",
        emoji: "🧠",
        subLabel: "تعلّم الآلة ونماذج التصنيف الذكية",
        icon: <Brain className="w-3.5 h-3.5 text-blue-600" />,
        largeIcon: <Brain className="w-6 h-6 text-blue-600" />,
        style: "bg-blue-50/90 text-blue-700 border-blue-200/80 group-hover:bg-blue-100/90",
        glowColor: "from-blue-500/20 via-indigo-500/10 to-transparent",
        iconBg: "bg-blue-50 text-blue-600 border-blue-200/80",
      };
    case "computer-vision":
      return {
        label: "الرؤية الحاسوبية",
        emoji: "👁️",
        subLabel: "تحليل الصور وكشف الملامح والإشارات",
        icon: <Eye className="w-3.5 h-3.5 text-emerald-600" />,
        largeIcon: <Eye className="w-6 h-6 text-emerald-600" />,
        style: "bg-emerald-50/90 text-emerald-700 border-emerald-200/80 group-hover:bg-emerald-100/90",
        glowColor: "from-emerald-500/20 via-teal-500/10 to-transparent",
        iconBg: "bg-emerald-50 text-emerald-600 border-emerald-200/80",
      };
    case "prompt-engineering":
      return {
        label: "هندسة الأوامر",
        emoji: "🔮",
        subLabel: "توجيه النماذج التوليدية وسرد القصص",
        icon: <Wand2 className="w-3.5 h-3.5 text-purple-600" />,
        largeIcon: <Wand2 className="w-6 h-6 text-purple-600" />,
        style: "bg-purple-50/90 text-purple-700 border-purple-200/80 group-hover:bg-purple-100/90",
        glowColor: "from-purple-500/20 via-fuchsia-500/10 to-transparent",
        iconBg: "bg-purple-50 text-purple-600 border-purple-200/80",
      };
    case "python-code":
      return {
        label: "برمجة بايثون",
        emoji: "🐍",
        subLabel: "معالجة المصفوفات والخوارزميات",
        icon: <Code2 className="w-3.5 h-3.5 text-amber-600" />,
        largeIcon: <Code2 className="w-6 h-6 text-amber-600" />,
        style: "bg-amber-50/90 text-amber-700 border-amber-200/80 group-hover:bg-amber-100/90",
        glowColor: "from-amber-500/20 via-orange-500/10 to-transparent",
        iconBg: "bg-amber-50 text-amber-600 border-amber-200/80",
      };
    case "other":
    default:
      return {
        label: "الأمان والأخلاقيات",
        emoji: "🛡️",
        subLabel: "الذكاء الاصطناعي المسؤول والآمن",
        icon: <ShieldCheck className="w-3.5 h-3.5 text-rose-600" />,
        largeIcon: <ShieldCheck className="w-6 h-6 text-rose-600" />,
        style: "bg-rose-50/90 text-rose-700 border-rose-200/80 group-hover:bg-rose-100/90",
        glowColor: "from-rose-500/20 via-pink-500/10 to-transparent",
        iconBg: "bg-rose-50 text-rose-600 border-rose-200/80",
      };
  }
}

function getCategoryLabel(category: ProjectCategory): string {
  return getCategoryMeta(category).label;
}

// Helper for Difficulty Metadata
export function getDifficultyMeta(difficulty: ProjectDifficulty) {
  switch (difficulty) {
    case "easy":
      return {
        id: "easy",
        label: "سهل",
        fullLabel: "مستوى سهل 🟢",
        badgeStyle: "bg-emerald-50 text-emerald-800 border-emerald-200/80 hover:bg-emerald-100/80",
        badgeText: "سهل 🟢",
        dotColor: "bg-emerald-500",
        emoji: "🟢",
        description: "مناسب للمبتدئين والاستكشاف الأولي للمفاهيم",
      };
    case "medium":
      return {
        id: "medium",
        label: "متوسط",
        fullLabel: "مستوى متوسط 🟡",
        badgeStyle: "bg-amber-50 text-amber-800 border-amber-200/80 hover:bg-amber-100/80",
        badgeText: "متوسط 🟡",
        dotColor: "bg-amber-500",
        emoji: "🟡",
        description: "تطبيقات بصرية وأوامر تفاعلية متعددة الخطوات",
      };
    case "hard":
    default:
      return {
        id: "hard",
        label: "متقدم",
        fullLabel: "مستوى متقدم 🔴",
        badgeStyle: "bg-rose-50 text-rose-800 border-rose-200/80 hover:bg-rose-100/80",
        badgeText: "متقدم 🔴",
        dotColor: "bg-rose-500",
        emoji: "🔴",
        description: "خوارزميات بايثون وتحليل مصفوفات متقدمة",
      };
  }
}

// Helper for Status Metadata
function getStatusMeta(status: string, accuracy?: number) {
  if (status === "starred" || (accuracy !== undefined && accuracy >= 98)) {
    return {
      label: "مشروع متميز 🌟",
      style: "bg-amber-50 text-amber-700 border-amber-200",
      icon: <Star className="w-3 h-3 fill-amber-400 text-amber-500" />,
    };
  }
  if (status === "in-progress" || status === "in_progress") {
    return {
      label: "قيد الإنجاز ⏳",
      style: "bg-indigo-50 text-indigo-700 border-indigo-200",
      icon: <Flame className="w-3 h-3 text-indigo-500" />,
    };
  }
  return {
    label: "مكتمل بنجاح ✅",
    style: "bg-emerald-50 text-emerald-700 border-emerald-200",
    icon: <CheckCircle2 className="w-3 h-3 text-emerald-500" />,
  };
}
