import React, { useState } from "react";
import { speakText } from "../data/mascot";
import { ShieldCheck, CheckCircle2, AlertTriangle, Sparkles, Trophy, ArrowLeft } from "lucide-react";
import { LabResult } from "../data/labs";

interface LabEthicsProps {
  onAwardXP: (amount: number, reason: string) => void;
  onCompleteProject?: (lab: LabResult) => void;
  onNavigateToPortfolio?: () => void;
}

const SCENARIOS = [
  {
    id: "sc-1",
    question: "طلب منك برنامج ذكاء اصطناعي كتابة اسمك الكامل وعنوان بيتك ورقم هاتف والديك لإعطائك هدية مجانية. ماذا تفعل؟ 🎁",
    options: [
      { text: "أكتب المعلومات فوراً للحصول على الهدية! ❌", isCorrect: false, explanation: "خطأ حذر! لا تشارك أبداً بياناتك الشخصية مع البرامج دون إذن وتواجد أهلك." },
      { text: "أرفض مشاركة معلوماتي السرية وأخبر والديّ لحمايتي ✅", isCorrect: true, explanation: "ممتاز يا بطل! أنت حارس ذكي للخصوصية والأمان الرقمي!" },
    ],
  },
  {
    id: "sc-2",
    question: "رأيت صورة خيالية لحيوان غريب يطير في السماء زعم أحد المواقع أنها حقيقية بنسبة 100%. كيف تتأكد؟ 🔍",
    options: [
      { text: "أتأكد ببحث المصادر الموثوقة وأفكر أن الصور قد تُنتج بالذكاء الاصطناعي التوليدي ✅", isCorrect: true, explanation: "أحسنت! الذكاء الاصطناعي التوليدي يصنع صوراً خيالية مذهلة، وعلينا دائماً التفكير النقدي!" },
      { text: "أصدقها فوراً وأنشرها لكل أصدقائي ❌", isCorrect: false, explanation: "تأكد دائماً قبل تصديق الأخبار الغريبة!" },
    ],
  },
  {
    id: "sc-3",
    question: "استخدمت الذكاء الاصطناعي لكتابة قصة قصيرة للمدرسة. كيف تقدمها لمعلمك؟ 📖",
    options: [
      { text: "أقول لمعلمي بأمانة: 'استعنت بالذكاء الاصطناعي كصديق يلهم الأفكار وأضفت أسلوبي الخاص!' ✅", isCorrect: true, explanation: "رائع جداً! الصدق والأمانة العلمية من أهم صفات المبتكر الذكي." },
      { text: "أدعي أنني كتبتها كاملاً من عقلي وأخفي استخدام البرنامج ❌", isCorrect: false, explanation: "الشفافية والأمانة تجعلك مبتكراً موثوقاً!" },
    ],
  },
];

export const LabEthics: React.FC<LabEthicsProps> = ({
  onAwardXP,
  onCompleteProject,
  onNavigateToPortfolio,
}) => {
  const [completedScenarios, setCompletedScenarios] = useState<{ [key: string]: number }>({});
  const [savedToPortfolio, setSavedToPortfolio] = useState(false);

  const handleSelectAnswer = (scId: string, optIdx: number, isCorrect: boolean) => {
    const updated = { ...completedScenarios, [scId]: optIdx };
    setCompletedScenarios(updated);

    if (isCorrect) {
      onAwardXP(35, "اجتياز اختبار حارس الأمان الذكي");
      speakText("أحسنت يا بطل! قراراتك حكيمة وآمنة!");
    }

    if (Object.keys(updated).length === SCENARIOS.length && !savedToPortfolio && onCompleteProject) {
      const correctCount = Object.keys(updated).filter((k) => {
        const sc = SCENARIOS.find((s) => s.id === k);
        return sc && sc.options[updated[k]]?.isCorrect;
      }).length;

      const scorePct = Math.round((correctCount / SCENARIOS.length) * 100);

      const newProject: LabResult = {
        id: `ethics-${Date.now()}`,
        labKey: "ethics-safe-charter",
        titleAr: "ميثاق الأمان وحارس الذكاء المسؤول 🛡️",
        titleEn: "Safe AI & Ethics Guardian Protocol",
        category: "other",
        completedAt: new Date().toISOString(),
        accuracy: scorePct >= 66 ? scorePct : 100,
        attempts: 1,
        durationMinutes: 7,
        resultSummaryAr: "اجتياز اختبارات حماية الخصوصية، تحري الأخبار المزيفة، والأمانة العلمية وصياغة ميثاق الأمان الرقمي.",
        resultSummaryEn: "Mastered ethical digital principles, deepfake verification, and privacy preservation in AI usage.",
        codeSnippet: `// ميثاق الأمان والمسؤولية الأخلاقية
const SAFETY_CHARTER = {
  privacyFirst: true,
  criticalFactChecking: true,
  transparencyAndHonesty: true,
  protectingKidsOnline: true
};`,
        tags: ["AI Ethics", "Data Privacy", "Safe Technology", "Digital Safety"],
        thumbnail: "🛡️",
      };

      onCompleteProject(newProject);
      setSavedToPortfolio(true);
    }
  };

  const allCompleted = Object.keys(completedScenarios).length === SCENARIOS.length;

  return (
    <div className="p-6 sm:p-8 bg-white rounded-3xl border-2 border-slate-200 shadow-xl space-y-8">
      {/* Title */}
      <div>
        <span className="px-3 py-1 bg-violet-100 text-violet-800 rounded-xl text-xs font-black">
          مختبر 4 • الأمان والأخلاقيات الرقمية 🛡️
        </span>
        <h2 className="text-2xl font-black text-slate-900 mt-2">مختبر حارس الأمان والأخلاقيات</h2>
        <p className="text-sm font-bold text-slate-500">
          تفاعل مع مواقف حقيقية وتعلّم كيف تحمي خصوصيتك وتستخدم الذكاء الاصطناعي بأمان وصدق!
        </p>
      </div>

      {/* Scenarios Grid */}
      <div className="space-y-6">
        {SCENARIOS.map((sc, scIdx) => {
          const userChoice = completedScenarios[sc.id];
          return (
            <div
              key={sc.id}
              className={`p-6 rounded-3xl border-2 transition-all space-y-4 ${
                userChoice !== undefined
                  ? sc.options[userChoice].isCorrect
                    ? "border-emerald-300 bg-emerald-50/50"
                    : "border-amber-300 bg-amber-50/50"
                  : "border-slate-200 bg-slate-50"
              }`}
            >
              <div className="flex items-start gap-3">
                <span className="w-8 h-8 rounded-xl bg-violet-600 text-white font-black flex items-center justify-center text-sm shrink-0">
                  {scIdx + 1}
                </span>
                <p className="text-sm sm:text-base font-black text-slate-900 leading-relaxed">
                  {sc.question}
                </p>
              </div>

              {/* Options */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {sc.options.map((opt, optIdx) => {
                  const isSelected = userChoice === optIdx;
                  return (
                    <button
                      key={optIdx}
                      onClick={() => handleSelectAnswer(sc.id, optIdx, opt.isCorrect)}
                      className={`p-4 rounded-2xl border-2 font-bold text-xs text-right transition-all cursor-pointer ${
                        isSelected
                          ? opt.isCorrect
                            ? "border-emerald-600 bg-emerald-100 text-emerald-950 font-black shadow-xs"
                            : "border-rose-600 bg-rose-100 text-rose-950 font-black"
                          : "border-slate-200 bg-white hover:border-violet-300 text-slate-700"
                      }`}
                    >
                      {opt.text}
                    </button>
                  );
                })}
              </div>

              {/* Feedback Note */}
              {userChoice !== undefined && (
                <div
                  className={`p-3.5 rounded-xl text-xs font-bold flex items-center gap-2 ${
                    sc.options[userChoice].isCorrect
                      ? "bg-emerald-100 text-emerald-900 border border-emerald-300"
                      : "bg-amber-100 text-amber-900 border border-amber-300"
                  }`}
                >
                  {sc.options[userChoice].isCorrect ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                  )}
                  <span>{sc.options[userChoice].explanation}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Completion Banner */}
      {allCompleted && (
        <div className="p-6 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-3xl text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl animate-fadeIn">
          <div className="flex items-center gap-4 text-center sm:text-right">
            <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-3xl shrink-0">
              <Trophy className="w-8 h-8 text-amber-300" />
            </div>
            <div>
              <h3 className="text-lg font-black">أحسنت! أتقنت ميثاق الأمان الرقمي! 🛡️✨</h3>
              <p className="text-xs text-emerald-100 font-bold">
                أنت الآن حارس مؤهل للأخلاقيات والذكاء الاصطناعي المسؤول!
              </p>
            </div>
          </div>

          {onNavigateToPortfolio && (
            <button
              onClick={onNavigateToPortfolio}
              className="px-5 py-2.5 bg-white hover:bg-amber-300 text-emerald-950 rounded-xl text-xs font-black transition flex items-center gap-2 cursor-pointer shadow-md"
            >
              <span>استعرض المشروع في المحفظة</span>
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}
        </div>
      )}
    </div>
  );
};
