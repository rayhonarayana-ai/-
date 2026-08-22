import { LESSONS } from "../../data/lessons";
import { LAB_CATALOG } from "../../data/labCatalog";
import { CANONICAL_SKILLS } from "../../utils/learningEvidence";
import { deriveActivityDifficulty } from "./difficulty";
import { deriveAdaptiveLearnerState } from "./learnerState";
import { POLICY_PRIORITIES, REASON_CODES, TOPIC_BY_SKILL } from "./policy";
import {
  AdaptiveRecommendationInput,
  LearningRecommendation,
} from "./types";

/**
 * Pure, deterministic single authority for adaptive learning recommendations.
 * 
 * CORE INVARIANTS:
 * 1. Zero Math.random() or non-deterministic branching.
 * 2. Independent of XP, level farming, streaks, or cosmetic badges.
 * 3. Evidence-driven: Uses Gate 2 mastery status as authoritative input.
 * 4. Loop & Duplicate Protection: Completed lessons are not recommended as "learn".
 * 5. Traceable Explainability: Every decision has a deterministic reasonCode and explanation.
 */
export function recommendNextLearningAction(
  input: AdaptiveRecommendationInput
): LearningRecommendation {
  const learnerState = deriveAdaptiveLearnerState(input);
  const {
    skillStates,
    completedLessons,
    completedLabs,
    totalAssessedEvidences,
  } = learnerState;

  // 1. COLD START (New Learner with 0 completed lessons, 0 labs, 0 evidences)
  if (
    completedLessons.length === 0 &&
    completedLabs.length === 0 &&
    totalAssessedEvidences === 0
  ) {
    const firstLesson = LESSONS[0] || {
      id: "lesson-1",
      title: "ما هو الذكاء الاصطناعي؟",
      level: 1,
    };

    return {
      actionType: "learn",
      targetId: "lesson-1",
      targetType: "lesson",
      targetTitleAr: firstLesson.title,
      targetTitleEn: "Introduction to AI & Machine Thinking",
      skillId: "skill_ai_foundations",
      difficulty: "foundation",
      reasonCode: REASON_CODES.COLD_START_FOUNDATION,
      explanationAr:
        "نبدأ رحلتنا الممتعة بالتعرف على أسرار الذكاء الاصطناعي وكيف يفكر الحاسوب.",
      explanationEn:
        "Recommended because this is the foundational entry point for new AI learners.",
      priority: POLICY_PRIORITIES.COLD_START,
      lessonId: "lesson-1",
      metadata: { level: 1, isColdStart: true },
    };
  }

  // 2. PRIORITY 1: SKILL DEVELOPING REMEDIATION
  // If an assessed skill is in "developing" status, prioritize targeted practice or review.
  const canonicalSkillOrder = [
    "skill_ai_foundations",
    "skill_machine_learning",
    "skill_computer_vision",
    "skill_prompt_engineering",
    "skill_ai_ethics",
    "skill_python_coding",
  ];

  for (const skillId of canonicalSkillOrder) {
    const skillState = skillStates[skillId];
    if (skillState && skillState.masteryStatus === "developing") {
      // Find an uncompleted associated lab first
      const uncompletedLabKey = skillState.associatedLabs.find(
        (key) => !completedLabs.includes(key)
      );

      if (uncompletedLabKey) {
        const labDef = LAB_CATALOG.find((l) => l.key === uncompletedLabKey);
        const labTitle = labDef?.titleAr || uncompletedLabKey;

        return {
          actionType: "practice",
          targetId: uncompletedLabKey,
          targetType: "lab",
          targetTitleAr: labTitle,
          targetTitleEn: labDef?.titleEn || uncompletedLabKey,
          skillId,
          difficulty: deriveActivityDifficulty("developing", "needs_practice"),
          reasonCode: REASON_CODES.SKILL_DEVELOPING_REMEDIATION,
          explanationAr: `توصية بتجربة مختبر (${labTitle}) لتطبيق مهارة (${skillState.titleAr}) وترسيخها بعد التقييم الأخير.`,
          explanationEn: `Recommended practice lab (${labDef?.titleEn || uncompletedLabKey}) to reinforce skill (${skillState.titleEn}) currently developing.`,
          priority: POLICY_PRIORITIES.DEVELOPING_REMEDIATION,
          labKey: uncompletedLabKey,
          metadata: { skillId, previousScore: skillState.latestScore },
        };
      }

      // If all labs completed or no lab, recommend review of the primary associated lesson
      const targetLessonId =
        skillState.associatedLessons.find((lId) =>
          completedLessons.includes(lId)
        ) ||
        skillState.associatedLessons[0] ||
        "lesson-1";

      const lessonDef = LESSONS.find((l) => l.id === targetLessonId);
      const lessonTitle = lessonDef?.title || targetLessonId;

      return {
        actionType: "review",
        targetId: targetLessonId,
        targetType: "lesson",
        targetTitleAr: lessonTitle,
        targetTitleEn: `Review: ${lessonDef?.title || targetLessonId}`,
        skillId,
        difficulty: deriveActivityDifficulty("developing", "needs_review"),
        reasonCode: REASON_CODES.SKILL_DEVELOPING_REMEDIATION,
        explanationAr: `مراجعة درس (${lessonTitle}) لتعزيز فهم المفاهيم وتطوير مهارة (${skillState.titleAr}) نحو الإتقان.`,
        explanationEn: `Recommended review of lesson (${targetLessonId}) to strengthen developing skill (${skillState.titleEn}).`,
        priority: POLICY_PRIORITIES.DEVELOPING_REMEDIATION,
        lessonId: targetLessonId,
        metadata: { skillId, previousScore: skillState.latestScore },
      };
    }
  }

  // 3. PRIORITY 2: READY FOR ASSESSMENT
  // Instructional lessons completed for a skill, but skill has not yet been assessed.
  for (const skillId of canonicalSkillOrder) {
    const skillState = skillStates[skillId];
    if (skillState && skillState.needState === "ready_for_assessment") {
      const topicInfo = TOPIC_BY_SKILL[skillId] || {
        ar: skillState.titleAr,
        en: skillState.titleEn,
      };

      return {
        actionType: "assess",
        targetId: `quiz-${skillId}`,
        targetType: "quiz",
        targetTitleAr: `اختبار التحقق: ${topicInfo.ar}`,
        targetTitleEn: `Verification Quiz: ${topicInfo.en}`,
        skillId,
        difficulty: "standard",
        reasonCode: REASON_CODES.INSTRUCTION_COMPLETE_READY_FOR_ASSESSMENT,
        explanationAr: `أكملت الدروس التمهيدية لمهارة (${skillState.titleAr}). أنت جاهز الآن لخوض الاختبار وإثبات إتقانك بالأدلة!`,
        explanationEn: `Prerequisite instruction completed for (${skillState.titleEn}). Ready for formal assessment evidence.`,
        priority: POLICY_PRIORITIES.READY_FOR_ASSESSMENT,
        suggestedTopic: topicInfo.ar,
        metadata: { skillId, topic: topicInfo.ar },
      };
    }
  }

  // 4. PRIORITY 3: CORE CURRICULUM NEXT LESSON
  // Find the next incomplete lesson in linear order (lesson-1 -> lesson-24).
  const nextIncompleteLesson = LESSONS.find(
    (lesson) => !completedLessons.includes(lesson.id)
  );

  if (nextIncompleteLesson) {
    // Find skill mapped to this lesson
    const primarySkillId =
      canonicalSkillOrder.find((sId) => {
        const sState = skillStates[sId];
        return sState?.associatedLessons.includes(nextIncompleteLesson.id);
      }) || "skill_ai_foundations";

    const sState = skillStates[primarySkillId];

    return {
      actionType: "learn",
      targetId: nextIncompleteLesson.id,
      targetType: "lesson",
      targetTitleAr: nextIncompleteLesson.title,
      targetTitleEn: `Level ${nextIncompleteLesson.level} Core Lesson: ${nextIncompleteLesson.id}`,
      skillId: primarySkillId,
      difficulty: deriveActivityDifficulty(
        sState?.masteryStatus || "not_assessed",
        "new"
      ),
      reasonCode: REASON_CODES.CORE_CURRICULUM_NEXT_LESSON,
      explanationAr: `الخطوة التالية في منهاجك: درس (${nextIncompleteLesson.title}) لاستكشاف معارف جديدة.`,
      explanationEn: `Next core curriculum lesson in sequential progression: ${nextIncompleteLesson.id}.`,
      priority: POLICY_PRIORITIES.CORE_NEXT_LESSON,
      lessonId: nextIncompleteLesson.id,
      metadata: { level: nextIncompleteLesson.level, lessonId: nextIncompleteLesson.id },
    };
  }

  // 5. PRIORITY 4: PRACTICAL LAB APPLICATION
  // Check for any uncompleted hands-on labs in the catalog.
  const nextUncompletedLab = LAB_CATALOG.find(
    (lab) => !completedLabs.includes(lab.key)
  );

  if (nextUncompletedLab) {
    const skillId =
      canonicalSkillOrder.find((sId) => {
        const sState = skillStates[sId];
        return sState?.associatedLabs.includes(nextUncompletedLab.key);
      }) || "skill_machine_learning";

    return {
      actionType: "project",
      targetId: nextUncompletedLab.key,
      targetType: "lab",
      targetTitleAr: nextUncompletedLab.titleAr,
      targetTitleEn: nextUncompletedLab.titleEn,
      skillId,
      difficulty: "standard",
      reasonCode: REASON_CODES.PRACTICAL_LAB_APPLICATION,
      explanationAr: `تطبيق عملي بمختبر (${nextUncompletedLab.titleAr}) لربط المعرفة النظرية بالبناء والإنتاج.`,
      explanationEn: `Hands-on practical lab (${nextUncompletedLab.titleEn}) to apply learned AI concepts.`,
      priority: POLICY_PRIORITIES.PRACTICAL_LAB,
      labKey: nextUncompletedLab.key,
      metadata: { labKey: nextUncompletedLab.key, level: nextUncompletedLab.levelId },
    };
  }

  // 6. PRIORITY 5: ADVANCED CHALLENGE & CAPSTONE (When all core curriculum & labs are completed)
  const challengeLab =
    LAB_CATALOG.find((l) => l.difficulty === "hard") ||
    LAB_CATALOG[LAB_CATALOG.length - 1] || {
      key: "python-pattern-gen",
      titleAr: "أنماط النجوم والمصفوفات النصية",
      titleEn: "Nested Loops & ASCII Pattern Matrix",
    };

  return {
    actionType: "continue",
    targetId: challengeLab.key,
    targetType: "lab",
    targetTitleAr: challengeLab.titleAr,
    targetTitleEn: challengeLab.titleEn,
    skillId: "skill_python_coding",
    difficulty: "challenge",
    reasonCode: REASON_CODES.ADVANCED_CHALLENGE,
    explanationAr:
      "أثبتّ إتقانك لجميع الكفاءات الأساسية! يمكنك الآن خوض تحديات البرمجة المتقدمة والمشاريع المفتوحة.",
    explanationEn:
      "All core competencies demonstrated. Recommended advanced coding challenge.",
    priority: POLICY_PRIORITIES.ADVANCED_CHALLENGE,
    labKey: challengeLab.key,
    metadata: { isMasteryAchieved: true },
  };
}
