/**
 * azureNeuralProvider.ts
 * Ready-to-upgrade TTS Provider for Azure Cognitive Services Neural Voices.
 * Supports Moroccan (ar-MA-MounaNeural / ar-MA-JamalNeural), Saudi (ar-SA-ZariyahNeural),
 * and Egyptian (ar-EG-SalmaNeural) neural child-appropriate voices with SSML.
 */

import { TTSProvider, TTSOptions, TTSVoiceInfo } from "./types";
import { preprocessSpeechText } from "./textPreprocessor";

export interface AzureConfig {
  subscriptionKey?: string;
  region?: string;
  customEndpoint?: string;
}

export class AzureNeuralTTSProvider implements TTSProvider {
  public id = "azure" as const;
  public name = "مايكروسوفت أزور العصبية (Azure Neural Voices)";

  private config: AzureConfig;
  private currentAudio: HTMLAudioElement | null = null;

  constructor(config: AzureConfig = {}) {
    this.config = {
      region: config.region || "westeurope",
      ...config,
    };
  }

  public get isAvailable(): boolean {
    return Boolean(
      this.config.subscriptionKey ||
      (typeof window !== "undefined" && (window as any).__AZURE_TTS_ENABLED__)
    );
  }

  public async getAvailableVoices(): Promise<TTSVoiceInfo[]> {
    return [
      {
        id: "ar-MA-MounaNeural",
        name: "منى المغربية (Mouna Neural - ar-MA) 🇲🇦",
        lang: "ar-MA",
        gender: "female",
        provider: "azure",
        qualityRating: 5,
      },
      {
        id: "ar-MA-JamalNeural",
        name: "جمال المغربي (Jamal Neural - ar-MA) 🇲🇦",
        lang: "ar-MA",
        gender: "male",
        provider: "azure",
        qualityRating: 5,
      },
      {
        id: "ar-SA-ZariyahNeural",
        name: "زارية السعودية (Zariyah Neural - ar-SA) 🇸🇦",
        lang: "ar-SA",
        gender: "female",
        provider: "azure",
        qualityRating: 5,
      },
      {
        id: "ar-SA-HamedNeural",
        name: "حامد السعودي (Hamed Neural - ar-SA) 🇸🇦",
        lang: "ar-SA",
        gender: "male",
        provider: "azure",
        qualityRating: 5,
      },
      {
        id: "ar-EG-SalmaNeural",
        name: "سلمى المصرية (Salma Neural - ar-EG) 🇪🇬",
        lang: "ar-EG",
        gender: "female",
        provider: "azure",
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

  /**
   * Builds child-friendly SSML with pitch (+10%) and speech rate (-10%)
   */
  public buildSSML(text: string, voiceName: string, rate: number = 0.9, pitch: number = 1.1): string {
    const ratePercent = `${Math.round((rate - 1) * 100)}%`;
    const pitchPercent = `${Math.round((pitch - 1) * 100)}%`;
    const lang = voiceName.split("-").slice(0, 2).join("-");

    const escaped = text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&apos;");

    return `
      <speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="${lang}">
        <voice name="${voiceName}">
          <prosody rate="${ratePercent}" pitch="${pitchPercent}">
            ${escaped}
          </prosody>
        </voice>
      </speak>
    `.trim();
  }

  public async speak(text: string, options: TTSOptions = {}): Promise<void> {
    this.stop();

    if (!text || text.trim() === "") {
      if (options.onEnd) options.onEnd();
      return;
    }

    const { fullNormalizedText } = preprocessSpeechText(text);

    // Pick best neural voice
    let voiceName = "ar-MA-MounaNeural";
    if (options.gender === "boy" || options.gender === "teacher") {
      voiceName = options.lang?.startsWith("ar-SA") ? "ar-SA-HamedNeural" : "ar-MA-JamalNeural";
    } else {
      voiceName = options.lang?.startsWith("ar-SA") ? "ar-SA-ZariyahNeural" : "ar-MA-MounaNeural";
    }

    const rate = options.rate ?? 0.9;
    const pitch = options.pitch ?? 1.1;
    const ssml = this.buildSSML(fullNormalizedText, voiceName, rate, pitch);

    if (options.onStart) options.onStart();

    try {
      // If a backend proxy endpoint /api/tts/azure is configured
      const response = await fetch("/api/tts/azure", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ssml, voiceName }),
      });

      if (!response.ok) {
        throw new Error(`Azure TTS returned ${response.status}`);
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
      console.warn("Azure TTS fallback to Web Speech API:", error);
      if (options.onError) options.onError(error);
      if (options.onEnd) options.onEnd();
    }
  }
}
