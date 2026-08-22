import { Certificate, LabResult } from "../../types";
import { GraduationEvaluation } from "./types";
import { generateCertificateSerial } from "../../data/graduation";

export class GraduationEligibilityError extends Error {
  constructor(message: string = "Cannot issue certificate: learner has not satisfied all auditable graduation requirements.") {
    super(message);
    this.name = "GraduationEligibilityError";
  }
}

export interface IssueCertificateOptions {
  childName?: string;
  labs?: LabResult[];
  levelsCompleted?: number;
}

/**
 * Issues an official graduation certificate strictly gated by auditable graduation evaluation.
 * 
 * INVARIANT: If evaluation is not eligible and not already graduated, throws GraduationEligibilityError.
 */
export function issueOfficialCertificate(
  evaluation: GraduationEvaluation,
  options: IssueCertificateOptions = {}
): Certificate {
  if (!evaluation.isEligible && !evaluation.hasGraduated) {
    const missingTitles = evaluation.missingRequirements
      .map((r) => r.titleAr)
      .join("، ");
    throw new GraduationEligibilityError(
      `لا يمكن إصدار شهادة التخرج الرسمية قبل استيفاء جميع المتطلبات التعليمية الموثقة بأدلة تقييمية. المتطلبات الناقصة: ${missingTitles}`
    );
  }

  const rawName = options.childName || "البطل المبتكر";
  const sanitizedChildName = rawName.trim().slice(0, 50) || "البطل المبتكر";
  const labs = options.labs || [];
  const levelsCompleted = options.levelsCompleted ?? (evaluation.isEligible ? 3 : 1);

  const highlightProjects = labs
    .slice(0, 4)
    .map(
      (l) =>
        `${l.thumbnail || "🚀"} ${l.titleAr} (${l.accuracy !== undefined ? `${l.accuracy}%` : "مكتمل"})`
    );

  const serial = generateCertificateSerial(sanitizedChildName);

  const certificate: Certificate = {
    id: `cert-${Date.now()}`,
    childName: sanitizedChildName,
    titleAr: "شهادة إنجاز وتخرج مطور الذكاء الاصطناعي الصغير",
    issuedAt: new Date().toISOString(),
    totalProjects: Math.max(labs.length, evaluation.auditTrail.passedLabsCount),
    averageAccuracy: evaluation.averageAccuracy,
    levelsCompleted,
    rank: evaluation.rank,
    rankTitleAr: evaluation.rankTitleAr,
    highlightProjects:
      highlightProjects.length > 0
        ? highlightProjects
        : ["مختبر تدريب المصنف الذكي", "مختبر الرؤية الحاسوبية", "مختبر هندسة الأوامر"],
    serialNumber: serial,
  };

  return certificate;
}
