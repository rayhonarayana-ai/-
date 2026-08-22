import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { LabResult, Certificate, UserProgress } from "../types";
import {
  generateCertificate,
  getCertificateShareText,
  getPortfolioShareSummary,
  RANK_INFO,
} from "../data/graduation";
import {
  evaluateGraduation,
  issueOfficialCertificate,
} from "../domain/graduation";
import { loadLearningEvidences } from "../utils/learningEvidence";
import {
  loadCertificate,
  saveCertificate,
  clearCertificate,
} from "../data/storage";
import {
  GraduationCap,
  Award,
  Sparkles,
  CheckCircle2,
  Lock,
  Printer,
  Copy,
  Check,
  Share2,
  RotateCcw,
  Target,
  ArrowRight,
  ShieldCheck,
  Download,
  Flame,
  FileCheck,
} from "lucide-react";

interface GraduationPanelProps {
  labs: LabResult[];
  progress: UserProgress;
  onNavigateToLabs: () => void;
  onNavigateToPath: () => void;
  childName?: string;
}

export const GraduationPanel: React.FC<GraduationPanelProps> = ({
  labs,
  progress,
  onNavigateToLabs,
  onNavigateToPath,
  childName = "البطل المبتكر",
}) => {
  const [storedCert, setStoredCert] = useState<Certificate | null>(() => loadCertificate());
  const [copiedShare, setCopiedShare] = useState<boolean>(false);
  const [copiedPortfolio, setCopiedPortfolio] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const evidences = loadLearningEvidences();
  const evaluation = evaluateGraduation({
    evidences,
    labs,
    storedCertificate: storedCert,
    childName,
  });

  const currentRankInfo = RANK_INFO[evaluation.rank];

  useEffect(() => {
    setStoredCert(loadCertificate());
  }, []);

  const handleIssueCertificate = () => {
    try {
      const cert = issueOfficialCertificate(evaluation, {
        childName,
        labs,
        levelsCompleted: 3,
      });
      saveCertificate(cert);
      setStoredCert(cert);
      showToast("🎉 مبروك! تم إصدار وتوثيق شهادة التخرج الرسمية بنجاح!");
    } catch (err: any) {
      showToast(err?.message || "تعذر إصدار الشهادة لعدم استيفاء الشروط.");
    }
  };

  const handleClearCert = () => {
    clearCertificate();
    setStoredCert(null);
    showToast("تمت إعادة ضبط الشهادة 🔄");
  };

  const handleCopyCertificateText = () => {
    if (!storedCert) return;
    const text = getCertificateShareText(storedCert);
    navigator.clipboard.writeText(text);
    setCopiedShare(true);
    setTimeout(() => setCopiedShare(false), 3000);
    showToast("تم نسخ نص الشهادة للمشاركة 📋✨");
  };

  const handleCopyPortfolioText = () => {
    const text = getPortfolioShareSummary(childName, labs, currentRankInfo.titleAr);
    navigator.clipboard.writeText(text);
    setCopiedPortfolio(true);
    setTimeout(() => setCopiedPortfolio(false), 3000);
    showToast("تم نسخ ملخص محفظة المشاريع للمعلم والوالدين 📁✨");
  };

  const handlePrint = () => {
    window.print();
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto" dir="rtl">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 left-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-xl border border-slate-700 text-xs sm:text-sm font-black flex items-center gap-2 animate-bounce">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-amber-600 via-orange-600 to-indigo-950 rounded-3xl p-6 sm:p-10 text-white shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-white/20 text-amber-200 border border-white/30">
              <GraduationCap className="w-4 h-4" />
              <span>أكاديمية الذكاء الاصطناعي للأطفال 🎓</span>
            </div>

            <h2 className="text-2xl sm:text-4xl font-black">
              نظام التخرج ورتب المطور الصغير
            </h2>

            <p className="text-xs sm:text-sm text-amber-100 leading-relaxed">
              كل مشروع تبنيه يرفع رتبتك من مستكشف إلى بانٍ صغير وصولاً إلى التتويج كـ «مطور صغير للذكاء الاصطناعي» مع شهادة إنجاز تفاعلية برقم تسلسلي خاص!
            </p>
          </div>

          {/* Current Rank Card */}
          <div className="w-full md:w-auto bg-white/15 backdrop-blur-md rounded-2xl p-5 border border-white/25 text-center min-w-[220px]">
            <span className="text-xs text-amber-200 block mb-1 font-bold">الرتبة الحالية المكتسبة</span>
            <div className="text-3xl my-1">{currentRankInfo.icon}</div>
            <h3 className="text-base sm:text-lg font-black text-white">{currentRankInfo.titleAr}</h3>
            <span className="text-[11px] text-amber-200 block mt-1">
              {labs.length} مشاريع موثقة
            </span>
          </div>
        </div>
      </div>

      {/* 3 Developer Ranks Visual Ladder */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
        <h3 className="text-lg sm:text-xl font-black text-slate-900 flex items-center gap-2">
          <Award className="w-5 h-5 text-amber-500" />
          <span>مسار الرتب والإنجاز التعليمي:</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {(["explorer", "builder", "young-developer"] as const).map((rankKey, idx) => {
            const info = RANK_INFO[rankKey];
            const isCurrent = evaluation.rank === rankKey;
            const isUnlocked =
              (rankKey === "explorer" && labs.length >= 0) ||
              (rankKey === "builder" && labs.length >= 3) ||
              (rankKey === "young-developer" && labs.length >= 6);

            return (
              <div
                key={rankKey}
                className={`p-5 rounded-2xl border transition-all flex flex-col justify-between space-y-3 relative overflow-hidden ${
                  isCurrent
                    ? "bg-amber-50/70 border-amber-300 ring-2 ring-amber-400/40 shadow-md"
                    : isUnlocked
                    ? "bg-slate-50 border-slate-200"
                    : "bg-slate-100 border-slate-200 opacity-60"
                }`}
              >
                {isCurrent && (
                  <span className="absolute top-2 left-2 text-[10px] font-black px-2 py-0.5 rounded-md bg-amber-500 text-slate-950 shadow-2xs">
                    رتبتك الحالية ⭐
                  </span>
                )}

                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-3xl">{info.icon}</span>
                    <div>
                      <h4 className="font-black text-sm text-slate-900">{info.titleAr}</h4>
                      <span className="text-[11px] text-slate-500">{info.minProjects} - {info.maxProjects === 999 ? "فأكثر" : `${info.maxProjects} مشاريع`}</span>
                    </div>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {info.descriptionAr}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between text-xs font-bold">
                  <span>حالة الرتبة:</span>
                  <span className={isUnlocked ? "text-emerald-700 font-black" : "text-slate-500"}>
                    {isUnlocked ? "مفتوحة ومحققة ✓" : "تتطلب المزيد من المشاريع"}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Graduation Status & Certificate Issuance Block */}
      <div className="space-y-6">
        {storedCert ? (
          /* Certificate Already Issued Card */
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-6"
          >
            {/* Action Bar above Certificate */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900 text-white p-4 rounded-2xl">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <span className="font-black text-xs sm:text-sm">
                  تم اعتماد وتوثيق شهادة التخرج الرسمية برقم: {storedCert.serialNumber}
                </span>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={handleCopyCertificateText}
                  className="px-3.5 py-1.5 bg-white/15 hover:bg-white/25 rounded-xl text-xs font-black transition cursor-pointer flex items-center gap-1.5"
                >
                  {copiedShare ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedShare ? "تم نسخ النص!" : "نسخ نص الشهادة"}</span>
                </button>

                <button
                  onClick={handleCopyPortfolioText}
                  className="px-3.5 py-1.5 bg-white/15 hover:bg-white/25 rounded-xl text-xs font-black transition cursor-pointer flex items-center gap-1.5"
                >
                  {copiedPortfolio ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
                  <span>{copiedPortfolio ? "تم نسخ الملخص!" : "مشاركة المحفظة"}</span>
                </button>

                <button
                  onClick={handlePrint}
                  className="px-4 py-1.5 bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-xl text-xs font-black transition cursor-pointer flex items-center gap-1.5 shadow-xs"
                >
                  <Printer className="w-4 h-4" />
                  <span>طباعة الشهادة 🖨️</span>
                </button>
              </div>
            </div>

            {/* Visual Digital Graduation Certificate (Printable) */}
            <div className="relative bg-gradient-to-br from-amber-50 via-white to-amber-50/50 rounded-3xl p-8 sm:p-14 border-8 border-double border-amber-300 shadow-2xl text-center space-y-6 print:border-none print:shadow-none">
              {/* Header Seal */}
              <div className="flex items-center justify-between border-b-2 border-amber-200 pb-6">
                <div className="text-right">
                  <span className="text-xs font-black text-amber-800 tracking-wider uppercase block">
                    Moallem Al-Zaka Academy
                  </span>
                  <span className="text-[11px] text-slate-500 font-mono">
                    الرقم التسلسلي: {storedCert.serialNumber}
                  </span>
                </div>

                <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-amber-400 via-yellow-300 to-amber-500 flex items-center justify-center text-3xl shadow-lg border-4 border-white">
                  🎓
                </div>

                <div className="text-left">
                  <span className="text-xs font-black text-amber-800 block">
                    أكاديمية الذكاء الاصطناعي للأطفال
                  </span>
                  <span className="text-[11px] text-slate-500">
                    تاريخ الإصدار: {new Date(storedCert.issuedAt).toLocaleDateString("ar-EG")}
                  </span>
                </div>
              </div>

              {/* Certificate Title */}
              <div className="space-y-2 pt-2">
                <h3 className="text-xs font-black text-amber-700 tracking-widest uppercase">
                  شهادة تخرج واعتماد رسمي
                </h3>
                <h2 className="text-2xl sm:text-4xl font-black text-slate-900">
                  مُطَوِّرُ صَغِيرٌ مُعْتَمَدٌ فِي الذَّكَاءِ الاصْطِنَاعِيّ
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 max-w-lg mx-auto">
                  تُمنح هذه الشهادة الرسمية تقديراً للاجتياز المتميز للمسار العملي التطبيقي وبناء نماذج تعلّم آلي حقيقية
                </p>
              </div>

              {/* Child Name Highlight */}
              <div className="py-4">
                <span className="text-xs text-slate-500 block mb-1">تُشهد الأكاديمية بأن البطل/ة المبتكر/ة:</span>
                <h1 className="text-3xl sm:text-5xl font-black text-indigo-900 tracking-tight font-serif">
                  {storedCert.childName}
                </h1>
                <div className="w-48 h-1 bg-gradient-to-r from-transparent via-amber-400 to-transparent mx-auto mt-2" />
              </div>

              {/* Metrics & Highlights */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-2 max-w-2xl mx-auto">
                <div className="p-3 rounded-2xl bg-amber-100/60 border border-amber-200 text-center">
                  <span className="text-[10px] font-bold text-amber-900 block">الرتبة الممنوحة</span>
                  <span className="text-xs font-black text-amber-950">{storedCert.rankTitleAr}</span>
                </div>

                <div className="p-3 rounded-2xl bg-amber-100/60 border border-amber-200 text-center">
                  <span className="text-[10px] font-bold text-amber-900 block">المشاريع المنجزة</span>
                  <span className="text-xs font-black text-indigo-900 font-mono">{storedCert.totalProjects} مشاريع</span>
                </div>

                <div className="p-3 rounded-2xl bg-amber-100/60 border border-amber-200 text-center">
                  <span className="text-[10px] font-bold text-amber-900 block">متوسط دقة التقييمات</span>
                  <span className="text-xs font-black text-emerald-900 font-mono">{storedCert.averageAccuracy}%</span>
                </div>

                <div className="p-3 rounded-2xl bg-amber-100/60 border border-amber-200 text-center">
                  <span className="text-[10px] font-bold text-amber-900 block">المستويات المكتملة</span>
                  <span className="text-xs font-black text-purple-900 font-mono">{storedCert.levelsCompleted} من 3</span>
                </div>
              </div>

              {/* Signature Seals */}
              <div className="border-t-2 border-amber-200 pt-6 flex items-center justify-between text-xs text-slate-700 font-bold">
                <div className="space-y-1">
                  <span>المساعد الذكي زكي 🤖</span>
                  <span className="block text-[10px] text-slate-400 font-normal">كبير المرشدين البيداغوجيين</span>
                </div>

                <div className="w-20 h-20 rounded-full border-2 border-dashed border-amber-400 flex items-center justify-center text-[10px] text-amber-800 font-black rotate-[-12deg] bg-amber-50">
                  ختم الاعتماد الرسمي ⭐
                </div>

                <div className="space-y-1">
                  <span>إدارة أكاديمية مُعَلِّم الذَّكَاء</span>
                  <span className="block text-[10px] text-slate-400 font-normal">منصة تعليم الذكاء الاصطناعي للأطفال</span>
                </div>
              </div>
            </div>
          </motion.div>
        ) : evaluation.isEligible ? (
          /* Eligible to graduate - Big Celebration Prompt */
          <div className="bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-900 rounded-3xl p-8 sm:p-12 text-white text-center space-y-6 shadow-2xl">
            <div className="w-24 h-24 mx-auto rounded-3xl bg-amber-400 text-slate-950 flex items-center justify-center text-5xl shadow-xl animate-bounce">
              🎓
            </div>

            <div className="space-y-2 max-w-xl mx-auto">
              <span className="text-xs font-black px-3 py-1 rounded-full bg-white/20 text-amber-300">
                استحقاق التخرج الرسمي محقق بالأدلة التقييمية 100% ⭐
              </span>
              <h3 className="text-2xl sm:text-4xl font-black">
                مبروك يا {childName}! أنت مؤهل الآن للتخرج
              </h3>
              <p className="text-xs sm:text-sm text-purple-200 leading-relaxed">
                لقد استوفيت كافة متطلبات الإتقان وأدلة التقييم المعتمدة بمعدل دقة {evaluation.averageAccuracy}%. اضغط أدناه لإصدار وتوثيق شهادتك الرسمية فوراً!
              </p>
            </div>

            <button
              onClick={handleIssueCertificate}
              className="px-8 py-4 bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-sm sm:text-base rounded-2xl transition cursor-pointer shadow-xl shadow-amber-500/20 inline-flex items-center gap-2 transform hover:scale-105 active:scale-95"
            >
              <GraduationCap className="w-5 h-5" />
              <span>إصدار وتوثيق شهادة المطور الصغير الآن 🎓</span>
            </button>
          </div>
        ) : (
          /* Not yet eligible - Detailed Evidence-Based Requirements Roadmap */
          <div className="bg-slate-50 rounded-3xl p-6 sm:p-8 border border-slate-200 space-y-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center text-2xl shrink-0">
                🧭
              </div>
              <div className="space-y-1">
                <h4 className="text-base sm:text-lg font-black text-slate-900">
                  شروط التخرج والاعتماد المبني على الأدلة التقييمية:
                </h4>
                <p className="text-xs sm:text-sm text-slate-600">
                  القاعدة الأكاديمية: شهادة التخرج تُمنح حصراً بناءً على كفاءات مثبتة ومشاريع مقيّمة (XP ≠ Mastery).
                </p>
              </div>
            </div>

            {/* Explicit Requirements Checklist */}
            <div className="space-y-3">
              {evaluation.requirements.map((req) => (
                <div
                  key={req.key}
                  className={`p-4 rounded-2xl border transition-all ${
                    req.isSatisfied
                      ? "bg-emerald-50/60 border-emerald-300 text-emerald-950"
                      : "bg-white border-slate-200 text-slate-800"
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        {req.isSatisfied ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                        ) : (
                          <Lock className="w-4 h-4 text-slate-400 shrink-0" />
                        )}
                        <h5 className="text-sm font-black">{req.titleAr}</h5>
                      </div>
                      <p className="text-xs text-slate-500 mr-7">{req.descriptionAr}</p>
                    </div>

                    <div className="flex items-center gap-2 self-start sm:self-center mr-7 sm:mr-0">
                      <span
                        className={`text-xs font-mono font-black px-2.5 py-1 rounded-xl ${
                          req.isSatisfied
                            ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                            : "bg-slate-100 text-slate-700 border border-slate-200"
                        }`}
                      >
                        {req.currentValue} / {req.targetValue} {req.unitAr}
                      </span>
                      <span
                        className={`text-[11px] font-black px-2 py-0.5 rounded-lg ${
                          req.isSatisfied
                            ? "bg-emerald-200 text-emerald-900"
                            : "bg-amber-100 text-amber-900"
                        }`}
                      >
                        {req.isSatisfied ? "مُستوفى ✓" : "قيد الإنجاز"}
                      </span>
                    </div>
                  </div>

                  {/* Requirement Progress Bar */}
                  <div className="mt-3 mr-7 sm:mr-0">
                    <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        style={{
                          width: `${Math.min(100, (req.currentValue / req.targetValue) * 100)}%`,
                        }}
                        className={`h-full rounded-full transition-all duration-500 ${
                          req.isSatisfied ? "bg-emerald-500" : "bg-indigo-600"
                        }`}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-2 flex flex-wrap items-center gap-3">
              <button
                onClick={onNavigateToLabs}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black transition cursor-pointer flex items-center gap-1.5 shadow-md"
              >
                <span>خوض تجربة مختبر جديدة 🧪</span>
              </button>

              <button
                onClick={onNavigateToPath}
                className="px-4 py-2.5 bg-white border border-slate-300 hover:bg-slate-100 text-slate-800 rounded-xl text-xs font-black transition cursor-pointer flex items-center gap-1.5"
              >
                <span>استعراض المسار التعليمي 🚀</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
