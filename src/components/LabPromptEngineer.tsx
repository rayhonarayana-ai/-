import React, { useState } from "react";
import { speakText } from "../data/mascot";
import { Sparkles, Wand2, Volume2, Loader2, MessageSquareCode, CheckCircle2, ArrowLeft } from "lucide-react";
import { LabResult } from "../data/labs";

interface LabPromptEngineerProps {
  onAwardXP: (amount: number, reason: string) => void;
  onCompleteProject?: (lab: LabResult) => void;
  onNavigateToPortfolio?: () => void;
}

const SUBJECTS = [
  { id: "s1", label: "روبوت فضائي لطيف 🤖", value: "روبوت فضائي صغير ولطيف يرتدي قبعة ذهبية" },
  { id: "s2", label: "قطة مكتشفة 🐱", value: "قطة أليفة تحمل خريطة كنز وساعة رقمية" },
  { id: "s3", label: "ديناصور رسام 🦕", value: "ديناصور ملون يحب الرسم بالفرشاة" },
  { id: "s4", label: "سيارة طائرة 🚗", value: "سيارة ذكية تطير وتعمل بالطاقة الشمسية" },
];

const PLACES = [
  { id: "p1", label: "في الغابة السحرية 🌳", value: "في غابة سحرية مليئة بالأشجار المضيئة" },
  { id: "p2", label: "على سطح المريخ 🚀", value: "على كوكب المريخ بين الرمال الحمراء" },
  { id: "p3", label: "في المدرسة الرقمية 🏫", value: "داخل مدرسة المستقبل الرقمية الذكية" },
  { id: "p4", label: "تحت المحيط 🌊", value: "في أعماق المحيط الهادئ بين الأسماك الملفتة" },
];

const STYLES = [
  { id: "st1", label: "قصة كرتونية مشوقة 📖", value: "قصة كرتونية قصيرة ومرحة للطفل" },
  { id: "st2", label: "وصف رسمة ثلاثية الأبعاد 🎨", value: "وصف مشهد فني ثلاثي الأبعاد بألوان زاهية" },
  { id: "st3", label: "أنشودة قصيرة ممتعة 🎵", value: "أنشودة قصيرة ولطيفة ذات أوزان قافية ممتعة" },
];

const MOODS = [
  { id: "m1", label: "سعيد ومتحمس جداً ⭐", value: "سعيد ومتحمس للتعليم والمغامرة" },
  { id: "m2", label: "حكيم وذكاء خارق 💡", value: "حكيم ومفكر يكتشف أسرار العالم" },
  { id: "m3", label: "مضحك ومستكشف 🌟", value: "مضحك ومملوء بالمواقف اللطيفة" },
];

export const LabPromptEngineer: React.FC<LabPromptEngineerProps> = ({
  onAwardXP,
  onCompleteProject,
  onNavigateToPortfolio,
}) => {
  const [selectedSubject, setSelectedSubject] = useState(SUBJECTS[0]);
  const [selectedPlace, setSelectedPlace] = useState(PLACES[0]);
  const [selectedStyle, setSelectedStyle] = useState(STYLES[0]);
  const [selectedMood, setSelectedMood] = useState(MOODS[0]);

  const [loading, setLoading] = useState(false);
  const [outputResult, setOutputResult] = useState<string | null>(null);
  const [savedToPortfolio, setSavedToPortfolio] = useState(false);

  const handleGeneratePrompt = async () => {
    setLoading(true);
    setOutputResult(null);
    setSavedToPortfolio(false);

    try {
      const res = await fetch("/api/prompt-lab", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: selectedSubject.value,
          setting: selectedPlace.value,
          style: selectedStyle.value,
          emotion: selectedMood.value,
        }),
      });

      if (!res.ok) throw new Error("Failed to generate prompt output.");

      const data = await res.json();
      setOutputResult(data.result);
      onAwardXP(40, "صناعة أمر ذكاء اصطناعي محترف");
      speakText(data.result.slice(0, 150));

      if (onCompleteProject) {
        const assembledPrompt = `[الدور]: كاتب ومبتكر ذكي | [الموضوع]: ${selectedSubject.value} | [المكان]: ${selectedPlace.value} | [الأسلوب]: ${selectedStyle.value} | [المشاعر]: ${selectedMood.value}`;
        const newProject: LabResult = {
          id: `prompt-${Date.now()}`,
          labKey: "prompt-space-story",
          titleAr: `مهندس الأوامر: ${selectedSubject.label.split(" ")[0]} ${selectedPlace.label.split(" ")[0]} 🔮`,
          titleEn: `Prompt Engineering: ${selectedSubject.label.split(" ")[0]}`,
          category: "prompt-engineering",
          completedAt: new Date().toISOString(),
          accuracy: 100,
          attempts: 1,
          durationMinutes: 8,
          resultSummaryAr: `صياغة وهندسة أمر متكامل خماسي العناصر (${selectedSubject.label}) لتوليد استجابة إبداعية دقيقة.`,
          resultSummaryEn: `Crafted 5-part prompt architecture to steer AI text generation for ${selectedSubject.label}.`,
          codeSnippet: `[معادلة صياغة الأوامر الخماسية]
الموضوع: ${selectedSubject.value}
البيئة: ${selectedPlace.value}
الأسلوب: ${selectedStyle.value}
النبرة: ${selectedMood.value}
النتيجة المولدة: ${data.result.slice(0, 80)}...`,
          tags: ["Prompt Engineering", "Generative AI", "Creative Flow", "LLM Control"],
          thumbnail: "🔮",
        };

        onCompleteProject(newProject);
        setSavedToPortfolio(true);
      }
    } catch (err) {
      console.error(err);
      setOutputResult("عذراً! تعذر معالجة الأمر في مختبر الأوامر، حاول تغيير مكعبات الأوامر واضغط مجدداً! 🚀");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 sm:p-8 bg-white rounded-3xl border-2 border-slate-200 shadow-xl space-y-8">
      {/* Title */}
      <div>
        <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-xl text-xs font-black">
          مختبر 2 • هندسة الأوامر (Prompt Engineering) 🔮
        </span>
        <h2 className="text-2xl font-black text-slate-900 mt-2">مختبر مهندس الأوامر الصغير</h2>
        <p className="text-sm font-bold text-slate-500">ركب المكعبات الذكية وشاهد كيف يستجيب الذكاء الاصطناعي لتعليماتك!</p>
      </div>

      {/* Building Blocks Pickers */}
      <div className="space-y-6">
        {/* Block 1: Subject */}
        <div>
          <label className="text-xs font-black text-slate-700 block mb-2">1. اختر بطل القصة (Subject):</label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {SUBJECTS.map((sub) => (
              <button
                key={sub.id}
                onClick={() => setSelectedSubject(sub)}
                className={`p-3 rounded-2xl border-2 text-xs font-black transition-all text-center cursor-pointer ${
                  selectedSubject.id === sub.id ? "border-purple-600 bg-purple-50 text-purple-900 shadow-xs" : "border-slate-200 hover:border-slate-300 text-slate-700"
                }`}
              >
                {sub.label}
              </button>
            ))}
          </div>
        </div>

        {/* Block 2: Setting */}
        <div>
          <label className="text-xs font-black text-slate-700 block mb-2">2. اختر المكان والمحيط (Setting):</label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {PLACES.map((place) => (
              <button
                key={place.id}
                onClick={() => setSelectedPlace(place)}
                className={`p-3 rounded-2xl border-2 text-xs font-black transition-all text-center cursor-pointer ${
                  selectedPlace.id === place.id ? "border-blue-600 bg-blue-50 text-blue-900 shadow-xs" : "border-slate-200 hover:border-slate-300 text-slate-700"
                }`}
              >
                {place.label}
              </button>
            ))}
          </div>
        </div>

        {/* Block 3: Style */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-black text-slate-700 block mb-2">3. اختر الأسلوب الفني (Style):</label>
            <div className="flex flex-col gap-2">
              {STYLES.map((st) => (
                <button
                  key={st.id}
                  onClick={() => setSelectedStyle(st)}
                  className={`p-2.5 rounded-xl border-2 text-xs font-black text-right transition cursor-pointer ${
                    selectedStyle.id === st.id ? "border-amber-500 bg-amber-50 text-amber-900 shadow-xs" : "border-slate-200 text-slate-700"
                  }`}
                >
                  {st.label}
                </button>
              ))}
            </div>
          </div>

          {/* Block 4: Mood */}
          <div>
            <label className="text-xs font-black text-slate-700 block mb-2">4. نبرة المشاعر (Mood):</label>
            <div className="flex flex-col gap-2">
              {MOODS.map((m) => (
                <button
                  key={m.id}
                  onClick={() => setSelectedMood(m)}
                  className={`p-2.5 rounded-xl border-2 text-xs font-black text-right transition cursor-pointer ${
                    selectedMood.id === m.id ? "border-rose-500 bg-rose-50 text-rose-900 shadow-xs" : "border-slate-200 text-slate-700"
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Trigger and Assembled Prompt Preview */}
      <div className="p-6 bg-slate-900 rounded-3xl text-white space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-400">معاينة الأمر المركب (Assembled Prompt):</span>
          <span className="px-2 py-0.5 bg-purple-500/30 text-purple-300 text-[10px] rounded-lg font-mono">
            4 Elements Active
          </span>
        </div>

        <div className="p-4 bg-slate-800 rounded-2xl font-mono text-xs text-purple-200 border border-slate-700 leading-relaxed">
          &quot;اكتب {selectedStyle.value} عن {selectedSubject.value} في {selectedPlace.value} بأسلوب {selectedMood.value}&quot;
        </div>

        <button
          onClick={handleGeneratePrompt}
          disabled={loading}
          className="w-full py-4 bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 disabled:opacity-50 text-white rounded-2xl font-black text-sm transition shadow-lg flex items-center justify-center gap-2 cursor-pointer"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>جاري استجابة وتوليد الذكاء الاصطناعي...</span>
            </>
          ) : (
            <>
              <Wand2 className="w-5 h-5" />
              <span>إرسال الأمر وتوليد الإبداع بالذكاء الاصطناعي 🚀</span>
            </>
          )}
        </button>
      </div>

      {/* Output Display */}
      {outputResult && (
        <div className="p-6 bg-gradient-to-tr from-purple-50 to-indigo-50 rounded-3xl border-2 border-purple-200 space-y-4 animate-fadeIn">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-purple-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-600" />
              النتيجة المولدة بالأمر الذكي:
            </span>
            <button
              onClick={() => speakText(outputResult)}
              className="p-2 text-purple-700 hover:bg-purple-100 rounded-xl transition"
              title="استماع للنتيجة"
            >
              <Volume2 className="w-5 h-5" />
            </button>
          </div>

          <div className="p-5 bg-white rounded-2xl border border-purple-100 text-sm font-bold text-slate-800 leading-relaxed shadow-xs whitespace-pre-wrap">
            {outputResult}
          </div>

          {savedToPortfolio && (
            <div className="p-3 bg-purple-100/80 border border-purple-200 rounded-xl text-xs font-black text-purple-900 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-purple-600" />
                تم توثيق مشروع هندسة الأوامر في محفظتك الرقمية! 🚀
              </span>
              {onNavigateToPortfolio && (
                <button
                  onClick={onNavigateToPortfolio}
                  className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-[11px] font-black transition flex items-center gap-1 cursor-pointer"
                >
                  <span>عرض في المحفظة</span>
                  <ArrowLeft className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
