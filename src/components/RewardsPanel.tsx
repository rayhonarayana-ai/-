import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { UserProgress, Badge, WeeklyGoal } from "../types";
import { INITIAL_BADGES } from "../data/mascot";
import { ZAKI_COLORS, ZAKI_ACCESSORIES } from "../data/zakiCustomizationData";
import { Certificate } from "./Certificate";
import { GoalTracker } from "./GoalTracker";
import { Award, Star, Flame, Trophy, Lock, Sparkles, Wand2, Palette, Shield, X, CheckCircle2 } from "lucide-react";

interface RewardsPanelProps {
  progress: UserProgress;
  onUpdateName: (name: string) => void;
  onOpenCustomizer?: () => void;
  onSetGoal: (newGoal: WeeklyGoal) => void;
  onClaimGoalReward?: (rewardXP: number) => void;
  soundEnabled?: boolean;
}

export const RewardsPanel: React.FC<RewardsPanelProps> = ({
  progress,
  onUpdateName,
  onOpenCustomizer,
  onSetGoal,
  onClaimGoalReward,
  soundEnabled = true,
}) => {
  const [selectedBadgeModal, setSelectedBadgeModal] = useState<Badge | null>(null);

  const xpForNextLevel = progress.level * 200;
  const currentLevelProgress = Math.min(100, Math.floor((progress.xp / xpForNextLevel) * 100));

  const unlockedColorsCount = ZAKI_COLORS.filter((c) => c.minLevel <= progress.level).length;
  const unlockedAccessoriesCount = ZAKI_ACCESSORIES.filter((a) => a.minLevel <= progress.level).length;

  return (
    <div className="space-y-8 dir-rtl">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div
          whileHover={{ scale: 1.02, y: -4 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className="p-6 bg-gradient-to-tr from-indigo-600 to-blue-600 rounded-3xl text-white space-y-2 shadow-lg shadow-indigo-200"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-indigo-100 bg-white/20 px-3 py-1 rounded-full">النقاط الكلية</span>
            <Star className="w-6 h-6 text-amber-300 fill-amber-300" />
          </div>
          <p className="text-4xl font-black">{progress.xp} XP</p>
          <p className="text-xs font-bold text-indigo-100">تواصل التعلم لحصد المزيد من النجوم والمكافآت!</p>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02, y: -4 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className="p-6 bg-gradient-to-tr from-purple-600 to-indigo-600 rounded-3xl text-white space-y-2 shadow-lg shadow-purple-200"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-purple-200 bg-white/20 px-3 py-1 rounded-full">المستوى الحالي</span>
            <Sparkles className="w-6 h-6 text-purple-200 animate-pulse" />
          </div>
          <p className="text-4xl font-black">المستوى {progress.level}</p>
          <div className="space-y-1 pt-1">
            <div className="w-full bg-white/20 h-2.5 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${currentLevelProgress}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="bg-amber-300 h-full rounded-full"
              />
            </div>
            <p className="text-[11px] font-bold text-purple-200 text-left">{currentLevelProgress}% نحو المستوى {progress.level + 1}</p>
          </div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02, y: -4 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className="p-6 bg-gradient-to-tr from-amber-500 to-orange-500 rounded-3xl text-white space-y-2 shadow-lg shadow-amber-200"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-amber-100 bg-white/20 px-3 py-1 rounded-full">الأيام المتتالية</span>
            <Flame className="w-6 h-6 text-amber-200 fill-amber-200 animate-bounce" />
          </div>
          <p className="text-4xl font-black">{progress.streakDays} أيام</p>
          <p className="text-xs font-bold text-amber-100">استمر في التعلم يومياً للحفاظ على الشعلة!</p>
        </motion.div>
      </div>

      {/* Goal Tracker Component */}
      <GoalTracker
        progress={progress}
        onSetGoal={onSetGoal}
        onClaimGoalReward={onClaimGoalReward}
        soundEnabled={soundEnabled}
      />

      {/* Zaki Customization Unlocked Rewards Banner */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="p-8 bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-900 rounded-[32px] text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden"
      >
        <div className="absolute -top-12 -left-12 w-40 h-40 bg-indigo-500/20 rounded-full blur-2xl"></div>
        <div className="space-y-3 text-center md:text-right relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/30 border border-indigo-400/30 text-indigo-200 text-xs font-black">
            <Wand2 className="w-3.5 h-3.5 text-amber-300" />
            <span>مكافآت المستوى الخاصة</span>
          </div>
          <h3 className="text-2xl font-black">خزانة إكسسوارات زكي المخصصة 🎨</h3>
          <p className="text-xs sm:text-sm text-slate-300 font-bold max-w-xl">
            فتحت حتى الآن <span className="text-amber-300 font-black">{unlockedColorsCount} أنماط ألوان</span> و{" "}
            <span className="text-amber-300 font-black">{unlockedAccessoriesCount} إكسسوارات ممتازة</span> لشخصية زكي المساعد الذكي!
          </p>
        </div>

        {onOpenCustomizer && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onOpenCustomizer}
            className="px-8 py-4 bg-amber-400 hover:bg-amber-300 text-slate-900 rounded-2xl font-black text-sm transition shadow-lg shadow-amber-400/20 flex items-center gap-2 flex-shrink-0 relative z-10 cursor-pointer"
          >
            <Palette className="w-5 h-5" />
            <span>افتَح خزانة زكي الآن 🎨</span>
          </motion.button>
        )}
      </motion.div>

      {/* Badges Collection Grid */}
      <div className="p-6 sm:p-8 bg-white rounded-[32px] border border-slate-100 shadow-xl space-y-6">
        <div>
          <h3 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <Award className="w-6 h-6 text-indigo-600" />
            <span>لوحة الأوسمة والشارات المكتسبة</span>
          </h3>
          <p className="text-sm font-bold text-slate-500">انقر على أي وسام لاستعراض تفاصيله وتأثيراته التفاعلية!</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {INITIAL_BADGES.map((badge, idx) => {
            const isUnlocked = progress.earnedBadges.includes(badge.id) || badge.unlocked;

            return (
              <motion.div
                key={badge.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: idx * 0.05 }}
                whileHover={{ scale: 1.05, y: -4 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedBadgeModal({ ...badge, unlocked: isUnlocked })}
                className={`p-5 rounded-3xl border text-center space-y-2 transition cursor-pointer relative overflow-hidden ${
                  isUnlocked
                    ? "bg-gradient-to-b from-indigo-50/50 to-white border-indigo-200 shadow-md hover:border-indigo-400"
                    : "bg-slate-50 border-slate-100 opacity-60 hover:opacity-80"
                }`}
              >
                <motion.div
                  animate={isUnlocked ? { rotate: [0, -5, 5, 0] } : {}}
                  transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                  className="w-16 h-16 mx-auto rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-3xl shadow-2xs relative"
                >
                  {badge.icon}
                  {!isUnlocked && (
                    <div className="absolute inset-0 bg-slate-900/40 rounded-2xl flex items-center justify-center text-white backdrop-blur-xs">
                      <Lock className="w-5 h-5" />
                    </div>
                  )}
                </motion.div>

                <h4 className="font-black text-sm text-slate-900">{badge.title}</h4>
                <p className="text-xs text-slate-500 font-bold line-clamp-2">{badge.description}</p>

                {isUnlocked ? (
                  <span className="inline-block px-2.5 py-0.5 bg-emerald-100 text-emerald-800 rounded-full text-[10px] font-black">
                    مكتسب ✅
                  </span>
                ) : (
                  <span className="inline-block px-2.5 py-0.5 bg-slate-200 text-slate-600 rounded-full text-[10px] font-black">
                    مغلق 🔒
                  </span>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Embedded Certificate Component */}
      <Certificate progress={progress} onUpdateName={onUpdateName} />

      {/* Badge Detail Modal Animation */}
      <AnimatePresence>
        {selectedBadgeModal && (
          <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="bg-white rounded-[32px] max-w-sm w-full p-6 text-center space-y-4 relative shadow-2xl border-2 border-indigo-200"
            >
              <button
                onClick={() => setSelectedBadgeModal(null)}
                className="absolute top-4 left-4 p-2 text-slate-400 hover:text-slate-600 rounded-full cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1, rotate: [0, 10, -10, 0] }}
                transition={{ delay: 0.1, duration: 0.5 }}
                className="w-24 h-24 mx-auto rounded-3xl bg-gradient-to-br from-indigo-100 to-purple-100 border-2 border-indigo-300 flex items-center justify-center text-5xl shadow-xl relative"
              >
                {selectedBadgeModal.icon}
                {selectedBadgeModal.unlocked && (
                  <div className="absolute -top-2 -right-2 bg-emerald-500 text-white rounded-full p-1 shadow-md">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                )}
              </motion.div>

              <div className="space-y-1">
                <h3 className="text-xl font-black text-slate-900">{selectedBadgeModal.title}</h3>
                <p className="text-xs font-bold text-slate-500 leading-relaxed">{selectedBadgeModal.description}</p>
              </div>

              <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-2xl text-xs font-black text-indigo-900">
                {selectedBadgeModal.unlocked
                  ? "🎉 وسام مكتسب وموثق في ملفك التعليمي بامتياز!"
                  : "🔒 واصل إكمال الدروس والتحديات في الأكاديمية لفتح هذا الوسام!"}
              </div>

              <button
                onClick={() => setSelectedBadgeModal(null)}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs rounded-2xl transition cursor-pointer"
              >
                إغلاق
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

