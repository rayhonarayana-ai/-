import React, { useState, useEffect } from "react";
import { GeneratedQuiz, QuizQuestion } from "../types";
import { speakText } from "../data/mascot";
import { X, Sparkles, CheckCircle2, XCircle, Trophy, Loader2, RefreshCw } from "lucide-react";
import { recordLearningEvidence } from "../utils/learningEvidence";
import { aiClient } from "../services/aiClient";
import {
  getSkillForAssessmentTopic,
  validateQuizStructure,
  evaluateQuizScore,
} from "../domain/assessment";

interface QuizModalProps {
  topic: string;
  onClose: () => void;
  onAwardXP: (amount: number, reason: string, customEventId?: string) => void;
}

const CANONICAL_FALLBACK_QUIZZES: Record<string, { title: string; questions: QuizQuestion[] }> = {
  skill_ai_foundations: {
    title: "تحدي أساسيات الذكاء الاصطناعي 🧠⭐",
    questions: [
      {
        question: "كيف تختلف الآلة الذكية عن الآلة العادية؟",
        options: [
          "الآلة الذكية تتعلم من الأمثلة والبيانات، بينما الآلة العادية تنفذ خطوات ثابتة فقط",
          "الآلة الذكية تحتوي على مصابيح ملونة فقط",
          "الآلة العادية أسرع دائماً في كل شيء",
          "لا يوجد أي فرق بينهما"
        ],
        correctIndex: 0,
        explanation: "ممتاز! الذكاء الاصطناعي يساعد البرامج على استنتاج القواعد بنفسها والتطور بالبيانات! 🌟"
      },
      {
        question: "أي مما يلي يُعد تطبيقاً حقيقياً للذكاء الاصطناعي في حياتنا اليومية؟",
        options: [
          "تطبيق الخرائط الذي يتوقع الازدحام ويقترح أسرع مسار",
          "ساعة يد ميكانيكية عادية",
          "مصباح الغرفة التقليدي",
          "المسطرة المدرسية"
        ],
        correctIndex: 0,
        explanation: "أحسنت! تطبيقات الخرائط تحلل حركة المرور بالذكاء الاصطناعي لترشدنا فوراً! 🚗"
      },
      {
        question: "ما هو الوقود الأساسي الذي يحتاجه الذكاء الاصطناعي ليتعلم؟",
        options: [
          "البيانات والأمثلة الكثيرة والمتنوعة",
          "البنزين والزيوت",
          "الورق الملون فقط",
          "التخمين العشوائي"
        ],
        correctIndex: 0,
        explanation: "بطل ذكي! البيانات هي كنز الذكاء الاصطناعي الذي يتعلم منه الأنماط! 💎"
      }
    ]
  },
  skill_machine_learning: {
    title: "تحدي التعلّم الآلي وتدريب النماذج 🤖⚡",
    questions: [
      {
        question: "ما هو التعلّم الإشرافي (Supervised Learning)؟",
        options: [
          "تدريب النموذج على أمثلة تحتوي على ميزات وتسميات صحيحة",
          "ترك الحاسوب يعمل بدون أي بيانات",
          "إطفاء الجهاز وتشغيله",
          "حفظ الكلمات دون فهم"
        ],
        correctIndex: 0,
        explanation: "أحسنت! نزود النموذج بالأمثلة وتسمياتها ليتعلم التمييز والتوقع بدقة! 🎯"
      },
      {
        question: "لماذا نفصل البيانات إلى بيانات تدريب وبيانات اختبار؟",
        options: [
          "للتأكد من قدرة النموذج على التعميم على أمثلة جديدة لم يرها من قبل",
          "لحذف نصف البيانات دون فائدة",
          "لتصغير حجم الشاشة",
          "لتسريع إغلاق الحاسوب"
        ],
        correctIndex: 0,
        explanation: "رائع! اختبار النموذج على بيانات جديدة يضمن دقته الحقيقية ومنع الحفظ الأعمى! 🔍"
      },
      {
        question: "ماذا يحدث عندما ندرب النموذج على أمثلة غير متوازنة؟",
        options: [
          "قد يتحيز النموذج للصنف الأكثر تكراراً وتقل دقته",
          "يصبح خارقاً في كل شيء تلقائياً",
          "لا يتأثر النموذج إطلاقاً",
          "يتوقف الشاحن عن العمل"
        ],
        correctIndex: 0,
        explanation: "إجابة دقيقة! توازن البيانات هو سر عدالة ودقة نماذج الذكاء الاصطناعي! ⚖️"
      }
    ]
  },
  skill_computer_vision: {
    title: "تحدي الرؤية الحاسوبية ومعالجة الصور 👁️✨",
    questions: [
      {
        question: "كيف يرى الكمبيوتر الصورة الرقمية؟",
        options: [
          "كمصفوفة من الأرقام تمثل شدة ألوان البكسلات (RGB)",
          "كلوحة قماشية زيتية حقيقية",
          "كنص مقروء فقط",
          "لا يستطيع رؤيتها أبداً"
        ],
        correctIndex: 0,
        explanation: "ممتاز! كل صورة هي جدول أرقام للبكسلات وقنوات الأحمر والأخضر والأزرق! 🎨"
      },
      {
        question: "ما وظيفة المربع المحيط (Bounding Box) في رؤية الكمبيوتر؟",
        options: [
          "تحديد موقع وأبعاد الكائن المكتشف داخل الصورة بدقة",
          "تلوين خلفية الصورة بالأسود",
          "حذف الكائن من الصورة",
          "تكبير حجم الشاشة"
        ],
        correctIndex: 0,
        explanation: "صحيح جداً! المربع المحيط يحدد موقع الكائن مثل السيارات ذاتية القيادة! 🚙"
      },
      {
        question: "كيف تميز خوارزميات الرؤية حواف الأشكال (Edges)؟",
        options: [
          "بالبحث عن التغير والتباين الحاد في درجات سطوع وألوان البكسلات المتجاورة",
          "بالتخمين بدون فحص البكسلات",
          "بقراءة عنوان الملف فقط",
          "بانتظار صوت خارجي"
        ],
        correctIndex: 0,
        explanation: "بطل! تباين السطوع بين البكسلات يكشف حدود الكائنات بوضوح هندسي مبهر! 📐"
      }
    ]
  },
  skill_prompt_engineering: {
    title: "تحدي هندسة وصياغة الأوامر 🔮🚀",
    questions: [
      {
        question: "ما هي العناصر الأساسية لصياغة أمر ذكي ومثالي للنموذج اللغوي؟",
        options: [
          "تحديد الدور، والموضوع، والمكان، والأسلوب، والمشاعر المطلوبة بوضوح",
          "كتابة كلمة واحدة عامة وغامضة",
          "تكرار الحروف عشوائياً",
          "ترك المساحة فارغة"
        ],
        correctIndex: 0,
        explanation: "مبدع! وضوح السياق والتفاصيل الخمسة يمنحك أفضل نتيجة إبداعية دقيقة! 🪄"
      },
      {
        question: "ماذا نسمي إعطاء النموذج أمثلة توضيحية داخل الأمر؟",
        options: [
          "التعلم عبر أمثلة قليلة (Few-Shot Prompting)",
          "إعادة تشغيل النظام",
          "المسح التلقائي",
          "التشفير المغلق"
        ],
        correctIndex: 0,
        explanation: "أحسنت! تقديم أمثلة يساعد الذكاء الاصطناعي على فهم النمط والتنسيق بدقة! 📋"
      },
      {
        question: "إذا كانت إجابة النموذج اللغوي غير دقيقة، ما هو أفضل تصرف؟",
        options: [
          "تحسين صياغة الأمر وإضافة قيود وتفاصيل محددة وواضحة",
          "الاستسلام وعدم المحاولة مجدداً",
          "حذف المتصفح",
          "كتابة نص غير مفهوم"
        ],
        correctIndex: 0,
        explanation: "هندسة الأوامر هي مهارة تجريب وتطوير مستمر للأوامر حتى نصل لأفضل نتيجة! 💡"
      }
    ]
  },
  skill_ai_ethics: {
    title: "تحدي أخلاقيات الذكاء الاصطناعي والأمان 🛡️✨",
    questions: [
      {
        question: "ما هو التصرف الصحيح لحماية الخصوصية عند استخدام أدوات الذكاء الاصطناعي؟",
        options: [
          "عدم مشاركة المعلومات الشخصية الحساسة مثل العناوين وكلمات المرور وأسرار المنزل",
          "نشر كل الأسرار والصور العائلية للجميع",
          "مشاركة أرقام الهواتف مع أي موقع",
          "إلغاء كلمات المرور"
        ],
        correctIndex: 0,
        explanation: "حكيم جداً! الأمان الرقمي وحماية خصوصيتك وخصوصية أسرتك أولوية قصوى دائماً! 🔐"
      },
      {
        question: "كيف نطبق الأمانة العلمية عند الاستعانة بالذكاء الاصطناعي في الأبحاث المدرسية؟",
        options: [
          "استخدامه كمساعد للفهم والتوضيح مع صياغة الأفكار بأسلوبنا الخاص وذكر المصادر",
          "نسخ ولصق الإجابة حرفياً وادعاء أنها من تأليفنا الشخصي",
          "إخفاء الحقيقة عن المعلم",
          "عدم قراءة المحتوى أصلاً"
        ],
        correctIndex: 0,
        explanation: "رائع! الأمانة العلمية والاعتماد على النفس هما سمة الباحث والمبتكر الحقيقي! 📚"
      },
      {
        question: "لماذا يجب الحذر والتفكير الناقد قبل تصديق كل صورة أو نص ينتجه الذكاء الاصطناعي؟",
        options: [
          "لأن النماذج قد تولد معلومات خاطئة (Hallucinations) أو صوراً مفبركة (Deepfakes)",
          "لأن كل شيء في الإنترنت صادق بنسبة 100% دائماً",
          "لأن الحواسيب لا تخطئ أبداً",
          "لأنه لا توجد صور في الإنترنت"
        ],
        correctIndex: 0,
        explanation: "بطل واعٍ! التفكير الناقد والتحقق من الحقائق يحميك من التضليل الرقمي! 🔍"
      }
    ]
  },
  skill_python_coding: {
    title: "تحدي البرمجة بلغة بايثون والخوارزميات 🐍⚡",
    questions: [
      {
        question: "ما هي المتغيرات (Variables) في لغة بايثون؟",
        options: [
          "صناديق ذكية في الذاكرة لتخزين واسترجاع البيانات والأرقام والنصوص",
          "أزرار على لوحة المفاتيح فقط",
          "شاشات عرض ملونة",
          "نوع من الأسلاك الكهربائية"
        ],
        correctIndex: 0,
        explanation: "ممتاز! المتغيرات تحتفظ بالقيم ليمكننا استخدامها وتعديلها في أي وقت! 📦"
      },
      {
        question: "ما الفائدة من استخدام حلقات التكرار (for loops) في البرمجة؟",
        options: [
          "تنفيذ الأوامر المتكررة بكفاءة عالية وبسطور برمجية قليلة ومنظمة",
          "إيقاف البرنامج فوراً",
          "إلغاء البيانات المخزنة",
          "جعل الحاسوب بطيئاً"
        ],
        correctIndex: 0,
        explanation: "أحسنت! حلقات التكرار تختصر آلاف الخطوات بسطرين فقط مثل المحترفين! 🔁"
      },
      {
        question: "ماذا تفعل جملة الشرط (if / else) في كود بايثون؟",
        options: [
          "تسمح للبرنامج باتخاذ قرارات ذكية واختيار مسار التنفيذ حسب تحقق الشرط",
          "ترسم دائرة حمراء فقط",
          "تحذف كل الأرقام",
          "تغلق الشاشة"
        ],
        correctIndex: 0,
        explanation: "بطل البرمجة! الشروط المنطقية هي عقل الكود الذي يحدد كيف يتصرف البرنامج! 🧠"
      }
    ]
  }
};

export const QuizModal: React.FC<QuizModalProps> = ({ topic, onClose, onAwardXP }) => {
  const [loading, setLoading] = useState(true);
  const [quiz, setQuiz] = useState<GeneratedQuiz | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [xpAwarded, setXpAwarded] = useState(false);

  const canonicalSkillId = getSkillForAssessmentTopic(topic);

  useEffect(() => {
    fetchQuiz();
  }, [topic]);

  const fetchQuiz = async () => {
    setLoading(true);
    try {
      const data = await aiClient.generateQuiz(topic);
      const validation = validateQuizStructure(data, topic);

      if (validation.isValid && validation.sanitizedQuiz && validation.sanitizedQuiz.questions.length > 0) {
        setQuiz({
          title: validation.sanitizedQuiz.title,
          questions: validation.sanitizedQuiz.questions,
        });
      } else {
        throw new Error(validation.reason || "Invalid quiz structure");
      }
    } catch (e) {
      console.warn("Using validated canonical fallback quiz for topic:", topic, e);
      const fallback = CANONICAL_FALLBACK_QUIZZES[canonicalSkillId] || CANONICAL_FALLBACK_QUIZZES.skill_ai_foundations;
      setQuiz(fallback);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSelect = (optionIndex: number) => {
    if (showAnswer) return;

    setSelectedOption(optionIndex);
    setShowAnswer(true);

    const q = quiz?.questions[currentIndex];
    if (q && optionIndex === q.correctIndex) {
      setScore((prev) => prev + 1);
      speakText("إجابة رائعة وصحيحة يا بطل!");
    } else {
      speakText("حاول في السؤال القادم، أنت قريب جداً!");
    }
  };

  const handleNextQuestion = () => {
    if (!quiz) return;
    if (currentIndex < quiz.questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOption(null);
      setShowAnswer(false);
    } else {
      setIsFinished(true);
      if (!xpAwarded) {
        const totalCount = quiz.questions.length || 1;
        const scoringResult = evaluateQuizScore(score, totalCount, canonicalSkillId);
        const attemptId = `quiz-${canonicalSkillId}-${Date.now()}`;

        // Record validated assessment evidence conforming to Gate 10 & Gate 2
        recordLearningEvidence({
          type: "QUIZ_ATTEMPTED",
          sourceId: `quiz-${canonicalSkillId}`,
          skillIds: [canonicalSkillId],
          score: scoringResult.score,
          correct: scoringResult.correct,
          total: scoringResult.total,
          assessed: true,
          passed: scoringResult.passed,
          masteryEligible: scoringResult.masteryEligible,
          idempotencyKey: `quiz-eval:${canonicalSkillId}:${attemptId}`,
          metadata: {
            topic,
            canonicalSkillId,
            title: quiz.title,
            assessedItemsCount: scoringResult.total,
          },
        });

        const earnedXP = score > 0 ? score * 25 : 5;
        onAwardXP(earnedXP, `اجتياز اختبار ${topic}`, `quiz-completed:${canonicalSkillId}:${attemptId}`);
        setXpAwarded(true);
      }
    }
  };

  const q: QuizQuestion | undefined = quiz?.questions[currentIndex];

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl relative border-2 border-amber-300">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 left-4 p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {loading ? (
          <div className="py-12 text-center space-y-3">
            <Loader2 className="w-10 h-10 text-amber-500 animate-spin mx-auto" />
            <p className="font-extrabold text-slate-800 text-base">زكي يبني لك اختباراً حركياً ذكياً الآن... 🤖⭐</p>
          </div>
        ) : isFinished ? (
          <div className="py-8 text-center space-y-4">
            <Trophy className="w-16 h-16 text-amber-500 mx-auto animate-bounce" />
            <h3 className="text-2xl font-black text-slate-900">أنهيت الاختبار بنجاح! 🏆</h3>
            <p className="text-lg font-extrabold text-amber-600">
              حصلت على {score} من {quiz?.questions.length} إجابات صحيحة!
            </p>
            <p className="text-xs font-bold text-slate-500">تم تقييم وتوثيق مهاراتك في سجل الأدلة التعليمية المعتمد!</p>

            <button
              onClick={onClose}
              className="px-8 py-3 bg-amber-500 hover:bg-amber-600 text-white font-black rounded-2xl shadow-md transition"
            >
              العودة للدروس ⭐
            </button>
          </div>
        ) : (
          q && (
            <div className="space-y-5">
              <div className="flex items-center justify-between text-xs font-black text-amber-700 bg-amber-50 p-3 rounded-2xl">
                <span>{quiz?.title}</span>
                <span>سؤال {currentIndex + 1} من {quiz?.questions.length}</span>
              </div>

              <h3 className="font-black text-lg text-slate-900 leading-relaxed">{q.question}</h3>

              <div className="space-y-3">
                {q.options.map((opt, idx) => {
                  let btnStyle = "bg-slate-50 border-slate-200 text-slate-800 hover:bg-slate-100";
                  if (showAnswer) {
                    if (idx === q.correctIndex) {
                      btnStyle = "bg-emerald-500 text-white border-emerald-600 font-extrabold";
                    } else if (selectedOption === idx) {
                      btnStyle = "bg-rose-500 text-white border-rose-600 font-extrabold";
                    }
                  }

                  return (
                    <button
                      key={idx}
                      disabled={showAnswer}
                      onClick={() => handleAnswerSelect(idx)}
                      className={`w-full p-4 rounded-2xl border-2 text-right text-sm font-bold transition shadow-2xs ${btnStyle}`}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>

              {showAnswer && (
                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-bold leading-relaxed">
                  {q.explanation}
                </div>
              )}

              <div className="pt-2 flex justify-end">
                <button
                  disabled={!showAnswer}
                  onClick={handleNextQuestion}
                  className="px-6 py-2.5 bg-amber-500 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-amber-600 text-white font-black rounded-xl text-sm transition shadow-sm"
                >
                  {currentIndex < (quiz?.questions.length || 0) - 1 ? "السؤال التالي ⬅️" : "عرض النتيجة 🏁"}
                </button>
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
};

