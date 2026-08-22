import { Certificate, DeveloperRank, LabResult } from "../../types";
import { LearningEvidence } from "../../types/learningEvidence";
import {
  CANONICAL_SKILLS,
  getSkillMasteryMap,
  isAssessmentEvidence,
} from "../../utils/learningEvidence";
import { RANK_INFO, getDeveloperRank } from "../../data/graduation";
import {
  DemonstratedSkillSummary,
  GraduationAuditTrail,
  GraduationEvaluation,
  GraduationRequirement,
  GraduationStatus,
} from "./types";

export const GRADUATION_RULE_VERSION = "2026.1-evidence-based";

export const MIN_DEMONSTRATED_SKILLS = 3;
export const MIN_ASSESSED_LABS = 3;
export const MIN_COMPREHENSIVE_ASSESSMENTS = 4;

export interface EvaluateGraduationInput {
  evidences: LearningEvidence[];
  labs?: LabResult[];
  storedCertificate?: Certificate | null;
  childName?: string;
}

/**
 * Authoritative, pure function to evaluate graduation eligibility.
 * 
 * CORE INVARIANT:
 * XP != mastery
 * streak != mastery
 * badge != mastery
 * AI praise != mastery
 * completion != mastery
 * 
 * Graduation requires explicit, auditable assessment evidence.
 */
export function evaluateGraduation(
  input: EvaluateGraduationInput
): GraduationEvaluation {
  const safeEvidences = Array.isArray(input?.evidences) ? input.evidences : [];
  const safeLabs = Array.isArray(input?.labs) ? input.labs : [];
  const storedCertificate = input?.storedCertificate || null;

  // 1. Evaluate Skills Mastery strictly from assessment evidence
  const skillMasteryMap = getSkillMasteryMap(safeEvidences);
  const demonstratedSkills: DemonstratedSkillSummary[] = Object.values(
    skillMasteryMap
  )
    .filter((s) => s.status === "demonstrated")
    .map((s) => ({
      skillId: s.skillId,
      titleAr: s.titleAr,
      titleEn: CANONICAL_SKILLS[s.skillId]?.titleEn || s.skillId,
      evidenceCount: s.assessedEvidenceCount,
      averageScore: s.averageScore,
      status: s.status,
    }));

  const masteryEvidenceIds = safeEvidences
    .filter((e) => isAssessmentEvidence(e) && e.masteryEligible === true)
    .map((e) => e.id);

  // Requirement 1: Core Competencies Demonstrated
  const demonstratedCount = demonstratedSkills.length;
  const isReq1Satisfied = demonstratedCount >= MIN_DEMONSTRATED_SKILLS;
  const req1: GraduationRequirement = {
    key: "CORE_COMPETENCIES_DEMONSTRATED",
    titleAr: "إثبات إتقان الكفاءات الأساسية بأدلة تقييمية",
    titleEn: "Core Competencies Demonstrated via Assessment Evidence",
    descriptionAr:
      "إثبات إتقان ما لا يقل عن 3 مهارات ذكاء اصطناعي عبر أدلة تقييم مؤهلة للإتقان (Mastery-Eligible Evidence).",
    isSatisfied: isReq1Satisfied,
    currentValue: demonstratedCount,
    targetValue: MIN_DEMONSTRATED_SKILLS,
    unitAr: "مهارات مُثبتة",
    evidenceIds: masteryEvidenceIds,
    detailsAr: isReq1Satisfied
      ? `تم إثبات ${demonstratedCount} مهارات بأدلة تقييمية معتمدة.`
      : `تم إثبات ${demonstratedCount} من أصل ${MIN_DEMONSTRATED_SKILLS} مهارات مطلوبة للتخرج.`,
  };

  // Requirement 2: Assessed Practical Labs Verified
  // A lab is verified if:
  // (a) matching assessed evidence exists with passed=true or score >= 80, OR
  // (b) lab result has accuracy >= 80
  const assessedLabEvidences = safeEvidences.filter(
    (e) =>
      (e.type === "LAB_COMPLETED" || e.type === "PROJECT_COMPLETED") &&
      isAssessmentEvidence(e) &&
      (e.passed === true || (e.score !== undefined && e.score >= 80))
  );

  const passedLabsFromResults = safeLabs.filter(
    (l) => l.accuracy !== undefined && l.accuracy >= 80
  );

  // Collect unique verified lab references
  const verifiedLabIds = new Set<string>();
  assessedLabEvidences.forEach((e) => verifiedLabIds.add(e.sourceId || e.id));
  passedLabsFromResults.forEach((l) => verifiedLabIds.add(l.id || l.labKey));

  const verifiedLabsCount = Math.max(
    verifiedLabIds.size,
    assessedLabEvidences.length,
    passedLabsFromResults.length
  );
  const isReq2Satisfied = verifiedLabsCount >= MIN_ASSESSED_LABS;
  const req2EvidenceIds = assessedLabEvidences.map((e) => e.id);

  const req2: GraduationRequirement = {
    key: "ASSESSED_LABS_VERIFIED",
    titleAr: "إنجاز وتوثيق مشاريع تطبيقية مقيّمة بنجاح",
    titleEn: "Assessed Practical Labs Verified",
    descriptionAr:
      "إتمام واجتياز 3 مختبرات تطبيقية على الأقل بنسبة دقة وتدريب مقيّمة لا تقل عن 80%.",
    isSatisfied: isReq2Satisfied,
    currentValue: verifiedLabsCount,
    targetValue: MIN_ASSESSED_LABS,
    unitAr: "مشاريع مقيّمة",
    evidenceIds: req2EvidenceIds,
    detailsAr: isReq2Satisfied
      ? `تم توثيق واجتياز ${verifiedLabsCount} مشاريع عملية بنجاح.`
      : `تم توثيق ${verifiedLabsCount} من أصل ${MIN_ASSESSED_LABS} مشاريع مطلوبة.`,
  };

  // Requirement 3: Comprehensive Assessment / Milestone Passed
  const passedAssessments = safeEvidences.filter(
    (e) =>
      isAssessmentEvidence(e) &&
      (e.passed === true || (e.score !== undefined && e.score >= 75))
  );
  const passedAssessmentsCount = passedAssessments.length;
  const isReq3Satisfied =
    passedAssessmentsCount >= MIN_COMPREHENSIVE_ASSESSMENTS;
  const req3EvidenceIds = passedAssessments.map((e) => e.id);

  const req3: GraduationRequirement = {
    key: "COMPREHENSIVE_ASSESSMENT_PASSED",
    titleAr: "اجتياز التقييمات الشاملة المعتمدة",
    titleEn: "Comprehensive Assessment Passed",
    descriptionAr:
      "اجتياز 4 محطات تقييمية معتمدة على الأقل بدرجة نجاح موثقة بالأدلة.",
    isSatisfied: isReq3Satisfied,
    currentValue: passedAssessmentsCount,
    targetValue: MIN_COMPREHENSIVE_ASSESSMENTS,
    unitAr: "تقييمات مجتازة",
    evidenceIds: req3EvidenceIds,
    detailsAr: isReq3Satisfied
      ? `تم اجتياز ${passedAssessmentsCount} محطات تقييمية معتمدة.`
      : `تم اجتياز ${passedAssessmentsCount} من أصل ${MIN_COMPREHENSIVE_ASSESSMENTS} تقييمات مطلوبة.`,
  };

  const requirements: GraduationRequirement[] = [req1, req2, req3];
  const satisfiedRequirements = requirements.filter((r) => r.isSatisfied);
  const missingRequirements = requirements.filter((r) => !r.isSatisfied);

  const isEligible = requirements.every((r) => r.isSatisfied);
  const hasGraduated = !!storedCertificate;

  let status: GraduationStatus = "not_eligible";
  if (hasGraduated) {
    status = "graduated";
  } else if (isEligible) {
    status = "eligible";
  }

  // Developer Rank calculation (Motivational ladder separated from academic qualification)
  const rank = getDeveloperRank(safeLabs.length);
  const rankInfo = RANK_INFO[rank];

  // Average accuracy calculation from assessed evidence & verified labs
  const assessedScores = safeEvidences
    .filter(isAssessmentEvidence)
    .map((e) => e.score as number);
  safeLabs
    .filter((l) => typeof l.accuracy === "number")
    .forEach((l) => assessedScores.push(l.accuracy as number));

  const averageAccuracy =
    assessedScores.length > 0
      ? Math.round(
          assessedScores.reduce((a, b) => a + b, 0) / assessedScores.length
        )
      : 0;

  const auditTrail: GraduationAuditTrail = {
    ruleVersion: GRADUATION_RULE_VERSION,
    evaluatedAt: new Date().toISOString(),
    totalEvidencesEvaluated: safeEvidences.length,
    assessedEvidencesCount: safeEvidences.filter(isAssessmentEvidence).length,
    masteryEligibleEvidencesCount: masteryEvidenceIds.length,
    demonstratedSkillsCount: demonstratedCount,
    passedLabsCount: verifiedLabsCount,
    isPedagogicallyDefensible: true,
  };

  return {
    status,
    isEligible,
    hasGraduated,
    requirements,
    satisfiedRequirementsCount: satisfiedRequirements.length,
    totalRequirementsCount: requirements.length,
    demonstratedSkills,
    missingRequirements,
    auditTrail,
    certificate: storedCertificate,
    rank,
    rankTitleAr: rankInfo.titleAr,
    rankIcon: rankInfo.icon,
    averageAccuracy,
  };
}
