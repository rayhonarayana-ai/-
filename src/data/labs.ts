import { Project, ProjectCategory, ProjectDifficulty, ProjectStatus } from "../types";

export interface LabResult {
  id: string;
  labKey: string;
  titleAr: string;
  titleEn: string;
  category: ProjectCategory;
  difficulty?: ProjectDifficulty;
  completedAt: string; // ISO date string e.g. "2026-08-14"
  accuracy?: number; // percentage (e.g., 98)
  attempts: number;
  durationMinutes: number;
  resultSummaryAr: string;
  resultSummaryEn: string;
  codeSnippet?: string;
  tags: string[];
  childId?: string;
  thumbnail?: string;
}

/**
 * Helper to compute difficulty if not explicitly given
 */
export function getProjectDifficulty(project: {
  category?: ProjectCategory;
  difficulty?: ProjectDifficulty;
  durationMinutes?: number;
  tags?: string[];
}): ProjectDifficulty {
  if (project.difficulty) return project.difficulty;
  if (project.category === "python-code") return "hard";
  if (project.category === "computer-vision") return "medium";
  if (project.tags && project.tags.some((t) => t.toLowerCase().includes("python") || t.toLowerCase().includes("pipeline") || t.toLowerCase().includes("neural"))) {
    return "hard";
  }
  if (project.durationMinutes && project.durationMinutes >= 15) {
    return "medium";
  }
  return "easy";
}

/**
 * 5 Initial Realistic Completed Labs covering all project categories
 */
export const COMPLETED_LABS: LabResult[] = [
  {
    id: "lab-res-01",
    labKey: "train-fruits-animals",
    titleAr: "نموذج تصنيف الفواكه الطازجة والخضار 🍎",
    titleEn: "Smart Fruit & Vegetable Classifier AI",
    category: "classification",
    difficulty: "easy",
    completedAt: "2026-08-12T14:30:00.000Z",
    accuracy: 98,
    attempts: 2,
    durationMinutes: 12,
    resultSummaryAr: "تم تدريب نموذج تعلّم آلي على 30 عينة ملونة للتمييز الفوري بين التفاح والموز والبرتقال بدقة 98% وتجربته على عينات جديدة بنجاح تام.",
    resultSummaryEn: "Supervised classification model trained with 30 visual samples to distinguish fresh fruits with high accuracy and tested on unseen images.",
    codeSnippet: `# تدريب مصنف الفواكه الذكي
from sklearn.neighbors import KNeighborsClassifier

features = [[150, 1], [170, 1], [130, 2], [140, 2]]  # [الوزن, الملمس]
labels = ["تفاح", "تفاح", "برتقال", "برتقال"]

model = KNeighborsClassifier(n_neighbors=3)
model.fit(features, labels)
prediction = model.predict([[160, 1]])
print("التوقع الذكي:", prediction[0])`,
    tags: ["Supervised Learning", "Classification", "Dataset Training", "Machine Learning"],
    thumbnail: "🍎",
    childId: "child-001",
  },
  {
    id: "lab-res-02",
    labKey: "vision-object-detector",
    titleAr: "كاشف الوجوه ومحلل الملامح البصرية 👁️",
    titleEn: "Computer Vision Face & Feature Detector",
    category: "computer-vision",
    difficulty: "medium",
    completedAt: "2026-08-13T10:15:00.000Z",
    accuracy: 95,
    attempts: 1,
    durationMinutes: 15,
    resultSummaryAr: "استكشاف مصفوفات البكسلات واستخراج الملامح وكشف المربعات المحيطة بالوجه (Bounding Boxes) وتحديد الإضاءة في 20 ميلي ثانية.",
    resultSummaryEn: "Pixel matrix exploration and facial feature extraction with real-time bounding box prediction and brightness compensation.",
    codeSnippet: `# معالجة مصفوفة الصورة وكشف المربعات
import cv2

image = cv2.imread("robot_kid.jpg")
gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
face_cascade = cv2.CascadeClassifier('haarcascade_frontalface.xml')
faces = face_cascade.detectMultiScale(gray, 1.1, 4)

for (x, y, w, h) in faces:
    cv2.rectangle(image, (x, y), (x+w, y+h), (0, 255, 0), 2)
print(f"تم اكتشاف {len(faces)} وجوه بنجاح!")`,
    tags: ["Computer Vision", "Bounding Box", "Pixel Matrix", "Feature Maps"],
    thumbnail: "👁️",
    childId: "child-001",
  },
  {
    id: "lab-res-03",
    labKey: "prompt-space-story",
    titleAr: "هندسة أوامر قصة الفضاء: مغامرة زكي الكونية 🔮",
    titleEn: "Cosmic Storyteller Prompt Engineering System",
    category: "prompt-engineering",
    difficulty: "easy",
    completedAt: "2026-08-13T16:45:00.000Z",
    accuracy: 100,
    attempts: 1,
    durationMinutes: 10,
    resultSummaryAr: "صياغة وتطبيق معادلة الأوامر الخماسية (الدور، المهمة، السياق، القيود، والأسلوب) لتوليد مغامرة فضاء خيالية متناسقة ومشوقة.",
    resultSummaryEn: "Crafted prompt architecture utilizing the 5-element prompting framework to guide generative LLM toward structured storytelling.",
    codeSnippet: `[نظام هندسة الأوامر المحترف]
الدور: مؤلف قصص خيال علمي ملهمة للأطفال المبتكرين
المهمة: اكتب مغامرة قصيرة عن الروبوت زكي في كوكب الكريستال الأخضر
الأسلوب: حماسي، تشويقي، علمي مبسط
القيود: 4 فقرات، ذكر معلومة فلكية حقيقية، ونهاية ملهمة بالذكاء الاصطناعي
درجة الإبداع (Temperature): 0.7`,
    tags: ["Prompt Engineering", "Generative AI", "Storytelling", "LLM Control"],
    thumbnail: "🔮",
    childId: "child-001",
  },
  {
    id: "lab-res-04",
    labKey: "python-clean-data",
    titleAr: "خوارزمية بايثون الذكية لترتيب وتصفية البيانات 🐍",
    titleEn: "Smart Python Data Sorting & Cleaning Pipeline",
    category: "python-code",
    difficulty: "hard",
    completedAt: "2026-08-14T08:20:00.000Z",
    accuracy: 96,
    attempts: 3,
    durationMinutes: 18,
    resultSummaryAr: "برمجة دالة بايثون ذكية لاستبعاد القيم الشاذة، ملء البيانات المفقودة، وترتيب درجات اختبار النماذج تصاعدياً وتنسيقها.",
    resultSummaryEn: "Authored Python pipeline to filter noisy outliers, impute missing values, and prepare structured datasets for ML ingestion.",
    codeSnippet: `# تنظيف وترتيب بيانات تجارب الذكاء الاصطناعي
def clean_and_sort_scores(raw_data):
    # إزالة القيم غير الصالحة وتصفية القيم الشاذة
    valid_scores = [item for item in raw_data if item is not None and 0 <= item["score"] <= 100]
    # الترتيب حسب نسبة الدقة تصاعدياً
    sorted_scores = sorted(valid_scores, key=lambda x: x["score"], reverse=True)
    return sorted_scores

experiment_data = [{"id": 1, "score": 98}, {"id": 2, "score": 95}, {"id": 3, "score": None}]
print("البيانات المنقاة:", clean_and_sort_scores(experiment_data))`,
    tags: ["Python", "Data Cleaning", "Algorithms", "Dataset Pipeline"],
    thumbnail: "🐍",
    childId: "child-001",
  },
  {
    id: "lab-res-05",
    labKey: "ethics-safe-charter",
    titleAr: "ميثاق المهندس الأخلاقي وحارس الأمان الرقمي 🛡️",
    titleEn: "AI Safety Guardian & Digital Ethics Charter",
    category: "other",
    difficulty: "easy",
    completedAt: "2026-08-14T11:00:00.000Z",
    accuracy: 100,
    attempts: 1,
    durationMinutes: 8,
    resultSummaryAr: "اجتياز اختبارات تمييز التزييف العميق وحماية الخصوصية وصياغة ميثاق الأمان الرقمي المعتمد لاستخدام الذكاء الاصطناعي لمصلحة البشرية.",
    resultSummaryEn: "Verified mastery of AI ethics scenarios: privacy preservation, deepfake verification, and fair algorithmic principles.",
    codeSnippet: `// ميثاق الأمان والمسؤولية الأخلاقية
const ETHICAL_AI_PRINCIPLES = {
  privacyFirst: "عدم مشاركة البيانات الشخصية أو الصور الخاصة دون إذن",
  verifyTruth: "التحقق الدائم من مصدر المعلومات قبل تصديقها",
  humanBenefiting: "توجيه أدوات الذكاء الاصطناعي لحل المشكلات ومساعدة المجتمع",
  transparency: "التوضيح الصادق عند استخدام الذكاء الاصطناعي في كتابة أو توليد محتوى"
};`,
    tags: ["AI Ethics", "Data Privacy", "Deepfake Awareness", "Safety Protocol"],
    thumbnail: "🛡️",
    childId: "child-001",
  },
];

/**
 * Transforms a completed LabResult into a Project format for the Portfolio
 */
export function labToProject(lab: LabResult): Project {
  let status: ProjectStatus = "completed";
  if (lab.accuracy !== undefined && lab.accuracy >= 98) {
    status = "starred";
  }

  const difficulty = getProjectDifficulty(lab);

  return {
    id: lab.id,
    title: lab.titleEn,
    titleAr: lab.titleAr,
    description: lab.resultSummaryEn,
    descriptionAr: lab.resultSummaryAr,
    category: lab.category,
    difficulty: difficulty,
    status: status,
    completedAt: lab.completedAt,
    accuracy: lab.accuracy,
    labId: lab.labKey,
    thumbnail: lab.thumbnail || "🚀",
    tags: lab.tags,
    childName: "البطل المبتكر",
    resultPreview: lab.resultSummaryAr,
    codeSnippet: lab.codeSnippet,
  };
}

/**
 * Converts an array of LabResults into an array of Project items
 */
export function getProjectsFromLabs(labs?: LabResult[]): Project[] {
  const sourceLabs = labs && labs.length > 0 ? labs : COMPLETED_LABS;
  return sourceLabs.map(labToProject);
}

/**
 * Computes portfolio summary statistics
 */
export function getLabsStats(labs?: LabResult[]): {
  totalCompleted: number;
  averageAccuracy: number;
  totalStars: number;
  byCategory: Record<ProjectCategory, number>;
  byDifficulty: Record<ProjectDifficulty, number>;
} {
  const sourceLabs = labs && labs.length > 0 ? labs : COMPLETED_LABS;
  const totalCompleted = sourceLabs.length;

  const validAccuracies = sourceLabs
    .filter((l) => typeof l.accuracy === "number")
    .map((l) => l.accuracy as number);

  const averageAccuracy =
    validAccuracies.length > 0
      ? Math.round(validAccuracies.reduce((a, b) => a + b, 0) / validAccuracies.length)
      : 100;

  const totalStars = sourceLabs.filter((l) => (l.accuracy ?? 0) >= 98).length;

  const byCategory: Record<ProjectCategory, number> = {
    classification: 0,
    "computer-vision": 0,
    "prompt-engineering": 0,
    "python-code": 0,
    other: 0,
  };

  const byDifficulty: Record<ProjectDifficulty, number> = {
    easy: 0,
    medium: 0,
    hard: 0,
  };

  sourceLabs.forEach((l) => {
    if (byCategory[l.category] !== undefined) {
      byCategory[l.category]++;
    } else {
      byCategory.other++;
    }

    const diff = getProjectDifficulty(l);
    if (byDifficulty[diff] !== undefined) {
      byDifficulty[diff]++;
    } else {
      byDifficulty.easy++;
    }
  });

  return {
    totalCompleted,
    averageAccuracy,
    totalStars,
    byCategory,
    byDifficulty,
  };
}
