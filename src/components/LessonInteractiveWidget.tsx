import React, { useState } from "react";
import { speakText } from "../data/mascot";
import {
  Brain,
  Sparkles,
  CheckCircle2,
  XCircle,
  Cpu,
  Eye,
  Wand2,
  ShieldCheck,
  RefreshCw,
  Zap,
  Grid,
  Bot,
  Play
} from "lucide-react";

interface LessonInteractiveWidgetProps {
  interactiveType?:
    | "sorter"
    | "quiz"
    | "compare"
    | "diagram"
    | "train"
    | "vision_pixel"
    | "prompt_builder"
    | "gen_canvas"
    | "ethics_sim";
  lessonId: string;
}

export const LessonInteractiveWidget: React.FC<LessonInteractiveWidgetProps> = ({
  interactiveType,
  lessonId,
}) => {
  // 1. SORTER STATE (Machine vs AI Classifier)
  const [sorterItems, setSorterItems] = useState([
    { id: "1", name: "المساعد الصوتي في الهاتف 🤖", isAI: true, sorted: null as boolean | null },
    { id: "2", name: "المايكروويف العادي 📟", isAI: false, sorted: null as boolean | null },
    { id: "3", name: "السيارة ذاتية القيادة 🚗", isAI: true, sorted: null as boolean | null },
    { id: "4", name: "المقص اليدوي ✂️", isAI: false, sorted: null as boolean | null },
    { id: "5", name: "فلتر الوجه التفاعلي 🤳", isAI: true, sorted: null as boolean | null },
    { id: "6", name: "ساعة الحائط العادية ⏰", isAI: false, sorted: null as boolean | null },
  ]);
  const [sorterFeedback, setSorterFeedback] = useState<string | null>(null);

  const handleSort = (itemId: string, choiceIsAI: boolean) => {
    setSorterItems((prev) =>
      prev.map((item) => {
        if (item.id === itemId) {
          const isCorrect = item.isAI === choiceIsAI;
          if (isCorrect) {
            speakText(`ممتاز! ${item.name} تصنيف صحيح!`);
            setSorterFeedback(`أحسنت! إجابة صحيحة بخصوص ${item.name}`);
          } else {
            speakText(`حاول مرة أخرى يا بطل`);
            setSorterFeedback(`انتبه! ${item.name} ليس كذلك.`);
          }
          return { ...item, sorted: isCorrect };
        }
        return item;
      })
    );
  };

  const resetSorter = () => {
    setSorterItems((prev) => prev.map((item) => ({ ...item, sorted: null })));
    setSorterFeedback(null);
  };

  // 2. DATA TRAINER STATE
  const [appleDataCount, setAppleDataCount] = useState(0);
  const [orangeDataCount, setOrangeDataCount] = useState(0);
  const [testResult, setTestResult] = useState<string | null>(null);

  const totalData = appleDataCount + orangeDataCount;
  const accuracy = Math.min(100, totalData * 10);

  const handleTestTrainer = (item: "🍎" | "🍊") => {
    if (totalData < 4) {
      setTestResult("⚠️ يحتاج النموذج إلى المزيد من الصور أولاً! أضف 4 صور على الأقل ليتعلم بالبيانات.");
      return;
    }
    if (item === "🍎") {
      setTestResult(`✅ بنسبة دقة ${accuracy}%: هذا التفاح اللذيذ 🍎! أحسنت تدريب النموذج.`);
      speakText("نموذجك الذكي تعرف على التفاح بنجاح!");
    } else {
      setTestResult(`✅ بنسبة دقة ${accuracy}%: هذه البرتقالة المنعشة 🍊! رائع جداً.`);
      speakText("نموذجك الذكي تعرف على البرتقال بنجاح!");
    }
  };

  // 3. PIXEL MATRIX VISION STATE
  const [pixelGrid, setPixelGrid] = useState<boolean[][]>(
    Array(5).fill(Array(5).fill(false))
  );

  const togglePixel = (r: number, c: number) => {
    setPixelGrid((prev) => {
      const next = prev.map((row) => [...row]);
      next[r][c] = !next[r][c];
      return next;
    });
  };

  const activePixelsCount = pixelGrid.flat().filter(Boolean).length;

  const resetPixelGrid = () => {
    setPixelGrid(Array(5).fill(Array(5).fill(false)));
  };

  // 4. PROMPT BUILDER STATE
  const [promptRole, setPromptRole] = useState("رائد فضاء ذكي 👨‍🚀");
  const [promptTask, setPromptTask] = useState("اشرح لي سر الذكاء الاصطناعي 🧠");
  const [promptStyle, setPromptStyle] = useState("بأسلوب مرح مع إيموجيات ملونة 😄");
  const [generatedPromptOutput, setGeneratedPromptOutput] = useState<string | null>(null);

  const handleRunPrompt = () => {
    const text = `أهلاً بك! أنا ${promptRole}. يسعدني أن ${promptTask} ${promptStyle}! \n"الذكاء الاصطناعي هو برنامج يستمع للبيانات كما أستمع أنا لأوامر محطة الفضاء، فيتطور ويساعدنا على ابتكار المستقبل!" 🚀✨`;
    setGeneratedPromptOutput(text);
    speakText(text);
  };

  // 5. GENERATIVE CANVAS STATE
  const [genSubject, setGenSubject] = useState("ديناصور أليف 🦖");
  const [genPlace, setGenPlace] = useState("في كوكب المريخ 🚀");
  const [genArtStyle, setGenArtStyle] = useState("رسوم ثلاثية الأبعاد 3D ✨");
  const [genResult, setGenResult] = useState<{ title: string; desc: string; icon: string } | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateArt = () => {
    setIsGenerating(true);
    setGenResult(null);
    setTimeout(() => {
      setIsGenerating(false);
      setGenResult({
        title: `${genSubject} ${genPlace}`,
        desc: `عمل فني توليدي جديد فريد من نوعه بأسلوب ${genArtStyle}! لم يصنعه أحد قبلك أبداً.`,
        icon: genSubject.includes("ديناصور") ? "🦖" : genSubject.includes("رائد") ? "👨‍🚀" : "🤖"
      });
      speakText(`تم ابتكار عملك الفني التوليدي بنجاح!`);
    }, 1200);
  };

  // 6. ETHICS SIMULATOR STATE
  const [ethicsScenarios, setEthicsScenarios] = useState([
    {
      id: "e1",
      title: "تطبيق يطلب كلمة سر حسابك وعنوان بيتك",
      isSafe: false,
      answered: null as boolean | null,
      explanation: "خطأ وخطر! لا تشارك أبداً بياناتك السرية أو عنوان منزلك مع أي برنامج. 🛑"
    },
    {
      id: "e2",
      title: "مساعد ذكي يشرح لك مسألة الرياضيات خطوة بخطوة للتعلم",
      isSafe: true,
      answered: null as boolean | null,
      explanation: "آمن وممتاز! المساعد التعليمي يساعدك في الاستيعاب والفهم بذكاء. ✅"
    },
    {
      id: "e3",
      title: "صورة غريبة مفبركة لشخص مشهور تطلب إرسال مال",
      isSafe: false,
      answered: null as boolean | null,
      explanation: "خطأ وتزييف! يجب التحقق دائماً من المصادر ولا تثق في التزييف. 🛑"
    },
    {
      id: "e4",
      title: "برنامج يصنع لك قصة كرتونية عن بطل خيالي يحب القراءة",
      isSafe: true,
      answered: null as boolean | null,
      explanation: "آمن ومبدع! هذا استخدام إيجابي وممتع للذكاء الاصطناعي. ✅"
    }
  ]);

  const handleEthicsAnswer = (id: string, userChoiceIsSafe: boolean) => {
    setEthicsScenarios((prev) =>
      prev.map((sc) => {
        if (sc.id === id) {
          const isCorrect = sc.isSafe === userChoiceIsSafe;
          if (isCorrect) {
            speakText("إجابة واعية وصحيحة! أنت حارس ذكي للبيانات");
          } else {
            speakText("انتبه يا بطل، هذا التصرف غير آمن");
          }
          return { ...sc, answered: isCorrect };
        }
        return sc;
      })
    );
  };

  // RENDER BASED ON INTERACTIVE TYPE
  if (interactiveType === "sorter") {
    const sortedCount = sorterItems.filter((i) => i.sorted === true).length;

    return (
      <div className="p-6 bg-gradient-to-br from-indigo-900 to-slate-900 rounded-3xl text-white space-y-5 border-2 border-indigo-500/30 shadow-2xl">
        <div className="flex items-center justify-between border-b border-indigo-800/80 pb-3">
          <div className="flex items-center gap-2">
            <Brain className="w-6 h-6 text-amber-400 animate-bounce" />
            <h4 className="font-black text-lg text-amber-300">تحدي تصنيف الآلات 🎮</h4>
          </div>
          <span className="px-3 py-1 bg-indigo-800 text-indigo-200 rounded-xl text-xs font-black">
            النتيجة: {sortedCount} / {sorterItems.length}
          </span>
        </div>

        <p className="text-xs font-bold text-slate-300">
          صنّف الآلات التالية: هل تعتمد على <span className="text-emerald-400">الذكاء الاصطناعي 🤖</span> أم أنها <span className="text-amber-400">آلة عادية 📟</span>؟
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {sorterItems.map((item) => (
            <div
              key={item.id}
              className={`p-4 rounded-2xl border transition flex flex-col justify-between space-y-3 ${
                item.sorted === true
                  ? "bg-emerald-950/80 border-emerald-500/80 text-emerald-200"
                  : item.sorted === false
                  ? "bg-rose-950/80 border-rose-500/80 text-rose-200"
                  : "bg-slate-800/90 border-slate-700 text-slate-100 hover:border-indigo-400"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm">{item.name}</span>
                {item.sorted === true && <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />}
                {item.sorted === false && <XCircle className="w-5 h-5 text-rose-400 shrink-0" />}
              </div>

              {item.sorted === null && (
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-700/60">
                  <button
                    onClick={() => handleSort(item.id, false)}
                    className="py-1.5 px-3 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded-xl text-xs font-black transition"
                  >
                    آلة عادية 📟
                  </button>
                  <button
                    onClick={() => handleSort(item.id, true)}
                    className="py-1.5 px-3 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 rounded-xl text-xs font-black transition"
                  >
                    ذكاء اصطناعي 🤖
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>

        {sorterFeedback && (
          <div className="p-3 bg-indigo-950 border border-indigo-500/40 rounded-2xl text-xs font-bold text-amber-300 flex items-center justify-between">
            <span>{sorterFeedback}</span>
            <button onClick={resetSorter} className="flex items-center gap-1 text-slate-400 hover:text-white">
              <RefreshCw className="w-3.5 h-3.5" /> إعادة اللعبة
            </button>
          </div>
        )}
      </div>
    );
  }

  if (interactiveType === "train") {
    return (
      <div className="p-6 bg-gradient-to-br from-blue-900 to-slate-900 rounded-3xl text-white space-y-5 border-2 border-blue-500/30 shadow-2xl">
        <div className="flex items-center justify-between border-b border-blue-800/80 pb-3">
          <div className="flex items-center gap-2">
            <Cpu className="w-6 h-6 text-cyan-400" />
            <h4 className="font-black text-lg text-cyan-300">مختبر تدريب النموذج بالفواكه 🍎🍊</h4>
          </div>
          <span className="px-3 py-1 bg-cyan-900/80 text-cyan-200 border border-cyan-500/30 rounded-xl text-xs font-black">
            دقة التدريب: {accuracy}%
          </span>
        </div>

        <p className="text-xs font-bold text-slate-300">
          انقر لإضافة صور تدريبية إلى النموذج الذكي، وشاهد كيف ترتفع دقة التعلم الآلي!
        </p>

        {/* Data Collectors Buttons */}
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => {
              setAppleDataCount((c) => c + 1);
              speakText("أضفت صورة تفاح للنموذج");
            }}
            className="p-4 bg-rose-500/20 hover:bg-rose-500/30 border-2 border-rose-500/50 rounded-2xl flex flex-col items-center justify-center gap-1 transition group"
          >
            <span className="text-3xl group-hover:scale-125 transition">🍎</span>
            <span className="text-xs font-black text-rose-300">+ إضافة صورة تفاح</span>
            <span className="text-[10px] text-slate-400">العدد: {appleDataCount} صور</span>
          </button>

          <button
            onClick={() => {
              setOrangeDataCount((c) => c + 1);
              speakText("أضفت صورة برتقال للنموذج");
            }}
            className="p-4 bg-orange-500/20 hover:bg-orange-500/30 border-2 border-orange-500/50 rounded-2xl flex flex-col items-center justify-center gap-1 transition group"
          >
            <span className="text-3xl group-hover:scale-125 transition">🍊</span>
            <span className="text-xs font-black text-orange-300">+ إضافة صورة برتقال</span>
            <span className="text-[10px] text-slate-400">العدد: {orangeDataCount} صور</span>
          </button>
        </div>

        {/* Accuracy Meter Progress Bar */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs font-black text-slate-300">
            <span>مستوى اكتمال البيانات: {totalData} صور</span>
            <span>{accuracy}% جاهزية</span>
          </div>
          <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 transition-all duration-300"
              style={{ width: `${accuracy}%` }}
            />
          </div>
        </div>

        {/* Test Section */}
        <div className="p-4 bg-slate-800/90 rounded-2xl border border-slate-700 space-y-3">
          <h5 className="text-xs font-black text-amber-300">اختبار دقة النموذج المدرس:</h5>
          <div className="flex items-center gap-3">
            <button
              onClick={() => handleTestTrainer("🍎")}
              className="flex-1 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-black transition"
            >
              اختبار التفاح 🍎
            </button>
            <button
              onClick={() => handleTestTrainer("🍊")}
              className="flex-1 py-2 bg-orange-600 hover:bg-orange-500 text-white rounded-xl text-xs font-black transition"
            >
              اختبار البرتقال 🍊
            </button>
          </div>

          {testResult && (
            <div className="p-3 bg-slate-900 border border-cyan-500/40 rounded-xl text-xs font-bold text-cyan-200">
              {testResult}
            </div>
          )}
        </div>
      </div>
    );
  }

  if (interactiveType === "vision_pixel") {
    return (
      <div className="p-6 bg-gradient-to-br from-emerald-950 to-slate-900 rounded-3xl text-white space-y-5 border-2 border-emerald-500/30 shadow-2xl">
        <div className="flex items-center justify-between border-b border-emerald-800/80 pb-3">
          <div className="flex items-center gap-2">
            <Eye className="w-6 h-6 text-emerald-400" />
            <h4 className="font-black text-lg text-emerald-300">مكتشف بكسلات الكمبيوتر 🧩</h4>
          </div>
          <button
            onClick={resetPixelGrid}
            className="flex items-center gap-1 px-3 py-1 bg-slate-800 hover:bg-slate-700 rounded-xl text-xs font-bold text-slate-300"
          >
            <RefreshCw className="w-3.5 h-3.5" /> مسح المربع
          </button>
        </div>

        <p className="text-xs font-bold text-slate-300">
          انقر المربعات لتشغيل البكسلات (1 مقابل 0)، وشاهد كيف يقرأ الكمبيوتر رسمتك كمصفوفة أرقام!
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          {/* Interactive 5x5 Grid */}
          <div className="flex flex-col items-center gap-2">
            <span className="text-[11px] font-bold text-emerald-400">شبكة الكاميرا 5x5:</span>
            <div className="grid grid-cols-5 gap-1.5 p-3 bg-slate-900 rounded-2xl border border-slate-700">
              {pixelGrid.map((row, rIdx) =>
                row.map((val, cIdx) => (
                  <button
                    key={`${rIdx}-${cIdx}`}
                    onClick={() => togglePixel(rIdx, cIdx)}
                    className={`w-10 h-10 rounded-lg border text-xs font-black transition-all duration-150 ${
                      val
                        ? "bg-emerald-400 text-slate-950 border-emerald-300 shadow-md shadow-emerald-400/30 scale-105"
                        : "bg-slate-800 text-slate-600 border-slate-700 hover:border-slate-500"
                    }`}
                  >
                    {val ? "255" : "0"}
                  </button>
                ))
              )}
            </div>
          </div>

          {/* AI Output Analysis Box */}
          <div className="p-4 bg-slate-900/90 rounded-2xl border border-emerald-500/30 space-y-3">
            <h5 className="text-xs font-black text-amber-300 flex items-center gap-1">
              <Zap className="w-4 h-4 text-amber-400" />
              <span>تحليل رؤية الحاسوب المباشر:</span>
            </h5>

            <div className="space-y-1 text-xs text-slate-300 font-mono bg-slate-950 p-3 rounded-xl border border-slate-800 dir-ltr">
              <p className="text-emerald-400 font-bold">Active Pixels: {activePixelsCount} / 25</p>
              <p className="text-slate-400 text-[11px]">
                {pixelGrid.map((row) => `[${row.map((v) => (v ? 1 : 0)).join(",")}]`).join("\n")}
              </p>
            </div>

            <div className="p-2.5 bg-emerald-900/30 border border-emerald-500/40 rounded-xl text-xs font-extrabold text-emerald-300 text-center">
              {activePixelsCount === 0
                ? "ارسم شيئاً بالبكسلات ليتعرف عليه الذكاء الاصطناعي! 🎨"
                : activePixelsCount > 10
                ? "النموذج يكتشف شكلاً ملوناً أو وجهاً ضاحكاً! 😃"
                : "النموذج يكتشف حواف أو خطوطاً متقطعة! 📐"}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (interactiveType === "prompt_builder") {
    return (
      <div className="p-6 bg-gradient-to-br from-purple-950 to-slate-900 rounded-3xl text-white space-y-5 border-2 border-purple-500/30 shadow-2xl">
        <div className="flex items-center justify-between border-b border-purple-800/80 pb-3">
          <div className="flex items-center gap-2">
            <Wand2 className="w-6 h-6 text-purple-400 animate-pulse" />
            <h4 className="font-black text-lg text-purple-300">مختبر صياغة الأمر الذهبي 🔮</h4>
          </div>
          <span className="px-3 py-1 bg-purple-900 text-purple-200 border border-purple-500/30 rounded-xl text-xs font-black">
            Prompt Builder
          </span>
        </div>

        <p className="text-xs font-bold text-slate-300">
          اختر مكونات أمرك الذهبي الثلاثة، واختبر استجابة زكي الفورية للأمر المفصل!
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Role Selector */}
          <div className="space-y-1">
            <label className="text-[11px] font-black text-purple-300">1. تحديد الشخصية (Role):</label>
            <select
              value={promptRole}
              onChange={(e) => setPromptRole(e.target.value)}
              className="w-full p-2.5 bg-slate-800 border border-purple-500/40 rounded-xl text-xs font-bold text-white focus:outline-hidden"
            >
              <option value="رائد فضاء ذكي 👨‍🚀">رائد فضاء ذكي 👨‍🚀</option>
              <option value="معلم كرتوني مرح 🦸‍♂️">معلم كرتوني مرح 🦸‍♂️</option>
              <option value="شيف حلويات ماهر 👨‍🍳">شيف حلويات ماهر 👨‍🍳</option>
            </select>
          </div>

          {/* Task Selector */}
          <div className="space-y-1">
            <label className="text-[11px] font-black text-purple-300">2. حدد المهمة (Task):</label>
            <select
              value={promptTask}
              onChange={(e) => setPromptTask(e.target.value)}
              className="w-full p-2.5 bg-slate-800 border border-purple-500/40 rounded-xl text-xs font-bold text-white focus:outline-hidden"
            >
              <option value="اشرح لي سر الذكاء الاصطناعي 🧠">اشرح لي سر الذكاء الاصطناعي 🧠</option>
              <option value="اكتب لي قصيدة قصيرة مبدعة 📜">اكتب لي قصيدة قصيرة مبدعة 📜</option>
              <option value="اعطني لغزاً ذكياً للأطفال 🧩">اعطني لغزاً ذكياً للأطفال 🧩</option>
            </select>
          </div>

          {/* Style Selector */}
          <div className="space-y-1">
            <label className="text-[11px] font-black text-purple-300">3. حدد الأسلوب (Style):</label>
            <select
              value={promptStyle}
              onChange={(e) => setPromptStyle(e.target.value)}
              className="w-full p-2.5 bg-slate-800 border border-purple-500/40 rounded-xl text-xs font-bold text-white focus:outline-hidden"
            >
              <option value="بأسلوب مرح مع إيموجيات ملونة 😄">بأسلوب مرح مع إيموجيات 😄</option>
              <option value="باستخدام تشبيهات الكرتون 🎨">باستخدام تشبيهات الكرتون 🎨</option>
              <option value="في فقرتين بسيطة جداً 🌟">في فقرتين بسيطة جداً 🌟</option>
            </select>
          </div>
        </div>

        <button
          onClick={handleRunPrompt}
          className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-2xl font-black text-sm transition shadow-lg shadow-purple-600/30 flex items-center justify-center gap-2"
        >
          <Play className="w-4 h-4 fill-white" />
          <span>تشغيل الأمر الذهبي واختبار زكي 🚀</span>
        </button>

        {generatedPromptOutput && (
          <div className="p-4 bg-slate-900 border-2 border-purple-500/50 rounded-2xl text-xs font-bold text-purple-200 leading-relaxed space-y-2">
            <span className="text-[10px] font-black text-amber-400 uppercase tracking-wider block">
              🤖 مخرجات زكي للأمر المحترف:
            </span>
            <p className="whitespace-pre-line">{generatedPromptOutput}</p>
          </div>
        )}
      </div>
    );
  }

  if (interactiveType === "gen_canvas") {
    return (
      <div className="p-6 bg-gradient-to-br from-pink-950 to-slate-900 rounded-3xl text-white space-y-5 border-2 border-pink-500/30 shadow-2xl">
        <div className="flex items-center justify-between border-b border-pink-800/80 pb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-pink-400" />
            <h4 className="font-black text-lg text-pink-300">مولد الابتكارات التوليدية 🪄</h4>
          </div>
          <span className="px-3 py-1 bg-pink-900/80 text-pink-200 border border-pink-500/30 rounded-xl text-xs font-black">
            Generative AI
          </span>
        </div>

        <p className="text-xs font-bold text-slate-300">
          امزج عناصر مختلفة وخيالياً، ودع الذكاء الاصطناعي التوليدي يصنع لك لوحة ومفهوماً جديداً كلياً!
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="space-y-1">
            <label className="text-[11px] font-black text-pink-300">العنصر (Subject):</label>
            <select
              value={genSubject}
              onChange={(e) => setGenSubject(e.target.value)}
              className="w-full p-2.5 bg-slate-800 border border-pink-500/40 rounded-xl text-xs font-bold text-white focus:outline-hidden"
            >
              <option value="ديناصور أليف 🦖">ديناصور أليف 🦖</option>
              <option value="رائد فضاء صغير 👨‍🚀">رائد فضاء صغير 👨‍🚀</option>
              <option value="روبوت طائر 🤖">روبوت طائر 🤖</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-black text-pink-300">المكان (Place):</label>
            <select
              value={genPlace}
              onChange={(e) => setGenPlace(e.target.value)}
              className="w-full p-2.5 bg-slate-800 border border-pink-500/40 rounded-xl text-xs font-bold text-white focus:outline-hidden"
            >
              <option value="في كوكب المريخ 🚀">في كوكب المريخ 🚀</option>
              <option value="في أعماق المحيط 🌊">في أعماق المحيط 🌊</option>
              <option value="في غابة الحلوى 🍭">في غابة الحلوى 🍭</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-black text-pink-300">الأسلوب (Art Style):</label>
            <select
              value={genArtStyle}
              onChange={(e) => setGenArtStyle(e.target.value)}
              className="w-full p-2.5 bg-slate-800 border border-pink-500/40 rounded-xl text-xs font-bold text-white focus:outline-hidden"
            >
              <option value="رسوم ثلاثية الأبعاد 3D ✨">رسوم ثلاثية الأبعاد 3D ✨</option>
              <option value="لوحة زيتية كلاسيكية 🎨">لوحة زيتية كلاسيكية 🎨</option>
              <option value="كرتون بكسل أرت 👾">كرتون بكسل أرت 👾</option>
            </select>
          </div>
        </div>

        <button
          onClick={handleGenerateArt}
          disabled={isGenerating}
          className="w-full py-3 bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 disabled:opacity-50 text-white rounded-2xl font-black text-sm transition shadow-lg shadow-pink-600/30 flex items-center justify-center gap-2"
        >
          <Sparkles className="w-4 h-4" />
          <span>{isGenerating ? "جاري الابتكار بالتوليد... ⏳" : "ابتكار بالذكاء الاصطناعي التوليدي 🌟"}</span>
        </button>

        {genResult && (
          <div className="p-5 bg-slate-900 border-2 border-pink-500/50 rounded-2xl flex items-center gap-4 animate-fade-in">
            <span className="text-4xl p-3 bg-pink-950 border border-pink-500/40 rounded-2xl">{genResult.icon}</span>
            <div className="space-y-1">
              <h5 className="font-black text-amber-300 text-sm">{genResult.title}</h5>
              <p className="text-xs font-bold text-slate-300">{genResult.desc}</p>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (interactiveType === "ethics_sim") {
    const answeredCount = ethicsScenarios.filter((s) => s.answered !== null).length;

    return (
      <div className="p-6 bg-gradient-to-br from-violet-950 to-slate-900 rounded-3xl text-white space-y-5 border-2 border-violet-500/30 shadow-2xl">
        <div className="flex items-center justify-between border-b border-violet-800/80 pb-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-emerald-400" />
            <h4 className="font-black text-lg text-emerald-300">تحدي حارس الأمان الذكي 🛡️</h4>
          </div>
          <span className="px-3 py-1 bg-violet-900 text-violet-200 border border-violet-500/30 rounded-xl text-xs font-black">
            المكتمل: {answeredCount} / {ethicsScenarios.length}
          </span>
        </div>

        <p className="text-xs font-bold text-slate-300">
          حدد لكل سيناريو: هل تصرف الذكاء الاصطناعي <span className="text-emerald-400">آمن ومقبول ✅</span> أم <span className="text-rose-400">خطر وغير آمن 🛑</span>؟
        </p>

        <div className="space-y-3">
          {ethicsScenarios.map((sc) => (
            <div
              key={sc.id}
              className={`p-4 rounded-2xl border transition space-y-3 ${
                sc.answered === true
                  ? "bg-emerald-950/80 border-emerald-500/80"
                  : sc.answered === false
                  ? "bg-rose-950/80 border-rose-500/80"
                  : "bg-slate-800/90 border-slate-700"
              }`}
            >
              <p className="font-bold text-xs sm:text-sm text-slate-100">{sc.title}</p>

              {sc.answered === null ? (
                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={() => handleEthicsAnswer(sc.id, true)}
                    className="flex-1 py-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 rounded-xl text-xs font-black transition"
                  >
                    آمن ومقبول ✅
                  </button>
                  <button
                    onClick={() => handleEthicsAnswer(sc.id, false)}
                    className="flex-1 py-2 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 rounded-xl text-xs font-black transition"
                  >
                    خطر وغير آمن 🛑
                  </button>
                </div>
              ) : (
                <div className="text-xs font-black text-amber-300 pt-1 border-t border-slate-700/60">
                  {sc.explanation}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return null;
};
