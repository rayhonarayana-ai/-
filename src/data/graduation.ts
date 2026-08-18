import {
  Certificate,
  DeveloperRank,
  GraduationState,
  LabResult,
} from "../types";
import { computeLearningPath } from "./learningPath";
import { getLabsStats } from "./labs";

export type { DeveloperRank };

export const RANK_INFO: Record<
  DeveloperRank,
  {
    titleAr: string;
    titleEn: string;
    icon: string;
    minProjects: number;
    maxProjects: number;
    descriptionAr: string;
    badgeBg: string;
    badgeText: string;
    gradient: string;
  }
> = {
  explorer: {
    titleAr: "مستكشف الذكاء الاصطناعي",
    titleEn: "AI Explorer",
    icon: "🧭",
    minProjects: 0,
    maxProjects: 2,
    descriptionAr: "بداية رحلة الاستكشاف والتعرف على النماذج الذكية والبيانات الأولية.",
    badgeBg: "bg-blue-50 border-blue-200",
    badgeText: "text-blue-700",
    gradient: "from-blue-500 to-indigo-600",
  },
  builder: {
    titleAr: "بانٍ صغير للمشاريع الذكية",
    titleEn: "Junior AI Builder",
    icon: "🛠️",
    minProjects: 3,
    maxProjects: 5,
    descriptionAr: "القدرة على توجيه النماذج التوليدية وهندسة الأوامر وبناء مشاريع تطبيقية متقنة.",
    badgeBg: "bg-purple-50 border-purple-200",
    badgeText: "text-purple-700",
    gradient: "from-purple-500 to-pink-600",
  },
  "young-developer": {
    titleAr: "مطور صغير معتمد للذكاء الاصطناعي",
    titleEn: "Certified Young AI Developer",
    icon: "🎓",
    minProjects: 6,
    maxProjects: 999,
    descriptionAr: "إتقان كتابة كود بايثون، وتدريب النماذج، والتفكير الهندسي الخوارزمي بثقة واقتدار.",
    badgeBg: "bg-amber-50 border-amber-200",
    badgeText: "text-amber-800",
    gradient: "from-amber-500 via-orange-500 to-yellow-500",
  },
};

/**
 * Calculates current rank based on total completed projects count
 */
export function getDeveloperRank(totalProjects: number): DeveloperRank {
  if (totalProjects >= 6) return "young-developer";
  if (totalProjects >= 3) return "builder";
  return "explorer";
}

/**
 * Generates official serial certificate code
 */
export function generateCertificateSerial(childName: string): string {
  const timestamp = Date.now().toString(36).toUpperCase().slice(-4);
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  return `MZ-DEV-2026-${timestamp}${randomSuffix}`;
}

/**
 * Computes full graduation state and certificate eligibility
 */
export function computeGraduationState(
  labs: LabResult[] = [],
  childName: string = "البطل المبتكر",
  storedCertificate?: Certificate | null
): GraduationState {
  const stats = getLabsStats(labs);
  const levels = computeLearningPath(labs);
  const completedLevelsCount = levels.filter((l) => l.status === "completed").length;
  const totalProjectsCount = labs.length;
  const rank = getDeveloperRank(totalProjectsCount);
  const rankInfo = RANK_INFO[rank];

  // Eligible to graduate if completed all 3 levels OR has at least 6 completed projects
  const canGraduate = completedLevelsCount >= 3 || totalProjectsCount >= 6;
  const hasGraduated = !!storedCertificate;

  const projectsToYoungDeveloper = Math.max(0, 6 - totalProjectsCount);

  return {
    rank,
    rankTitleAr: rankInfo.titleAr,
    rankIcon: rankInfo.icon,
    canGraduate,
    hasGraduated,
    certificate: storedCertificate || null,
    projectsToYoungDeveloper,
    completedLevelsCount,
    totalProjectsCount,
    averageAccuracy: stats.averageAccuracy,
  };
}

/**
 * Creates and issues a new official certificate
 */
export function generateCertificate(
  childName: string,
  labs: LabResult[],
  levelsCompleted: number
): Certificate {
  const stats = getLabsStats(labs);
  const rank = getDeveloperRank(labs.length);
  const rankInfo = RANK_INFO[rank];

  const highlightProjects = labs
    .slice(0, 4)
    .map((l) => `${l.thumbnail || "🚀"} ${l.titleAr} (${l.accuracy || 95}%)`);

  return {
    id: `cert-${Date.now()}`,
    childName: childName.trim() || "البطل المبتكر",
    titleAr: "شهادة مطور صغير معتمد في الذكاء الاصطناعي",
    issuedAt: new Date().toISOString(),
    totalProjects: labs.length,
    averageAccuracy: stats.averageAccuracy,
    levelsCompleted: levelsCompleted,
    rank: rank,
    rankTitleAr: rankInfo.titleAr,
    highlightProjects: highlightProjects,
    serialNumber: generateCertificateSerial(childName),
  };
}

/**
 * Pre-formatted text for sharing the certificate with family, teachers, or WhatsApp
 */
export function getCertificateShareText(cert: Certificate): string {
  const formattedDate = new Date(cert.issuedAt).toLocaleDateString("ar-EG", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return `🎓✨ إنجاز استثنائي جديد! ✨🎓

يسرني مشاركة شهادة تخرج المطور الصغير:
🌟 البطل/ة: ${cert.childName}
🏆 الرتبة: ${cert.rankTitleAr}
🎯 معدل الدقة والإتقان: ${cert.averageAccuracy}%
🚀 إجمالي المشاريع المنجزة: ${cert.totalProjects} مشاريع ذكية
📚 المستويات المكتملة: ${cert.levelsCompleted} من 3 مستويات
🔖 الرقم التسلسلي المعتمد: ${cert.serialNumber}
📅 تاريخ الإصدار: ${formattedDate}

أبرز المشاريع:
${cert.highlightProjects.map((p) => `• ${p}`).join("\n")}

صُدرت من منصة «مُعَلِّمُ الذَّكَاءِ» لأكاديمية الذكاء الاصطناعي للأطفال 🤖✨
https://ai-for-kids.ai.studio`;
}

/**
 * Pre-formatted portfolio summary for parents & teachers
 */
export function getPortfolioShareSummary(
  childName: string,
  labs: LabResult[],
  rankTitle: string
): string {
  const stats = getLabsStats(labs);

  return `📁 ملخص محفظة مشاريع الذكاء الاصطناعي 🚀

👦 اسم المطور الصغير: ${childName}
🏅 الرتبة الحالية: ${rankTitle}
📊 إجمالي المشاريع الموثقة: ${labs.length} مشاريع
🎯 متوسط دقة النماذج: ${stats.averageAccuracy}%
⭐ المشاريع المتميزة (100%): ${stats.totalStars}

المشاريع المنجزة:
${labs
  .map(
    (l, idx) =>
      `${idx + 1}. ${l.thumbnail || "🔹"} ${l.titleAr} [${l.accuracy || 95}% - ${l.attempts} محاولات]`
  )
  .join("\n")}

تم التوثيق والتدريب عبر منصة «مُعَلِّمُ الذَّكَاءِ» للأطفال 🌟`;
}

/**
 * Pre-formatted achievement card text
 */
export function getAchievementCardText(lab: LabResult, childName: string): string {
  return `🌟 بطاقة إنجاز مشروع ذكي 🌟

👦 المطور: ${childName}
🚀 المشروع: ${lab.titleAr} (${lab.titleEn})
🎯 نسبة الدقة المحققة: ${lab.accuracy || 95}%
⏱️ عدد محاولات التدريب والتحسين: ${lab.attempts}
💡 ملخص الإنجاز: ${lab.resultSummaryAr}
🔖 التوثيق المعتمد: MZ-LAB-${lab.id}

تم الإنجاز عبر منصة «مُعَلِّمُ الذَّكَاءِ» 🤖✨`;
}
