/**
 * webSpeechProvider.ts
 * Enhanced Web Speech API synthesis provider tailored for:
 * 1. Superior Arabic Voice Selection (prioritizing ar-MA, Natural/Neural voices, warm child-friendly tones).
 * 2. Acoustic Tuning for Kids (default rate = 0.85, warm pitch = 1.08).
 * 3. Natural prosody via micro-chunking and breath pauses.
 * 4. Comprehensive voice diagnosis and fallback documentation.
 */

import { TTSProvider, TTSOptions, TTSVoiceInfo, VoiceGender, VoiceEngineDiagnosis } from "./types";
import { preprocessSpeechText } from "./textPreprocessor";

export class WebSpeechTTSProvider implements TTSProvider {
  public id = "webspeech" as const;
  public name = "المتصفح الذكي المحسّن (Web Speech API)";

  private currentPlaybackId: number = 0;
  private cachedVoices: SpeechSynthesisVoice[] = [];

  constructor() {
    this.initVoices();
  }

  public get isAvailable(): boolean {
    return typeof window !== "undefined" && "speechSynthesis" in window;
  }

  private initVoices(): void {
    if (!this.isAvailable) return;

    this.cachedVoices = window.speechSynthesis.getVoices();
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = () => {
        this.cachedVoices = window.speechSynthesis.getVoices();
      };
    }
  }

  public async getAvailableVoices(): Promise<TTSVoiceInfo[]> {
    if (!this.isAvailable) return [];

    let voices = this.cachedVoices;
    if (voices.length === 0) {
      voices = window.speechSynthesis.getVoices();
      this.cachedVoices = voices;
    }

    return voices.map((v) => {
      const isArabic = v.lang.toLowerCase().startsWith("ar");
      const isMoroccan = v.lang.toLowerCase().includes("ma") || v.name.toLowerCase().includes("moroc");
      const isNeuralOrNatural =
        v.name.toLowerCase().includes("natural") ||
        v.name.toLowerCase().includes("online") ||
        v.name.toLowerCase().includes("neural") ||
        v.name.toLowerCase().includes("google") ||
        v.name.toLowerCase().includes("siri") ||
        v.name.toLowerCase().includes("premium");
      const gender = this.detectVoiceGender(v.name);

      let qualityRating = 3;
      if (isArabic) {
        qualityRating = isMoroccan ? 5 : isNeuralOrNatural ? 5 : 4;
      }

      return {
        id: v.voiceURI,
        name: v.name,
        lang: v.lang,
        gender,
        isLocalService: v.localService,
        provider: "webspeech",
        qualityRating,
        isNeuralOrNatural,
        isMoroccan,
        description: isMoroccan
          ? "صوت مغربي مخصص (ar-MA)"
          : isNeuralOrNatural
          ? "صوت عصبي طبيعي فائق الجودة"
          : isArabic
          ? "صوت عربي قياسي"
          : "صوت عام",
      };
    });
  }

  /**
   * Detect gender from standard speech synthesis voice naming conventions
   */
  private detectVoiceGender(voiceName: string): "male" | "female" | "neutral" {
    const lower = voiceName.toLowerCase();
    const femaleNames = [
      "mouna", "laila", "salma", "zariyah", "fatima", "hoda", "zeina",
      "amal", "mariam", "yasmin", "nour", "female", "woman", "girl", "siri"
    ];
    const maleNames = [
      "jamal", "tarik", "hamed", "hamdan", "naayf", "shakir", "maged",
      "salim", "khalid", "omar", "ali", "male", "man", "boy"
    ];

    if (femaleNames.some((n) => lower.includes(n))) return "female";
    if (maleNames.some((n) => lower.includes(n))) return "male";
    return "neutral";
  }

  /**
   * Evaluates and scores an Arabic voice candidate to rank the most human and warm voice.
   */
  private scoreVoice(voice: SpeechSynthesisVoice, langPreference: string, genderPreference?: VoiceGender): number {
    const nameLower = voice.name.toLowerCase();
    const langLower = voice.lang.toLowerCase().replace("_", "-");
    const cleanLang = langPreference.toLowerCase().replace("_", "-");
    let score = 0;

    const isArabicRequested = cleanLang.startsWith("ar") || cleanLang === "darija";
    const isMoroccanRequested = cleanLang.includes("ma") || cleanLang === "darija";

    // 1. Language Matching
    if (isArabicRequested) {
      if (langLower.startsWith("ar")) {
        score += 300;
        if (isMoroccanRequested && (langLower.includes("ma") || nameLower.includes("moroc") || nameLower.includes("mouna"))) {
          score += 1000; // Huge boost for authentic Moroccan voice
        }
      }
    } else {
      if (langLower === cleanLang) score += 500;
      else if (langLower.startsWith(cleanLang.split("-")[0])) score += 300;
    }

    // 2. Natural / Neural High-Fidelity Synthesizers
    if (
      nameLower.includes("natural") ||
      nameLower.includes("online") ||
      nameLower.includes("neural") ||
      nameLower.includes("wavenet") ||
      nameLower.includes("google") ||
      nameLower.includes("siri") ||
      nameLower.includes("premium")
    ) {
      score += 450;
    }

    // 3. Known Warm Child-Friendly Arab Voice Personalities
    const topWarmNames = [
      "mouna", "salma", "laila", "zariyah", "hoda", "zeina", // Warm female
      "tarik", "naayf", "shakir", "maged", "hamed", "jamal"  // Friendly male
    ];
    if (topWarmNames.some((n) => nameLower.includes(n))) {
      score += 250;
    }

    // 4. Gender Matching
    const voiceGender = this.detectVoiceGender(voice.name);
    if (genderPreference === "girl" && voiceGender === "female") score += 200;
    if (genderPreference === "boy" && voiceGender === "male") score += 200;
    if (genderPreference === "teacher" && (voiceGender === "male" || voiceGender === "female")) score += 100;

    // 5. Prefer Online/Cloud Natural Synthesizers over robotic local basic synthesizers
    if (!voice.localService) {
      score += 80;
    }

    return score;
  }

  /**
   * Finds the absolute best voice using our weighted heuristic scoring system.
   */
  public findBestVoice(
    langPreference: string = "ar-MA",
    genderPreference?: VoiceGender,
    specificVoiceURI?: string
  ): SpeechSynthesisVoice | null {
    if (!this.isAvailable) return null;

    const voices = this.cachedVoices.length > 0 ? this.cachedVoices : window.speechSynthesis.getVoices();
    if (!voices || voices.length === 0) return null;

    // 1. If explicit voiceURI is requested
    if (specificVoiceURI) {
      const exact = voices.find((v) => v.voiceURI === specificVoiceURI);
      if (exact) return exact;
    }

    // 2. Score all available voices and pick highest score
    const scoredVoices = voices.map((v) => ({
      voice: v,
      score: this.scoreVoice(v, langPreference, genderPreference),
    }));

    scoredVoices.sort((a, b) => b.score - a.score);

    if (scoredVoices.length > 0 && scoredVoices[0].score > 0) {
      return scoredVoices[0].voice;
    }

    // Fallback: any Arabic voice if Arabic requested
    const cleanLang = langPreference.toLowerCase();
    if (cleanLang.startsWith("ar") || cleanLang === "darija") {
      const anyArabic = voices.find((v) => v.lang.toLowerCase().startsWith("ar"));
      if (anyArabic) return anyArabic;
    }

    return voices[0] || null;
  }

  /**
   * Generates a diagnostic report on current voice selection
   */
  public getDiagnosis(lang: string = "ar-MA", gender?: VoiceGender): VoiceEngineDiagnosis {
    const voices = this.cachedVoices.length > 0 ? this.cachedVoices : (this.isAvailable ? window.speechSynthesis.getVoices() : []);
    const arabicVoices = voices.filter((v) => v.lang.toLowerCase().startsWith("ar"));
    const selected = this.findBestVoice(lang, gender);

    if (!selected) {
      return {
        selectedVoiceName: "غير متاح (No TTS Engine)",
        selectedVoiceLang: "none",
        isMoroccan: false,
        isNaturalNeural: false,
        qualityRating: 1,
        totalArabicVoicesFound: arabicVoices.length,
        provider: "webspeech",
        fallbackNote: "المتصفح لا يحتوي على أصوات مثبتة حالياً.",
      };
    }

    const isMoroccan = selected.lang.toLowerCase().includes("ma") || selected.name.toLowerCase().includes("moroc");
    const isNaturalNeural =
      selected.name.toLowerCase().includes("natural") ||
      selected.name.toLowerCase().includes("online") ||
      selected.name.toLowerCase().includes("neural") ||
      selected.name.toLowerCase().includes("google") ||
      selected.name.toLowerCase().includes("siri");

    let fallbackNote: string | undefined;
    if (!isMoroccan && (lang.includes("ma") || lang === "darija")) {
      fallbackNote = `تم اختيار أفضل صوت عربي متاح (${selected.name}) مع تشكيل صوتي دارجة مغربية تلقائي.`;
    }

    return {
      selectedVoiceName: selected.name,
      selectedVoiceLang: selected.lang,
      isMoroccan,
      isNaturalNeural,
      qualityRating: isMoroccan ? 5 : isNaturalNeural ? 5 : 4,
      totalArabicVoicesFound: arabicVoices.length,
      provider: "webspeech",
      fallbackNote,
    };
  }

  /**
   * Stops all active speech synthesis instantly and increments cancellation token
   */
  public stop(): void {
    if (!this.isAvailable) return;
    this.currentPlaybackId++;
    try {
      window.speechSynthesis.cancel();
    } catch (e) {
      // Ignore cancellation error
    }
  }

  /**
   * Speak text with child-friendly acoustic settings:
   * - Default rate = 0.85 (0.82 - 0.88 range for maximum clarity and warmth)
   * - Warm pitch = 1.08 - 1.15
   * - Sentence micro-chunking with 90ms breathing pause
   */
  public async speak(text: string, options: TTSOptions = {}): Promise<void> {
    if (!this.isAvailable) {
      if (options.onEnd) options.onEnd();
      return;
    }

    // Cancel prior speech immediately
    this.stop();

    const playbackId = this.currentPlaybackId;

    if (!text || text.trim() === "") {
      if (options.onEnd) options.onEnd();
      return;
    }

    const currentLang = options.lang || "ar-MA";

    // 1. Text Preprocessing, Phonetic Normalization & Sentence Chunking
    const { chunks } = preprocessSpeechText(text, 75, currentLang);
    if (chunks.length === 0) {
      if (options.onEnd) options.onEnd();
      return;
    }

    // 2. Resolve Parameters: Default rate = 0.85, pitch = 1.08
    let rate = options.rate ?? 0.85;
    let pitch = options.pitch ?? 1.08;

    // Apply speed presets:
    // slow = 0.76x, normal = 0.85x, fast = 1.05x
    if (options.speedPreset === "slow") {
      rate = 0.76;
    } else if (options.speedPreset === "normal") {
      rate = 0.85;
    } else if (options.speedPreset === "fast") {
      rate = 1.05;
    }

    // Apply gender acoustic tweaks (warm and cheerful)
    if (options.gender === "boy") {
      pitch = Math.max(1.08, pitch);
      rate = Math.min(0.9, rate);
    } else if (options.gender === "girl") {
      pitch = Math.max(1.15, pitch);
      rate = Math.min(0.88, rate);
    } else if (options.gender === "robot") {
      pitch = 0.88;
      rate = Math.min(0.92, rate);
    } else if (options.gender === "teacher") {
      pitch = 1.0;
      rate = Math.min(0.84, rate);
    }

    const selectedVoice = this.findBestVoice(
      currentLang,
      options.gender,
      options.voiceURI
    );

    if (options.onStart) {
      options.onStart();
    }

    // 3. Play chunks sequentially with natural micro-pauses
    try {
      for (let i = 0; i < chunks.length; i++) {
        // If playback was cancelled during previous chunk, abort immediately
        if (this.currentPlaybackId !== playbackId) {
          return;
        }

        const chunk = chunks[i];
        await this.speakSingleChunk(chunk, {
          rate,
          pitch,
          voice: selectedVoice,
          lang: currentLang,
          playbackId,
        });

        // Add a micro-pause between sentences for natural prosody and breathing
        if (i < chunks.length - 1) {
          await new Promise((resolve) => setTimeout(resolve, 90));
        }
      }

      // Check cancellation token before calling onEnd
      if (this.currentPlaybackId === playbackId) {
        if (options.onEnd) options.onEnd();
      }
    } catch (err) {
      if (this.currentPlaybackId === playbackId) {
        if (options.onError) options.onError(err);
        if (options.onEnd) options.onEnd();
      }
    }
  }

  private speakSingleChunk(
    chunkText: string,
    params: {
      rate: number;
      pitch: number;
      voice: SpeechSynthesisVoice | null;
      lang: string;
      playbackId: number;
    }
  ): Promise<void> {
    return new Promise((resolve) => {
      if (!this.isAvailable || this.currentPlaybackId !== params.playbackId) {
        resolve();
        return;
      }

      const utterance = new SpeechSynthesisUtterance(chunkText);
      utterance.rate = params.rate;
      utterance.pitch = params.pitch;
      utterance.lang = params.lang;

      if (params.voice) {
        utterance.voice = params.voice;
      }

      utterance.onend = () => {
        resolve();
      };

      utterance.onerror = (e) => {
        // Resolve on error to allow subsequent chunks or graceful completion
        console.warn("Speech synthesis chunk event:", e);
        resolve();
      };

      window.speechSynthesis.speak(utterance);
    });
  }
}
