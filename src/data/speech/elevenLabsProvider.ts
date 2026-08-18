/**
 * elevenLabsProvider.ts
 * Ready-to-upgrade TTS Provider for ElevenLabs High-Quality Child & Mascot Voices.
 */

import { TTSProvider, TTSOptions, TTSVoiceInfo } from "./types";
import { preprocessSpeechText } from "./textPreprocessor";

export interface ElevenLabsConfig {
  apiKey?: string;
  defaultVoiceId?: string;
}

export class ElevenLabsTTSProvider implements TTSProvider {
  public id = "elevenlabs" as const;
  public name = "إليفن لابس المتقدم (ElevenLabs AI Voices)";

  private config: ElevenLabsConfig;
  private currentAudio: HTMLAudioElement | null = null;

  constructor(config: ElevenLabsConfig = {}) {
    this.config = {
      defaultVoiceId: "21m00Tcm4TlvDq8ikWAM", // Rachel / Friendly
      ...config,
    };
  }

  public get isAvailable(): boolean {
    return Boolean(
      this.config.apiKey ||
      (typeof window !== "undefined" && (window as any).__ELEVENLABS_ENABLED__)
    );
  }

  public async getAvailableVoices(): Promise<TTSVoiceInfo[]> {
    return [
      {
        id: "eleven-ar-zaki-child",
        name: "زكي الطفل المبدع (ElevenLabs Child - Arabic)",
        lang: "ar-MA",
        gender: "male",
        provider: "elevenlabs",
        qualityRating: 5,
      },
      {
        id: "eleven-ar-friendly-girl",
        name: "سلمى الصديقة الذكية (ElevenLabs Girl - Arabic)",
        lang: "ar-MA",
        gender: "female",
        provider: "elevenlabs",
        qualityRating: 5,
      },
    ];
  }

  public stop(): void {
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio.currentTime = 0;
      this.currentAudio = null;
    }
  }

  public async speak(text: string, options: TTSOptions = {}): Promise<void> {
    this.stop();

    if (!text || text.trim() === "") {
      if (options.onEnd) options.onEnd();
      return;
    }

    const { fullNormalizedText } = preprocessSpeechText(text);
    if (options.onStart) options.onStart();

    try {
      const response = await fetch("/api/tts/elevenlabs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: fullNormalizedText,
          voiceId: this.config.defaultVoiceId,
          voiceSettings: {
            stability: 0.65,
            similarity_boost: 0.85,
            style: 0.35,
            use_speaker_boost: true,
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`ElevenLabs TTS error: ${response.status}`);
      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      this.currentAudio = audio;

      audio.onended = () => {
        URL.revokeObjectURL(audioUrl);
        this.currentAudio = null;
        if (options.onEnd) options.onEnd();
      };

      audio.onerror = (e) => {
        URL.revokeObjectURL(audioUrl);
        this.currentAudio = null;
        if (options.onError) options.onError(e);
        if (options.onEnd) options.onEnd();
      };

      await audio.play();
    } catch (error) {
      console.warn("ElevenLabs TTS fallback:", error);
      if (options.onError) options.onError(error);
      if (options.onEnd) options.onEnd();
    }
  }
}
