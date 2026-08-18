import React, { useState, useEffect } from "react";
import { GeneratedQuiz, QuizQuestion } from "../types";
import { speakText } from "../data/mascot";
import { X, Sparkles, CheckCircle2, XCircle, Trophy, Loader2, RefreshCw } from "lucide-react";

interface QuizModalProps {
  topic: string;
  onClose: () => void;
  onAwardXP: (amount: number, reason: string) => void;
}

export const QuizModal: React.FC<QuizModalProps> = ({ topic, onClose, onAwardXP }) => {
  const [loading, setLoading] = useState(true);
  const [quiz, setQuiz] = useState<GeneratedQuiz | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [isFinished, setIsFinished] = useState(false);

  useEffect(() => {
    fetchQuiz();
  }, [topic]);

  const fetchQuiz = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/generate-quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic }),
      });

      if (!res.ok) throw new Error("Failed to fetch quiz");

      const data = await res.json();
      setQuiz(data);
    } catch (e) {
      console.error(e);
      // Fallback quiz
      setQuiz({
        title: `اختبار ذكي في ${topic}`,
        questions: [
          {
            question: "ما هو الذكاء الاصطناعي ببساطة؟",
            options: [
              "برنامج كمبيوتر يتعلم ويحل المشكلات مثل البشر",
              "شاشة تفاعلية ملونة فقط",
              "نوع من المأكولات الذكية",
              "لعبة ورق قديمة"
            ],
            correctIndex: 0,
            explanation: "ممتاز! الذكاء الاصطناعي يساعد البرامج على التفكير والتطور بالبيانات!"
          }
        ]
      });
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
      const earnedXP = (score + 1) * 30;
      onAwardXP(earnedXP, `اجتياز اختبار ${topic}`);
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
            <p className="text-xs font-bold text-slate-500">تمت إضافة نقاط XP لحسابك المبدع!</p>

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
                <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 text-sm font-bold text-amber-950 space-y-3">
                  <p>💡 {q.explanation}</p>
                  <button
                    onClick={handleNextQuestion}
                    className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-black text-xs shadow-xs transition"
                  >
                    السؤال التالي 🚀
                  </button>
                </div>
              )}
            </div>
          )
        )}
      </div>
    </div>
  );
};
