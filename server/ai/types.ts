/**
 * Server AI Gateway - Types and Contracts
 * Gate 5 Architecture: Secure, bounded, child-safe AI gateway.
 */

export type AIErrorCategory =
  | "INVALID_INPUT"
  | "RATE_LIMITED"
  | "AI_UNAVAILABLE"
  | "AI_TIMEOUT"
  | "UNSAFE_REQUEST"
  | "INVALID_AI_RESPONSE";

export type AITaskType =
  | "chat"
  | "prompt_lab"
  | "vision_explain"
  | "quiz_generation"
  | "pedagogical_report";

export interface ProviderRequest {
  task: AITaskType;
  contents: any;
  systemInstruction?: string;
  temperature?: number;
  responseMimeType?: string;
  responseSchema?: any;
  preferredModel?: string;
  timeoutMs?: number;
  requestId?: string;
}

export interface ProviderResponse {
  text: string;
  raw?: any;
  modelUsed: string;
  latencyMs: number;
}

export interface AIProvider {
  name: string;
  generate(request: ProviderRequest): Promise<ProviderResponse>;
}

export interface GatewayResult<T> {
  success: boolean;
  data?: T;
  aiGenerated: boolean;
  requestId?: string;
  error?: {
    category: AIErrorCategory;
    message: string;
    safeUserMessage: string;
    retryAfterSeconds?: number;
  };
  fallbackData?: T;
  metadata?: {
    latencyMs: number;
    modelUsed?: string;
    attempts: number;
  };
}

export interface ChatMessage {
  role: "user" | "assistant" | "model";
  content: string;
}

export interface ChatRequestPayload {
  messages: ChatMessage[];
  language?: string;
  persona?: string;
  personaPrompt?: string;
}

export interface PromptLabPayload {
  subject?: string;
  setting?: string;
  style?: string;
  emotion?: string;
}

export interface VisionExplainPayload {
  imageBase64: string;
  mimeType?: string;
}

export interface QuizGenerationPayload {
  topic?: string;
}

export interface GeneratedQuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface GeneratedQuiz {
  title: string;
  questions: GeneratedQuizQuestion[];
}

export interface PedagogicalReportPayload {
  studentName?: string;
  level?: number;
  xp?: number;
  streakDays?: number;
  completedLessons?: string[];
  completedLabs?: string[];
  completedProjects?: Array<{
    title: string;
    category?: string;
    categoryLabel?: string;
    score?: number;
    description?: string;
  }>;
  earnedBadges?: string[];
  totalChatMessages?: number;
  language?: string;
  parentNotes?: string;
}
