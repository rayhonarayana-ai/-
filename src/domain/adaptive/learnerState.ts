import {
  CANONICAL_SKILLS,
  getSkillMasteryMap,
  isAssessmentEvidence,
} from "../../utils/learningEvidence";
import { LearningEvidence } from "../../types/learningEvidence";
import { LabResult } from "../../types";
import {
  AdaptiveLearnerState,
  AdaptiveRecommendationInput,
  LearningNeedState,
  SkillAdaptiveState,
} from "./types";

// Canonical mapping of lessons to primary skill IDs
export const LESSON_SKILL_MAPPING: Record<string, string[]> = {
  "lesson-1": ["skill_ai_foundations"],
  "lesson-2": ["skill_ai_foundations"],
  "lesson-3": ["skill_ai_foundations", "skill_machine_learning"],
  "lesson-4": ["skill_machine_learning"],
  "lesson-5": ["skill_computer_vision"],
  "lesson-6": ["skill_computer_vision"],
  "lesson-7": ["skill_ai_foundations", "skill_computer_vision"],
  "lesson-8": ["skill_computer_vision"],
  "lesson-9": ["skill_prompt_engineering"],
  "lesson-10": ["skill_prompt_engineering"],
  "lesson-11": ["skill_prompt_engineering"],
  "lesson-12": ["skill_prompt_engineering"],
  "lesson-13": ["skill_prompt_engineering"],
  "lesson-14": ["skill_prompt_engineering"],
  "lesson-15": ["skill_ai_ethics"],
  "lesson-16": ["skill_ai_ethics"],
  "lesson-17": ["skill_python_coding"],
  "lesson-18": ["skill_python_coding"],
  "lesson-19": ["skill_python_coding"],
  "lesson-20": ["skill_python_coding"],
  "lesson-21": ["skill_python_coding"],
  "lesson-22": ["skill_python_coding"],
  "lesson-23": ["skill_python_coding"],
  "lesson-24": ["skill_python_coding"],
};

// Canonical mapping of labs to primary skill IDs
export const LAB_SKILL_MAPPING: Record<string, string> = {
  "fruit-classifier": "skill_machine_learning",
  "emotion-classifier": "skill_machine_learning",
  "object-detector": "skill_computer_vision",
  "color-sorter": "skill_computer_vision",
  "story-prompter": "skill_prompt_engineering",
  "image-prompt-crafter": "skill_prompt_engineering",
  "explain-like-five": "skill_prompt_engineering",
  "prompt-debugger": "skill_prompt_engineering",
  "python-turtle-loops": "skill_python_coding",
  "python-star-drawer": "skill_python_coding",
  "python-smart-counter": "skill_python_coding",
  "python-pattern-gen": "skill_python_coding",
};

/**
 * Pure, deterministic function to derive learner's pedagogical state
 * without mutating or creating secondary persistence.
 * Uses Gate 2 mastery derivation as single authority.
 */
export function deriveAdaptiveLearnerState(
  input: AdaptiveRecommendationInput
): AdaptiveLearnerState {
  const rawEvidences = Array.isArray(input?.evidences) ? input.evidences : [];
  const safeEvidences = rawEvidences.filter(
    (e): e is LearningEvidence =>
      !!e &&
      typeof e === "object" &&
      Array.isArray(e.skillIds) &&
      typeof e.id === "string"
  );
  const rawLabs = Array.isArray(input?.labs) ? input.labs : [];
  const safeLabs = rawLabs.filter(
    (l): l is LabResult => !!l && typeof l === "object"
  );
  const completedLessons = Array.isArray(input?.progress?.completedLessons)
    ? input.progress.completedLessons.filter((l): l is string => typeof l === "string")
    : [];
  const completedLabs = safeLabs
    .map((l) => l.labKey || l.id)
    .filter((id): id is string => typeof id === "string" && id.length > 0);

  const studentName =
    input?.childName || input?.progress?.studentName || "البطل المبتكر";

  // Single Authority: Gate 2 Mastery Derivation
  const masteryMap = getSkillMasteryMap(safeEvidences);

  // Group lessons and labs by skill
  const lessonsBySkill: Record<string, string[]> = {};
  Object.entries(LESSON_SKILL_MAPPING).forEach(([lessonId, skills]) => {
    skills.forEach((skillId) => {
      if (!lessonsBySkill[skillId]) lessonsBySkill[skillId] = [];
      lessonsBySkill[skillId].push(lessonId);
    });
  });

  const labsBySkill: Record<string, string[]> = {};
  Object.entries(LAB_SKILL_MAPPING).forEach(([labKey, skillId]) => {
    if (!labsBySkill[skillId]) labsBySkill[skillId] = [];
    labsBySkill[skillId].push(labKey);
  });

  const skillStates: Record<string, SkillAdaptiveState> = {};
  let demonstratedSkillCount = 0;
  let developingSkillCount = 0;
  let notAssessedSkillCount = 0;

  Object.keys(CANONICAL_SKILLS).forEach((skillId) => {
    const canonicalDef = CANONICAL_SKILLS[skillId];
    const mastery = masteryMap[skillId] || {
      skillId,
      titleAr: canonicalDef.titleAr,
      status: "not_assessed",
      assessedEvidenceCount: 0,
      averageScore: 0,
    };

    const associatedLessons = lessonsBySkill[skillId] || [];
    const associatedLabs = labsBySkill[skillId] || [];

    // Pedagogical Need State derivation
    let needState: LearningNeedState = "new";

    if (mastery.status === "demonstrated") {
      needState = "demonstrated";
      demonstratedSkillCount++;
    } else if (mastery.status === "developing") {
      needState = "needs_practice";
      developingSkillCount++;
    } else {
      // not_assessed: check if instructional lessons have been completed
      const hasCompletedInstruction = associatedLessons.some((lId) =>
        completedLessons.includes(lId)
      );
      if (hasCompletedInstruction) {
        needState = "ready_for_assessment";
      } else {
        needState = "new";
      }
      notAssessedSkillCount++;
    }

    skillStates[skillId] = {
      skillId,
      titleAr: canonicalDef.titleAr,
      titleEn: canonicalDef.titleEn,
      masteryStatus: mastery.status,
      needState,
      assessedCount: mastery.assessedEvidenceCount,
      averageScore: mastery.averageScore,
      associatedLessons,
      associatedLabs,
    };
  });

  const assessedEvidences = safeEvidences.filter(isAssessmentEvidence);
  const recentAssessedEvidence =
    assessedEvidences.length > 0
      ? assessedEvidences[assessedEvidences.length - 1]
      : undefined;

  let activeLevel = 1;
  const compCount = completedLessons.length;
  if (compCount >= 16) {
    activeLevel = 3;
  } else if (compCount >= 8) {
    activeLevel = 2;
  }

  return {
    studentName,
    skillStates,
    completedLessons,
    completedLabs,
    demonstratedSkillCount,
    developingSkillCount,
    notAssessedSkillCount,
    totalAssessedEvidences: assessedEvidences.length,
    recentAssessedEvidence,
    activeLevel,
  };
}
