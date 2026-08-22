import { DeveloperRank, Certificate, LabResult } from "../../types";
import { LearningEvidence, MasteryStatus } from "../../types/learningEvidence";

export type GraduationStatus = "not_eligible" | "eligible" | "graduated";

export type GraduationRequirementKey =
  | "CORE_COMPETENCIES_DEMONSTRATED"
  | "ASSESSED_LABS_VERIFIED"
  | "COMPREHENSIVE_ASSESSMENT_PASSED";

export interface GraduationRequirement {
  key: GraduationRequirementKey;
  titleAr: string;
  titleEn: string;
  descriptionAr: string;
  isSatisfied: boolean;
  currentValue: number;
  targetValue: number;
  unitAr: string;
  evidenceIds: string[];
  detailsAr: string;
}

export interface DemonstratedSkillSummary {
  skillId: string;
  titleAr: string;
  titleEn: string;
  evidenceCount: number;
  averageScore?: number;
  status: MasteryStatus;
}

export interface GraduationAuditTrail {
  ruleVersion: string;
  evaluatedAt: string;
  totalEvidencesEvaluated: number;
  assessedEvidencesCount: number;
  masteryEligibleEvidencesCount: number;
  demonstratedSkillsCount: number;
  passedLabsCount: number;
  isPedagogicallyDefensible: boolean;
}

export interface GraduationEvaluation {
  status: GraduationStatus;
  isEligible: boolean;
  hasGraduated: boolean;
  requirements: GraduationRequirement[];
  satisfiedRequirementsCount: number;
  totalRequirementsCount: number;
  demonstratedSkills: DemonstratedSkillSummary[];
  missingRequirements: GraduationRequirement[];
  auditTrail: GraduationAuditTrail;
  certificate: Certificate | null;
  rank: DeveloperRank;
  rankTitleAr: string;
  rankIcon: string;
  averageAccuracy: number;
}
