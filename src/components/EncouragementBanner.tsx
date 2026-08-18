import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { TabType, UserProgress } from "../types";
import {
  Sparkles,
  Trophy,
  Zap,
  Coffee,
  RefreshCw,
  X,
  Flame,
  Star,
  Lightbulb,
  Heart,
  ChevronLeft,
  Smile,
  Target
} from "lucide-react";

interface EncouragementBannerProps {
  activeTab: TabType;
  progress: UserProgress;
  onNavigateTab?: (tab: TabType) => void;
  lastActionTrigger?: { type: string; timestamp: number; data?: any } | null;
}

interface EncouragementMessage {
  id: string;
  category: "effort" | "keep_going" | "break" | "learning" | "challenge" | "milestone";
  title: string;
  message: string;
  icon: React.ReactNode;
  gradient: string;
  borderColor: string;
  actionText?: string;
  actionTab?: TabType;
}

export const EncouragementBanner: React.FC<EncouragementBannerProps> = ({
  activeTab,
  progress,
  onNavigateTab,
  lastActionTrigger,
}) => {
  const [currentBanner, setCurrentBanner] = useState<EncouragementMessage | null>(null);
  const [isVisible, setIsVisible] = useState(true);
  const [sessionMinutes, setSessionMinutes] = useState(0);
  const historyRef = useRef<string[]>([]);

  // Messages pool catalog
  const messagesCatalog: EncouragementMessage[] = [
    // Effort & Growth Mindset
    {
      id: "effort-1",
      category: "effort",
      title: "المحاولة والجهد هما سر النجاح! 💪",
      message: "أنت تقوم بعمل رائع ومثالي! كل محاولة تجعل عقلك الرقمي أقوى وأذكى.",
      icon: <Flame className="w-5 h-5 text-amber-500 fill-amber-400 animate-pulse" />,
      gradient: "from-amber-500/10 via-orange-500/10 to-amber-500/5",
      borderColor: "border-amber-300/80 text-amber-900",
      actionText: "استمر في الاستكشاف",
    },
    {
      id: "effort-2",
      category: "effort",
      title: "مشروعك يقترب من الكمال! 🛠️",
      message: "التركيز والتجربة العملية يجهزانك لتكون مخترع المستقبل. أنت قادر على تحقيق المزيد!",
      icon: <Zap className="w-5 h-5 text-indigo-500 fill-indigo-400" />,
      gradient: "from-indigo-500/10 via-purple-500/10 to-indigo-500/5",
      borderColor: "border-indigo-300/80 text-indigo-900",
      actionText: "واصل العمل الممتاز",
    },

    // Keep Going
    {
      id: "keep-1",
      category: "keep_going",
      title: "استمر، الشغف يفتح كل الأبواب! 🚀",
      message: "فضولك ورغبتك في التعلم هي قوتك الخارقة اليوم. واصل تقدمك الشامخ!",
      icon: <Sparkles className="w-5 h-5 text-purple-500 animate-spin-slow" />,
      gradient: "from-purple-500/10 via-pink-500/10 to-purple-500/5",
      borderColor: "border-purple-300/80 text-purple-900",
      actionText: "انتقل للدرس التالي",
      actionTab: "lessons",
    },
    {
      id: "keep-2",
      category: "keep_going",
      title: "إنجازاتك تضيء شاشة الأكاديمية! ⭐",
      message: "جمعت حتى الآن " + progress.xp + " نقطة XP! خطوة بخطوة تصنع فارقاً حقيقياً.",
      icon: <Trophy className="w-5 h-5 text-amber-500 fill-amber-300" />,
      gradient: "from-amber-500/10 via-yellow-500/10 to-amber-500/5",
      borderColor: "border-amber-400/80 text-amber-950",
      actionText: "استعرض أوسمتك",
      actionTab: "rewards",
    },

    // Learning & Discovery
    {
      id: "learn-1",
      category: "learning",
      title: "لقد تعلمت فكرة جبارة اليوم! 🧠✨",
      message: "كل مفهوم جديد تكتشفه في الذكاء الاصطناعي يمنحك نظرة أعمق للتكنولوجيا حولك.",
      icon: <Lightbulb className="w-5 h-5 text-emerald-500 fill-emerald-300" />,
      gradient: "from-emerald-500/10 via-teal-500/10 to-emerald-500/5",
      borderColor: "border-emerald-300/80 text-emerald-900",
      actionText: "جرب في المختبر",
      actionTab: "labs",
    },
    {
      id: "learn-2",
      category: "learning",
      title: "زكي سعيد جداً بتفاعلك! 🤖💙",
      message: "المستكشف الذكي يحب من يطرح الأسئلة ويفكر بحرية. اسأل زكي أي سؤال يدور في ذهنك!",
      icon: <Smile className="w-5 h-5 text-blue-500" />,
      gradient: "from-blue-500/10 via-cyan-500/10 to-blue-500/5",
      borderColor: "border-blue-300/80 text-blue-900",
      actionText: "تحدث مع زكي",
      actionTab: "chat",
    },

    // Short Challenge
    {
      id: "chal-1",
      category: "challenge",
      title: "تحدي الأبطال السريع! 🎯",
      message: "هل تستطيع إكمال تطبيق مشروع عملي جديد وتدريب النموذج في المختبر خلال 5 دقائق؟",
      icon: <Target className="w-5 h-5 text-rose-500" />,
      gradient: "from-rose-500/10 via-pink-500/10 to-rose-500/5",
      borderColor: "border-rose-300/80 text-rose-900",
      actionText: "اقبل التحدي",
      actionTab: "labs",
    },

    // Break Reminder
    {
      id: "break-1",
      category: "break",
      title: "استراحة المحارب الذكي! 🌟☕",
      message: "أنت تتعلم بتركيز منذ فترة طويلة. خذ استراحة قصيرة، اشرب شربة ماء ثم عد بقوة أكبر!",
      icon: <Coffee className="w-5 h-5 text-teal-600" />,
      gradient: "from-teal-500/10 via-emerald-500/10 to-teal-500/5",
      borderColor: "border-teal-300/80 text-teal-900",
      actionText: "فهمت، سأخذ استراحة",
    },
  ];

  // Helper to pick a smart non-repeating message
  const pickSmartMessage = (filterCategory?: string) => {
    let pool = messagesCatalog;
    if (filterCategory) {
      const catFiltered = messagesCatalog.filter((m) => m.category === filterCategory);
      if (catFiltered.length > 0) pool = catFiltered;
    }

    // Filter out recently used messages
    const freshPool = pool.filter((m) => !historyRef.current.includes(m.id));
    const selectedPool = freshPool.length > 0 ? freshPool : pool;

    const randomIndex = Math.floor(Math.random() * selectedPool.length);
    const chosen = selectedPool[randomIndex];

    // Maintain recent history max 3
    historyRef.current = [...historyRef.current.slice(-2), chosen.id];
    setCurrentBanner(chosen);
    setIsVisible(true);
  };

  // Initial load message
  useEffect(() => {
    pickSmartMessage();
  }, []);

  // Monitor time spent for break reminder trigger
  useEffect(() => {
    const timer = setInterval(() => {
      setSessionMinutes((prev) => {
        const next = prev + 1;
        // Trigger break reminder every 10 minutes spent
        if (next % 10 === 0) {
          pickSmartMessage("break");
        }
        return next;
      });
    }, 60000); // every minute

    return () => clearInterval(timer);
  }, []);

  // React to tab switching or action triggers
  useEffect(() => {
    if (activeTab === "lessons") {
      pickSmartMessage("effort");
    } else if (activeTab === "labs") {
      pickSmartMessage("learning");
    } else if (activeTab === "rewards") {
      pickSmartMessage("keep_going");
    } else if (activeTab === "chat") {
      pickSmartMessage("learning");
    }
  }, [activeTab]);

  // React to explicit action triggers (e.g. XP gain or lesson completed)
  useEffect(() => {
    if (lastActionTrigger) {
      if (lastActionTrigger.type === "xp_earned" || lastActionTrigger.type === "lesson_completed") {
        pickSmartMessage("keep_going");
      }
    }
  }, [lastActionTrigger]);

  if (!currentBanner || !isVisible) {
    return (
      <div className="flex justify-end">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => pickSmartMessage()}
          className="flex items-center gap-2 px-3 py-1.5 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded-2xl text-xs font-black transition border border-amber-300 shadow-xs cursor-pointer"
        >
          <Sparkles className="w-4 h-4 text-amber-600 animate-spin-slow" />
          <span>💡 إشراقة تشجيع من زكي</span>
        </motion.button>
      </div>
    );
  }

  return (
    <AnimatePresence>
      <motion.div
        key={currentBanner.id}
        initial={{ opacity: 0, y: -12, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -12, scale: 0.98 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className={`p-4 sm:p-5 rounded-3xl bg-gradient-to-r ${currentBanner.gradient} border-2 ${currentBanner.borderColor} shadow-lg relative overflow-hidden flex flex-wrap items-center justify-between gap-4 dir-rtl`}
      >
        {/* Left Side Info */}
        <div className="flex items-start sm:items-center gap-3.5 flex-1 min-w-[260px]">
          <div className="w-10 h-10 rounded-2xl bg-white/90 border border-slate-200/80 flex items-center justify-center shrink-0 shadow-sm">
            {currentBanner.icon}
          </div>
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-wide opacity-80">
                منصة التشجيع والتحفيز الذكية ✨
              </span>
            </div>
            <h4 className="font-black text-sm sm:text-base leading-tight">
              {currentBanner.title}
            </h4>
            <p className="text-xs font-bold opacity-90 leading-relaxed">
              {currentBanner.message}
            </p>
          </div>
        </div>

        {/* Right Side Controls */}
        <div className="flex items-center gap-2 shrink-0">
          {currentBanner.actionText && (
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => {
                if (currentBanner.actionTab && onNavigateTab) {
                  onNavigateTab(currentBanner.actionTab);
                } else {
                  pickSmartMessage();
                }
              }}
              className="px-4 py-2 bg-white/90 hover:bg-white text-slate-900 border border-slate-200/80 rounded-2xl text-xs font-black transition shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <span>{currentBanner.actionText}</span>
              <ChevronLeft className="w-3.5 h-3.5" />
            </motion.button>
          )}

          {/* Refresh Banner Button */}
          <button
            onClick={() => pickSmartMessage()}
            title="رسالة تشجيعية جديدة"
            className="p-2 hover:bg-white/50 rounded-xl transition text-slate-600 cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          {/* Dismiss Banner Button */}
          <button
            onClick={() => setIsVisible(false)}
            title="إخفاء اللافتة"
            className="p-2 hover:bg-white/50 rounded-xl transition text-slate-600 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
