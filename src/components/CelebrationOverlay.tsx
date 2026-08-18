import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Trophy, Star, Sparkles, Award, Zap, CheckCircle2, X, Flame, Heart, Crown } from "lucide-react";
import { speakText } from "../data/mascot";

export interface CelebrationData {
  title: string;
  subtitle: string;
  xpEarned?: number;
  icon?: string;
  badgeName?: string;
}

interface CelebrationOverlayProps {
  data: CelebrationData | null;
  onClose: () => void;
  soundEnabled?: boolean;
}

interface ConfettiParticle {
  id: number;
  x: number; // initial offset X
  y: number; // initial offset Y
  targetX: number;
  targetY: number;
  rotate: number;
  scale: number;
  color: string;
  shape: "rect" | "circle" | "star" | "sparkle" | "crown";
  duration: number;
  delay: number;
}

const COLORS = [
  "bg-amber-400",
  "bg-orange-500",
  "bg-pink-500",
  "bg-indigo-500",
  "bg-emerald-400",
  "bg-cyan-400",
  "bg-purple-500",
  "bg-yellow-300",
  "bg-red-500",
];

const EMOJI_SHAPES = ["⭐", "✨", "🎉", "🏆", "🌟", "👑", "💥", "❤️", "🔥", "🚀"];

export const CelebrationOverlay: React.FC<CelebrationOverlayProps> = ({
  data,
  onClose,
  soundEnabled = true,
}) => {
  const [particles, setParticles] = useState<ConfettiParticle[]>([]);

  useEffect(() => {
    if (data) {
      // Generate 60 randomized confetti particles bursting from center-bottom
      const generated: ConfettiParticle[] = Array.from({ length: 65 }).map((_, i) => {
        const angle = Math.random() * Math.PI * 2;
        const radius = 180 + Math.random() * 320;
        const targetX = Math.cos(angle) * radius;
        const targetY = Math.sin(angle) * radius - 100; // bias upwards

        const shapes: ("rect" | "circle" | "star" | "sparkle" | "crown")[] = [
          "rect",
          "circle",
          "star",
          "sparkle",
          "crown",
        ];

        return {
          id: i,
          x: (Math.random() - 0.5) * 60,
          y: (Math.random() - 0.5) * 60,
          targetX,
          targetY,
          rotate: (Math.random() - 0.5) * 720,
          scale: 0.6 + Math.random() * 0.9,
          color: COLORS[i % COLORS.length],
          shape: shapes[i % shapes.length],
          duration: 1.5 + Math.random() * 1.2,
          delay: Math.random() * 0.2,
        };
      });

      setParticles(generated);

      // Voice encouragement
      if (soundEnabled) {
        speakText(`رائع جداً يا بطل! ${data.title}. ${data.subtitle}`);
      }
    } else {
      setParticles([]);
    }
  }, [data, soundEnabled]);

  if (!data) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md dir-rtl overflow-hidden">
        {/* Particle Canvas / Layer */}
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center overflow-hidden">
          {particles.map((p) => {
            const emojiIndex = p.id % EMOJI_SHAPES.length;
            const emoji = EMOJI_SHAPES[emojiIndex];

            return (
              <motion.div
                key={p.id}
                initial={{
                  x: p.x,
                  y: p.y,
                  opacity: 1,
                  scale: 0,
                  rotate: 0,
                }}
                animate={{
                  x: [p.x, p.targetX, p.targetX + (Math.random() - 0.5) * 80],
                  y: [p.y, p.targetY, p.targetY + 250 + Math.random() * 150], // burst up then fall down
                  opacity: [0, 1, 1, 0],
                  scale: [0.2, p.scale, p.scale, 0],
                  rotate: p.rotate,
                }}
                transition={{
                  duration: p.duration,
                  delay: p.delay,
                  ease: "easeOut",
                }}
                className="absolute"
              >
                {p.shape === "rect" ? (
                  <div className={`w-3.5 h-6 rounded-xs ${p.color} shadow-md`} />
                ) : p.shape === "circle" ? (
                  <div className={`w-4 h-4 rounded-full ${p.color} shadow-md`} />
                ) : (
                  <span className="text-xl select-none drop-shadow-md">{emoji}</span>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Central Celebratory Modal Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.7, y: 40, rotate: -3 }}
          animate={{ opacity: 1, scale: 1, y: 0, rotate: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 30 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className="bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-900 border-2 border-amber-400/80 rounded-[36px] max-w-lg w-full p-8 text-center text-white shadow-[0_0_50px_rgba(251,191,36,0.3)] relative z-10 overflow-hidden"
        >
          {/* Top Radial Glow Background */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-80 bg-amber-500/20 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute bottom-0 right-0 w-60 h-60 bg-purple-500/20 rounded-full blur-3xl pointer-events-none"></div>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 left-4 p-2 bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white rounded-full transition cursor-pointer z-20 border border-slate-700"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Big Bouncing Trophy / Icon Header */}
          <div className="relative mb-6 inline-block">
            <motion.div
              animate={{
                scale: [1, 1.15, 1],
                rotate: [0, -6, 6, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                repeatType: "reverse",
              }}
              className="w-24 h-24 mx-auto bg-gradient-to-tr from-amber-400 via-orange-400 to-yellow-300 rounded-3xl p-1 shadow-2xl shadow-amber-500/40 flex items-center justify-center relative"
            >
              <div className="w-full h-full bg-slate-900 rounded-[22px] flex items-center justify-center text-5xl">
                {data.icon || "🏆"}
              </div>
            </motion.div>

            {/* Sparkle Badges floating around trophy */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
              className="absolute -top-2 -right-2 text-amber-300"
            >
              <Sparkles className="w-7 h-7" />
            </motion.div>
            <motion.div
              animate={{ scale: [0.8, 1.2, 0.8] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="absolute -bottom-2 -left-2 text-yellow-300"
            >
              <Star className="w-6 h-6 fill-yellow-300" />
            </motion.div>
          </div>

          {/* Title & Subtitle */}
          <div className="space-y-2 mb-6">
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-amber-400/20 border border-amber-400/40 text-amber-300 text-xs font-black mb-1">
              <Crown className="w-3.5 h-3.5 text-amber-300" />
              <span>إنجاز جديد يضاف لسجلك!</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-white leading-tight">
              {data.title}
            </h2>

            <p className="text-sm font-bold text-slate-300 max-w-sm mx-auto leading-relaxed">
              {data.subtitle}
            </p>
          </div>

          {/* Reward Badges Display */}
          <div className="flex flex-wrap items-center justify-center gap-3 mb-8">
            {data.xpEarned && data.xpEarned > 0 && (
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl text-white font-black text-sm shadow-lg shadow-amber-500/30 flex items-center gap-2 border border-amber-300/40"
              >
                <Zap className="w-5 h-5 text-yellow-200 fill-yellow-300 animate-bounce" />
                <span>+{data.xpEarned} XP نقاط إضافية!</span>
              </motion.div>
            )}

            {data.badgeName && (
              <div className="px-4 py-2.5 bg-indigo-900/80 rounded-2xl text-indigo-200 font-black text-xs border border-indigo-500/50 flex items-center gap-2">
                <Award className="w-4 h-4 text-indigo-400" />
                <span>وسام: {data.badgeName}</span>
              </div>
            )}
          </div>

          {/* Action Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onClose}
            className="w-full py-4 bg-gradient-to-r from-amber-400 via-orange-400 to-yellow-400 hover:from-amber-500 hover:to-orange-500 text-slate-950 font-black text-base rounded-2xl shadow-xl shadow-amber-500/30 flex items-center justify-center gap-2 cursor-pointer border border-yellow-200"
          >
            <CheckCircle2 className="w-5 h-5 text-slate-950" />
            <span>متابعة مغامرة التعلم 🚀</span>
          </motion.button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
