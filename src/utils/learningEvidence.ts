import {
  LearningEvidence,
  LearningEventType,
  MasteryStatus,
  SkillMastery,
} from "../types/learningEvidence";
import { learningEvidenceStore, STORAGE_KEYS } from "../persistence";

/**
 * Temporary client-side storage key for learning evidence records.
 * NOTE: Temporary client-side persistence; not authoritative backend persistence.
 */
export const LEARNING_EVIDENCE_STORAGE_KEY = STORAGE_KEYS.LEARNING_EVIDENCE;

/**
 * Canonical AI & Coding Skills Taxonomy for Kids AI Academy
 */
export const CANONICAL_SKILLS: Record<string, { id: string; titleAr: string; titleEn: string }> = {
  skill_ai_foundations: {
    id: "skill_ai_foundations",
    titleAr: "أساسيات الذكاء الاصطناعي والتفكير المنطقي",
    titleEn: "AI Foundations & Logic",
  },
  skill_machine_learning: {
    id: "skill_machine_learning",
    titleAr: "التعلّم الآلي وتدريب النماذج",
    titleEn: "Machine Learning & Training",
  },
  skill_computer_vision: {
    id: "skill_computer_vision",
    titleAr: "الرؤية الحاسوبية ومعالجة الصور",
    titleEn: "Computer Vision & Features",
  },
  skill_prompt_engineering: {
    id: "skill_prompt_engineering",
    titleAr: "هندسة وصياغة الأوامر التوليدية",
    titleEn: "Prompt Engineering Architecture",
  },
  skill_ai_ethics: {
    id: "skill_ai_ethics",
    titleAr: "الأخلاقيات والأمان والمسؤولية الرقمية",
    titleEn: "AI Ethics & Digital Safety",
  },
  skill_python_coding: {
    id: "skill_python_coding",
    titleAr: "البرمجة بلغة بايثون والخوارزميات",
    titleEn: "Python Programming & Loops",
  },
};

/**
 * Maps a lesson id or level to canonical skill id
 */
export function mapLessonToSkillId(lessonId: string, level?: number): string {
  const num = parseInt(lessonId.replace(/\D/g, ""), 10);
  if (!isNaN(num)) {
    if (num <= 4) return "skill_ai_foundations";
    if (num <= 6) return "skill_machine_learning";
    if (num <= 8) return "skill_computer_vision";
    if (num <= 16) return "skill_prompt_engineering";
    return "skill_python_coding";
  }
  if (level === 1) return "skill_ai_foundations";
  if (level === 2) return "skill_prompt_engineering";
  if (level === 3) return "skill_python_coding";
  return "skill_ai_foundations";
}

/**
 * Maps category or topic name to canonical skill id
 */
export function mapCategoryToSkillId(categoryOrTopic: string): string {
  const key = categoryOrTopic.toLowerCase();
  if (key.includes("vision") || key.includes("بصر") || key.includes("صورة") || key.includes("رؤية")) {
    return "skill_computer_vision";
  }
  if (key.includes("prompt") || key.includes("أمر") || key.includes("توليد") || key.includes("هندسة")) {
    return "skill_prompt_engineering";
  }
  if (key.includes("python") || key.includes("بايثون") || key.includes("كود") || key.includes("code")) {
    return "skill_python_coding";
  }
  if (key.includes("ethic") || key.includes("أخلاق") || key.includes("أمان") || key.includes("safety")) {
    return "skill_ai_ethics";
  }
  if (key.includes("classif") || key.includes("train") || key.includes("تدريب") || key.includes("تعلّم")) {
    return "skill_machine_learning";
  }
  return "skill_ai_foundations";
}

/**
 * Helper to determine if an evidence item represents a valid, evaluated assessment.
 */
export function isAssessmentEvidence(evidence: LearningEvidence): boolean {
  return (
    evidence.assessed === true &&
    typeof evidence.score === "number" &&
    !isNaN(evidence.score)
  );
}

/**
 * Derives the mastery status of a given skill strictly from assessed evidence.
 * 
 * Rules:
 * - XP, completion flags, streaks, or badges have ZERO weight on mastery.
 * - Evidence for skill A never affects skill B (strict skillId isolation).
 * - If 0 assessed evidence exists for the skill -> "not_assessed"
 * - If assessed evidence exists and at least one evidence explicitly qualifies as masteryEligible -> "demonstrated"
 * - If assessed evidence exists but no evidence meets the specific activity mastery rubric -> "developing"
 */
export function deriveMasteryStatus(
  skillId: string,
  evidences: LearningEvidence[]
): MasteryStatus {
  // Strict skill isolation: match only evidences explicitly tagged with this skillId
  const skillAssessed = evidences.filter(
    (e) => Array.isArray(e.skillIds) && e.skillIds.includes(skillId) && isAssessmentEvidence(e)
  );

  if (skillAssessed.length === 0) {
    return "not_assessed";
  }

  // A skill achieves "demonstrated" ONLY when valid assessed evidence is explicitly mastery-eligible
  const hasMasteryEvidence = skillAssessed.some((e) => e.masteryEligible === true);

  if (hasMasteryEvidence) {
    return "demonstrated";
  }

  return "developing";
}

/**
 * Loads all stored learning evidence records with error-handling and fallback.
 */
export function loadLearningEvidences(): LearningEvidence[] {
  return learningEvidenceStore.loadEvidence();
}

/**
 * Records a new learning evidence entry into client storage.
 */
export function recordLearningEvidence(
  evidenceInput: Omit<LearningEvidence, "id" | "createdAt">
): LearningEvidence {
  return learningEvidenceStore.appendEvidence(evidenceInput);
}

/**
 * Computes a map of all canonical skills with their evidence-backed mastery status.
 */
export function getSkillMasteryMap(
  evidences: LearningEvidence[] = loadLearningEvidences()
): Record<string, SkillMastery> {
  const result: Record<string, SkillMastery> = {};

  Object.values(CANONICAL_SKILLS).forEach((skill) => {
    const skillEvidences = evidences.filter((e) => e.skillIds?.includes(skill.id));
    const assessedEvidences = skillEvidences.filter(isAssessmentEvidence);
    const status = deriveMasteryStatus(skill.id, evidences);

    let averageScore: number | undefined;
    let lastAssessedAt: string | undefined;

    if (assessedEvidences.length > 0) {
      const sum = assessedEvidences.reduce((acc, curr) => acc + (curr.score || 0), 0);
      averageScore = Math.round(sum / assessedEvidences.length);
      const sortedByDate = [...assessedEvidences].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      lastAssessedAt = sortedByDate[0].createdAt;
    }

    result[skill.id] = {
      skillId: skill.id,
      titleAr: skill.titleAr,
      status,
      evidenceCount: skillEvidences.length,
      assessedEvidenceCount: assessedEvidences.length,
      averageScore,
      lastAssessedAt,
    };
  });

  return result;
}
