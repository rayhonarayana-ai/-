import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { TabType, LabType, UserProgress, ZakiCustomization, LabDefinition } from "./types";
import { LanguageProvider, useLanguageContext } from "./context/LanguageContext";
import { Header } from "./components/Header";
import { ZakiMascot } from "./components/ZakiMascot";
import { ChatAssistant } from "./components/ChatAssistant";
import { LessonViewer } from "./components/LessonViewer";
import { LabTrainModel } from "./components/LabTrainModel";
import { LabPromptEngineer } from "./components/LabPromptEngineer";
import { LabVisionAI } from "./components/LabVisionAI";
import { LabEthics } from "./components/LabEthics";
import { LearningPath } from "./components/LearningPath";
import { GraduationPanel } from "./components/GraduationPanel";
import { LabCompletion } from "./components/LabCompletion";
import { RewardsPanel } from "./components/RewardsPanel";
import { ParentReportPanel } from "./components/ParentReportPanel";
import { GoalTracker } from "./components/GoalTracker";
import { WeeklyGoal } from "./types";
import { QuizModal } from "./components/QuizModal";
import { ZakiCustomizerModal } from "./components/ZakiCustomizerModal";
import LoginPanel from "./components/LoginPanel";
import { EncouragementBanner } from "./components/EncouragementBanner";
import { CelebrationOverlay, CelebrationData } from "./components/CelebrationOverlay";
import { ProjectsPortfolio } from "./components/ProjectsPortfolio";
import { loadLabs, addLabResult, loadCertificate } from "./data/storage";
import { LabResult } from "./data/labs";
import { LESSONS } from "./data/lessons";
import { LAB_CATALOG } from "./data/labCatalog";
import { computeGraduationState } from "./data/graduation";
import { speakText, stopSpeech } from "./data/mascot";
import { playClickSound, playSuccessSound, playLevelUpSound } from "./data/audioEffects";
import {
  Brain,
  BookOpen,
  MessageSquareCode,
  FlaskConical,
  Award,
  Sparkles,
  ArrowLeft,
  ArrowRight,
  Cpu,
  Wand2,
  Eye,
  ShieldCheck,
  Palette,
  FileText,
  FolderGit2,
  Milestone,
  GraduationCap,
} from "lucide-react";

export default function App() {
  return (
    <LanguageProvider>
      <MainAppContent />
    </LanguageProvider>
  );
}

function MainAppContent() {
  const { t, direction } = useLanguageContext();
  const [activeTab, setActiveTab] = useState<TabType>("home");
  const [activeLab, setActiveLab] = useState<LabType>("train");
  const [activeLearningLab, setActiveLearningLab] = useState<LabDefinition | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [activeQuizTopic, setActiveQuizTopic] = useState<string | null>(null);
  const [isCustomizerOpen, setIsCustomizerOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<{ name: string; role: "parent" | "child" | "guest" } | null>(null);
  const [lastActionTrigger, setLastActionTrigger] = useState<{ type: string; timestamp: number; data?: any } | null>(null);
  const [streakCelebrationSignal, setStreakCelebrationSignal] = useState<number>(0);
  const [celebrationData, setCelebrationData] = useState<CelebrationData | null>(null);
  const [labs, setLabs] = useState<LabResult[]>(() => loadLabs());
  const [certificate, setCertificate] = useState(() => loadCertificate());

  const [progress, setProgress] = useState<UserProgress>(() => {
    const saved = localStorage.getItem("kids_ai_progress");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return {
      xp: 120,
      level: 1,
      streakDays: 3,
      completedLessons: ["lesson-1"],
      completedLabs: [],
      earnedBadges: ["badge-first-step"],
      totalChatMessages: 0,
      studentName: "المستكشف الصغير",
      zakiCustomization: {
        colorId: "indigo",
        accessoryId: "glasses",
        expressionId: "happy",
      },
    };
  });

  useEffect(() => {
    localStorage.setItem("kids_ai_progress", JSON.stringify(progress));
  }, [progress]);

  // Compute graduation and rank status
  const graduationState = computeGraduationState(labs, progress.studentName || "المستكشف الصغير", certificate);

  // Check URL query parameters for shared project deep links
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const shareProjectId = params.get("share_project");
      const studentParam = params.get("student");
      if (shareProjectId) {
        setActiveTab("projects");
        if (studentParam && !progress.studentName) {
          updateStudentName(studentParam);
        }
      }
    }
  }, []);

  const awardXP = (amount: number, reason: string) => {
    setProgress((prev) => {
      const newXP = prev.xp + amount;
      const newLevel = Math.floor(newXP / 200) + 1;
      if (newLevel > prev.level && soundEnabled) {
        playLevelUpSound();
      }
      return {
        ...prev,
        xp: newXP,
        level: newLevel,
      };
    });
    setLastActionTrigger({ type: "xp_earned", timestamp: Date.now(), data: { amount, reason } });

    if (soundEnabled) {
      playSuccessSound();
      speakText(`عظيم جداً! حصلت على ${amount} نقطة XP بفضل ${reason}!`);
    }
  };

  const handleCompleteLesson = (lessonId: string, xpReward: number) => {
    if (!progress.completedLessons.includes(lessonId)) {
      setProgress((prev) => ({
        ...prev,
        completedLessons: [...prev.completedLessons, lessonId],
      }));
      setLastActionTrigger({ type: "lesson_completed", timestamp: Date.now(), data: { lessonId } });
      awardXP(xpReward, "إكمال الدرس الذكي");

      const completedLessonObj = LESSONS.find((l) => l.id === lessonId);
      const titleText = completedLessonObj ? `أتقنت درس: ${completedLessonObj.title} 🎉` : "أنجزت الدرس بنجاح الباهر! 🎉";

      setCelebrationData({
        title: titleText,
        subtitle: "أحسنت يا بطل! خطوة عملاقة نحو إتقان مفاهيم الذكاء الاصطناعي وبناء مستقبل مبرمج ذكي!",
        xpEarned: xpReward,
        icon: "🎓",
        badgeName: "إكمال الدرس الذكي",
      });
    }
  };

  const updateStudentName = (name: string) => {
    setProgress((prev) => ({ ...prev, studentName: name }));
  };

  const handleSetGoal = (newGoal: WeeklyGoal) => {
    setProgress((prev) => ({
      ...prev,
      weeklyGoal: newGoal,
    }));
    setLastActionTrigger({ type: "goal_set", timestamp: Date.now() });
  };

  const handleClaimGoalReward = (rewardXP: number) => {
    awardXP(rewardXP, "إكمال الهدف الأسبوعي بنجاح 🎯");
    setCelebrationData({
      title: "حققت هدفك الأسبوعي بنجاح! 🎯🏆",
      subtitle: "مبروك يا بطل! أثبت عزيمتك العالية وقدرتك المذهلة على التخطيط والوصول لقمة النجاح!",
      xpEarned: rewardXP,
      icon: "👑",
      badgeName: "بطل التحدي الأسبوعي",
    });
  };

  const handleSaveCustomization = (customization: ZakiCustomization) => {
    setProgress((prev) => ({
      ...prev,
      zakiCustomization: customization,
    }));
  };

  const handleLoginSuccess = (user: { name: string; role: "parent" | "child" | "guest" }) => {
    setCurrentUser(user);
    if (user.name && user.name !== "ضيف") {
      updateStudentName(user.name);
    }
    setIsLoginOpen(false);

    // Increment consecutive login streak and trigger particle celebration
    setProgress((prev) => ({
      ...prev,
      streakDays: prev.streakDays + 1,
    }));
    setStreakCelebrationSignal(Date.now());

    // If logged in as parent, switch to parent report tab
    if (user.role === "parent") {
      setActiveTab("parent_report");
    }
  };

  const handleSaveLabProject = (newLab: LabResult) => {
    const updated = addLabResult(newLab);
    setLabs(updated);
    if (soundEnabled) {
      playSuccessSound();
    }
    setCelebrationData({
      title: "إنجاز وتوثيق مشروع ذكي جديد! 🚀",
      subtitle: `تمت إضافة مشروع (${newLab.titleAr}) إلى محفظتك الرقمية وإصدار بطاقة إتقان قابلة للمشاركة والتحميل!`,
      xpEarned: 100,
      icon: newLab.thumbnail || "🚀",
      badgeName: newLab.titleAr,
    });
  };

  const handleTabChange = (tab: TabType) => {
    if (soundEnabled) {
      playClickSound();
    }
    setActiveTab(tab);
    stopSpeech();
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-800 font-cairo" dir={direction}>
      {/* App Header Bar */}
      <Header
        activeTab={activeTab}
        setActiveTab={handleTabChange}
        progress={progress}
        soundEnabled={soundEnabled}
        setSoundEnabled={setSoundEnabled}
        onOpenCustomizer={() => setIsCustomizerOpen(true)}
        onOpenLogin={() => setIsLoginOpen(true)}
        currentUser={currentUser}
        triggerStreakCelebrationSignal={streakCelebrationSignal}
        rank={graduationState.rank}
        totalProjects={labs.length}
        averageAccuracy={graduationState.averageAccuracy}
        certificate={certificate}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Dynamic Interactive Encouragement Banner */}
        <EncouragementBanner
          activeTab={activeTab}
          progress={progress}
          onNavigateTab={handleTabChange}
          lastActionTrigger={lastActionTrigger}
        />

        <AnimatePresence mode="wait">
          {/* TAB 1: HOME PAGE */}
          {activeTab === "home" && (
            <motion.div
              key="home"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
              className="space-y-8"
            >
              {/* Zaki Companion Hero Card */}
              <ZakiMascot
                mood="excited"
                message={t.hero.welcomeMessage}
                onAskClick={() => handleTabChange("chat")}
                onOpenCustomizer={() => setIsCustomizerOpen(true)}
                customization={progress.zakiCustomization}
              />

              {/* Goal Tracker Component */}
              <GoalTracker
                progress={progress}
                onSetGoal={handleSetGoal}
                onClaimGoalReward={handleClaimGoalReward}
                soundEnabled={soundEnabled}
              />

              {/* Main Interactive Portals Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {/* Portal 1: 3-Level Learning Path */}
                <motion.div
                  whileHover={{ scale: 1.03, y: -4 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleTabChange("path")}
                  className="p-5 bg-gradient-to-br from-indigo-500/10 via-white to-indigo-500/5 rounded-[32px] border border-indigo-200 hover:border-indigo-400 shadow-xl shadow-indigo-100/40 hover:shadow-2xl transition-all cursor-pointer group relative overflow-hidden flex flex-col justify-between"
                >
                  <div>
                    <div className="w-12 h-12 rounded-2xl bg-indigo-100 border border-indigo-200 flex items-center justify-center text-indigo-700 mb-3 group-hover:scale-110 transition">
                      <Milestone className="w-6 h-6" />
                    </div>
                    <h3 className="font-black text-base text-slate-900 mb-1">{t.portals.pathTitle}</h3>
                    <p className="text-xs font-bold text-slate-500 mb-3">
                      {t.portals.pathDesc}
                    </p>
                  </div>
                  <span className="inline-flex items-center gap-1 text-xs font-black text-indigo-700 group-hover:translate-x-1 transition">
                    <span>{t.portals.pathBtn}</span> {direction === "rtl" ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
                  </span>
                </motion.div>

                {/* Portal 2: Projects Portfolio */}
                <motion.div
                  whileHover={{ scale: 1.03, y: -4 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleTabChange("projects")}
                  className="p-5 bg-white rounded-[32px] border border-slate-100 hover:border-cyan-300 shadow-xl shadow-cyan-100/30 hover:shadow-2xl transition-all cursor-pointer group relative overflow-hidden flex flex-col justify-between"
                >
                  <div>
                    <div className="w-12 h-12 rounded-2xl bg-cyan-50 border border-cyan-100 flex items-center justify-center text-cyan-600 mb-3 group-hover:scale-110 transition">
                      <FolderGit2 className="w-6 h-6" />
                    </div>
                    <h3 className="font-black text-base text-slate-900 mb-1">{t.portals.projectsTitle}</h3>
                    <p className="text-xs font-bold text-slate-500 mb-3">
                      {t.portals.projectsDesc}
                    </p>
                  </div>
                  <span className="inline-flex items-center gap-1 text-xs font-black text-cyan-600 group-hover:translate-x-1 transition">
                    <span>{t.portals.projectsBtn}</span> {direction === "rtl" ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
                  </span>
                </motion.div>

                {/* Portal 3: Graduation & Rank */}
                <motion.div
                  whileHover={{ scale: 1.03, y: -4 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleTabChange("graduation")}
                  className="p-5 bg-white rounded-[32px] border border-slate-100 hover:border-amber-300 shadow-xl shadow-amber-100/30 hover:shadow-2xl transition-all cursor-pointer group relative overflow-hidden flex flex-col justify-between"
                >
                  <div>
                    <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 mb-3 group-hover:scale-110 transition">
                      <GraduationCap className="w-6 h-6" />
                    </div>
                    <h3 className="font-black text-base text-slate-900 mb-1">{t.portals.graduationTitle}</h3>
                    <p className="text-xs font-bold text-slate-500 mb-3">
                      {t.portals.graduationDesc}
                    </p>
                  </div>
                  <span className="inline-flex items-center gap-1 text-xs font-black text-amber-600 group-hover:translate-x-1 transition">
                    <span>{t.portals.graduationBtn}</span> {direction === "rtl" ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
                  </span>
                </motion.div>

                {/* Portal 4: Parent Pedagogical Report */}
                <motion.div
                  whileHover={{ scale: 1.03, y: -4 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleTabChange("parent_report")}
                  className="p-5 bg-gradient-to-br from-amber-500/10 to-orange-500/10 bg-white rounded-[32px] border border-amber-200 hover:border-amber-400 shadow-xl shadow-amber-100/40 hover:shadow-2xl transition-all cursor-pointer group relative overflow-hidden flex flex-col justify-between"
                >
                  <div>
                    <div className="w-12 h-12 rounded-2xl bg-amber-100 border border-amber-200 flex items-center justify-center text-amber-700 mb-3 group-hover:scale-110 transition">
                      <FileText className="w-6 h-6" />
                    </div>
                    <h3 className="font-black text-base text-slate-900 mb-1">{t.portals.parentTitle}</h3>
                    <p className="text-xs font-bold text-slate-600 mb-3">
                      {t.portals.parentDesc}
                    </p>
                  </div>
                  <span className="inline-flex items-center gap-1 text-xs font-black text-amber-700 group-hover:translate-x-1 transition">
                    <span>{t.portals.parentBtn}</span> {direction === "rtl" ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
                  </span>
                </motion.div>
              </div>

              {/* Daily AI Fun Fact Widget */}
              <div className="p-8 bg-gradient-to-r from-indigo-900 via-slate-900 to-purple-900 rounded-[32px] text-white space-y-3 relative overflow-hidden shadow-xl">
                <div className="flex items-center gap-2 text-xs font-black text-amber-300">
                  <Sparkles className="w-4 h-4" />
                  <span>معلومة اليوم عن الذكاء الاصطناعي 💡</span>
                </div>
                <p className="text-base sm:text-lg font-bold leading-relaxed text-slate-100">
                  "تستطيع خوارزميات رؤية الكمبيوتر الحديثة قراءة وتصنيف أكثر من 100,000 صورة قطة في ثانيتين فقط، وهذا يعادل قراءة ألف طفل لكتاب كامل في رمشة عين!"
                </p>
              </div>
            </motion.div>
          )}

          {/* TAB 2: LEARNING PATH */}
          {activeTab === "path" && (
            <motion.div
              key="path"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
            >
              <LearningPath
                labs={labs}
                progress={progress}
                onSelectLab={(lab) => {
                  if (soundEnabled) playClickSound();
                  setActiveLearningLab(lab);
                }}
                onNavigateToProjects={() => handleTabChange("projects")}
                onNavigateToGraduation={() => handleTabChange("graduation")}
              />
            </motion.div>
          )}

          {/* TAB 3: LESSONS */}
          {activeTab === "lessons" && (
            <motion.div
              key="lessons"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
            >
              <LessonViewer
                onCompleteLesson={handleCompleteLesson}
                onStartQuiz={(topic) => setActiveQuizTopic(topic)}
                onOpenLab={(labType) => {
                  handleTabChange("labs");
                  setActiveLab(labType);
                }}
                completedLessons={progress.completedLessons}
              />
            </motion.div>
          )}

          {/* TAB 4: CHAT ASSISTANT */}
          {activeTab === "chat" && (
            <motion.div
              key="chat"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
            >
              <ChatAssistant onAwardXP={awardXP} />
            </motion.div>
          )}

          {/* TAB 5: LABS */}
          {activeTab === "labs" && (
            <motion.div
              key="labs"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
              className="space-y-6"
            >
              {/* Lab Type Switcher */}
              <div className="flex items-center gap-2 overflow-x-auto p-1.5 bg-slate-200/80 rounded-2xl">
                <button
                  onClick={() => setActiveLab("train")}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black transition cursor-pointer ${
                    activeLab === "train"
                      ? "bg-white text-slate-900 shadow-md"
                      : "text-slate-700 hover:bg-slate-300/50"
                  }`}
                >
                  <Cpu className="w-4 h-4 text-blue-500" />
                  <span>1. تدريب النموذج 🧠</span>
                </button>

                <button
                  onClick={() => setActiveLab("prompt")}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black transition cursor-pointer ${
                    activeLab === "prompt"
                      ? "bg-white text-slate-900 shadow-md"
                      : "text-slate-700 hover:bg-slate-300/50"
                  }`}
                >
                  <Wand2 className="w-4 h-4 text-purple-500" />
                  <span>2. مهندس الأوامر 🔮</span>
                </button>

                <button
                  onClick={() => setActiveLab("vision")}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black transition cursor-pointer ${
                    activeLab === "vision"
                      ? "bg-white text-slate-900 shadow-md"
                      : "text-slate-700 hover:bg-slate-300/50"
                  }`}
                >
                  <Eye className="w-4 h-4 text-emerald-500" />
                  <span>3. رؤية الكمبيوتر 👁️</span>
                </button>

                <button
                  onClick={() => setActiveLab("ethics")}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black transition cursor-pointer ${
                    activeLab === "ethics"
                      ? "bg-white text-slate-900 shadow-md"
                      : "text-slate-700 hover:bg-slate-300/50"
                  }`}
                >
                  <ShieldCheck className="w-4 h-4 text-violet-500" />
                  <span>4. الأمان والأخلاقيات 🛡️</span>
                </button>
              </div>

              {/* Active Lab Component */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeLab}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ duration: 0.2 }}
                >
                  {activeLab === "train" && (
                    <LabTrainModel
                      onAwardXP={awardXP}
                      onCompleteProject={handleSaveLabProject}
                      onNavigateToPortfolio={() => handleTabChange("projects")}
                    />
                  )}
                  {activeLab === "prompt" && (
                    <LabPromptEngineer
                      onAwardXP={awardXP}
                      onCompleteProject={handleSaveLabProject}
                      onNavigateToPortfolio={() => handleTabChange("projects")}
                    />
                  )}
                  {activeLab === "vision" && (
                    <LabVisionAI
                      onAwardXP={awardXP}
                      onCompleteProject={handleSaveLabProject}
                      onNavigateToPortfolio={() => handleTabChange("projects")}
                    />
                  )}
                  {activeLab === "ethics" && (
                    <LabEthics
                      onAwardXP={awardXP}
                      onCompleteProject={handleSaveLabProject}
                      onNavigateToPortfolio={() => handleTabChange("projects")}
                    />
                  )}
                </motion.div>
              </AnimatePresence>
            </motion.div>
          )}

          {/* TAB 6: PROJECTS PORTFOLIO */}
          {activeTab === "projects" && (
            <motion.div
              key="projects"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
            >
              <ProjectsPortfolio
                labs={labs}
                user={{ name: progress.studentName || "البطل المبتكر", role: "child" }}
                onOpenLab={(labKey) => {
                  const matchingLab = LAB_CATALOG.find((l) => l.key === labKey || l.category === labKey);
                  if (matchingLab) {
                    setActiveLearningLab(matchingLab);
                  } else {
                    handleTabChange("path");
                  }
                }}
                onOpenImprovementLab={(project) => {
                  const matchingLab = LAB_CATALOG.find((l) => l.key === project.labId || l.category === project.category) || LAB_CATALOG[0];
                  setActiveLearningLab(matchingLab);
                }}
                onNavigateToParentReport={() => handleTabChange("parent_report")}
                onAwardXP={awardXP}
              />
            </motion.div>
          )}

          {/* TAB 7: GRADUATION & CERTIFICATE */}
          {activeTab === "graduation" && (
            <motion.div
              key="graduation"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
            >
              <GraduationPanel
                labs={labs}
                progress={progress}
                childName={progress.studentName || "المستكشف الصغير"}
                onNavigateToLabs={() => handleTabChange("labs")}
                onNavigateToPath={() => handleTabChange("path")}
              />
            </motion.div>
          )}

          {/* TAB 8: PARENT PEDAGOGICAL REPORT */}
          {activeTab === "parent_report" && (
            <motion.div
              key="parent_report"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
            >
              <ParentReportPanel
                progress={progress}
                labs={labs}
                childName={progress.studentName || "المستكشف الصغير"}
              />
            </motion.div>
          )}

          {/* TAB 9: REWARDS & CERTIFICATE & ZAKI WARDROBE */}
          {activeTab === "rewards" && (
            <motion.div
              key="rewards"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
            >
              <RewardsPanel
                progress={progress}
                onUpdateName={updateStudentName}
                onOpenCustomizer={() => setIsCustomizerOpen(true)}
                onSetGoal={handleSetGoal}
                onClaimGoalReward={handleClaimGoalReward}
                soundEnabled={soundEnabled}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Interactive Lab Runner Modal */}
      {activeLearningLab && (
        <LabCompletion
          lab={activeLearningLab}
          childName={progress.studentName || "المستكشف الصغير"}
          onComplete={(result) => {
            handleSaveLabProject(result);
            setActiveLearningLab(null);
          }}
          onClose={() => setActiveLearningLab(null)}
        />
      )}

      {/* Zaki Customization Modal */}
      {isCustomizerOpen && (
        <ZakiCustomizerModal
          progress={progress}
          onSaveCustomization={handleSaveCustomization}
          onClose={() => setIsCustomizerOpen(false)}
        />
      )}

      {/* Dynamic AI Quiz Modal */}
      {activeQuizTopic && (
        <QuizModal
          topic={activeQuizTopic}
          onClose={() => setActiveQuizTopic(null)}
          onAwardXP={awardXP}
        />
      )}

      {/* Login & Signup Modal */}
      {isLoginOpen && (
        <LoginPanel
          onLoginSuccess={handleLoginSuccess}
          onClose={() => setIsLoginOpen(false)}
        />
      )}

      {/* Celebration Overlay with Confetti & Flying Stars */}
      <CelebrationOverlay
        data={celebrationData}
        onClose={() => setCelebrationData(null)}
        soundEnabled={soundEnabled}
      />

      {/* Footer */}
      <footer className="py-6 border-t border-slate-100 bg-white text-center text-xs font-bold text-slate-400">
        <p>مُعَلِّمُ الذَّكَاءِ الاصْطِنَاعِيّ للأَطْفَالِ • تم التطوير بالذكاء الاصطناعي التفاعلي للأجيال المبدعة 🚀</p>
      </footer>
    </div>
  );
}

