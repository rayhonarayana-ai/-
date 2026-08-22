export type TabId =
  | "home"
  | "path"
  | "lab"
  | "projects"
  | "zaki"
  | "parent-report"
  | "graduate"
  | "graduation"
  | "profile"
  | "settings";

export type TabType =
  | TabId
  | "lessons"
  | "chat"
  | "labs"
  | "rewards"
  | "parent_report"
  | "graduation";

export type ProjectCategory =
  | "classification"
  | "computer-vision"
  | "prompt-engineering"
  | "python-code"
  | "other";

export type ProjectDifficulty = "easy" | "medium" | "hard";

export type ProjectStatus = "completed" | "in-progress" | "starred";

export type LevelStatus = "locked" | "available" | "in-progress" | "completed";

export type DeveloperRank = "explorer" | "builder" | "young-developer";

export interface Project {
  id: string;
  title: string;
  titleAr: string;
  description: string;
  descriptionAr: string;
  category: ProjectCategory;
  difficulty?: ProjectDifficulty;
  status: ProjectStatus;
  isStarred?: boolean;
  completedAt?: string;
  accuracy?: number;
  attempts?: number;
  labId?: string;
  levelId?: number;
  thumbnail?: string;
  tags: string[];
  childName?: string;
  resultPreview?: string;
  codeSnippet?: string;
  explanationAr?: string;
}

export type ProjectLabItem = Project;

export interface LabResult {
  id: string;
  labKey: string;
  titleAr: string;
  titleEn: string;
  category: ProjectCategory;
  levelId?: number;
  difficulty?: ProjectDifficulty;
  completedAt: string; // ISO date string e.g. "2026-08-14"
  accuracy?: number; // percentage (e.g., 98)
  attempts: number;
  durationMinutes: number;
  resultSummaryAr: string;
  resultSummaryEn: string;
  codeSnippet?: string;
  explanationAr?: string;
  tags: string[];
  childId?: string;
  thumbnail?: string;
}

export interface LabDefinition {
  id?: string;
  key: string;
  titleAr: string;
  titleEn: string;
  category: ProjectCategory;
  levelId: number; // 1, 2, or 3
  difficulty: ProjectDifficulty;
  estimatedMinutes: number;
  descriptionAr: string;
  learningGoalAr: string;
  tipsAr: string[];
  explanationAr: string;
  baseAccuracy: number;
  improveBonus: number;
  starterCode?: string;
  starterPrompt?: string;
  tags: string[];
  thumbnail: string;
}

export interface LearningLevel {
  id: number;
  titleAr: string;
  titleEn: string;
  descriptionAr: string;
  icon: string;
  requiredProjects: number;
  categories: ProjectCategory[];
  status: LevelStatus;
  completedCount: number;
  colorTheme: string;
  badgeTitleAr: string;
}

export interface Certificate {
  id: string;
  childName: string;
  titleAr: string;
  issuedAt: string;
  totalProjects: number;
  averageAccuracy: number;
  levelsCompleted: number;
  rank: DeveloperRank;
  rankTitleAr: string;
  highlightProjects: string[];
  serialNumber: string;
}

export interface GraduationState {
  rank: DeveloperRank;
  rankTitleAr: string;
  rankIcon: string;
  canGraduate: boolean;
  hasGraduated: boolean;
  certificate: Certificate | null;
  projectsToYoungDeveloper: number;
  completedLevelsCount: number;
  totalProjectsCount: number;
  averageAccuracy: number;
}

export interface ProjectsPortfolioData {
  childName: string;
  totalCompleted: number;
  totalStars: number;
  projects: Project[];
}

export interface User {
  name: string;
  role: "parent" | "child" | "guest";
}

export type ReportLanguage =
  | "quadrilingual"
  | "trilingual"
  | "ar_fusha"
  | "ar_darija"
  | "berber_tifinagh"
  | "berber_latin"
  | "fr"
  | "en";

export interface PedagogicalReportData {
  studentName: string;
  level: number;
  xp: number;
  streakDays: number;
  completedLessons: string[];
  completedLabs: string[];
  completedProjects?: any[];
  earnedBadges: string[];
  totalChatMessages: number;
  language: ReportLanguage;
  parentNotes?: string;
}

export type LabType = "train" | "prompt" | "vision" | "ethics";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  mood?: "happy" | "thinking" | "excited" | "teaching" | "celebrating";
}

export interface LessonStep {
  id: string;
  title: string;
  content: string;
  analogyTitle?: string;
  analogyContent?: string;
  keyTakeaway: string;
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
  diagramData?: {
    inputLabel: string;
    processLabel: string;
    outputLabel: string;
  };
  quizQuestion?: {
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  };
}

export interface PracticalProject {
  title: string;
  subtitle: string;
  description: string;
  objective: string;
  stepsToBuild: string[];
  interactiveType:
    | "sorter"
    | "train"
    | "vision_pixel"
    | "prompt_builder"
    | "gen_canvas"
    | "ethics_sim";
  labTypeLink?: LabType;
}

export interface Lesson {
  id: string;
  level: number;
  title: string;
  subtitle: string;
  iconName: string;
  color: string;
  description: string;
  estimatedMinutes: number;
  xpReward: number;
  steps: LessonStep[];
  practicalProject: PracticalProject;
}

export interface Badge {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: string;
  category: "lesson" | "lab" | "chat" | "master";
}

export interface ZakiCustomization {
  colorId: string;
  accessoryId: string;
  expressionId: string;
}

export interface WeeklyGoal {
  id: string;
  title: string;
  targetXP: number;
  startXP: number;
  startLessonsCount?: number;
  createdAt: string;
  isCompleted?: boolean;
}

export interface UserProgress {
  xp: number;
  level: number;
  streakDays: number;
  completedLessons: string[]; // lesson ids
  completedLabs: string[]; // lab ids
  earnedBadges: string[]; // badge ids
  totalChatMessages: number;
  studentName: string;
  zakiCustomization?: ZakiCustomization;
  weeklyGoal?: WeeklyGoal;
  appliedXpEventIds?: string[]; // Bounded set of processed idempotent XP event IDs
  lastLearningActivityDate?: string; // ISO calendar date "YYYY-MM-DD" of last qualifying learning activity
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface GeneratedQuiz {
  title: string;
  questions: QuizQuestion[];
}
