import React from "react";
import { TabType, UserProgress, User, Certificate } from "../types";
import { StreakBadge } from "./StreakBadge";
import { DeveloperRank, RANK_INFO } from "../data/graduation";
import { useLanguageContext } from "../context/LanguageContext";
import { HeaderLanguageSelector } from "./HeaderLanguageSelector";
import {
  Brain,
  Milestone,
  FlaskConical,
  FolderGit2,
  MessageSquareCode,
  FileText,
  GraduationCap,
  HardDrive,
  Target,
  Sparkles,
  Volume2,
  VolumeX,
  Star,
  User as UserIcon,
} from "lucide-react";

interface HeaderProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  progress: UserProgress;
  soundEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => void;
  onOpenCustomizer?: () => void;
  onOpenLogin?: () => void;
  currentUser?: User | null;
  triggerStreakCelebrationSignal?: number;
  // New props for status bar
  rank?: DeveloperRank;
  totalProjects?: number;
  averageAccuracy?: number;
  certificate?: Certificate | null;
  isStorageOk?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  progress,
  soundEnabled,
  setSoundEnabled,
  onOpenCustomizer,
  onOpenLogin,
  currentUser,
  triggerStreakCelebrationSignal,
  rank = "explorer",
  totalProjects = 0,
  averageAccuracy = 96,
  certificate = null,
  isStorageOk = true,
}) => {
  const { t, direction } = useLanguageContext();
  const currentRankInfo = RANK_INFO[rank] || RANK_INFO.explorer;

  const navItems: { id: TabType; label: string; icon: React.ReactNode; badge?: string }[] = [
    { id: "home", label: t.nav.home, icon: <Brain className="w-4 h-4 text-indigo-600" /> },
    { id: "path", label: t.nav.path, icon: <Milestone className="w-4 h-4 text-blue-600" />, badge: t.nav.pathBadge },
    { id: "lessons", label: t.nav.lessons, icon: <Brain className="w-4 h-4 text-emerald-600" /> },
    { id: "labs", label: t.nav.labs, icon: <FlaskConical className="w-4 h-4 text-purple-600" /> },
    { id: "projects", label: t.nav.projects, icon: <FolderGit2 className="w-4 h-4 text-cyan-600" />, badge: `${totalProjects}` },
    { id: "chat", label: t.nav.chat, icon: <MessageSquareCode className="w-4 h-4 text-teal-600" /> },
    {
      id: "graduation",
      label: t.nav.graduation,
      icon: <GraduationCap className="w-4 h-4 text-orange-600" />,
      badge: certificate ? t.nav.graduationCertified : rank === "young-developer" ? t.nav.graduationReady : undefined,
    },
    { id: "parent_report", label: t.nav.parent_report, icon: <FileText className="w-4 h-4 text-amber-600" /> },
    { id: "rewards", label: t.nav.rewards, icon: <Sparkles className="w-4 h-4 text-rose-600" /> },
  ];

  const getRoleBadge = (role?: "parent" | "child" | "guest") => {
    switch (role) {
      case "parent":
        return { label: t.roles.parent, style: "bg-amber-100 text-amber-800 border-amber-200" };
      case "child":
        return { label: t.roles.child, style: "bg-indigo-100 text-indigo-800 border-indigo-200" };
      case "guest":
      default:
        return { label: t.roles.guest, style: "bg-slate-100 text-slate-700 border-slate-200" };
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-xs" dir={direction}>
      {/* Top Pedagogical Status Bar */}
      <div className="bg-slate-900 text-slate-200 px-3 sm:px-6 py-1.5 text-[11px] font-bold border-b border-slate-800 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          {/* Storage status */}
          <span className="inline-flex items-center gap-1 text-emerald-400 bg-slate-800 px-2 py-0.5 rounded-md border border-slate-700">
            <HardDrive className="w-3 h-3" />
            <span>{isStorageOk ? t.statusBar.storageConnected : t.statusBar.storageReadOnly}</span>
          </span>

          {/* Current Rank */}
          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-black ${currentRankInfo.badgeBg} ${currentRankInfo.badgeText} border`}>
            <span>{currentRankInfo.icon}</span>
            <span>{t.statusBar.rankLabel}: {currentRankInfo.titleAr}</span>
          </span>

          {/* Projects completed */}
          <span className="inline-flex items-center gap-1 bg-slate-800 text-indigo-300 px-2 py-0.5 rounded-md border border-slate-700">
            <Sparkles className="w-3 h-3 text-amber-400" />
            <span>{totalProjects} {t.statusBar.projectsCount}</span>
          </span>

          {/* Average Accuracy */}
          <span className="inline-flex items-center gap-1 bg-slate-800 text-emerald-300 px-2 py-0.5 rounded-md border border-slate-700">
            <Target className="w-3 h-3 text-emerald-400" />
            <span>{t.statusBar.accuracyLabel}: {averageAccuracy}%</span>
          </span>
        </div>

        {/* Graduation / Certificate Badge & Language Quick Switcher */}
        <div className="flex items-center gap-2">
          {certificate ? (
            <button
              onClick={() => setActiveTab("graduation")}
              className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-amber-500 hover:bg-amber-400 text-slate-950 font-black transition cursor-pointer shadow-xs"
            >
              <GraduationCap className="w-3.5 h-3.5" />
              <span>{t.statusBar.certifiedBadge}</span>
            </button>
          ) : (
            <button
              onClick={() => setActiveTab("graduation")}
              className="inline-flex items-center gap-1 text-slate-300 hover:text-white transition cursor-pointer"
            >
              <span>{t.statusBar.towardsDev}</span>
            </button>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18 gap-2">
          {/* Logo & App Title */}
          <div
            onClick={() => setActiveTab("home")}
            className="flex items-center gap-2.5 cursor-pointer group shrink-0"
          >
            <div className="relative w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-200 group-hover:scale-105 transition-transform">
              <span className="text-2xl select-none">🤖</span>
              <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-white"></span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                  {t.header.appTitle}
                </h1>
                <span className="text-[10px] font-black px-1.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100 hidden sm:inline-block">
                  {t.header.forKidsBadge}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">{t.header.appSubtitle}</p>
            </div>
          </div>

          {/* Desktop Navigation Tabs */}
          <nav className="hidden lg:flex items-center gap-1 bg-slate-50 p-1.5 rounded-2xl border border-slate-100">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`relative flex items-center gap-1.5 px-3 py-2 rounded-xl font-black text-xs transition-all duration-200 cursor-pointer ${
                    isActive
                      ? "bg-indigo-600 text-white shadow-md shadow-indigo-200 scale-[1.02]"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
                  }`}
                >
                  <span className={isActive ? "text-white" : ""}>{item.icon}</span>
                  <span>{item.label}</span>
                  {item.badge && (
                    <span
                      className={`px-1.5 py-0.2 text-[9px] font-extrabold rounded-full ${
                        isActive
                          ? "bg-white/20 text-white"
                          : "bg-indigo-100 text-indigo-800"
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Stats Bar & User Controls */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Dedicated Synchronized Language Selector Button */}
            <HeaderLanguageSelector />

            {/* Zaki Customizer Button */}
            {onOpenCustomizer && (
              <button
                onClick={onOpenCustomizer}
                className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-700 text-xs font-black transition cursor-pointer shadow-2xs"
                title={t.header.zakiCustomizer}
              >
                <span>{t.header.zakiCustomizer}</span>
              </button>
            )}

            {/* XP Badge */}
            <div className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-black shadow-2xs">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
              <span>{progress.xp} XP</span>
            </div>

            {/* Streak Component */}
            <StreakBadge
              streakDays={progress.streakDays}
              soundEnabled={soundEnabled}
              triggerCelebrationSignal={triggerStreakCelebrationSignal}
            />

            {/* Level Badge */}
            <div className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-indigo-600 text-white text-xs font-black shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>{t.header.levelPrefix} {progress.level}</span>
            </div>

            {/* User Profile & Role Indicator */}
            {onOpenLogin && (
              <button
                onClick={onOpenLogin}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-800 text-xs font-black transition shadow-2xs cursor-pointer"
                title="الملف الشخصي وتسجيل الدخول"
              >
                <UserIcon className="w-3.5 h-3.5 text-indigo-600" />
                <span className="max-w-[80px] sm:max-w-[120px] truncate">
                  {currentUser ? currentUser.name : progress.studentName || t.header.guestUser}
                </span>
                {currentUser && (
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded-md border font-black ${
                      getRoleBadge(currentUser.role).style
                    }`}
                  >
                    {getRoleBadge(currentUser.role).label}
                  </span>
                )}
              </button>
            )}

            {/* Sound Toggle Button */}
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              title={soundEnabled ? t.header.soundOff : t.header.soundOn}
              className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                soundEnabled
                  ? "bg-indigo-50 border-indigo-200 text-indigo-600 hover:bg-indigo-100"
                  : "bg-slate-100 border-slate-200 text-slate-400 hover:bg-slate-200"
              }`}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Bar: Smooth Horizontal Scrolling */}
        <div className="lg:hidden flex items-center py-2 border-t border-slate-100 overflow-x-auto gap-1.5 scrollbar-none no-scrollbar">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-1.5 py-1.5 px-3 rounded-xl font-black text-xs transition-all whitespace-nowrap shrink-0 cursor-pointer ${
                  isActive
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-200"
                    : "text-slate-600 hover:bg-slate-100 bg-slate-50 border border-slate-100"
                }`}
              >
                <span className={isActive ? "text-white" : ""}>{item.icon}</span>
                <span>{item.label}</span>
                {item.badge && (
                  <span
                    className={`px-1.5 py-0.2 text-[9px] font-extrabold rounded-full ${
                      isActive
                        ? "bg-white/20 text-white"
                        : "bg-indigo-100 text-indigo-800"
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
