/**
 * Speech System Types & Interfaces
 * Provides a modular, extensible architecture supporting Web Speech API,
 * Azure Cognitive Neural Voices, and ElevenLabs.
 */

export type VoiceGender = "boy" | "girl" | "robot" | "teacher" | "neutral";
export type SpeechSpeedPreset = "slow" | "normal" | "fast";
export type TTSProviderType = "webspeech" | "azure" | "elevenlabs";

export interface TTSVoiceInfo {
  id: string;
  name: string;
  lang: string;
  gender?: "male" | "female" | "neutral";
  isLocalService?: boolean;
  provider: TTSProviderType;
  qualityRating?: number; // 1-5 stars
  isNeuralOrNatural?: boolean;
  isMoroccan?: boolean;
  description?: string;
}

export interface VoiceEngineDiagnosis {
  selectedVoiceName: string;
  selectedVoiceLang: string;
  isMoroccan: boolean;
  isNaturalNeural: boolean;
  qualityRating: number;
  totalArabicVoicesFound: number;
  provider: TTSProviderType;
  fallbackNote?: string;
}

export interface TTSOptions {
  pitch?: number; // default 1.08 - 1.12
  rate?: number; // default 0.85 (0.82 - 0.88 for children)
  speedPreset?: SpeechSpeedPreset; // "slow" (0.76), "normal" (0.85), "fast" (1.05)
  gender?: VoiceGender;
  lang?: string; // e.g. "ar-MA", "ar-SA", "fr-FR", "en-US"
  voiceURI?: string;
  voicePresetId?: string;
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (err: any) => void;
  onBoundary?: (charIndex: number, word: string) => void;
}

export interface EnhancedVoiceConfig {
  pitch: number; // 0.7 - 1.5 (default 1.08)
  rate: number; // 0.7 - 1.3 (default 0.85)
  speedPreset: SpeechSpeedPreset; // "slow" | "normal" | "fast"
  gender: VoiceGender; // "boy" | "girl" | "robot" | "teacher"
  lang: string; // e.g. "ar-MA", "ar-SA", "fr-FR", "en-US"
  preferredVoiceURI?: string;
  provider: TTSProviderType;
  voicePreset: string;
  enableSentenceChunking: boolean;
  enablePhoneticOptimization?: boolean;
}

export interface TTSProvider {
  id: TTSProviderType;
  name: string;
  isAvailable: boolean;
  speak(text: string, options: TTSOptions): Promise<void>;
  stop(): void;
  getAvailableVoices(): Promise<TTSVoiceInfo[]>;
  getDiagnosis?(lang?: string, gender?: VoiceGender): VoiceEngineDiagnosis;
}

