import html2canvas from "html2canvas";
import { Project } from "../types";

/**
 * Returns a consistent serial ID for any project
 */
export function getSerialIdForProject(projectId: string): string {
  const cleanId = (projectId || "proj").replace(/[^a-zA-Z0-9]/g, "").slice(-8).toUpperCase();
  return `MZ-AI-${cleanId.padStart(8, "X")}`;
}

/**
 * Generates a unique shareable URL for a project
 */
export function generateProjectShareUrl(
  project: Project,
  childName: string = "البطل المبتكر"
): string {
  try {
    const origin = typeof window !== "undefined" && window.location ? window.location.origin : "";
    const pathname = typeof window !== "undefined" && window.location ? window.location.pathname : "";
    const params = new URLSearchParams();
    params.set("tab", "projects");
    params.set("share_project", project.id);
    if (childName && childName.trim()) {
      params.set("student", childName.trim());
    }
    if (project.titleAr) params.set("title", project.titleAr);
    if (project.accuracy !== undefined) params.set("acc", String(project.accuracy));
    if (project.category) params.set("cat", project.category);
    return `${origin}${pathname}?${params.toString()}`;
  } catch (e) {
    return typeof window !== "undefined" ? window.location.href : "";
  }
}

/**
 * Captures an HTML DOM element as a high-resolution PNG image using html2canvas
 * and triggers an automatic file download.
 */
export async function exportElementToPNG(
  element: HTMLElement,
  fileName: string = "بطاقة_إنجاز_مشروع_الذكاء_الاصطناعي.png"
): Promise<string> {
  const canvas = await html2canvas(element, {
    scale: 2, // 2x retina clarity
    useCORS: true,
    allowTaint: true,
    backgroundColor: null,
    logging: false,
  });

  const dataUrl = canvas.toDataURL("image/png");
  const link = document.createElement("a");
  link.download = fileName.endsWith(".png") ? fileName : `${fileName}.png`;
  link.href = dataUrl;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  return dataUrl;
}

/**
 * Generates and downloads a high-resolution PNG achievement certificate card
 * with the child's name, project title, completion date, and verification seal.
 */
export function downloadProjectAchievementPNG(
  project: Project,
  childName: string = "البطل المبتكر"
): void {
  const canvas = document.createElement("canvas");
  const width = 1200;
  const height = 750;
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  // 1. Royal Indigo Background Gradient
  const bgGradient = ctx.createLinearGradient(0, 0, width, height);
  bgGradient.addColorStop(0, "#0f172a");
  bgGradient.addColorStop(0.5, "#1e1b4b");
  bgGradient.addColorStop(1, "#312e81");
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

  drawGlow(150, 150, 250, "rgba(251, 191, 36, 0.3)");
  drawGlow(width - 150, height - 150, 300, "rgba(99, 102, 241, 0.25)");

  // 2. Outer Ornamental Border
  ctx.strokeStyle = "#fbbf24";
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
    ctx.strokeStyle = "#fbbf24";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(-20, 0);
    ctx.lineTo(0, 0);
    ctx.lineTo(0, -20);
    ctx.stroke();

    ctx.fillStyle = "#fbbf24";
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
  ctx.fillStyle = "rgba(15, 23, 42, 0.75)";
  ctx.beginPath();
  ctx.roundRect(60, 60, width - 120, height - 120, 24);
  ctx.fill();
  ctx.strokeStyle = "#4338ca";
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
  ctx.fillStyle = "#c7d2fe";
  ctx.fillText("✨ منصة «مُعلِّمُ الذَّكاء» للذكاء الاصطناعي للأطفال ✨", width / 2, 107);

  // Certificate Main Title
  ctx.font = "900 32px 'Cairo', 'Tajawal', sans-serif";
  ctx.fillStyle = "#ffffff";
  ctx.fillText("🌟 شَهَادَةُ تَوْثِيقِ وَإِنْجَازِ مَشْرُوعِ AI 🌟", width / 2, 160);

  ctx.font = "700 13px 'Cairo', sans-serif";
  ctx.fillStyle = "#fbbf24";
  ctx.fillText("AI PRACTICAL PROJECT & LEARNING ACHIEVEMENT", width / 2, 185);

  // Subtle divider line
  const lineGrad = ctx.createLinearGradient(width / 2 - 250, 0, width / 2 + 250, 0);
  lineGrad.addColorStop(0, "transparent");
  lineGrad.addColorStop(0.5, "#fbbf24");
  lineGrad.addColorStop(1, "transparent");
  ctx.strokeStyle = lineGrad;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(width / 2 - 250, 205);
  ctx.lineTo(width / 2 + 250, 205);
  ctx.stroke();

  // 5. Recipient Section: Child Name
  ctx.font = "600 18px 'Cairo', 'Tajawal', sans-serif";
  ctx.fillStyle = "#c7d2fe";
  ctx.fillText("تُمنح هذه الشهادة بكل فخر للمبتكر الذكي:", width / 2, 245);

  // Child Name Banner
  ctx.fillStyle = "rgba(251, 191, 36, 0.12)";
  ctx.beginPath();
  ctx.roundRect(width / 2 - 260, 260, 520, 54, 18);
  ctx.fill();
  ctx.strokeStyle = "#fbbf24";
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.font = "900 30px 'Cairo', 'Tajawal', sans-serif";
  ctx.fillStyle = "#ffffff";
  ctx.fillText(`🚀 ${childName.trim() || "البطل المبتكر"} 🌟`, width / 2, 298);

  // 6. Project Details Box
  const projectTitle = project.titleAr || project.title;
  ctx.font = "600 17px 'Cairo', 'Tajawal', sans-serif";
  ctx.fillStyle = "#c7d2fe";
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
  const accuracyText = project.accuracy !== undefined ? `⚡ نسبة الدقة: ${project.accuracy}%` : "⚡ الحالة: مكتمل بنجاح";
  ctx.fillText(accuracyText, width / 2 - 125, 506);

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
  ctx.strokeStyle = "#fbbf24";
  ctx.lineWidth = 3;
  ctx.stroke();

  ctx.font = "bold 12px 'Cairo', sans-serif";
  ctx.fillStyle = "#fbbf24";
  ctx.fillText("★ مُعْتَمَد ومُوَثَّق ★", sealX, sealY - 10);
  ctx.font = "900 13px 'Cairo', sans-serif";
  ctx.fillStyle = "#ffffff";
  ctx.fillText("VERIFIED AI LAB", sealX, sealY + 10);
  ctx.font = "bold 10px sans-serif";
  ctx.fillStyle = "#fbbf24";
  ctx.fillText("2026 EDITION", sealX, sealY + 26);

  // Right: Signature
  const sigX = width - 180;
  const sigY = 610;
  ctx.font = "bold 14px 'Cairo', sans-serif";
  ctx.fillStyle = "#c7d2fe";
  ctx.fillText("إشراف وتوثيق:", sigX, sigY - 20);

  ctx.font = "900 17px 'Cairo', 'Tajawal', sans-serif";
  ctx.fillStyle = "#ffffff";
  ctx.fillText("مُعلِّمُ الذَّكاء الاصطناعي 🤖", sigX, sigY + 5);

  ctx.font = "600 12px 'Cairo', sans-serif";
  ctx.fillStyle = "#fbbf24";
  ctx.fillText("رئيس لجنة المبتكرين الصغار", sigX, sigY + 25);

  // Verification ID
  const serialId = `MZ-AI-${project.id.replace(/[^a-zA-Z0-9]/g, "").slice(-8).toUpperCase()}`;
  ctx.font = "500 11px monospace";
  ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
  ctx.fillText(`Serial ID: ${serialId} • https://moallem-alzaka.edu`, width / 2, 650);

  // Trigger Download
  const dataUrl = canvas.toDataURL("image/png");
  const link = document.createElement("a");
  const safeProjectTitle = (project.titleAr || project.title).replace(/[\/\\:*?"<>|]/g, "_");
  const safeChildName = childName.trim().replace(/[\/\\:*?"<>|]/g, "_");
  link.download = `بطاقة_إنجاز_${safeChildName}_${safeProjectTitle}.png`;
  link.href = dataUrl;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
