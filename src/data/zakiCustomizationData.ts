export interface ColorOption {
  id: string;
  name: string;
  minLevel: number;
  bgGradient: string;
  glowClass: string;
  accentHex: string;
  badgeBg: string;
}

export interface AccessoryOption {
  id: string;
  name: string;
  emoji: string;
  minLevel: number;
  description: string;
}

export interface ExpressionOption {
  id: string;
  name: string;
  emoji: string;
  minLevel: number;
}

export const ZAKI_COLORS: ColorOption[] = [
  {
    id: "indigo",
    name: "الأزرق السيبراني (Cyber Indigo)",
    minLevel: 1,
    bgGradient: "from-indigo-600 via-indigo-500 to-blue-600",
    glowClass: "shadow-indigo-500/30",
    accentHex: "#4f46e5",
    badgeBg: "bg-indigo-50 text-indigo-700 border-indigo-200",
  },
  {
    id: "purple",
    name: "الأرجواني الفائق (Hyper Purple)",
    minLevel: 2,
    bgGradient: "from-purple-600 via-fuchsia-500 to-indigo-600",
    glowClass: "shadow-purple-500/30",
    accentHex: "#9333ea",
    badgeBg: "bg-purple-50 text-purple-700 border-purple-200",
  },
  {
    id: "emerald",
    name: "الزمردي الذكي (Smart Emerald)",
    minLevel: 3,
    bgGradient: "from-emerald-500 via-teal-500 to-cyan-600",
    glowClass: "shadow-emerald-500/30",
    accentHex: "#059669",
    badgeBg: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  {
    id: "gold",
    name: "الشمس الذهبية (Golden Sun)",
    minLevel: 4,
    bgGradient: "from-amber-500 via-orange-500 to-yellow-500",
    glowClass: "shadow-amber-500/40",
    accentHex: "#d97706",
    badgeBg: "bg-amber-50 text-amber-700 border-amber-200",
  },
  {
    id: "cyan",
    name: "السيبراني المضيء (Neon Cyber)",
    minLevel: 5,
    bgGradient: "from-cyan-500 via-blue-600 to-indigo-700",
    glowClass: "shadow-cyan-500/40",
    accentHex: "#06b6d4",
    badgeBg: "bg-cyan-50 text-cyan-700 border-cyan-200",
  },
  {
    id: "cosmic",
    name: "المجرة الكونية (Cosmic Galaxy)",
    minLevel: 6,
    bgGradient: "from-pink-600 via-purple-700 to-slate-900",
    glowClass: "shadow-pink-500/40",
    accentHex: "#db2777",
    badgeBg: "bg-pink-50 text-pink-700 border-pink-200",
  },
];

export const ZAKI_ACCESSORIES: AccessoryOption[] = [
  {
    id: "none",
    name: "بدون إكسسوار",
    emoji: "",
    minLevel: 1,
    description: "المظهر النقي والكلاسيكي لزكي 🤖",
  },
  {
    id: "glasses",
    name: "نظارة المكتشف 👓",
    emoji: "👓",
    minLevel: 1,
    description: "نظارة ذكية لتحليل البيانات بسرعة!",
  },
  {
    id: "headset",
    name: "سماعة الرأس 🎧",
    emoji: "🎧",
    minLevel: 2,
    description: "تواصل مباشر وبث صوتي فائق الجودة!",
  },
  {
    id: "wizard",
    name: "قبعة الساحر 🧙",
    emoji: "🧙",
    minLevel: 3,
    description: "لصناعة الأوامر السحرية في الذكاء الاصطناعي!",
  },
  {
    id: "crown",
    name: "تاج البطولة 👑",
    emoji: "👑",
    minLevel: 4,
    description: "رمز المبتكر العبقري والنجوم!",
  },
  {
    id: "astronaut",
    name: "خوذة رائد الفضاء 🚀",
    emoji: "🚀",
    minLevel: 5,
    description: "لاستكشاف مجرات البيانات البعيدة!",
  },
  {
    id: "cape",
    name: "عباءة البطل الخارق 🦸",
    emoji: "🦸",
    minLevel: 6,
    description: "لحماية أمان وأخلاقيات التكنولوجيا!",
  },
];

export const ZAKI_EXPRESSIONS: ExpressionOption[] = [
  { id: "happy", name: "سعيد ومبتسم 🙂", emoji: "🤖", minLevel: 1 },
  { id: "excited", name: "متحمس ونشيط 🌟", emoji: "🌟", minLevel: 1 },
  { id: "smart", name: "عبقري ومفكر 💡", emoji: "🧠", minLevel: 2 },
  { id: "hero", name: "بطل النجوم 🏆", emoji: "🎉", minLevel: 3 },
];

export const DEFAULT_ZAKI_CUSTOMIZATION = {
  colorId: "indigo",
  accessoryId: "glasses",
  expressionId: "happy",
};
