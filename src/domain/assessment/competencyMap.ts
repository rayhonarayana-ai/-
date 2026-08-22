/**
 * Canonical Competency Map & Registry
 * Gate 10 Architecture: Formal mapping between Lessons, Labs, Assessments, and Competencies.
 */

import { CompetencyMapping, MappingIntegrityReport } from "./types";
import { CANONICAL_SKILLS } from "../../utils/learningEvidence";
import { LESSONS } from "../../data/lessons";
import { LAB_CATALOG } from "../../data/labCatalog";

/**
 * The Canonical Competency Registry
 * Maps each of the 6 canonical competencies to their instructional lessons,
 * hands-on labs, assessment topics, and graduation criteria.
 */
export const CANONICAL_COMPETENCY_REGISTRY: Record<string, CompetencyMapping> = {
  skill_ai_foundations: {
    skillId: "skill_ai_foundations",
    titleAr: "أساسيات الذكاء الاصطناعي والتفكير المنطقي",
    titleEn: "AI Foundations & Logic",
    category: "ai-foundations",
    taughtLessons: ["lesson-1", "lesson-2", "lesson-3", "lesson-4"],
    practicedLabs: ["fruit-classifier", "smart-assistant"],
    assessedSources: ["quiz-ai-foundations", "step-quiz-lesson-1", "step-quiz-lesson-2"],
    assessmentTopics: [
      "أساسيات الذكاء الاصطناعي",
      "الذكاء الاصطناعي",
      "AI Foundations",
      "مقدمة الذكاء الاصطناعي",
    ],
    graduationRelevance: "mandatory_core",
    minimumAssessedItemsForMastery: 3,
    masteryAccuracyThreshold: 85,
  },

  skill_machine_learning: {
    skillId: "skill_machine_learning",
    titleAr: "التعلّم الآلي وتدريب النماذج",
    titleEn: "Machine Learning & Training",
    category: "classification",
    taughtLessons: ["lesson-5", "lesson-6"],
    practicedLabs: [
      "emotion-classifier",
      "audio-recognizer",
      "robot-navigator",
      "smart-sorter-agent",
      "train-classifier",
    ],
    assessedSources: ["quiz-machine-learning", "lab-train-model-rubric"],
    assessmentTopics: [
      "التعلّم الآلي وتدريب النماذج",
      "تعلم الآلة",
      "Machine Learning",
      "تصنيف البيانات",
    ],
    graduationRelevance: "mandatory_core",
    minimumAssessedItemsForMastery: 3,
    masteryAccuracyThreshold: 85,
  },

  skill_computer_vision: {
    skillId: "skill_computer_vision",
    titleAr: "الرؤية الحاسوبية ومعالجة الصور",
    titleEn: "Computer Vision & Features",
    category: "computer-vision",
    taughtLessons: ["lesson-7", "lesson-8"],
    practicedLabs: [
      "object-detector",
      "color-sorter",
      "vision-object-detector",
    ],
    assessedSources: ["quiz-computer-vision", "step-quiz-lesson-7", "step-quiz-lesson-8"],
    assessmentTopics: [
      "الرؤية الحاسوبية ومعالجة الصور",
      "رؤية الكمبيوتر",
      "Computer Vision",
      "معالجة الصور الرقمية",
    ],
    graduationRelevance: "mandatory_core",
    minimumAssessedItemsForMastery: 3,
    masteryAccuracyThreshold: 85,
  },

  skill_prompt_engineering: {
    skillId: "skill_prompt_engineering",
    titleAr: "هندسة وصياغة الأوامر التوليدية",
    titleEn: "Prompt Engineering Architecture",
    category: "prompt-engineering",
    taughtLessons: [
      "lesson-9",
      "lesson-10",
      "lesson-11",
      "lesson-12",
      "lesson-13",
      "lesson-14",
      "lesson-15",
      "lesson-16",
    ],
    practicedLabs: [
      "prompt-storyteller",
      "character-creator",
      "creative-writer",
      "smart-chatbot-tutor",
      "prompt-space-story",
    ],
    assessedSources: ["quiz-prompt-engineering", "step-quiz-lesson-9"],
    assessmentTopics: [
      "هندسة وصياغة الأوامر",
      "هندسة الأوامر",
      "Prompt Engineering",
      "الذكاء الاصطناعي التوليدي",
    ],
    graduationRelevance: "mandatory_core",
    minimumAssessedItemsForMastery: 3,
    masteryAccuracyThreshold: 85,
  },

  skill_ai_ethics: {
    skillId: "skill_ai_ethics",
    titleAr: "الأخلاقيات والأمان والمسؤولية الرقمية",
    titleEn: "AI Ethics & Digital Safety",
    category: "ethics",
    taughtLessons: ["lesson-4", "lesson-16", "lesson-24"],
    practicedLabs: ["ethics-safeguard", "ethics-safe-charter"],
    assessedSources: ["quiz-ai-ethics", "lab-ethics-safeguard"],
    assessmentTopics: [
      "الأخلاقيات والأمان الرقمي",
      "أخلاقيات الذكاء الاصطناعي",
      "AI Ethics",
      "الأمان الرقمي والخصوصية",
    ],
    graduationRelevance: "mandatory_core",
    minimumAssessedItemsForMastery: 3,
    masteryAccuracyThreshold: 85,
  },

  skill_python_coding: {
    skillId: "skill_python_coding",
    titleAr: "البرمجة بلغة بايثون والخوارزميات",
    titleEn: "Python Programming & Loops",
    category: "coding",
    taughtLessons: [
      "lesson-17",
      "lesson-18",
      "lesson-19",
      "lesson-20",
      "lesson-21",
      "lesson-22",
      "lesson-23",
      "lesson-24",
    ],
    practicedLabs: [
      "python-turtle-shapes",
      "python-game-loop",
      "python-data-analyzer",
      "python-pattern-gen",
    ],
    assessedSources: ["quiz-python-coding", "step-quiz-lesson-17"],
    assessmentTopics: [
      "البرمجة بلغة بايثون",
      "بايثون والخوارزميات",
      "Python Programming",
      "البرمجة والتكرار",
    ],
    graduationRelevance: "mandatory_core",
    minimumAssessedItemsForMastery: 3,
    masteryAccuracyThreshold: 85,
  },
};

/**
 * Lookup competency for a given skill ID
 */
export function getCompetencyForSkill(skillId: string): CompetencyMapping | undefined {
  if (!skillId || typeof skillId !== "string") return undefined;
  return CANONICAL_COMPETENCY_REGISTRY[skillId];
}

/**
 * Get all skills taught by a given lesson ID
 */
export function getSkillsTaughtByLesson(lessonId: string): string[] {
  if (!lessonId || typeof lessonId !== "string") return [];
  const matched: string[] = [];
  for (const comp of Object.values(CANONICAL_COMPETENCY_REGISTRY)) {
    if (comp.taughtLessons.includes(lessonId)) {
      matched.push(comp.skillId);
    }
  }
  return matched;
}

/**
 * Get all skills practiced or assessed by a given lab key
 */
export function getSkillsPracticedByLab(labKey: string): string[] {
  if (!labKey || typeof labKey !== "string") return [];
  const matched: string[] = [];
  for (const comp of Object.values(CANONICAL_COMPETENCY_REGISTRY)) {
    if (comp.practicedLabs.includes(labKey)) {
      matched.push(comp.skillId);
    }
  }
  return matched;
}

/**
 * Resolve canonical skill for an assessment topic string
 * Server/Domain authoritative mapping.
 */
export function getSkillForAssessmentTopic(topic: string): string {
  if (!topic || typeof topic !== "string") return "skill_ai_foundations";
  const cleanTopic = topic.trim().toLowerCase();

  for (const comp of Object.values(CANONICAL_COMPETENCY_REGISTRY)) {
    for (const t of comp.assessmentTopics) {
      if (cleanTopic.includes(t.toLowerCase()) || t.toLowerCase().includes(cleanTopic)) {
        return comp.skillId;
      }
    }
  }

  // Fallback keyword heuristics based on canonical taxonomy
  if (cleanTopic.includes("vision") || cleanTopic.includes("بصر") || cleanTopic.includes("صورة") || cleanTopic.includes("رؤية")) {
    return "skill_computer_vision";
  }
  if (cleanTopic.includes("prompt") || cleanTopic.includes("أمر") || cleanTopic.includes("توليد") || cleanTopic.includes("هندسة")) {
    return "skill_prompt_engineering";
  }
  if (cleanTopic.includes("python") || cleanTopic.includes("بايثون") || cleanTopic.includes("كود") || cleanTopic.includes("code")) {
    return "skill_python_coding";
  }
  if (cleanTopic.includes("ethic") || cleanTopic.includes("أخلاق") || cleanTopic.includes("أمان") || cleanTopic.includes("safety")) {
    return "skill_ai_ethics";
  }
  if (cleanTopic.includes("classif") || cleanTopic.includes("train") || cleanTopic.includes("تدريب") || cleanTopic.includes("تعلّم")) {
    return "skill_machine_learning";
  }

  return "skill_ai_foundations";
}

/**
 * Check if a skill ID belongs to the canonical taxonomy
 */
export function isCanonicalSkill(skillId: string): boolean {
  if (!skillId || typeof skillId !== "string") return false;
  return Boolean(CANONICAL_SKILLS[skillId] && CANONICAL_COMPETENCY_REGISTRY[skillId]);
}

/**
 * Perform comprehensive mathematical & relational integrity audit of the competency map
 */
export function validateCompetencyMappingIntegrity(): MappingIntegrityReport {
  const errors: string[] = [];
  const warnings: string[] = [];

  const existingLessonIds = new Set(LESSONS.map((l) => l.id));
  const existingLabKeys = new Set(LAB_CATALOG.map((l) => l.key));
  // Also include interactive lab keys
  const interactiveLabKeys = new Set([
    "train-classifier",
    "vision-object-detector",
    "prompt-space-story",
    "ethics-safe-charter",
  ]);

  let totalLessonsMapped = 0;
  let totalLabsMapped = 0;
  let totalAssessmentsMapped = 0;

  const allCanonicalSkillIds = Object.keys(CANONICAL_SKILLS);
  const registeredSkillIds = Object.keys(CANONICAL_COMPETENCY_REGISTRY);

  // 1. Verify 1:1 match with CANONICAL_SKILLS
  for (const skillId of allCanonicalSkillIds) {
    if (!CANONICAL_COMPETENCY_REGISTRY[skillId]) {
      errors.push(`Canonical skill '${skillId}' is missing from CANONICAL_COMPETENCY_REGISTRY.`);
    }
  }

  for (const skillId of registeredSkillIds) {
    if (!CANONICAL_SKILLS[skillId]) {
      errors.push(`Registered skill '${skillId}' does not exist in CANONICAL_SKILLS taxonomy.`);
    }

    const comp = CANONICAL_COMPETENCY_REGISTRY[skillId];

    // 2. Verify instructional coverage (at least 1 lesson)
    if (!Array.isArray(comp.taughtLessons) || comp.taughtLessons.length === 0) {
      errors.push(`Skill '${skillId}' has 0 taught lessons (orphan/uninstructional skill).`);
    } else {
      totalLessonsMapped += comp.taughtLessons.length;
      for (const lessonId of comp.taughtLessons) {
        if (!existingLessonIds.has(lessonId)) {
          errors.push(`Skill '${skillId}' maps to nonexistent lesson '${lessonId}'.`);
        }
      }
    }

    // 3. Verify lab coverage
    if (!Array.isArray(comp.practicedLabs) || comp.practicedLabs.length === 0) {
      warnings.push(`Skill '${skillId}' has no mapped practice labs.`);
    } else {
      totalLabsMapped += comp.practicedLabs.length;
      for (const labKey of comp.practicedLabs) {
        if (!existingLabKeys.has(labKey) && !interactiveLabKeys.has(labKey)) {
          errors.push(`Skill '${skillId}' maps to nonexistent lab key '${labKey}'.`);
        }
      }
    }

    // 4. Verify assessment coverage (at least 1 assessment path)
    if (!Array.isArray(comp.assessedSources) || comp.assessedSources.length === 0) {
      errors.push(`Skill '${skillId}' has 0 assessment sources (unassessed skill).`);
    } else {
      totalAssessmentsMapped += comp.assessedSources.length;
    }

    // 5. Verify assessment topics
    if (!Array.isArray(comp.assessmentTopics) || comp.assessmentTopics.length === 0) {
      errors.push(`Skill '${skillId}' has 0 mapped assessment topics.`);
    }
  }

  return {
    isValid: errors.length === 0,
    totalSkills: registeredSkillIds.length,
    totalLessonsMapped,
    totalLabsMapped,
    totalAssessmentsMapped,
    errors,
    warnings,
  };
}
