import React, { useRef, useState, useEffect } from "react";
import { motion } from "motion/react";
import { ProjectLabItem } from "../types";
import {
  Download,
  Printer,
  Copy,
  Check,
  X,
  Sparkles,
  Award,
  Calendar,
  Share2,
  Cpu,
  Eye,
  Wand2,
  ShieldCheck,
  Bot,
  Zap,
} from "lucide-react";

interface ProjectCardModalProps {
  project: ProjectLabItem;
  studentName: string;
  onClose: () => void;
}

export const ProjectCardModal: React.FC<ProjectCardModalProps> = ({
  project,
  studentName,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "train":
        return "🧠";
      case "vision":
        return "👁️";
      case "prompt":
        return "🔮";
      case "ethics":
        return "🛡️";
      default:
        return "🚀";
    }
  };

  // Generate Canvas Card Image
  const drawCardToCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Dimensions (High-res 1200x800 for crystal-clear exports)
    const width = 1200;
    const height = 800;
    canvas.width = width;
    canvas.height = height;

    // Background Dark Slate & Indigo Gradient
    const bgGradient = ctx.createLinearGradient(0, 0, width, height);
    bgGradient.addColorStop(0, "#0f172a");
    bgGradient.addColorStop(0.5, "#1e1b4b");
    bgGradient.addColorStop(1, "#31104b");
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, width, height);

    // Decorative geometric stars / circles
    ctx.fillStyle = "rgba(99, 102, 241, 0.15)";
    ctx.beginPath();
    ctx.arc(100, 100, 180, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "rgba(236, 72, 153, 0.12)";
    ctx.beginPath();
    ctx.arc(width - 150, height - 150, 220, 0, Math.PI * 2);
    ctx.fill();

    // Golden / Holographic Border Card Frame
    const borderGradient = ctx.createLinearGradient(40, 40, width - 40, height - 40);
    borderGradient.addColorStop(0, "#f59e0b");
    borderGradient.addColorStop(0.3, "#ec4899");
    borderGradient.addColorStop(0.7, "#6366f1");
    borderGradient.addColorStop(1, "#10b981");

    ctx.strokeStyle = borderGradient;
    ctx.lineWidth = 10;
    ctx.beginPath();
    ctx.roundRect(40, 40, width - 80, height - 80, 36);
    ctx.stroke();

    // Inner Card Container
    ctx.fillStyle = "rgba(15, 23, 42, 0.85)";
    ctx.beginPath();
    ctx.roundRect(55, 55, width - 110, height - 110, 28);
    ctx.fill();

    // RTL Header Text
    ctx.direction = "rtl";
    ctx.textAlign = "right";

    // Top Platform Label
    ctx.fillStyle = "#fbbf24";
    ctx.font = "bold 28px Cairo, sans-serif";
    ctx.fillText("🌟 منصة مُعَلِّمُ الذَّكاءِ الاصْطِنَاعِيّ للأَطْفَالِ", width - 90, 120);

    ctx.fillStyle = "#94a3b8";
    ctx.font = "bold 22px Cairo, sans-serif";
    ctx.fillText("بطاقة إنجاز مشروع تطبيقي موثق • AI Project Achievement Card", width - 90, 155);

    // Divider Line
    ctx.strokeStyle = "rgba(255, 255, 255, 0.15)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(90, 185);
    ctx.lineTo(width - 90, 185);
    ctx.stroke();

    // Project Category Badge
    ctx.fillStyle = "#4338ca";
    ctx.beginPath();
    ctx.roundRect(width - 340, 215, 250, 45, 12);
    ctx.fill();

    ctx.fillStyle = "#e0e7ff";
    ctx.font = "bold 22px Cairo, sans-serif";
    ctx.fillText(`${getCategoryIcon(project.category)} ${project.categoryLabel}`, width - 115, 245);

    // Project Title
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 44px Cairo, sans-serif";
    const title = project.title.length > 35 ? project.title.substring(0, 35) + "..." : project.title;
    ctx.fillText(title, width - 90, 315);

    // Student Recognition Text
    ctx.fillStyle = "#cbd5e1";
    ctx.font = "26px Cairo, sans-serif";
    ctx.fillText("تم تصميم وبناء هذا المشروع العملي بنجاح فائق بواسطة المبتكر الصغير:", width - 90, 375);

    // Kid Name (Gold Highlight)
    ctx.fillStyle = "#facc15";
    ctx.font = "bold 48px Cairo, sans-serif";
    ctx.fillText(`👑 ${studentName || "المبتكر الصغير"}`, width - 90, 440);

    // Description
    ctx.fillStyle = "#94a3b8";
    ctx.font = "22px Cairo, sans-serif";
    const desc = project.description.length > 70 ? project.description.substring(0, 70) + "..." : project.description;
    ctx.fillText(desc, width - 90, 500);

    // Metrics Box (Accuracy + XP + Rating)
    // Box 1: Score
    ctx.fillStyle = "rgba(30, 41, 59, 0.9)";
    ctx.beginPath();
    ctx.roundRect(width - 400, 545, 310, 100, 18);
    ctx.fill();
    ctx.strokeStyle = "rgba(16, 185, 129, 0.4)";
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = "#10b981";
    ctx.font = "bold 38px Cairo, sans-serif";
    ctx.fillText(`${project.score}% دقة النموذج`, width - 130, 605);

    // Box 2: XP
    ctx.fillStyle = "rgba(30, 41, 59, 0.9)";
    ctx.beginPath();
    ctx.roundRect(width - 730, 545, 300, 100, 18);
    ctx.fill();
    ctx.strokeStyle = "rgba(245, 158, 11, 0.4)";
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = "#f59e0b";
    ctx.font = "bold 38px Cairo, sans-serif";
    ctx.fillText(`+${project.xpEarned} XP مكافأة`, width - 460, 605);

    // Box 3: Status
    ctx.fillStyle = "rgba(30, 41, 59, 0.9)";
    ctx.beginPath();
    ctx.roundRect(width - 1040, 545, 280, 100, 18);
    ctx.fill();
    ctx.strokeStyle = "rgba(99, 102, 241, 0.4)";
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = "#818cf8";
    ctx.font = "bold 32px Cairo, sans-serif";
    ctx.fillText(`مكتمل وموثق 🏆`, width - 800, 605);

    // Footer Info: Date & Authenticity Seal
    ctx.textAlign = "left";
    ctx.direction = "ltr";
    ctx.fillStyle = "#64748b";
    ctx.font = "20px Cairo, sans-serif";
    ctx.fillText(`Verified AI Creation • ID: #${project.id.slice(0, 12)}`, 90, 715);
    ctx.fillText(`Date: ${project.completedAt} • Zaki AI Academy Certified`, 90, 745);

    // Left Seal Visual
    ctx.textAlign = "center";
    ctx.fillStyle = "rgba(245, 158, 11, 0.15)";
    ctx.beginPath();
    ctx.arc(170, 310, 80, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#f59e0b";
    ctx.lineWidth = 4;
    ctx.stroke();

    ctx.font = "60px sans-serif";
    ctx.fillText("🤖", 170, 320);

    ctx.fillStyle = "#fbbf24";
    ctx.font = "bold 18px Cairo, sans-serif";
    ctx.fillText("ختم زكي المعتمد 🎖️", 170, 360);
  };

  useEffect(() => {
    drawCardToCanvas();
  }, [project, studentName]);

  const handleDownloadPNG = () => {
    setIsDownloading(true);
    try {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const imageURL = canvas.toDataURL("image/png");
      const downloadLink = document.createElement("a");
      downloadLink.href = imageURL;
      downloadLink.download = `بطاقة_مشروع_${studentName.replace(/\s+/g, "_")}_${project.id}.png`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    } catch (e) {
      console.error("Error downloading image:", e);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleCopyText = () => {
    const text = `🎉 أنجزت مشروع الذكاء الاصطناعي بنجاح!\n📌 المشروع: ${project.title}\n📂 التصنيف: ${project.categoryLabel}\n🏆 الدقة والنتيجة: ${project.score}%\n⭐ نقاط الخبرة: +${project.xpEarned} XP\n👨‍💻 المبتكر: ${studentName}\n🚀 منصة معلم الذكاء الاصطناعي للأطفال`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.92 }}
        className="bg-slate-900 border-2 border-indigo-500/40 rounded-[32px] max-w-4xl w-full p-6 sm:p-8 text-white shadow-2xl space-y-6 relative overflow-hidden my-8"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 left-6 p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition cursor-pointer z-20"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-right space-y-2 pr-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-amber-300 text-xs font-black">
            <Sparkles className="w-4 h-4" />
            <span>بطاقة الإنجاز الرقمية للمشروع 🎨</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white">
            بطاقة إنجاز: {project.title}
          </h2>
          <p className="text-xs sm:text-sm font-bold text-slate-300">
            يمكنك تحميل البطاقة كصورة PNG ومشاركتها مع عائلتك وأصدقائك أو طباعتها كشهادة!
          </p>
        </div>

        {/* Hidden Canvas for High-Resolution Export */}
        <canvas ref={canvasRef} className="hidden" />

        {/* Live Visual Card Preview */}
        <div className="relative rounded-3xl p-6 sm:p-8 bg-gradient-to-br from-slate-950 via-indigo-950 to-purple-950 border-2 border-amber-400/50 shadow-2xl overflow-hidden space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-amber-400/20 border border-amber-400/40 flex items-center justify-center text-3xl shadow-inner">
                {project.thumbnailEmoji || getCategoryIcon(project.category)}
              </div>
              <div className="text-right">
                <span className="text-xs font-black text-amber-300 px-2.5 py-0.5 rounded-full bg-amber-400/10 border border-amber-400/20">
                  {project.categoryLabel}
                </span>
                <h3 className="text-lg sm:text-xl font-black text-white mt-1">
                  {project.title}
                </h3>
              </div>
            </div>

            <div className="text-left sm:text-right">
              <div className="text-xs font-bold text-slate-400">تاريخ الإنجاز</div>
              <div className="text-sm font-black text-slate-200">{project.completedAt}</div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-right">
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1">
              <span className="text-xs font-bold text-slate-400">صانع المشروع والمبتكر:</span>
              <div className="text-xl font-black text-amber-300 flex items-center gap-2">
                <span>👑 {studentName || "المبتكر الصغير"}</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1">
              <span className="text-xs font-bold text-slate-400">مستوى الإتقان والدقة:</span>
              <div className="text-xl font-black text-emerald-400 flex items-center gap-2">
                <Award className="w-5 h-5" />
                <span>{project.score}% • ممتاز وموثق</span>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-right space-y-2">
            <span className="text-xs font-bold text-slate-400">وصف الإنجاز:</span>
            <p className="text-sm font-bold text-slate-200 leading-relaxed">
              {project.description}
            </p>
            {project.kidNotes && (
              <div className="pt-2 border-t border-white/10 text-xs font-bold text-indigo-200">
                💬 ملاحظة البطل: "{project.kidNotes}"
              </div>
            )}
          </div>

          {/* Tags */}
          <div className="flex flex-wrap items-center gap-2 pt-2">
            {project.tags.map((tag, idx) => (
              <span
                key={idx}
                className="text-xs font-black px-3 py-1 rounded-xl bg-indigo-500/20 border border-indigo-400/20 text-indigo-300"
              >
                #{tag}
              </span>
            ))}
          </div>
        </div>

        {/* Action Controls Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          {/* 1. Download PNG */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleDownloadPNG}
            disabled={isDownloading}
            className="py-3.5 px-4 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-black text-sm rounded-2xl transition shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>تحميل كصورة عالية الدقة PNG 📥</span>
          </motion.button>

          {/* 2. Print / PDF */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handlePrint}
            className="py-3.5 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-black text-sm rounded-2xl transition shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2 cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>طباعة أو حفظ كـ PDF 🖨️</span>
          </motion.button>

          {/* 3. Copy Summary */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleCopyText}
            className="py-3.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-black text-sm rounded-2xl transition border border-slate-700 flex items-center justify-center gap-2 cursor-pointer"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? "تم النسخ بنجاح!" : "نسخ ملخص الإنجاز 📋"}</span>
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
};
