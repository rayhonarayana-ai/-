import {
  Certificate,
  DeveloperRank,
  GraduationState,
  LabResult,
} from "../types";
import { computeLearningPath } from "./learningPath";
import { getLabsStats } from "./labs";
import { evaluateGraduation, issueOfficialCertificate } from "../domain/graduation";
import { loadLearningEvidences } from "../utils/learningEvidence";

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
    titleAr: "مطور صغير للذكاء الاصطناعي",
    titleEn: "Young AI Developer",
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
 * Computes full graduation state and certificate eligibility using authoritative evidence-based evaluation.
 */
export function computeGraduationState(
  labs: LabResult[] = [],
  childName: string = "البطل المبتكر",
  storedCertificate?: Certificate | null,
  providedEvidences?: any[]
): GraduationState {
  const evidences = providedEvidences || loadLearningEvidences();
  const evaluation = evaluateGraduation({
    evidences,
    labs,
    storedCertificate,
    childName,
  });

  const levels = computeLearningPath(labs);
  const completedLevelsCount = levels.filter((l) => l.status === "completed").length;
  const totalProjectsCount = labs.length;
  const projectsToYoungDeveloper = Math.max(0, 6 - totalProjectsCount);

  return {
    rank: evaluation.rank,
    rankTitleAr: evaluation.rankTitleAr,
    rankIcon: evaluation.rankIcon,
    canGraduate: evaluation.isEligible,
    hasGraduated: evaluation.hasGraduated,
    certificate: storedCertificate || null,
    projectsToYoungDeveloper,
    completedLevelsCount,
    totalProjectsCount,
    averageAccuracy: evaluation.averageAccuracy,
  };
}

/**
 * Creates and issues a new official certificate gated by evidence evaluation
 */
export function generateCertificate(
  childName: string,
  labs: LabResult[],
  levelsCompleted: number,
  providedEvidences?: any[]
): Certificate {
  const evidences = providedEvidences || loadLearningEvidences();
  const evaluation = evaluateGraduation({
    evidences,
    labs,
    childName,
  });

  return issueOfficialCertificate(evaluation, {
    childName,
    labs,
    levelsCompleted,
  });
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

  return `🎓✨ إنجاز تعليمي جديد! ✨🎓

يسرني مشاركة شهادة إنجاز المطور الصغير:
🌟 البطل/ة: ${cert.childName}
🏆 الرتبة: ${cert.rankTitleAr}
🎯 متوسط دقة التقييمات: ${cert.averageAccuracy}%
🚀 إجمالي المشاريع المنجزة: ${cert.totalProjects} مشاريع ذكية
📚 المستويات المكتملة: ${cert.levelsCompleted} من 3 مستويات
🔖 الرقم التسلسلي للشهادة: ${cert.serialNumber}
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
      `${idx + 1}. ${l.thumbnail || "🔹"} ${l.titleAr} [${l.accuracy !== undefined ? `${l.accuracy}%` : "مكتمل"} - ${l.attempts} محاولات]`
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
🎯 نسبة الدقة المحققة: ${lab.accuracy !== undefined ? `${lab.accuracy}%` : "مكتمل بنجاح"}
⏱️ عدد محاولات التدريب والتحسين: ${lab.attempts}
💡 ملخص الإنجاز: ${lab.resultSummaryAr}
🔖 معرف المشروع: MZ-LAB-${lab.id}

تم الإنجاز عبر منصة «مُعَلِّمُ الذَّكَاءِ» 🤖✨`;
}
