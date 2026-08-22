import { MasteryStatus } from "../../types/learningEvidence";
import { LearningEvidence } from "../../types/learningEvidence";
import { LabResult, ProjectCategory, UserProgress } from "../../types";

export type LearningActionType =
  | "learn"
  | "practice"
  | "review"
  | "assess"
  | "project"
  | "continue";

export type RecommendationTargetType = "lesson" | "quiz" | "lab" | "skill";

export type AdaptiveDifficulty = "foundation" | "standard" | "challenge";

export type LearningNeedState =
  | "new"
  | "needs_practice"
  | "needs_review"
  | "ready_for_assessment"
  | "demonstrated";

export interface SkillAdaptiveState {
  skillId: string;
  titleAr: string;
  titleEn: string;
  masteryStatus: MasteryStatus;
  needState: LearningNeedState;
  assessedCount: number;
  latestScore?: number;
  averageScore?: number;
  associatedLessons: string[];
  associatedLabs: string[];
}

export interface AdaptiveLearnerState {
  studentName: string;
  skillStates: Record<string, SkillAdaptiveState>;
  completedLessons: string[];
  completedLabs: string[];
  demonstratedSkillCount: number;
  developingSkillCount: number;
  notAssessedSkillCount: number;
  totalAssessedEvidences: number;
  recentAssessedEvidence?: LearningEvidence;
  activeLevel: number;
}

export interface LearningRecommendation {
  actionType: LearningActionType;
  targetId: string;
  targetType: RecommendationTargetType;
  targetTitleAr: string;
  targetTitleEn: string;
  skillId: string;
  difficulty: AdaptiveDifficulty;
  reasonCode: string;
  explanationAr: string;
  explanationEn: string;
  priority: number;
  suggestedTopic?: string;
  labKey?: string;
  lessonId?: string;
  metadata?: Record<string, any>;
}

export interface AdaptiveRecommendationInput {
  progress?: UserProgress | null;
  evidences?: LearningEvidence[] | null;
  labs?: LabResult[] | null;
  preferredCategory?: ProjectCategory;
  childName?: string;
}
