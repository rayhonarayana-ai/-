/**
 * ttsManager.ts
 * Central Singleton Manager for Zaki's Speech Synthesis System.
 * Manages providers, text pre-processing, child acoustic tuning (rate=0.85, pitch=1.08),
 * speed presets (slow: 0.76 / normal: 0.85 / fast: 1.05), voice gender,
 * replay memory, and live speaking visualizer state.
 */

import {
  TTSProvider,
  TTSOptions,
  TTSVoiceInfo,
  EnhancedVoiceConfig,
  SpeechSpeedPreset,
  VoiceGender,
  TTSProviderType,
  VoiceEngineDiagnosis,
} from "./types";
import { WebSpeechTTSProvider } from "./webSpeechProvider";
import { AzureNeuralTTSProvider } from "./azureNeuralProvider";
import { ElevenLabsTTSProvider } from "./elevenLabsProvider";

export const DEFAULT_ENHANCED_VOICE_CONFIG: EnhancedVoiceConfig = {
  pitch: 1.08, // Child-friendly warm pitch
  rate: 0.85,  // Calm natural child rate (0.82 - 0.88 range)
  speedPreset: "normal",
  gender: "boy",
  lang: "ar-MA",
  provider: "webspeech",
  voicePreset: "friendly",
  enableSentenceChunking: true,
  enablePhoneticOptimization: true,
};

const STORAGE_KEY = "kids_ai_enhanced_voice_config";

class TTSManager {
  private providers: Map<TTSProviderType, TTSProvider> = new Map();
  private activeProviderType: TTSProviderType = "webspeech";
  private config: EnhancedVoiceConfig;
  private isSpeakingState: boolean = false;
  private lastSpokenText: string = "";
  private lastSpokenOptions?: TTSOptions;
  private listeners: Set<(speaking: boolean) => void> = new Set();

  constructor() {
    this.config = this.loadConfig();

    // Register all providers
    const webSpeech = new WebSpeechTTSProvider();
    const azure = new AzureNeuralTTSProvider();
    const elevenLabs = new ElevenLabsTTSProvider();

    this.providers.set("webspeech", webSpeech);
    this.providers.set("azure", azure);
    this.providers.set("elevenlabs", elevenLabs);

    this.activeProviderType = this.config.provider || "webspeech";
  }

  private loadConfig(): EnhancedVoiceConfig {
    if (typeof window === "undefined") return { ...DEFAULT_ENHANCED_VOICE_CONFIG };
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return { ...DEFAULT_ENHANCED_VOICE_CONFIG, ...JSON.parse(saved) };
      }
    } catch (e) {
      console.warn("Failed to load voice config from localStorage:", e);
    }
    return { ...DEFAULT_ENHANCED_VOICE_CONFIG };
  }

  public saveConfig(newConfig: Partial<EnhancedVoiceConfig>): EnhancedVoiceConfig {
    this.config = { ...this.config, ...newConfig };

    // Sync speed presets with rate numbers
    if (newConfig.speedPreset) {
      if (newConfig.speedPreset === "slow") this.config.rate = 0.76;
      else if (newConfig.speedPreset === "normal") this.config.rate = 0.85;
      else if (newConfig.speedPreset === "fast") this.config.rate = 1.05;
    }

    if (newConfig.gender) {
      if (newConfig.gender === "boy") this.config.pitch = 1.08;
      else if (newConfig.gender === "girl") this.config.pitch = 1.15;
      else if (newConfig.gender === "robot") {
        this.config.pitch = 0.88;
        this.config.rate = 0.88;
      } else if (newConfig.gender === "teacher") {
        this.config.pitch = 1.0;
        this.config.rate = 0.83;
      }
    }

    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.config));
      } catch (e) {
        // Ignore
      }
    }

    return this.config;
  }

  public getConfig(): EnhancedVoiceConfig {
    return { ...this.config };
  }

  public getActiveProvider(): TTSProvider {
    const provider = this.providers.get(this.activeProviderType);
    if (provider && provider.isAvailable) {
      return provider;
    }
    // Fallback to Web Speech
    return this.providers.get("webspeech")!;
  }

  public setProvider(type: TTSProviderType): void {
    if (this.providers.has(type)) {
      this.activeProviderType = type;
      this.saveConfig({ provider: type });
    }
  }

  public async getAvailableVoices(): Promise<TTSVoiceInfo[]> {
    const active = this.getActiveProvider();
    return active.getAvailableVoices();
  }

  public async getAllProvidersVoices(): Promise<Record<TTSProviderType, TTSVoiceInfo[]>> {
    const result: Record<TTSProviderType, TTSVoiceInfo[]> = {
      webspeech: [],
      azure: [],
      elevenlabs: [],
    };

    for (const [key, provider] of this.providers.entries()) {
      try {
        result[key] = await provider.getAvailableVoices();
      } catch (e) {
        result[key] = [];
      }
    }

    return result;
  }

  public getDiagnosis(lang?: string, gender?: VoiceGender): VoiceEngineDiagnosis {
    const active = this.getActiveProvider();
    if (active.getDiagnosis) {
      return active.getDiagnosis(lang || this.config.lang, gender || this.config.gender);
    }
    return {
      selectedVoiceName: active.name,
      selectedVoiceLang: lang || "ar-MA",
      isMoroccan: false,
      isNaturalNeural: false,
      qualityRating: 4,
      totalArabicVoicesFound: 1,
      provider: this.activeProviderType,
    };
  }

  public setSpeaking(speaking: boolean): void {
    this.isSpeakingState = speaking;
    this.listeners.forEach((listener) => listener(speaking));
  }

  public get isSpeaking(): boolean {
    return this.isSpeakingState;
  }

  public get lastText(): string {
    return this.lastSpokenText;
  }

  public onSpeakingChange(listener: (speaking: boolean) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * Immediately stops all providers
   */
  public stop(): void {
    this.providers.forEach((p) => {
      try {
        p.stop();
      } catch (e) {}
    });
    this.setSpeaking(false);
  }

  /**
   * Speak text using current config and active provider.
   * Cancels prior speech automatically and stores text for replay.
   */
  public async speak(text: string, customOptions?: TTSOptions): Promise<void> {
    this.stop();

    if (!text || text.trim() === "") {
      if (customOptions?.onEnd) customOptions.onEnd();
      return;
    }

    this.lastSpokenText = text;
    this.lastSpokenOptions = customOptions;

    const mergedOptions: TTSOptions = {
      pitch: this.config.pitch,
      rate: this.config.rate,
      speedPreset: this.config.speedPreset,
      gender: this.config.gender,
      lang: this.config.lang || "ar-MA",
      voiceURI: this.config.preferredVoiceURI,
      ...customOptions,
    };

    const originalOnStart = mergedOptions.onStart;
    const originalOnEnd = mergedOptions.onEnd;
    const originalOnError = mergedOptions.onError;

    mergedOptions.onStart = () => {
      this.setSpeaking(true);
      if (originalOnStart) originalOnStart();
    };

    mergedOptions.onEnd = () => {
      this.setSpeaking(false);
      if (originalOnEnd) originalOnEnd();
    };

    mergedOptions.onError = (err) => {
      this.setSpeaking(false);
      if (originalOnError) originalOnError(err);
    };

    const provider = this.getActiveProvider();
    await provider.speak(text, mergedOptions);
  }

  /**
   * Replay the last spoken message
   */
  public async replayLast(): Promise<void> {
    if (this.lastSpokenText) {
      await this.speak(this.lastSpokenText, this.lastSpokenOptions);
    }
  }
}

// Global Singleton instance
export const ttsManager = new TTSManager();

/**
 * Convenient standalone helper function for backward compatibility and simplicity
 */
export function speakText(
  text: string,
  onEnd?: () => void,
  customConfig?: Partial<EnhancedVoiceConfig> | TTSOptions
): void {
  ttsManager.speak(text, {
    ...customConfig,
    onEnd,
  });
}

/**
 * Convenient stop function
 */
export function stopSpeech(): void {
  ttsManager.stop();
}

/**
 * Convenient replay function
 */
export function replayLastSpeech(): void {
  ttsManager.replayLast();
}
