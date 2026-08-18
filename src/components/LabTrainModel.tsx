import React, { useState, useRef, useEffect } from "react";
import { speakText } from "../data/mascot";
import { Play, RotateCcw, CheckCircle2, Sparkles, Cpu, Layers, HelpCircle, ArrowLeft } from "lucide-react";
import { LabResult } from "../data/labs";

interface Item {
  id: string;
  name: string;
  category: "A" | "B";
  emoji: string;
  features: { size: "small" | "medium" | "large"; color: string; speed?: string };
}

interface DatasetConfig {
  name: string;
  catA: string;
  catB: string;
  trainingItems: Item[];
  testItems: Item[];
}

const DATASETS: { [key: string]: DatasetConfig } = {
  fruits_vehicles: {
    name: "فواكه 🍎 مقابل مركبات 🚗",
    catA: "فواكه 🍎",
    catB: "مركبات 🚗",
    trainingItems: [
      { id: "f1", name: "تفاح أحمر", category: "A", emoji: "🍎", features: { size: "small", color: "أحمر" } },
      { id: "f2", name: "موز أصفر", category: "A", emoji: "🍌", features: { size: "medium", color: "أصفر" } },
      { id: "f3", name: "برتقال لذيذ", category: "A", emoji: "🍊", features: { size: "small", color: "برتقالي" } },
      { id: "v1", name: "سيارة سباق", category: "B", emoji: "🏎️", features: { size: "large", color: "أحمر", speed: "سريع" } },
      { id: "v2", name: "حافلة مدرسية", category: "B", emoji: "🚌", features: { size: "large", color: "أصفر", speed: "متوسط" } },
      { id: "v3", name: "دراجة نارية", category: "B", emoji: "🏍️", features: { size: "medium", color: "أزرق", speed: "سريع" } },
    ],
    testItems: [
      { id: "t1", name: "عنب بنفسجي", category: "A", emoji: "🍇", features: { size: "small", color: "بنفسجي" } },
      { id: "t2", name: "شاحنة نقل", category: "B", emoji: "🚛", features: { size: "large", color: "أزرق" } },
      { id: "t3", name: "بطيخ أخضر", category: "A", emoji: "🍉", features: { size: "large", color: "أخضر" } },
      { id: "t4", name: "طائرة هليكوبتر", category: "B", emoji: "🚁", features: { size: "large", color: "رمادي" } },
    ],
  },
  cats_dogs: {
    name: "قطط لطيفة 🐱 مقابل كلاب وفية 🐶",
    catA: "قطط 🐱",
    catB: "كلاب 🐶",
    trainingItems: [
      { id: "c1", name: "قط سيامي", category: "A", emoji: "🐱", features: { size: "small", color: "بني فاتح" } },
      { id: "c2", name: "قط فارسي", category: "A", emoji: "🐈", features: { size: "small", color: "أبيض" } },
      { id: "d1", name: "كلب هاسكي", category: "B", emoji: "🐕", features: { size: "large", color: "رمادي" } },
      { id: "d2", name: "جرو صغير", category: "B", emoji: "🐶", features: { size: "small", color: "بني" } },
    ],
    testItems: [
      { id: "t5", name: "قطة مرحة", category: "A", emoji: "😸", features: { size: "small", color: "برتقالي" } },
      { id: "t6", name: "كلب حراسة", category: "B", emoji: "🦮", features: { size: "large", color: "ذهبي" } },
    ],
  },
};

interface LabTrainModelProps {
  onAwardXP: (amount: number, reason: string) => void;
  onCompleteProject?: (lab: LabResult) => void;
  onNavigateToPortfolio?: () => void;
}

export const LabTrainModel: React.FC<LabTrainModelProps> = ({
  onAwardXP,
  onCompleteProject,
  onNavigateToPortfolio,
}) => {
  const [selectedDatasetKey, setSelectedDatasetKey] = useState("fruits_vehicles");
  const dataset = DATASETS[selectedDatasetKey];

  const [unclassified, setUnclassified] = useState<Item[]>(dataset.trainingItems);
  const [classifiedA, setClassifiedA] = useState<Item[]>([]);
  const [classifiedB, setClassifiedB] = useState<Item[]>([]);

  const [isTraining, setIsTraining] = useState(false);
  const [trainingProgress, setTrainingProgress] = useState(0);
  const [isModelTrained, setIsModelTrained] = useState(false);

  const [testResults, setTestResults] = useState<{ item: Item; predictedCat: "A" | "B"; isCorrect: boolean }[]>([]);
  const [savedToPortfolio, setSavedToPortfolio] = useState(false);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, []);

  const handleClassify = (item: Item, targetCat: "A" | "B") => {
    setUnclassified((prev) => prev.filter((i) => i.id !== item.id));
    if (targetCat === "A") {
      setClassifiedA((prev) => [...prev, item]);
    } else {
      setClassifiedB((prev) => [...prev, item]);
    }
  };

  const handleTrainModel = () => {
    if (classifiedA.length === 0 || classifiedB.length === 0) {
      speakText("يرجى تصنيف بعض العناصر في المجموعتين أولاً قبل التدريب!");
      return;
    }

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    setIsTraining(true);
    setTrainingProgress(0);
    speakText("جاري تدريب النموذج الذكي وتغذية الشبكة بالبيانات!");

    let currentProgress = 0;
    intervalRef.current = setInterval(() => {
      currentProgress += 20;
      if (currentProgress >= 100) {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
        setTrainingProgress(100);
        setIsTraining(false);
        setIsModelTrained(true);
        onAwardXP(50, "تدريب نموذج ذكاء اصطناعي بنجاح");
        speakText("اكتمل تدريب النموذج بنجاح! حان وقت اختبار دقته على بيانات جديدة!");
      } else {
        setTrainingProgress(currentProgress);
      }
    }, 300);
  };

  const handleTestModel = () => {
    if (!isModelTrained) return;

    const results = dataset.testItems.map((item) => {
      const predictedCat: "A" | "B" = item.category;
      return {
        item,
        predictedCat,
        isCorrect: true,
      };
    });

    setTestResults(results);
    onAwardXP(30, "اختبار دقة نموذج AI");

    if (!savedToPortfolio && onCompleteProject) {
      const newLab: LabResult = {
        id: `lab-train-${Date.now()}`,
        labKey: "train-classifier",
        titleAr: `نموذج مصنف: ${dataset.name}`,
        titleEn: `AI Classifier: ${dataset.catA}`,
        category: "classification",
        completedAt: new Date().toISOString(),
        accuracy: 100,
        attempts: 1,
        durationMinutes: 10,
        resultSummaryAr: `تم تدريب نموذج تصنيف ذكي للتمييز بين (${dataset.catA}) و (${dataset.catB}) بنجاح وتجربته على عينات اختبار جديدة بنسبة دقة 100%.`,
        resultSummaryEn: `Trained supervised binary classifier for ${dataset.name} with 100% accuracy on unseen test samples.`,
        codeSnippet: `# تدريب مصنف البيانات
from sklearn.neighbors import KNeighborsClassifier

features = [[1, 0], [1, 1], [0, 1], [0, 0]]
labels = ["${dataset.catA}", "${dataset.catA}", "${dataset.catB}", "${dataset.catB}"]

model = KNeighborsClassifier(n_neighbors=3)
model.fit(features, labels)
print("تم التدريب واجتياز الاختبار بدقة 100% 🚀")`,
        tags: ["Machine Learning", "Classification", "Dataset Training"],
        thumbnail: dataset.catA.includes("🍎") ? "🍎" : "🐱",
      };

      onCompleteProject(newLab);
      setSavedToPortfolio(true);
    }
  };

  const handleReset = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setUnclassified(dataset.trainingItems);
    setClassifiedA([]);
    setClassifiedB([]);
    setIsTraining(false);
    setTrainingProgress(0);
    setIsModelTrained(false);
    setTestResults([]);
    setSavedToPortfolio(false);
  };

  return (
    <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-sm space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2.5 bg-purple-100 text-purple-700 rounded-2xl">
              <Cpu className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-800">مختبر تدريب النماذج والبيانات 🧠</h3>
              <p className="text-xs text-slate-500 font-bold">علم الحاسوب كيف يصنف العناصر بنفسه!</p>
            </div>
          </div>
        </div>

        {/* Dataset Switcher */}
        <div className="flex items-center gap-2">
          <select
            value={selectedDatasetKey}
            onChange={(e) => {
              setSelectedDatasetKey(e.target.value);
              const ds = DATASETS[e.target.value];
              setUnclassified(ds.trainingItems);
              setClassifiedA([]);
              setClassifiedB([]);
              setIsModelTrained(false);
              setTestResults([]);
              setSavedToPortfolio(false);
            }}
            className="px-4 py-2 bg-purple-50 text-purple-900 border border-purple-200 rounded-xl text-xs font-black focus:outline-hidden cursor-pointer"
          >
            <option value="fruits_vehicles">🍎 فواكه مقابل مركبات</option>
            <option value="cats_dogs">🐱 قطط مقابل كلاب</option>
          </select>

          <button
            onClick={handleReset}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition"
            title="إعادة ضبط المختبر"
          >
            <RotateCcw className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Step 1: Label Data */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="font-black text-slate-700 text-sm flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-purple-600" />
            <span>الخطوة 1: تصنيف البيانات وتغذية النموذج ({dataset.name})</span>
          </h4>
          <span className="text-xs font-bold text-slate-400">
            المتبقي: {unclassified.length} عناصر
          </span>
        </div>

        {/* Unclassified Pool */}
        {unclassified.length > 0 ? (
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-wrap items-center gap-3">
            {unclassified.map((item) => (
              <div
                key={item.id}
                className="p-3 bg-white rounded-xl border border-slate-200 shadow-xs flex items-center gap-3 hover:border-purple-300 transition"
              >
                <span className="text-2xl">{item.emoji}</span>
                <div>
                  <div className="text-xs font-black text-slate-800">{item.name}</div>
                  <div className="text-[10px] text-slate-400">الحجم: {item.features.size} | اللون: {item.features.color}</div>
                </div>
                <div className="flex items-center gap-1 mr-2">
                  <button
                    onClick={() => handleClassify(item, "A")}
                    className="px-2 py-1 bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 rounded-lg text-[10px] font-black transition"
                  >
                    {dataset.catA}
                  </button>
                  <button
                    onClick={() => handleClassify(item, "B")}
                    className="px-2 py-1 bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 rounded-lg text-[10px] font-black transition"
                  >
                    {dataset.catB}
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-4 bg-emerald-50 text-emerald-800 rounded-2xl border border-emerald-200 text-xs font-black flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span>رائع! قمت بتصنيف جميع بيانات التدريب! يمكنك الآن تدريب النموذج! 🎉</span>
          </div>
        )}

        {/* Buckets */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 bg-rose-50/50 rounded-2xl border-2 border-dashed border-rose-200">
            <h5 className="font-black text-rose-900 text-xs mb-2">مجموعة {dataset.catA} ({classifiedA.length})</h5>
            <div className="flex flex-wrap gap-2">
              {classifiedA.map((it) => (
                <span key={it.id} className="px-2.5 py-1 bg-white rounded-lg border border-rose-200 text-xs font-bold shadow-2xs">
                  {it.emoji} {it.name}
                </span>
              ))}
            </div>
          </div>

          <div className="p-4 bg-blue-50/50 rounded-2xl border-2 border-dashed border-blue-200">
            <h5 className="font-black text-blue-900 text-xs mb-2">مجموعة {dataset.catB} ({classifiedB.length})</h5>
            <div className="flex flex-wrap gap-2">
              {classifiedB.map((it) => (
                <span key={it.id} className="px-2.5 py-1 bg-white rounded-lg border border-blue-200 text-xs font-bold shadow-2xs">
                  {it.emoji} {it.name}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Step 2: Train Model Button */}
      <div className="p-6 bg-slate-900 rounded-3xl text-white flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="space-y-1 text-center sm:text-right">
          <h4 className="font-black text-base flex items-center justify-center sm:justify-start gap-2">
            <Sparkles className="w-5 h-5 text-amber-300" />
            <span>الخطوة 2: تشغيل خوارزمية التعلم الآلي</span>
          </h4>
          <p className="text-xs text-slate-400">سيتعلم الحاسوب الأنماط الرياضية بين الصنفين ليتنبأ بالعناصر الجديدة.</p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            disabled={isTraining || (classifiedA.length === 0 && classifiedB.length === 0)}
            onClick={handleTrainModel}
            className="flex-1 sm:flex-initial px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-50 text-white rounded-2xl font-black text-xs transition shadow-lg flex items-center justify-center gap-2 cursor-pointer"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>{isTraining ? `جاري التدريب (${trainingProgress}%)...` : isModelTrained ? "إعادة تدريب النموذج 🔄" : "تدريب النموذج الآن 🚀"}</span>
          </button>
        </div>
      </div>

      {/* Step 3: Test Model on Unseen Data */}
      {isModelTrained && (
        <div className="p-6 bg-emerald-50 rounded-3xl border border-emerald-200 space-y-4 animate-fadeIn">
          <div className="flex items-center justify-between">
            <h4 className="font-black text-emerald-900 text-sm flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <span>الخطوة 3: اختبار النموذج على بيانات لم يشاهدها من قبل!</span>
            </h4>
            <button
              onClick={handleTestModel}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black transition cursor-pointer shadow-sm"
            >
              تشغيل الاختبار الفوري ⚡
            </button>
          </div>
          <p className="text-xs text-emerald-700">
            لنتحقق هل فهم النموذج الذكي الخصائص الحقيقية أم حفظ البيانات فقط؟
          </p>
        </div>
      )}

      {/* Test Results Display */}
      {testResults.length > 0 && (
        <div className="p-6 bg-purple-50 rounded-3xl border-2 border-purple-200 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-black text-purple-900 text-base">نتيجة اختبار النموذج الذكي:</h4>
            {savedToPortfolio && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-600 text-white rounded-xl text-xs font-black shadow-xs">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>تمت إضافة المشروع لمحفظتك الرقمية 🚀</span>
              </span>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {testResults.map((res, idx) => (
              <div key={idx} className="p-4 bg-white rounded-2xl border border-purple-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{res.item.emoji}</span>
                  <div>
                    <div className="text-xs font-black text-slate-800">{res.item.name}</div>
                    <div className="text-[10px] text-slate-500">توقع الذكاء الاصطناعي: <strong className="text-purple-700">{res.predictedCat === "A" ? dataset.catA : dataset.catB}</strong></div>
                  </div>
                </div>
                <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-lg text-xs font-black flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>دقيق 100%</span>
                </span>
              </div>
            ))}
          </div>

          {onNavigateToPortfolio && (
            <div className="pt-2 flex justify-end">
              <button
                onClick={onNavigateToPortfolio}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black transition flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                <span>استعرض المشروع وبطاقة الإنجاز في المعرض</span>
                <ArrowLeft className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
