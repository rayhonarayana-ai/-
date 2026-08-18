import { LabResult, LearningLevel, LevelStatus } from "../types";

export const LEARNING_LEVELS_CONFIG = [
  {
    id: 1,
    titleAr: "المستوى 1 – أفهم الذكاء الاصطناعي 🧠",
    titleEn: "Level 1 – Understanding AI & Vision",
    descriptionAr: "تعرف على كيفية تعلّم الآلة من البيانات واكتشاف الوجوه وتصنيف الصور في الزمن الحقيقي.",
    icon: "🧠",
    requiredProjects: 2,
    categories: ["classification", "computer-vision"] as const,
    colorTheme: "from-blue-600 to-cyan-600",
    badgeTitleAr: "مستكشف النماذج الذكية 🌟",
  },
  {
    id: 2,
    titleAr: "المستوى 2 – أتحكم في الأوامر 🔮",
    titleEn: "Level 2 – Mastering Prompt Architecture",
    descriptionAr: "صياغة أوامر احترافية، توجيه النماذج التوليدية، منع الهلوسة، وصناعة محتوى ذكي متناسق.",
    icon: "🔮",
    requiredProjects: 2,
    categories: ["prompt-engineering"] as const,
    colorTheme: "from-purple-600 to-fuchsia-600",
    badgeTitleAr: "مهندس الأوامر المبدع 🎨",
  },
  {
    id: 3,
    titleAr: "المستوى 3 – أبني بنفسي 🐍",
    titleEn: "Level 3 – Coding Algorithms in Python",
    descriptionAr: "كتابة كود بايثون حقيقي، إتقان حلقات التكرار والزوايا الهندسية، وبناء خوارزميات برمجية متكاملة.",
    icon: "🐍",
    requiredProjects: 2,
    categories: ["python-code"] as const,
    colorTheme: "from-emerald-600 to-teal-600",
    badgeTitleAr: "مطور بايثون الصغير 🎓",
  },
];

/**
 * Computes the real status of all 3 levels based on completed labs in localStorage
 */
export function computeLearningPath(labs: LabResult[] = []): LearningLevel[] {
  // Count projects matching each level's categories
  const level1Count = labs.filter(
    (l) => l.category === "classification" || l.category === "computer-vision"
  ).length;

  const level2Count = labs.filter(
    (l) => l.category === "prompt-engineering"
  ).length;

  const level3Count = labs.filter(
    (l) => l.category === "python-code"
  ).length;

  const counts = [level1Count, level2Count, level3Count];

  const results: LearningLevel[] = [];

  for (let i = 0; i < LEARNING_LEVELS_CONFIG.length; i++) {
    const config = LEARNING_LEVELS_CONFIG[i];
    const completedCount = counts[i];
    const isRequirementMet = completedCount >= config.requiredProjects;

    let status: LevelStatus = "locked";

    if (i === 0) {
      // Level 1 is always unlocked
      if (isRequirementMet) {
        status = "completed";
      } else if (completedCount > 0) {
        status = "in-progress";
      } else {
        status = "available";
      }
    } else {
      // Prior level must be completed to unlock
      const priorLevelCompleted = results[i - 1].status === "completed";

      if (priorLevelCompleted) {
        if (isRequirementMet) {
          status = "completed";
        } else if (completedCount > 0) {
          status = "in-progress";
        } else {
          status = "available";
        }
      } else {
        status = "locked";
      }
    }

    results.push({
      id: config.id,
      titleAr: config.titleAr,
      titleEn: config.titleEn,
      descriptionAr: config.descriptionAr,
      icon: config.icon,
      requiredProjects: config.requiredProjects,
      categories: [...config.categories],
      status: status,
      completedCount: completedCount,
      colorTheme: config.colorTheme,
      badgeTitleAr: config.badgeTitleAr,
    });
  }

  return results;
}

/**
 * Returns overall learning path progress metrics
 */
export function getLearningPathProgress(labs: LabResult[] = []) {
  const levels = computeLearningPath(labs);
  const completedLevels = levels.filter((l) => l.status === "completed").length;
  const currentActiveLevel = levels.find((l) => l.status === "in-progress" || l.status === "available") || levels[levels.length - 1];
  
  const totalRequiredProjects = levels.reduce((acc, curr) => acc + curr.requiredProjects, 0); // 6
  const totalEffectiveCompleted = levels.reduce((acc, curr) => acc + Math.min(curr.completedCount, curr.requiredProjects), 0);
  const overallPercentage = Math.round((totalEffectiveCompleted / totalRequiredProjects) * 100);

  return {
    levels,
    completedLevels,
    currentActiveLevel,
    totalRequiredProjects,
    totalEffectiveCompleted,
    overallPercentage,
    isAllCompleted: completedLevels === levels.length,
  };
}
