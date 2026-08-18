import React, { useState } from "react";
import { motion } from "motion/react";
import { LabResult, UserProgress } from "../types";
import { getLabsStats } from "../data/labs";
import { computeLearningPath } from "../data/learningPath";
import { computeGraduationState, RANK_INFO } from "../data/graduation";
import {
  FileText,
  Printer,
  Copy,
  Check,
  Sparkles,
  Heart,
  TrendingUp,
  Target,
  Compass,
  CheckCircle2,
  Calendar,
  Share2,
  Lightbulb,
  Award,
} from "lucide-react";

interface ParentReportPanelProps {
  labs: LabResult[];
  progress: UserProgress;
  childName?: string;
}

export const ParentReportPanel: React.FC<ParentReportPanelProps> = ({
  labs,
  progress,
  childName = "البطل المبتكر",
}) => {
  const [copied, setCopied] = useState(false);
  const stats = getLabsStats(labs);
  const learningLevels = computeLearningPath(labs);
  const graduation = computeGraduationState(labs, childName);
  const currentRankInfo = RANK_INFO[graduation.rank];

  const currentDate = new Date().toLocaleDateString("ar-EG", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // Calculate Growth Mindset strengths dynamically
  const strengths: string[] = [];
  if (stats.averageAccuracy >= 95) {
    strengths.push("دقة استثنائية في تدريب النماذج الرياضية واستخراج الميزات البصرية.");
  }
  if (stats.byCategory["python-code"] > 0) {
    strengths.push("شغف لافت بالتفكير الخوارزمي وكتابة كود بايثون الحقيقي واستخدام الحلقات التكرارية.");
  }
  if (stats.byCategory["prompt-engineering"] > 0) {
    strengths.push("إتقان هندسة الأوامر وتوجيه النماذج التوليدية بأسلوب محكم وخالٍ من الهلوسة.");
  }
  if (stats.byCategory.classification > 0 || stats.byCategory["computer-vision"] > 0) {
    strengths.push("استيعاب عميق لمفاهيم التعلّم الإشرافي وتحليل مصفوفات البكسلات في الصور.");
  }
  if (strengths.length === 0) {
    strengths.push("حماس واستكشاف مستمر وتجربة أدوات الذكاء الاصطناعي بفضول علمي رائع.");
  }

  // Growth areas (framed purely in Growth Mindset)
  const growthOpportunities: string[] = [];
  if (stats.byCategory["python-code"] < 2) {
    growthOpportunities.push("فرصة رائعة للتوسع في تجارب كود بايثون بالمستوى الثالث لبناء خوارزميات أعمق.");
  }
  if (stats.byCategory["prompt-engineering"] < 2) {
    growthOpportunities.push("مساحة ممتعة لصياغة أوامر توليدية لقصص وألعاب إضافية بالتعاون مع المساعد زكي.");
  }
  if (stats.byCategory["computer-vision"] < 2) {
    growthOpportunities.push("استكشاف إضافي لكاميرا الرؤية الحاسوبية وكشف معالم الوجوه والأشياء المحيطة.");
  }
  if (growthOpportunities.length === 0) {
    growthOpportunities.push("جاهز تماماً لخوض مشروع التخرج الكبير (Capstone Project) والحصول على الاعتماد الرسمي!");
  }

  // Practical home activities (<10 mins)
  const homeActivities = [
    {
      title: "لعبة مصنف الأشياء العائلي 🍎🍊",
      duration: "5 دقائق",
      desc: "اطلب من طفلك تصنيف أغراض المطبخ وفق ميزتين محددتين (اللون والملمس) ليشرح لك كيف يفكر نموذج التعلّم الآلي.",
    },
    {
      title: "صياغة أمر ذكي مشترك 🔮",
      duration: "7 دقائق",
      desc: "اكتبوا معاً أمراً خماسياً للذكاء الاصطناعي لصناعة وصفة طعام مرحة أو قصة قبل النوم مع وضع قيود كوميدية.",
    },
    {
      title: "كشف الزوايا في المنزل 📐",
      duration: "5 دقائق",
      desc: "ابحثوا عن الأشكال الهندسية في الغرفة وناقشوا كيف تستخدم برامج بايثون الزوايا (مثل 90° للمربع و144° للنجمة) لرسم العوالم الرقمية.",
    },
  ];

  // Full formatted report text for WhatsApp / Copy
  const fullReportText = `📋 تقرير ولي الأمر البيداغوجي – منصة «مُعَلِّمُ الذَّكَاءِ» 🤖
📅 تاريخ التقرير: ${currentDate}
👦 اسم البطل المبتكر: ${childName}
🏆 الرتبة الحالية: ${currentRankInfo.titleAr}
📊 المشاريع المنجزة: ${labs.length} مشاريع موثقة
🎯 متوسط دقة النماذج: ${stats.averageAccuracy}%

1️⃣ ملخص التقدم:
أظهر ${childName} التزاماً متميزاً وفهماً عملياً لأساسيات الذكاء الاصطناعي.

2️⃣ سجل المشاريع المنفذة:
${labs
  .map(
    (l, idx) =>
      `${idx + 1}. ${l.thumbnail || "🚀"} ${l.titleAr} (الدقة: ${l.accuracy || 95}%)`
  )
  .join("\n")}

3️⃣ نقاط القوة التي برزت:
${strengths.map((s) => `• ${s}`).join("\n")}

4️⃣ فرص النمو والتطور القادمة:
${growthOpportunities.map((g) => `• ${g}`).join("\n")}

5️⃣ مقترحات عملية للمنزل:
• ${homeActivities[0].title}: ${homeActivities[0].desc}

صُدر عبر منصة «مُعَلِّمُ الذَّكَاءِ» للأطفال 🌟`;

  const handleCopyReport = () => {
    navigator.clipboard.writeText(fullReportText);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto" dir="rtl">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-amber-600 via-orange-600 to-indigo-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-white/20 text-amber-200 border border-white/20">
            <Heart className="w-4 h-4 text-rose-300 fill-rose-300" />
            <span>تقرير ولي الأمر التربوي والملاحظات البيداغوجية 👨‍👩‍👧</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black">
            تقرير إنجازات وتطور {childName}
          </h2>

          <p className="text-xs sm:text-sm text-amber-100 max-w-xl">
            تقرير تحليلي واقعي مبني على بيانات تدريب حقيقية، بصياغة قائمة على عقلية النمو (Growth Mindset) لمشاركة فخر الإنجاز.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={handleCopyReport}
            className="px-4 py-2.5 bg-white text-slate-900 hover:bg-amber-100 rounded-xl text-xs font-black transition cursor-pointer flex items-center gap-1.5 shadow-md"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? "تم النسخ بنجاح!" : "نسخ التقرير للواتساب"}</span>
          </button>

          <button
            onClick={handlePrint}
            className="px-4 py-2.5 bg-white/20 hover:bg-white/30 text-white rounded-xl text-xs font-black border border-white/20 transition cursor-pointer flex items-center gap-1.5"
          >
            <Printer className="w-4 h-4" />
            <span>طباعة / حفظ PDF</span>
          </button>
        </div>
      </div>

      {/* Printable Report Container */}
      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-md space-y-8 print:p-0 print:border-none print:shadow-none">
        {/* Section 1: Progress Summary */}
        <div className="border-b border-slate-100 pb-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg sm:text-xl font-black text-slate-900 flex items-center gap-2">
              <span className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center text-sm font-bold">
                1
              </span>
              <span>ملخص التقدم ومؤشرات الإتقان:</span>
            </h3>
            <span className="text-xs text-slate-500 font-medium">تاريخ الرصد: {currentDate}</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-center">
              <span className="block text-[11px] font-bold text-slate-500">المشاريع المنجزة</span>
              <span className="text-2xl font-black text-indigo-600 font-mono">
                {labs.length}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-center">
              <span className="block text-[11px] font-bold text-slate-500">متوسط الدقة</span>
              <span className="text-2xl font-black text-emerald-600 font-mono">
                {stats.averageAccuracy}%
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-center">
              <span className="block text-[11px] font-bold text-slate-500">الرتبة المكتسبة</span>
              <span className="text-xs font-black text-purple-700 block mt-1">
                {currentRankInfo.icon} {currentRankInfo.titleAr}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-center">
              <span className="block text-[11px] font-bold text-slate-500">المستويات المكتملة</span>
              <span className="text-2xl font-black text-amber-600 font-mono">
                {learningLevels.filter((l) => l.status === "completed").length} / 3
              </span>
            </div>
          </div>
        </div>

        {/* Section 2: Real Lab Projects Record */}
        <div className="border-b border-slate-100 pb-6 space-y-4">
          <h3 className="text-lg sm:text-xl font-black text-slate-900 flex items-center gap-2">
            <span className="w-8 h-8 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center text-sm font-bold">
              2
            </span>
            <span>ماذا تعلم طفلك؟ (سجل المشاريع المنفذة):</span>
          </h3>

          <div className="space-y-3">
            {labs.map((lab, index) => (
              <div
                key={lab.id || index}
                className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="flex items-start gap-3">
                  <span className="text-2xl">{lab.thumbnail || "🚀"}</span>
                  <div>
                    <h4 className="font-black text-sm text-slate-900">{lab.titleAr}</h4>
                    <p className="text-xs text-slate-600 mt-0.5">{lab.resultSummaryAr}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                  <span className="text-xs font-black px-2.5 py-1 rounded-xl bg-emerald-100 text-emerald-800 border border-emerald-200">
                    دقة {lab.accuracy || 95}%
                  </span>
                  <span className="text-xs font-bold px-2 py-1 rounded-xl bg-slate-200 text-slate-700">
                    {lab.attempts || 1} محاولات
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section 3: Observed Strengths */}
        <div className="border-b border-slate-100 pb-6 space-y-4">
          <h3 className="text-lg sm:text-xl font-black text-slate-900 flex items-center gap-2">
            <span className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center text-sm font-bold">
              3
            </span>
            <span>نقاط القوة التي برزت في رحلة التعلّم:</span>
          </h3>

          <div className="space-y-2">
            {strengths.map((str, idx) => (
              <div
                key={idx}
                className="flex items-start gap-3 p-3.5 rounded-2xl bg-emerald-50/60 border border-emerald-200/80"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <p className="text-xs sm:text-sm text-emerald-950 font-bold leading-relaxed">{str}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Section 4: Gentle Growth Opportunities */}
        <div className="border-b border-slate-100 pb-6 space-y-4">
          <h3 className="text-lg sm:text-xl font-black text-slate-900 flex items-center gap-2">
            <span className="w-8 h-8 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center text-sm font-bold">
              4
            </span>
            <span>مجالات يمكن دعمها بلطف (عقلية النمو):</span>
          </h3>

          <div className="space-y-2">
            {growthOpportunities.map((opp, idx) => (
              <div
                key={idx}
                className="flex items-start gap-3 p-3.5 rounded-2xl bg-purple-50/60 border border-purple-200/80"
              >
                <Sparkles className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                <p className="text-xs sm:text-sm text-purple-950 font-bold leading-relaxed">{opp}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Section 5: Practical Family Home Activities */}
        <div className="border-b border-slate-100 pb-6 space-y-4">
          <h3 className="text-lg sm:text-xl font-black text-slate-900 flex items-center gap-2">
            <span className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center text-sm font-bold">
              5
            </span>
            <span>أنشطة منزلية مقترحة سريعة (&lt; 10 دقائق):</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            {homeActivities.map((act, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200 space-y-1.5"
              >
                <div className="flex items-center justify-between text-xs font-black text-amber-900">
                  <span>{act.title}</span>
                  <span className="text-[10px] bg-amber-200 text-amber-900 px-2 py-0.5 rounded-full">
                    {act.duration}
                  </span>
                </div>
                <p className="text-[11px] text-amber-800 leading-relaxed font-medium">
                  {act.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Section 6: Next Period & Graduation Outlook */}
        <div className="space-y-4">
          <h3 className="text-lg sm:text-xl font-black text-slate-900 flex items-center gap-2">
            <span className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-800 flex items-center justify-center text-sm font-bold">
              6
            </span>
            <span>نظرة على الفترة القادمة وشروط التخرج:</span>
          </h3>

          <div className="p-5 rounded-2xl bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1">
              <h4 className="font-black text-sm text-indigo-950">
                الهدف القادم: رتبة مطور صغير معتمد في الذكاء الاصطناعي 🎓
              </h4>
              <p className="text-xs text-indigo-800 leading-relaxed">
                {graduation.canGraduate
                  ? "البطل مؤهل رسمياً للتخرج واستلام الشهادة الرسمية الموثقة!"
                  : `متبقي ${graduation.projectsToYoungDeveloper} مشاريع إضافية لإتمام شرط التخرج الرسمي والحصول على شهادة المطور الصغير المعتمدة.`}
              </p>
            </div>

            <div className="text-center shrink-0">
              <span className="block text-2xl font-black text-indigo-600 font-mono">
                {labs.length} / 6
              </span>
              <span className="text-[10px] font-bold text-slate-500">مشاريع للتخرج</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
