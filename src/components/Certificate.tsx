import React, { useState } from "react";
import { UserProgress } from "../types";
import { Award, Printer, Sparkles, CheckCircle2, ShieldCheck } from "lucide-react";

interface CertificateProps {
  progress: UserProgress;
  onUpdateName: (name: string) => void;
}

export const Certificate: React.FC<CertificateProps> = ({ progress, onUpdateName }) => {
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(progress.studentName);

  const handleSaveName = () => {
    if (nameInput.trim()) {
      onUpdateName(nameInput.trim());
      setEditingName(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const todayDate = new Date().toLocaleDateString("ar-SA", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <Award className="w-6 h-6 text-amber-500" />
            <span>شهادة مستكشف الذكاء الاصطناعي الصغير</span>
          </h2>
          <p className="text-sm font-bold text-slate-500">احصل على شهادة إنجازك التقديرية واطبعها بشرف!</p>
        </div>

        <button
          onClick={handlePrint}
          className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-black text-xs flex items-center gap-2 shadow-md transition"
        >
          <Printer className="w-4 h-4 text-amber-400" />
          <span>طباعة / حفظ الشهادة (PDF) 🖨️</span>
        </button>
      </div>

      {/* Certificate Frame */}
      <div className="print-certificate p-8 sm:p-12 bg-gradient-to-br from-amber-500/5 via-white to-amber-500/10 rounded-3xl border-8 border-double border-amber-300 shadow-2xl space-y-8 relative overflow-hidden text-center">
        {/* Background Decorative Seals */}
        <div className="absolute top-4 right-4 w-16 h-16 bg-amber-400/20 rounded-full blur-xl pointer-events-none"></div>
        <div className="absolute bottom-4 left-4 w-16 h-16 bg-orange-400/20 rounded-full blur-xl pointer-events-none"></div>

        {/* Certificate Header */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-100 border border-amber-300 text-amber-900 text-xs font-black">
            <Sparkles className="w-4 h-4 text-amber-600" />
            <span>شهادة إنجاز واجتياز تفاعلي</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-black bg-gradient-to-r from-amber-600 via-orange-600 to-purple-600 bg-clip-text text-transparent">
            مُعَلِّمُ الذَّكَاءِ الاصْطِنَاعِيّ للأَطْفَالِ
          </h1>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">AI EXPLORER CERTIFICATE OF ACHIEVEMENT</p>
        </div>

        <p className="text-sm sm:text-base font-extrabold text-slate-600">تشهد هذه المنصة الذكية بكل فخر واعتزاز بأن البطل المبدع:</p>

        {/* Student Name Display / Edit */}
        <div className="py-2">
          {editingName ? (
            <div className="flex items-center justify-center gap-2 max-w-xs mx-auto">
              <input
                type="text"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                placeholder="اكتب اسمك هنا..."
                className="px-4 py-2 border-2 border-amber-500 rounded-xl font-black text-center text-lg focus:outline-hidden"
              />
              <button
                onClick={handleSaveName}
                className="px-4 py-2 bg-amber-500 text-white font-black text-xs rounded-xl shadow-xs"
              >
                حفظ
              </button>
            </div>
          ) : (
            <div className="inline-block relative group">
              <h2
                onClick={() => setEditingName(true)}
                className="text-3xl sm:text-5xl font-black text-slate-900 border-b-4 border-amber-400 pb-2 px-6 cursor-pointer hover:text-amber-600 transition"
                title="انقر لتعديل الاسم"
              >
                {progress.studentName || "المستكشف الذكي الصغير"} ✏️
              </h2>
            </div>
          )}
        </div>

        <p className="text-sm sm:text-base font-extrabold text-slate-700 max-w-xl mx-auto leading-relaxed">
          قد أتم بنجاح ومواظبة استكشاف مفاهيم الذكاء الاصطناعي، والتعلم الآلي، ورؤية الكمبيوتر، وهندسة الأوامر والأخلاقيات الرقمية بمجموع <span className="text-amber-600 font-black">{progress.xp} XP</span> والوصول للمستوى <span className="text-purple-600 font-black">{progress.level}</span>!
        </p>

        {/* Official Seals Footer */}
        <div className="pt-8 border-t-2 border-dashed border-amber-200 flex flex-wrap items-center justify-around gap-6">
          <div className="text-center space-y-1">
            <span className="text-3xl">🤖</span>
            <p className="font-extrabold text-xs text-slate-800">توقيع زَكِيّ AI</p>
            <p className="text-[10px] font-bold text-slate-400">المساعد الشخصي الذكي</p>
          </div>

          <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-amber-400 to-orange-500 p-1 shadow-lg flex items-center justify-center text-white">
            <div className="w-full h-full border-2 border-dashed border-white rounded-full flex flex-col items-center justify-center text-[10px] font-black">
              <span>ختم الاعتماد</span>
              <ShieldCheck className="w-5 h-5 text-white mt-0.5" />
            </div>
          </div>

          <div className="text-center space-y-1">
            <span className="text-xs font-black text-slate-800 block">{todayDate}</span>
            <p className="font-extrabold text-xs text-slate-800">تاريخ الإصدار</p>
            <p className="text-[10px] font-bold text-slate-400">منصة الذكاء الاصطناعي للأطفال</p>
          </div>
        </div>
      </div>
    </div>
  );
};
