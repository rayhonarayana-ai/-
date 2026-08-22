import React, { useState, useEffect, useRef } from "react";
import { speakText } from "../data/mascot";
import { Eye, Upload, Scan, Sparkles, Volume2, Loader2, Image as ImageIcon, CheckCircle2, ArrowLeft } from "lucide-react";
import { LabResult } from "../data/labs";
import { recordLearningEvidence } from "../utils/learningEvidence";
import { aiClient } from "../services/aiClient";

interface LabVisionAIProps {
  onAwardXP: (amount: number, reason: string) => void;
  onCompleteProject?: (lab: LabResult) => void;
  onNavigateToPortfolio?: () => void;
}

const SAMPLE_IMAGES = [
  {
    id: "sample-cat",
    title: "قطة منزلية 🐱",
    url: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "sample-robot",
    title: "روبوت ذكي 🤖",
    url: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "sample-car",
    title: "سيارة حديثة 🚗",
    url: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "sample-space",
    title: "رائد فضاء 🚀",
    url: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=600&q=80",
  },
];

export const LabVisionAI: React.FC<LabVisionAIProps> = ({
  onAwardXP,
  onCompleteProject,
  onNavigateToPortfolio,
}) => {
  const [selectedImg, setSelectedImg] = useState<string>(SAMPLE_IMAGES[0].url);
  const [scanning, setScanning] = useState(false);
  const [visionAnalysis, setVisionAnalysis] = useState<string | null>(null);
  const [showEdgeFilter, setShowEdgeFilter] = useState(false);
  const [hasAwardedVisionXP, setHasAwardedVisionXP] = useState(false);
  const [savedToPortfolio, setSavedToPortfolio] = useState(false);
  const objectUrlsRef = useRef<string[]>([]);

  // Cleanup object URLs on unmount to prevent memory leaks
  useEffect(() => {
    return () => {
      objectUrlsRef.current.forEach((url) => {
        try {
          URL.revokeObjectURL(url);
        } catch {}
      });
      objectUrlsRef.current = [];
    };
  }, []);

  const handleAnalyzeImage = async (imageUrl: string) => {
    setSelectedImg(imageUrl);
    setScanning(true);
    setVisionAnalysis(null);
    setSavedToPortfolio(false);

    try {
      // Fetch image and convert to base64
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const reader = new FileReader();

      reader.onloadend = async () => {
        const base64data = reader.result as string;

        try {
          const data = await aiClient.explainVisionImage({
            imageBase64: base64data,
            mimeType: blob.type || "image/jpeg",
          });

          const explanationText = data.explanation;
          const isAiGenerated = data.aiGenerated;

          setVisionAnalysis(explanationText);
          if (!hasAwardedVisionXP) {
            onAwardXP(45, "تحليل رؤية الكمبيوتر بالذكاء الاصطناعي");
            setHasAwardedVisionXP(true);
          }
          speakText(explanationText.slice(0, 150));

          if (onCompleteProject) {
            // Record non-assessed lab evidence (Visual exploration, assessed = false)
            recordLearningEvidence({
              type: "LAB_COMPLETED",
              sourceId: "lab-vision-ai",
              skillIds: ["skill_computer_vision"],
              assessed: false,
              metadata: { sampleUrl: imageUrl },
            });

            const activeSample = SAMPLE_IMAGES.find((s) => s.url === imageUrl);
            const sampleName = activeSample ? activeSample.title : "صورة مخصصة 🖼️";

            const summaryText = isAiGenerated
              ? `تحليل ملامح وبكسلات الصورة (${sampleName}) واستخراج المربعات المحيطة والعناصر عبر نموذج الرؤية البصرية.`
              : `استكشاف تفاعلي لمعالم الصورة (${sampleName}) وتطبيق فلتر مصفوفة الحواف البصرية.`;

            const newProject: LabResult = {
              id: `vision-${Date.now()}`,
              labKey: "vision-object-detector",
              titleAr: `محلل الرؤية البصرية: ${sampleName}`,
              titleEn: `Computer Vision Feature Extractor: ${sampleName}`,
              category: "computer-vision",
              completedAt: new Date().toISOString(),
              attempts: 1,
              durationMinutes: 12,
              resultSummaryAr: summaryText,
              resultSummaryEn: `Extracted pixel feature maps and analyzed visual contours for ${sampleName}.`,
              codeSnippet: `# تحليل مصفوفة البكسلات واستخراج الملامح
import cv2

image = cv2.imread("vision_sample.jpg")
gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
edges = cv2.Canny(gray, 100, 200)
print("تم استخراج مصفوفة الحواف والملامح البصرية بنجاح!")`,
              tags: ["Computer Vision", "Pixel Matrix", "Feature Maps", "Bounding Box"],
              thumbnail: "👁️",
            };

            onCompleteProject(newProject);
            setSavedToPortfolio(true);
          }
        } catch (e) {
          console.error(e);
          setVisionAnalysis(
            "تعذر الاتصال بخدمة تحليل الصور حالياً. جرب تفعيل فلتر الحواف لاستكشاف بنية البكسلات! 👁️💡"
          );
        } finally {
          setScanning(false);
        }
      };

      reader.readAsDataURL(blob);
    } catch (err) {
      console.error(err);
      setScanning(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      objectUrlsRef.current.push(url);
      handleAnalyzeImage(url);
    }
  };

  return (
    <div className="p-6 sm:p-8 bg-white rounded-3xl border-2 border-slate-200 shadow-xl space-y-8">
      {/* Title */}
      <div>
        <span className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-xl text-xs font-black">
          مختبر 3 • رؤية الكمبيوتر (Computer Vision) 👁️
        </span>
        <h2 className="text-2xl font-black text-slate-900 mt-2">مختبر العين الإلكترونية الذكية</h2>
        <p className="text-sm font-bold text-slate-500">اختر صورة أو ارفع صورتك الخاصة لتكتشف كيف يفككها الذكاء الاصطناعي إلى بكسلات وأشكال!</p>
      </div>

      {/* Sample Image Selector */}
      <div className="space-y-3">
        <label className="text-xs font-black text-slate-700 block">اختر صورة للتجربة أو ارفع صورة من جهازك:</label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {SAMPLE_IMAGES.map((img) => (
            <button
              key={img.id}
              onClick={() => handleAnalyzeImage(img.url)}
              className={`p-2 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 cursor-pointer ${
                selectedImg === img.url ? "border-emerald-600 bg-emerald-50 scale-105 shadow-md" : "border-slate-200 hover:border-slate-300"
              }`}
            >
              <img src={img.url} alt={img.title} className="w-full h-24 object-cover rounded-xl" crossOrigin="anonymous" referrerPolicy="no-referrer" />
              <span className="text-xs font-black text-slate-800">{img.title}</span>
            </button>
          ))}
        </div>

        {/* Custom Upload */}
        <div className="pt-2">
          <label className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-black cursor-pointer transition">
            <Upload className="w-4 h-4" />
            <span>أو ارفع صورة من جهازك 📁</span>
            <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
          </label>
        </div>
      </div>

      {/* Viewer & Scanner Area */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
        {/* Left: The Image with Scanning Ray */}
        <div className="relative rounded-3xl overflow-hidden border-2 border-slate-800 bg-slate-900 aspect-video flex items-center justify-center">
          <img
            src={selectedImg}
            alt="Target"
            crossOrigin="anonymous"
            referrerPolicy="no-referrer"
            className={`w-full h-full object-contain transition-all duration-300 ${
              showEdgeFilter ? "filter invert contrast-200 grayscale" : ""
            }`}
          />

          {/* Scanning Animation Laser Line */}
          {scanning && (
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
              <div className="w-full h-1 bg-emerald-400 shadow-[0_0_15px_#34d399] animate-bounce" />
              <div className="absolute inset-0 bg-emerald-500/10 backdrop-blur-2xs flex items-center justify-center">
                <span className="px-4 py-2 bg-slate-900/90 text-emerald-400 font-mono text-xs font-black rounded-xl border border-emerald-500 animate-pulse flex items-center gap-2">
                  <Scan className="w-4 h-4 animate-spin" />
                  جاري تفكيك مصفوفة البكسلات وكشف الكائنات...
                </span>
              </div>
            </div>
          )}

          {/* Pixel Matrix Filter Toggle */}
          <div className="absolute bottom-3 right-3 flex gap-2">
            <button
              onClick={() => setShowEdgeFilter(!showEdgeFilter)}
              className={`px-3 py-1.5 rounded-xl text-[11px] font-black transition ${
                showEdgeFilter ? "bg-emerald-500 text-slate-900" : "bg-slate-800/80 text-slate-200 hover:bg-slate-700"
              }`}
            >
              {showEdgeFilter ? "👁️ فلتر الحواف مفعل" : "⚡ عرض خطوط الحواف (Edges)"}
            </button>
          </div>
        </div>

        {/* Right: AI Vision Output explanation */}
        <div className="p-6 bg-slate-50 rounded-3xl border border-slate-200 flex flex-col justify-between h-full space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-black text-emerald-700 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4" />
                تحليل العين الذكية (Vision AI Engine):
              </span>
              {visionAnalysis && (
                <button
                  onClick={() => speakText(visionAnalysis)}
                  className="p-1.5 text-emerald-700 hover:bg-emerald-100 rounded-lg transition"
                  title="استماع للشرح"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              )}
            </div>

            {scanning ? (
              <div className="py-12 text-center text-slate-400 space-y-2">
                <Loader2 className="w-8 h-8 animate-spin mx-auto text-emerald-600" />
                <p className="text-xs font-bold">الذكاء الاصطناعي يفحص الأشكال والألوان والملامح الآن...</p>
              </div>
            ) : visionAnalysis ? (
              <div className="space-y-4 animate-fadeIn">
                <p className="text-sm font-bold text-slate-800 leading-relaxed bg-white p-4 rounded-2xl border border-emerald-200">
                  {visionAnalysis}
                </p>

                {savedToPortfolio && (
                  <div className="p-3 bg-emerald-100/70 border border-emerald-200 rounded-xl text-xs font-black text-emerald-900 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      تم توثيق نموذج الرؤية في محفظة مشاريعك! 🚀
                    </span>
                    {onNavigateToPortfolio && (
                      <button
                        onClick={onNavigateToPortfolio}
                        className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[11px] font-black transition flex items-center gap-1 cursor-pointer"
                      >
                        <span>عرض في المحفظة</span>
                        <ArrowLeft className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="py-12 text-center text-slate-400 space-y-2">
                <ImageIcon className="w-12 h-12 mx-auto text-slate-300" />
                <p className="text-xs font-bold">اضغط على أي صورة بالأعلى لبدء التحليل الفوري بالذكاء الاصطناعي!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
