import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Project } from "../types";
import {
  Download,
  X,
  Sparkles,
  Award,
  CheckCircle2,
  Calendar,
  Zap,
  Tag,
  User,
  Copy,
  Check,
  RefreshCw,
  Palette,
  Share2,
  ExternalLink,
  MessageCircle,
  QrCode,
  Globe,
  Send,
  ShieldCheck,
} from "lucide-react";
import {
  exportElementToPNG,
  generateProjectShareUrl,
  getSerialIdForProject,
} from "../utils/cardGenerator";

interface AchievementCardModalProps {
  project: Project | null;
  defaultChildName: string;
  onClose: () => void;
  onShowToast: (msg: string) => void;
  onAwardXP?: (amount: number, reason: string) => void;
}

type CardTheme = "royal-indigo" | "emerald-tech" | "cosmic-purple" | "golden-champ";

export const AchievementCardModal: React.FC<AchievementCardModalProps> = ({
  project,
  defaultChildName,
  onClose,
  onShowToast,
  onAwardXP,
}) => {
  const [childName, setChildName] = useState(defaultChildName || "البطل المبتكر");
  const [selectedTheme, setSelectedTheme] = useState<CardTheme>("royal-indigo");
  const [activeTab, setActiveTab] = useState<"card" | "share">("card");
  const [isExportingHtml2Canvas, setIsExportingHtml2Canvas] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedImage, setCopiedImage] = useState(false);
  const [hasAwardedDownloadXP, setHasAwardedDownloadXP] = useState(false);
  const [hasAwardedShareXP, setHasAwardedShareXP] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const cardElementRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (defaultChildName) {
      setChildName(defaultChildName);
    }
  }, [defaultChildName]);

  // Generate Unique Share URL
  const shareUrl = project ? generateProjectShareUrl(project, childName) : "";
  const serialId = project ? getSerialIdForProject(project.id) : "MZ-AI-2026";

  // Render the Canvas whenever inputs change
  useEffect(() => {
    if (!project) return;
    drawCertificate();
  }, [project, childName, selectedTheme]);

  const drawCertificate = () => {
    const canvas = canvasRef.current;
    if (!canvas || !project) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = 1200;
    const height = 750;
    canvas.width = width;
    canvas.height = height;

    // Theme color palettes
    const themes = {
      "royal-indigo": {
        bgStart: "#0f172a",
        bgMid: "#1e1b4b",
        bgEnd: "#312e81",
        accent: "#818cf8",
        gold: "#fbbf24",
        goldGlow: "rgba(251, 191, 36, 0.3)",
        innerBg: "rgba(15, 23, 42, 0.75)",
        cardBorder: "#4338ca",
        subText: "#c7d2fe",
      },
      "emerald-tech": {
        bgStart: "#022c22",
        bgMid: "#064e3b",
        bgEnd: "#065f46",
        accent: "#34d399",
        gold: "#f59e0b",
        goldGlow: "rgba(245, 158, 11, 0.3)",
        innerBg: "rgba(2, 44, 34, 0.75)",
        cardBorder: "#059669",
        subText: "#a7f3d0",
      },
      "cosmic-purple": {
        bgStart: "#180828",
        bgMid: "#3b0764",
        bgEnd: "#581c87",
        accent: "#c084fc",
        gold: "#facc15",
        goldGlow: "rgba(250, 204, 21, 0.3)",
        innerBg: "rgba(24, 8, 40, 0.75)",
        cardBorder: "#7e22ce",
        subText: "#e9d5ff",
      },
      "golden-champ": {
        bgStart: "#1c1917",
        bgMid: "#292524",
        bgEnd: "#44403c",
        accent: "#fbbf24",
        gold: "#f59e0b",
        goldGlow: "rgba(245, 158, 11, 0.4)",
        innerBg: "rgba(28, 25, 23, 0.8)",
        cardBorder: "#78716c",
        subText: "#fef3c7",
      },
    };

    const t = themes[selectedTheme];

    // 1. Background Gradient
    const bgGradient = ctx.createLinearGradient(0, 0, width, height);
    bgGradient.addColorStop(0, t.bgStart);
    bgGradient.addColorStop(0.5, t.bgMid);
    bgGradient.addColorStop(1, t.bgEnd);
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, width, height);

    // Decorative Ambient Circles
    const drawGlow = (x: number, y: number, radius: number, color: string) => {
      const g = ctx.createRadialGradient(x, y, 10, x, y, radius);
      g.addColorStop(0, color);
      g.addColorStop(1, "transparent");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
    };

    drawGlow(150, 150, 250, t.goldGlow);
    drawGlow(width - 150, height - 150, 300, "rgba(99, 102, 241, 0.25)");

    // 2. Outer Ornamental Border
    ctx.strokeStyle = t.gold;
    ctx.lineWidth = 4;
    ctx.strokeRect(30, 30, width - 60, height - 60);

    // Thin Inner Border
    ctx.strokeStyle = "rgba(255, 255, 255, 0.2)";
    ctx.lineWidth = 1;
    ctx.strokeRect(40, 40, width - 80, height - 80);

    // Corner Ornaments
    const drawCorner = (x: number, y: number, rot: number) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rot);
      ctx.strokeStyle = t.gold;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(-20, 0);
      ctx.lineTo(0, 0);
      ctx.lineTo(0, -20);
      ctx.stroke();

      ctx.fillStyle = t.gold;
      ctx.beginPath();
      ctx.arc(0, 0, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    };

    drawCorner(45, 45, 0);
    drawCorner(width - 45, 45, Math.PI / 2);
    drawCorner(width - 45, height - 45, Math.PI);
    drawCorner(45, height - 45, -Math.PI / 2);

    // 3. Inner Card Panel
    ctx.fillStyle = t.innerBg;
    ctx.beginPath();
    ctx.roundRect(60, 60, width - 120, height - 120, 24);
    ctx.fill();
    ctx.strokeStyle = t.cardBorder;
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // 4. Header: Platform Brand & Certificate Header
    ctx.direction = "rtl";
    ctx.textAlign = "center";

    // Small Top Pill: Platform
    ctx.fillStyle = "rgba(255, 255, 255, 0.12)";
    ctx.beginPath();
    ctx.roundRect(width / 2 - 200, 85, 400, 34, 17);
    ctx.fill();
    ctx.strokeStyle = "rgba(255, 255, 255, 0.25)";
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.font = "bold 15px 'Cairo', 'Tajawal', sans-serif";
    ctx.fillStyle = t.subText;
    ctx.fillText("✨ منصة «مُعلِّمُ الذَّكاء» للذكاء الاصطناعي للأطفال ✨", width / 2, 107);

    // Certificate Main Title
    ctx.font = "900 32px 'Cairo', 'Tajawal', sans-serif";
    ctx.fillStyle = "#ffffff";
    ctx.fillText("🌟 شَهَادَةُ تَوْثِيقِ وَإِنْجَازِ مَشْرُوعِ AI 🌟", width / 2, 160);

    ctx.font = "700 13px 'Cairo', sans-serif";
    ctx.fillStyle = t.gold;
    ctx.fillText("AI PRACTICAL PROJECT & LEARNING ACHIEVEMENT", width / 2, 185);

    // Subtle divider line
    const lineGrad = ctx.createLinearGradient(width / 2 - 250, 0, width / 2 + 250, 0);
    lineGrad.addColorStop(0, "transparent");
    lineGrad.addColorStop(0.5, t.gold);
    lineGrad.addColorStop(1, "transparent");
    ctx.strokeStyle = lineGrad;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(width / 2 - 250, 205);
    ctx.lineTo(width / 2 + 250, 205);
    ctx.stroke();

    // 5. Recipient Section: Child Name
    ctx.font = "600 18px 'Cairo', 'Tajawal', sans-serif";
    ctx.fillStyle = t.subText;
    ctx.fillText("تُمنح هذه الشهادة بكل فخر للمبتكر الذكي:", width / 2, 245);

    // Child Name Banner
    ctx.fillStyle = "rgba(251, 191, 36, 0.12)";
    ctx.beginPath();
    ctx.roundRect(width / 2 - 260, 260, 520, 54, 18);
    ctx.fill();
    ctx.strokeStyle = t.gold;
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.font = "900 30px 'Cairo', 'Tajawal', sans-serif";
    ctx.fillStyle = "#ffffff";
    ctx.fillText(`🚀 ${childName.trim() || "البطل المبتكر"} 🌟`, width / 2, 298);

    // 6. Project Details Box
    const projectTitle = project.titleAr || project.title;
    ctx.font = "600 17px 'Cairo', 'Tajawal', sans-serif";
    ctx.fillStyle = t.subText;
    ctx.fillText("لإتمامه بنجاح وتفوق مختبر وتطبيق:", width / 2, 350);

    // Project Name & Score Box
    ctx.fillStyle = "rgba(255, 255, 255, 0.07)";
    ctx.beginPath();
    ctx.roundRect(100, 370, width - 200, 160, 20);
    ctx.fill();
    ctx.strokeStyle = "rgba(255, 255, 255, 0.15)";
    ctx.lineWidth = 1;
    ctx.stroke();

    // Project Title inside box
    ctx.font = "900 24px 'Cairo', 'Tajawal', sans-serif";
    ctx.fillStyle = "#ffffff";
    ctx.fillText(`« ${projectTitle} »`, width / 2, 410);

    // Project Summary (Wrapped text)
    const summaryText = project.descriptionAr || project.description || "تم تدريب واختبار نموذج الذكاء الاصطناعي بنجاح.";
    ctx.font = "500 15px 'Cairo', 'Tajawal', sans-serif";
    ctx.fillStyle = "rgba(255, 255, 255, 0.85)";

    const words = summaryText.split(" ");
    let line = "";
    let lineY = 445;
    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + " ";
      const metrics = ctx.measureText(testLine);
      if (metrics.width > width - 280 && n > 0) {
        ctx.fillText(line, width / 2, lineY);
        line = words[n] + " ";
        lineY += 24;
        if (lineY > 475) break;
      } else {
        line = testLine;
      }
    }
    if (line && lineY <= 475) {
      ctx.fillText(line, width / 2, lineY);
    }

    // Metrics Row inside Project Box
    const accuracyVal = project.accuracy !== undefined ? `${project.accuracy}%` : "مكتمل بنجاح";
    const dateFormatted = project.completedAt
      ? new Date(project.completedAt).toLocaleDateString("ar-SA", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      : new Date().toLocaleDateString("ar-SA", {
          year: "numeric",
          month: "long",
          day: "numeric",
        });

    // Accuracy badge
    ctx.fillStyle = "rgba(52, 211, 153, 0.2)";
    ctx.beginPath();
    ctx.roundRect(width / 2 - 230, 485, 210, 32, 12);
    ctx.fill();
    ctx.strokeStyle = "#34d399";
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.font = "bold 14px 'Cairo', sans-serif";
    ctx.fillStyle = "#34d399";
    const accuracyLabel = project.accuracy !== undefined ? `⚡ نسبة الدقة: ${project.accuracy}%` : "⚡ الحالة: مكتمل بنجاح";
    ctx.fillText(accuracyLabel, width / 2 - 125, 506);

    // Completion Date badge
    ctx.fillStyle = "rgba(129, 140, 248, 0.2)";
    ctx.beginPath();
    ctx.roundRect(width / 2 + 20, 485, 210, 32, 12);
    ctx.fill();
    ctx.strokeStyle = "#818cf8";
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.font = "bold 14px 'Cairo', sans-serif";
    ctx.fillStyle = "#c7d2fe";
    ctx.fillText(`📅 التاريخ: ${dateFormatted}`, width / 2 + 125, 506);

    // 7. Footer: Golden Seal & Signatures
    const sealX = 170;
    const sealY = 610;
    ctx.fillStyle = "rgba(251, 191, 36, 0.15)";
    ctx.beginPath();
    ctx.arc(sealX, sealY, 46, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = t.gold;
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.font = "bold 12px 'Cairo', sans-serif";
    ctx.fillStyle = t.gold;
    ctx.fillText("★ مُعْتَمَد ومُوَثَّق ★", sealX, sealY - 10);
    ctx.font = "900 13px 'Cairo', sans-serif";
    ctx.fillStyle = "#ffffff";
    ctx.fillText("VERIFIED AI LAB", sealX, sealY + 10);
    ctx.font = "bold 10px sans-serif";
    ctx.fillStyle = t.gold;
    ctx.fillText("2026 EDITION", sealX, sealY + 26);

    // Right: Signature
    const sigX = width - 180;
    const sigY = 610;
    ctx.font = "bold 14px 'Cairo', sans-serif";
    ctx.fillStyle = t.subText;
    ctx.fillText("إشراف وتوثيق:", sigX, sigY - 20);

    ctx.font = "900 17px 'Cairo', 'Tajawal', sans-serif";
    ctx.fillStyle = "#ffffff";
    ctx.fillText("مُعلِّمُ الذَّكاء الاصطناعي 🤖", sigX, sigY + 5);

    ctx.font = "600 12px 'Cairo', sans-serif";
    ctx.fillStyle = t.gold;
    ctx.fillText("رئيس لجنة المبتكرين الصغار", sigX, sigY + 25);

    // Center: Verification Serial Number
    ctx.font = "500 11px monospace";
    ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
    ctx.fillText(`Serial ID: ${serialId} • https://moallem-alzaka.edu`, width / 2, 650);
  };

  /**
   * Save PNG using html2canvas by capturing the styled DOM element
   */
  const handleDownloadHtml2CanvasPNG = async () => {
    if (!project) return;
    setIsExportingHtml2Canvas(true);

    try {
      const safeProjectTitle = (project.titleAr || project.title).replace(/[\/\\:*?"<>|]/g, "_");
      const safeChildName = childName.trim().replace(/[\/\\:*?"<>|]/g, "_");
      const fileName = `بطاقة_إنجاز_${safeChildName}_${safeProjectTitle}.png`;

      if (cardElementRef.current) {
        await exportElementToPNG(cardElementRef.current, fileName);
        onShowToast(`تم تصدير وحفظ بطاقة الإنجاز بتقنية html2canvas بنجاح! 📥✨`);
      } else {
        // Fallback to canvas export
        handleDownloadCanvasPNG();
      }

      if (onAwardXP && !hasAwardedDownloadXP) {
        onAwardXP(20, "تحميل بطاقة إنجاز رقمية");
        setHasAwardedDownloadXP(true);
      }
    } catch (err) {
      console.error("html2canvas export error:", err);
      // Fallback to Canvas
      handleDownloadCanvasPNG();
    } finally {
      setIsExportingHtml2Canvas(false);
    }
  };

  const handleDownloadCanvasPNG = () => {
    const canvas = canvasRef.current;
    if (!canvas || !project) return;

    try {
      const dataUrl = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      const safeProjectTitle = (project.titleAr || project.title).replace(/[\/\\:*?"<>|]/g, "_");
      const safeChildName = childName.trim().replace(/[\/\\:*?"<>|]/g, "_");
      link.download = `شهادة_انجاز_${safeChildName}_${safeProjectTitle}.png`;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      if (onAwardXP && !hasAwardedDownloadXP) {
        onAwardXP(20, "تحميل بطاقة إنجاز رقمية");
        setHasAwardedDownloadXP(true);
      }

      onShowToast(`تم تحميل بطاقة إنجاز (${project.titleAr || project.title}) بنجاح كصورة PNG فائقة الدقة! 📥✨`);
    } catch (err) {
      console.error(err);
      onShowToast("حدث خطأ أثناء تحميل الصورة، يرجى المحاولة مجدداً.");
    }
  };

  /**
   * Copy Unique Share Link to Clipboard
   */
  const handleCopyShareLink = async () => {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 3000);
      onShowToast("تم نسخ رابط المشاركة الفريد بنجاح! 🔗✨ أرسله لأصدقائك الآن ليطلعوا على إنجازك.");
      if (onAwardXP && !hasAwardedShareXP) {
        onAwardXP(15, "مشاركة رابط مشروع ذكي");
        setHasAwardedShareXP(true);
      }
    } catch (err) {
      console.error(err);
      onShowToast("تعذر نسخ الرابط تلقائياً، يرجى نسخه يدوياً من المربع.");
    }
  };

  /**
   * Share to WhatsApp
   */
  const handleWhatsAppShare = () => {
    if (!project) return;
    const title = project.titleAr || project.title;
    const score = project.accuracy ? `بنسبة دقة ${project.accuracy}%` : "بإتقان متميز";
    const text = `🌟 مرحباً يا أصدقاء! لقد أتممت بنجاح مشروع الذكاء الاصطناعي «${title}» ${score} على منصة مُعلِّم الذكاء! 🚀🤖\nشاهد بطاقة إنجازي الرقمية وتفاصيل المشروع عبر هذا الرابط الفريد:\n${shareUrl}`;
    const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(whatsappUrl, "_blank", "noopener,noreferrer");
    if (onAwardXP && !hasAwardedShareXP) {
      onAwardXP(15, "مشاركة رابط مشروع ذكي");
      setHasAwardedShareXP(true);
    }
    onShowToast("جاري فتح واتساب لمشاركة بطاقة إنجازك مع أصدقائك! 💬🚀");
  };

  /**
   * Native Web Share API
   */
  const handleNativeShare = async () => {
    if (!project) return;
    const title = project.titleAr || project.title;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `بطاقة إنجاز مشروع: ${title}`,
          text: `شاهد بطاقة إتقان مشروع الذكاء الاصطناعي (${title}) للمبتكر الصغير (${childName}) 🌟!`,
          url: shareUrl,
        });
        onShowToast("تمت المشاركة بنجاح! 🚀🎉");
      } catch (e) {
        handleCopyShareLink();
      }
    } else {
      handleCopyShareLink();
    }
  };

  const handleCopyImage = async () => {
    const canvas = canvasRef.current;
    if (!canvas || !project) return;

    try {
      canvas.toBlob(async (blob) => {
        if (!blob) return;
        try {
          await navigator.clipboard.write([
            new ClipboardItem({
              "image/png": blob,
            }),
          ]);
          setCopiedImage(true);
          setTimeout(() => setCopiedImage(false), 2500);
          onShowToast("تم نسخ صورة بطاقة الإنجاز إلى الحافظة! يمكنك لصقها الآن في واتساب أو أي تطبيق 📋🖼️");
        } catch (clipErr) {
          handleDownloadHtml2CanvasPNG();
        }
      });
    } catch (e) {
      handleDownloadHtml2CanvasPNG();
    }
  };

  if (!project) return null;

  const projectTitle = project.titleAr || project.title;
  const projectDesc = project.descriptionAr || project.description || "تم تدريب واختبار نموذج الذكاء الاصطناعي بنجاح.";
  const accuracyVal = project.accuracy !== undefined ? `${project.accuracy}%` : "مكتمل بنجاح";
  const dateFormatted = project.completedAt
    ? new Date(project.completedAt).toLocaleDateString("ar-SA", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : new Date().toLocaleDateString("ar-SA", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });

  // Dynamic Tailwind Theme Classes for HTML2Canvas Card Container
  const themeClasses: Record<CardTheme, { bg: string; border: string; glow: string; textAccent: string; pill: string }> = {
    "royal-indigo": {
      bg: "bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900",
      border: "border-amber-400/80 ring-2 ring-indigo-500/30",
      glow: "shadow-2xl shadow-indigo-950/60",
      textAccent: "text-amber-300",
      pill: "bg-indigo-900/80 border-indigo-400/40 text-indigo-100",
    },
    "emerald-tech": {
      bg: "bg-gradient-to-br from-slate-950 via-emerald-950 to-slate-900",
      border: "border-amber-400/80 ring-2 ring-emerald-500/30",
      glow: "shadow-2xl shadow-emerald-950/60",
      textAccent: "text-emerald-300",
      pill: "bg-emerald-900/80 border-emerald-400/40 text-emerald-100",
    },
    "cosmic-purple": {
      bg: "bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900",
      border: "border-amber-300/80 ring-2 ring-purple-500/30",
      glow: "shadow-2xl shadow-purple-950/60",
      textAccent: "text-purple-300",
      pill: "bg-purple-900/80 border-purple-400/40 text-purple-100",
    },
    "golden-champ": {
      bg: "bg-gradient-to-br from-stone-950 via-neutral-900 to-amber-950",
      border: "border-amber-400 ring-2 ring-amber-500/40",
      glow: "shadow-2xl shadow-amber-950/60",
      textAccent: "text-amber-300",
      pill: "bg-amber-950/80 border-amber-400/40 text-amber-100",
    },
  };

  const currentThemeStyle = themeClasses[selectedTheme];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-md overflow-y-auto" dir="rtl">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={{ duration: 0.2 }}
        className="bg-white rounded-3xl border border-slate-100 shadow-2xl w-full max-w-4xl overflow-hidden my-auto max-h-[95vh] flex flex-col"
      >
        {/* Modal Header */}
        <div className="p-4 sm:p-6 bg-gradient-to-r from-indigo-900 via-purple-900 to-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-amber-400/20 text-amber-300 flex items-center justify-center border border-amber-400/30 shrink-0">
              <Award className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <h3 className="text-base sm:text-xl font-black text-white flex items-center gap-2">
                <span>بطاقة إنجاز ومشاركة المشروع الرقمية</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] bg-amber-400/20 text-amber-300 border border-amber-400/40">
                  html2canvas & Unique Link
                </span>
              </h3>
              <p className="text-xs text-purple-200 font-medium">
                بطاقة إنجاز ورابط مشاركة تقديري لإرساله للأصدقاء والأهل 🌟
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs inside Modal: Card Preview vs Unique Link */}
        <div className="flex border-b border-slate-200 bg-slate-100/80 px-6 pt-2 gap-2">
          <button
            onClick={() => setActiveTab("card")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-xs font-black transition cursor-pointer border-b-2 ${
              activeTab === "card"
                ? "bg-white text-indigo-700 border-indigo-600 shadow-2xs"
                : "text-slate-600 hover:text-slate-900 border-transparent"
            }`}
          >
            <Palette className="w-3.5 h-3.5 text-indigo-500" />
            <span>معاينة البطاقة وتصدير PNG (html2canvas) 🖼️</span>
          </button>

          <button
            onClick={() => setActiveTab("share")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-xs font-black transition cursor-pointer border-b-2 ${
              activeTab === "share"
                ? "bg-white text-indigo-700 border-indigo-600 shadow-2xs"
                : "text-slate-600 hover:text-slate-900 border-transparent"
            }`}
          >
            <Share2 className="w-3.5 h-3.5 text-amber-500" />
            <span>رابط المشاركة الفريد ومواقع التواصل 🔗</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1 text-slate-800 bg-slate-50/80">
          {/* Controls Bar: Name Editor & Theme Selector */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
            {/* Child Name input */}
            <div className="space-y-1.5">
              <label className="text-xs font-black text-slate-700 flex items-center gap-1.5">
                <User className="w-4 h-4 text-indigo-600" />
                <span>اسم البطل المبتكر (يظهر بالبطاقة والرابط):</span>
              </label>
              <input
                type="text"
                value={childName}
                onChange={(e) => setChildName(e.target.value)}
                placeholder="أدخل اسم الطفل..."
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-black text-slate-900 focus:outline-hidden focus:border-indigo-500 focus:bg-white transition"
              />
            </div>

            {/* Theme Picker */}
            <div className="space-y-1.5">
              <label className="text-xs font-black text-slate-700 flex items-center gap-1.5">
                <Palette className="w-4 h-4 text-purple-600" />
                <span>طابع وثيم بطاقة الإنجاز:</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: "royal-indigo", label: "أزرق ملكي", color: "bg-indigo-900 text-indigo-100" },
                  { id: "emerald-tech", label: "زمرد ذكي", color: "bg-emerald-900 text-emerald-100" },
                  { id: "cosmic-purple", label: "كوني بنفسجي", color: "bg-purple-900 text-purple-100" },
                  { id: "golden-champ", label: "ذهبي فاخر", color: "bg-amber-950 text-amber-200" },
                ].map((th) => (
                  <button
                    key={th.id}
                    onClick={() => setSelectedTheme(th.id as CardTheme)}
                    className={`py-2 px-2 rounded-xl text-xs font-black transition border-2 cursor-pointer text-center ${th.color} ${
                      selectedTheme === th.id
                        ? "border-amber-400 shadow-md scale-[1.02]"
                        : "border-transparent opacity-75 hover:opacity-100"
                    }`}
                  >
                    {th.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {/* VIEW TAB 1: HTML2CANVAS & LIVE CARD PREVIEW */}
            {activeTab === "card" && (
              <motion.div
                key="tab-card"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.15 }}
                className="space-y-4"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-slate-700 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    <span>بطاقة الإنجاز الرقمية التفاعلية (قابلة للحفظ بدقة فائقة):</span>
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-extrabold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2.5 py-0.5 rounded-lg">
                      دقة عالية 1200x750 🖨️
                    </span>
                  </div>
                </div>

                {/* HTML DOM CARD ELEMENT FOR HTML2CANVAS CAPTURE */}
                <div
                  ref={cardElementRef}
                  id={`achievement-card-${project.id}`}
                  className={`p-6 sm:p-8 rounded-3xl border-3 ${currentThemeStyle.border} ${currentThemeStyle.bg} ${currentThemeStyle.glow} text-white relative overflow-hidden transition-all duration-300 font-cairo`}
                  style={{ minHeight: "440px" }}
                >
                  {/* Subtle Background Glow Spheres */}
                  <div className="absolute -top-20 -left-20 w-64 h-64 bg-amber-400/15 rounded-full blur-3xl pointer-events-none" />
                  <div className="absolute -bottom-20 -right-20 w-72 h-72 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

                  {/* Corner Ornaments */}
                  <div className="absolute top-3 left-3 w-6 h-6 border-t-2 border-l-2 border-amber-400 rounded-tl-lg pointer-events-none opacity-80" />
                  <div className="absolute top-3 right-3 w-6 h-6 border-t-2 border-r-2 border-amber-400 rounded-tr-lg pointer-events-none opacity-80" />
                  <div className="absolute bottom-3 left-3 w-6 h-6 border-b-2 border-l-2 border-amber-400 rounded-bl-lg pointer-events-none opacity-80" />
                  <div className="absolute bottom-3 right-3 w-6 h-6 border-b-2 border-r-2 border-amber-400 rounded-br-lg pointer-events-none opacity-80" />

                  {/* Top Certificate Header Strip */}
                  <div className="text-center space-y-2 relative z-10">
                    <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-white/10 border border-white/20 text-xs font-bold text-slate-200">
                      <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                      <span>منصة «مُعلِّمُ الذَّكاء» للذكاء الاصطناعي للأطفال</span>
                    </div>

                    <h2 className="text-xl sm:text-3xl font-black text-white tracking-wide">
                      🌟 شَهَادَةُ إِتْقَانِ وَإِنْجَازِ مَشْرُوعِ AI 🌟
                    </h2>
                    <p className="text-[11px] font-black text-amber-400 tracking-widest uppercase">
                      AI Project Practical Achievement Certificate
                    </p>
                  </div>

                  {/* Divider */}
                  <div className="h-px bg-gradient-to-r from-transparent via-amber-400 to-transparent my-4 opacity-70" />

                  {/* Recipient Section */}
                  <div className="text-center space-y-2 relative z-10">
                    <p className="text-xs sm:text-sm font-semibold text-slate-300">
                      تُمنح هذه الشهادة بكل فخر للمبتكر الذكي:
                    </p>
                    <div className="inline-block px-6 py-2 rounded-2xl bg-amber-400/15 border-2 border-amber-400/90 shadow-lg shadow-amber-400/10">
                      <h3 className="text-xl sm:text-3xl font-black text-white flex items-center gap-2">
                        <span>🚀</span>
                        <span>{childName.trim() || "البطل المبتكر"}</span>
                        <span>🌟</span>
                      </h3>
                    </div>
                  </div>

                  {/* Project Details Box */}
                  <div className="mt-4 p-4 sm:p-5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 relative z-10 text-center space-y-3">
                    <p className="text-xs text-slate-300 font-medium">
                      لإتمامه بنجاح وتفوق مختبر وتطبيق الذكاء الاصطناعي:
                    </p>
                    <h4 className="text-lg sm:text-2xl font-black text-amber-300">
                      « {projectTitle} »
                    </h4>
                    <p className="text-xs sm:text-sm text-slate-200 line-clamp-2 max-w-2xl mx-auto leading-relaxed">
                      {projectDesc}
                    </p>

                    {/* Stats Badges in Project Box */}
                    <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-500/25 border border-emerald-400 text-emerald-300 text-xs font-black">
                        <Zap className="w-3.5 h-3.5" />
                        <span>نسبة الدقة: {accuracyVal}</span>
                      </span>

                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-indigo-500/25 border border-indigo-400 text-indigo-200 text-xs font-black">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>تاريخ الإكمال: {dateFormatted}</span>
                      </span>

                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-500/25 border border-amber-400 text-amber-200 text-xs font-black">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>كود التوثيق: {serialId}</span>
                      </span>
                    </div>
                  </div>

                  {/* Footer Stamps & Verification */}
                  <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 pt-3 border-t border-white/15 relative z-10">
                    {/* Left: Verification Stamp */}
                    <div className="flex items-center gap-3">
                      <div className="w-14 h-14 rounded-full border-2 border-amber-400 bg-amber-400/20 flex flex-col items-center justify-center text-center text-amber-300 font-black p-1 shadow-inner">
                        <span className="text-[9px] leading-tight">إنجاز مميز</span>
                        <span className="text-[10px] text-white">★ AI ★</span>
                        <span className="text-[8px] opacity-80">2026</span>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-black text-amber-300 block">بطاقة إنجاز رقمية</span>
                        <span className="text-[10px] text-slate-300 font-mono">ID: {serialId}</span>
                      </div>
                    </div>

                    {/* Right: Platform */}
                    <div className="text-left sm:text-left space-y-0.5">
                      <span className="text-[11px] font-bold text-slate-300 block">إشراف وتوجيه:</span>
                      <span className="text-xs font-black text-white block">مُعلِّم الذكاء الاصطناعي 🤖</span>
                      <span className="text-[10px] text-amber-400 font-mono block">https://moallem-alzaka.edu</span>
                    </div>
                  </div>
                </div>

                {/* Hidden Native Canvas for backup/high-res Canvas rendering */}
                <canvas ref={canvasRef} className="hidden" />
              </motion.div>
            )}

            {/* VIEW TAB 2: UNIQUE SHARE LINK & SOCIAL BROADCAST */}
            {activeTab === "share" && (
              <motion.div
                key="tab-share"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.15 }}
                className="space-y-6"
              >
                {/* Hero Share Banner */}
                <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-900 via-indigo-800 to-purple-900 text-white flex flex-col sm:flex-row items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-amber-400 text-slate-900 flex items-center justify-center font-black text-2xl shadow-lg shadow-amber-400/20 shrink-0">
                    🔗
                  </div>
                  <div className="space-y-1 text-center sm:text-right">
                    <h4 className="text-base sm:text-lg font-black text-white">
                      رابط مشاركة فريد لبطاقة إنجاز ({projectTitle})
                    </h4>
                    <p className="text-xs text-indigo-200 leading-relaxed">
                      عندما يفتح أصدقاؤك هذا الرابط، ستظهر لهم بطاقة إنجازك الرقمية فوراً، ويمكنهم استكشاف نموذجك والاطلاع على درجتك الباهرة!
                    </p>
                  </div>
                </div>

                {/* Unique URL Copy Box */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs space-y-3">
                  <label className="text-xs font-black text-slate-800 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Globe className="w-4 h-4 text-indigo-600" />
                      <span>الرابط الفريد المباشر للمشروع:</span>
                    </span>
                    <span className="text-[10px] font-bold text-slate-500">
                      مشفر ببيانات الإنجاز ومعرف التوثيق
                    </span>
                  </label>

                  <div className="flex flex-col sm:flex-row items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={shareUrl}
                      className="w-full px-3.5 py-3 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono text-slate-800 select-all focus:outline-hidden focus:border-indigo-500"
                    />

                    <button
                      onClick={handleCopyShareLink}
                      className={`w-full sm:w-auto px-5 py-3 rounded-xl text-xs font-black transition flex items-center justify-center gap-2 shrink-0 cursor-pointer shadow-sm ${
                        copiedLink
                          ? "bg-emerald-600 text-white"
                          : "bg-indigo-600 hover:bg-indigo-700 text-white"
                      }`}
                    >
                      {copiedLink ? (
                        <>
                          <Check className="w-4 h-4" />
                          <span>تم نسخ الرابط! 🎉</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          <span>نسخ الرابط 📋</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Social Share Broadcast Options */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* WhatsApp Share Button */}
                  <button
                    onClick={handleWhatsAppShare}
                    className="p-4 rounded-2xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-900 flex items-center gap-3 transition cursor-pointer text-right group shadow-2xs"
                  >
                    <div className="w-11 h-11 rounded-xl bg-emerald-500 text-white flex items-center justify-center font-black text-xl shrink-0 group-hover:scale-105 transition-transform">
                      <MessageCircle className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <span className="text-xs font-black text-emerald-950 block">مشاركة عبر واتساب (WhatsApp)</span>
                      <span className="text-[11px] text-emerald-700 block">إرسال بطاقة الإنجاز لأصدقائك أو مجموعة العائلة</span>
                    </div>
                  </button>

                  {/* Native System Share */}
                  <button
                    onClick={handleNativeShare}
                    className="p-4 rounded-2xl bg-purple-50 hover:bg-purple-100 border border-purple-300 text-purple-900 flex items-center gap-3 transition cursor-pointer text-right group shadow-2xs"
                  >
                    <div className="w-11 h-11 rounded-xl bg-purple-600 text-white flex items-center justify-center font-black text-xl shrink-0 group-hover:scale-105 transition-transform">
                      <Share2 className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <span className="text-xs font-black text-purple-950 block">مشاركة عبر النظام أو البريد</span>
                      <span className="text-[11px] text-purple-700 block">إرسال عبر أي تطبيق مثبت على جهازك</span>
                    </div>
                  </button>
                </div>

                {/* Message Preview Box */}
                <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200/90 text-amber-950 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-xs font-black text-amber-900">
                    <Sparkles className="w-4 h-4 text-amber-600" />
                    <span>نص الرسالة الترحيبية عند المشاركة:</span>
                  </div>
                  <p className="text-xs text-amber-900/90 bg-white p-3 rounded-xl border border-amber-200 font-medium leading-relaxed">
                    🌟 مرحباً يا أصدقاء! لقد أتممت بنجاح مشروع الذكاء الاصطناعي «{projectTitle}» بنسبة دقة {accuracyVal} على منصة مُعلِّم الذكاء! 🚀🤖 شاهدوا بطاقة إنجازي الرقمية واكتشفوا كيف دربت النموذج الذكي!
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 sm:p-5 bg-white border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-black transition cursor-pointer"
          >
            إغلاق النافذة
          </button>

          <div className="flex flex-wrap items-center gap-2">
            {/* Copy Link Button */}
            <button
              onClick={handleCopyShareLink}
              className="px-4 py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-800 border border-indigo-200 rounded-xl text-xs font-black transition flex items-center gap-1.5 cursor-pointer"
            >
              {copiedLink ? (
                <>
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>تم نسخ الرابط! 🔗</span>
                </>
              ) : (
                <>
                  <Share2 className="w-4 h-4 text-indigo-600" />
                  <span>نسخ رابط المشاركة</span>
                </>
              )}
            </button>

            {/* Copy Image to Clipboard */}
            <button
              onClick={handleCopyImage}
              className="px-4 py-2.5 bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-200 rounded-xl text-xs font-black transition flex items-center gap-1.5 cursor-pointer"
            >
              {copiedImage ? (
                <>
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>تم نسخ الصورة! 📋</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-purple-600" />
                  <span>نسخ صورة البطاقة</span>
                </>
              )}
            </button>

            {/* Save PNG using html2canvas */}
            <button
              onClick={handleDownloadHtml2CanvasPNG}
              disabled={isExportingHtml2Canvas}
              className="px-5 sm:px-6 py-2.5 bg-gradient-to-r from-amber-500 via-orange-500 to-indigo-600 hover:from-amber-600 hover:to-indigo-700 text-white rounded-xl text-xs sm:text-sm font-black transition shadow-lg shadow-indigo-200 flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isExportingHtml2Canvas ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>جاري تصدير PNG...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>حفظ الصورة كـ PNG (html2canvas) 📥</span>
                </>
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

