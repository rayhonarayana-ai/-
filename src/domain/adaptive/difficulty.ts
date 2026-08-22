import { MasteryStatus } from "../../types/learningEvidence";
import { AdaptiveDifficulty, LearningNeedState } from "./types";

/**
 * Pure, deterministic difficulty determination based on pedagogical need state.
 * 
 * CORE INVARIANT:
 * No negative child labeling (e.g. no "weak", "struggling", "slow").
 * Difficulty is a property of the scaffolded content/challenge level, not the child's identity.
 */
export function deriveActivityDifficulty(
  masteryStatus: MasteryStatus,
  needState: LearningNeedState
): AdaptiveDifficulty {
  if (masteryStatus === "demonstrated" || needState === "demonstrated") {
    return "challenge";
  }

  if (masteryStatus === "developing" || needState === "needs_practice" || needState === "needs_review") {
    return "foundation";
  }

  // Not yet assessed or standard lesson step
  return "standard";
}

export function getDifficultyLabel(
  difficulty: AdaptiveDifficulty,
  lang: "ar" | "en" = "ar"
): string {
  if (lang === "en") {
    switch (difficulty) {
      case "foundation":
        return "Foundation / Scaffolded";
      case "challenge":
        return "Mastery Challenge";
      case "standard":
      default:
        return "Standard Track";
    }
  }

  switch (difficulty) {
    case "foundation":
      return "مسار تأسيسي مدعوم 🧱";
    case "challenge":
      return "تحدي متقدم وإتقان 🚀";
    case "standard":
    default:
      return "المسار المعياري 🧭";
  }
}

export function getDifficultyDescription(
  difficulty: AdaptiveDifficulty,
  lang: "ar" | "en" = "ar"
): string {
  if (lang === "en") {
    switch (difficulty) {
      case "foundation":
        return "Provides step-by-step hints and visual guidance for reinforced learning.";
      case "challenge":
        return "Presents open-ended exploration to deepen already mastered concepts.";
      case "standard":
      default:
        return "Balanced instructional pace aligned with the core curriculum.";
    }
  }

  switch (difficulty) {
    case "foundation":
      return "يقدم تلميحات وتوجيهات خطوة بخطوة لدعم ترسيخ المفاهيم بسلاسة.";
    case "challenge":
      return "يتيح استكشافاً أوسع لتطبيق المفاهيم المتقنة في سياقات جديدة ومبتكرة.";
    case "standard":
    default:
      return "وتيرة تعليمية متوازنة متوافقة مع تسلسل المنهاج الأساسي.";
  }
}
