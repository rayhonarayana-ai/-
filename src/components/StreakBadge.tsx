import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Flame, Sparkles, Trophy, Calendar, CheckCircle2, Zap } from "lucide-react";
import { speakText } from "../data/mascot";

interface Particle {
  id: number;
  x: number;
  y: number;
  scale: number;
  rotate: number;
  color: string;
  icon: string;
  duration: number;
}

interface StreakBadgeProps {
  streakDays: number;
  soundEnabled?: boolean;
  triggerCelebrationSignal?: number; // timestamp or counter to force trigger
  onStreakUpdate?: (newStreak: number) => void;
}

const PARTICLE_ICONS = ["🔥", "✨", "⭐", "⚡", "💥", "🌟", "🧡"];
const PARTICLE_COLORS = [
  "text-orange-500",
  "text-amber-400",
  "text-yellow-300",
  "text-red-500",
  "text-purple-400",
  "text-pink-400",
];

export const StreakBadge: React.FC<StreakBadgeProps> = ({
  streakDays,
  soundEnabled = true,
  triggerCelebrationSignal = 0,
}) => {
  const [particles, setParticles] = useState<Particle[]>([]);
  const [isExploding, setIsExploding] = useState(false);
  const [showStreakModal, setShowStreakModal] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const triggerCelebration = useCallback(() => {
    setIsExploding(true);

    // Create 28 bursting particles
    const newParticles: Particle[] = Array.from({ length: 28 }).map((_, i) => {
      const angle = (i / 28) * 360 + (Math.random() * 20 - 10);
      const distance = 60 + Math.random() * 110;
      const rad = (angle * Math.PI) / 180;

      return {
        id: Date.now() + i,
        x: Math.cos(rad) * distance,
        y: Math.sin(rad) * distance,
        scale: 0.6 + Math.random() * 0.9,
        rotate: Math.random() * 360 - 180,
        color: PARTICLE_COLORS[i % PARTICLE_COLORS.length],
        icon: PARTICLE_ICONS[i % PARTICLE_ICONS.length],
        duration: 0.8 + Math.random() * 0.6,
      };
    });

    setParticles(newParticles);
    setToastMessage(`حماس متواصل! سلسلة ${streakDays} أيام متتالية 🔥`);

    if (soundEnabled) {
      speakText(`ممتاز جداً! أنت حافظت على حماسك المتتالي لليوم الـ ${streakDays}! استمر يا بطل! 🔥🚀`);
    }

    setTimeout(() => {
      setIsExploding(false);
      setParticles([]);
    }, 1800);

    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  }, [streakDays, soundEnabled]);

  // Watch for triggerCelebrationSignal changes
  useEffect(() => {
    if (triggerCelebrationSignal > 0) {
      triggerCelebration();
    }
  }, [triggerCelebrationSignal, triggerCelebration]);

  const weekDays = [
    { dayName: "اليوم 1", dayNum: 1, reward: "+10 XP" },
    { dayName: "اليوم 2", dayNum: 2, reward: "+15 XP" },
    { dayName: "اليوم 3", dayNum: 3, reward: "+20 XP" },
    { dayName: "اليوم 4", dayNum: 4, reward: "+25 XP" },
    { dayName: "اليوم 5", dayNum: 5, reward: "+30 XP" },
    { dayName: "اليوم 6", dayNum: 6, reward: "+40 XP" },
    { dayName: "اليوم 7", dayNum: 7, reward: "وسام الحماس! 🏆" },
  ];

  return (
    <div className="relative inline-block">
      {/* Toast floating banner on celebration */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -15, scale: 0.85 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.9 }}
            className="absolute top-12 left-1/2 -translate-x-1/2 z-50 whitespace-nowrap bg-gradient-to-r from-orange-500 via-amber-500 to-red-600 text-white font-black text-xs px-3.5 py-1.5 rounded-full shadow-xl shadow-orange-500/30 border border-amber-300/40 flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 text-yellow-200 animate-spin" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Interactive Streak Badge */}
      <motion.button
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.94 }}
        onClick={() => {
          triggerCelebration();
          setShowStreakModal(true);
        }}
        className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer select-none border ${
          isExploding
            ? "bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 text-white border-amber-300 shadow-lg shadow-orange-500/40 ring-4 ring-orange-400/30"
            : "bg-amber-50 hover:bg-amber-100 border-amber-200 text-amber-800 shadow-2xs"
        }`}
        title="انقر لمشاهدة التتابع والاحتفال بحماسك!"
      >
        {/* Animated Flame Icon */}
        <motion.div
          animate={
            isExploding
              ? { scale: [1, 1.4, 1.2, 1.5, 1], rotate: [0, -15, 15, -10, 0] }
              : { scale: [1, 1.12, 1] }
          }
          transition={{
            duration: isExploding ? 0.6 : 2,
            repeat: isExploding ? 2 : Infinity,
            repeatType: "reverse",
          }}
          className="relative flex items-center justify-center"
        >
          <Flame
            className={`w-4 h-4 ${
              isExploding
                ? "text-yellow-200 fill-yellow-300 drop-shadow-[0_0_8px_rgba(251,191,36,0.9)]"
                : "text-orange-500 fill-orange-400"
            }`}
          />
        </motion.div>

        {/* Streak Number */}
        <span className="font-black text-xs dir-rtl">{streakDays} أيام</span>

        {/* Particle Explosions */}
        {isExploding && (
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
            {particles.map((p) => (
              <motion.span
                key={p.id}
                initial={{ x: 0, y: 0, opacity: 1, scale: 0.2, rotate: 0 }}
                animate={{
                  x: p.x,
                  y: p.y,
                  opacity: [1, 1, 0],
                  scale: [0.2, p.scale, p.scale * 0.8],
                  rotate: p.rotate,
                }}
                transition={{ duration: p.duration, ease: "easeOut" }}
                className={`absolute select-none text-base ${p.color}`}
              >
                {p.icon}
              </motion.span>
            ))}
          </div>
        )}
      </motion.button>

      {/* Streak Modal / Popover */}
      <AnimatePresence>
        {showStreakModal && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 dir-rtl">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-amber-100 relative overflow-hidden"
            >
              {/* Top Banner */}
              <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 -m-6 p-6 mb-6 text-white text-center relative">
                <button
                  onClick={() => setShowStreakModal(false)}
                  className="absolute top-4 left-4 p-1.5 bg-black/20 hover:bg-black/30 rounded-full text-white transition cursor-pointer"
                >
                  ✕
                </button>

                <motion.div
                  animate={{ scale: [1, 1.15, 1], rotate: [0, -5, 5, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="w-16 h-16 mx-auto bg-white/20 rounded-2xl flex items-center justify-center text-3xl shadow-inner mb-2"
                >
                  🔥
                </motion.div>

                <h3 className="text-xl font-black">سلسلة الحماس اليومي! 🎉</h3>
                <p className="text-xs font-bold opacity-90 mt-1">
                  سجلت الدخول لـ <span className="text-yellow-200 underline">{streakDays} أيام متتالية</span>!
                </p>
              </div>

              {/* Days Grid */}
              <div className="space-y-4">
                <div className="flex items-center justify-between text-xs font-black text-slate-700">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4 text-orange-500" />
                    <span>تتبع الأيام المتتالية:</span>
                  </span>
                  <span className="text-indigo-600 font-extrabold">{streakDays} / 7 أيام</span>
                </div>

                <div className="grid grid-cols-7 gap-1.5 text-center">
                  {weekDays.map((wd) => {
                    const isCompleted = streakDays >= wd.dayNum;
                    const isCurrent = streakDays === wd.dayNum;

                    return (
                      <div
                        key={wd.dayNum}
                        className={`p-2 rounded-xl flex flex-col items-center justify-between transition border ${
                          isCompleted
                            ? "bg-gradient-to-b from-amber-400 to-orange-500 text-white border-orange-300 shadow-xs"
                            : isCurrent
                            ? "bg-amber-50 border-amber-400 text-amber-900 ring-2 ring-amber-400/40"
                            : "bg-slate-50 border-slate-200 text-slate-400"
                        }`}
                      >
                        <span className="text-[10px] font-black">{wd.dayName}</span>
                        <div className="my-1.5">
                          {isCompleted ? (
                            <CheckCircle2 className="w-4 h-4 text-white fill-emerald-500" />
                          ) : (
                            <Flame className={`w-4 h-4 ${isCurrent ? "text-orange-500" : "text-slate-300"}`} />
                          )}
                        </div>
                        <span className="text-[9px] font-bold opacity-90">{wd.reward}</span>
                      </div>
                    );
                  })}
                </div>

                {/* Encouragement Quote */}
                <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-900 font-bold flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>
                    الاستمرار اليومي هو السر لبناء عقل مبرمج ومفكر ذكي! واصل الدخول يومياً لتضاعف نقاطك! 🚀
                  </span>
                </div>

                {/* Action Buttons */}
                <div className="pt-2 flex items-center justify-between gap-3">
                  <button
                    onClick={triggerCelebration}
                    className="flex-1 py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-2xl font-black text-xs shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Trophy className="w-4 h-4 text-yellow-200" />
                    <span>احتفل بالحماس اليومي 🔥</span>
                  </button>

                  <button
                    onClick={() => setShowStreakModal(false)}
                    className="px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl font-black text-xs transition cursor-pointer"
                  >
                    حسناً!
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
