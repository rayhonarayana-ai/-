/**
 * Server AI Gateway - AI Provider Adapter (Gemini)
 * Gate 5 Architecture: Isolated provider integration using @google/genai.
 */

import { GoogleGenAI } from "@google/genai";
import { AIProvider, ProviderRequest, ProviderResponse } from "./types.js";
import { AI_LIMITS } from "./limits.js";

export class GeminiProvider implements AIProvider {
  public readonly name = "gemini";
  private client: GoogleGenAI | null = null;

  private getClient(): GoogleGenAI {
    if (!this.client) {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error("GEMINI_API_KEY environment variable is not configured.");
      }
      this.client = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });
    }
    return this.client;
  }

  public async generate(request: ProviderRequest): Promise<ProviderResponse> {
    const startTime = Date.now();
    const timeoutMs = request.timeoutMs || AI_LIMITS.defaultTimeoutMs;

    const modelsToTry = [
      request.preferredModel || "gemini-3.7-flash",
      "gemini-2.5-flash",
    ];
    const uniqueModels = Array.from(new Set(modelsToTry)).slice(0, AI_LIMITS.maxAttempts);

    let lastError: any = null;

    for (let attempt = 0; attempt < uniqueModels.length; attempt++) {
      const model = uniqueModels[attempt];
      try {
        const ai = this.getClient();
        
        // Build generateContent call wrapped with strict bounded timeout
        const generatePromise = ai.models.generateContent({
          model,
          contents: request.contents,
          config: {
            systemInstruction: request.systemInstruction,
            temperature: request.temperature ?? AI_LIMITS.defaultTemperature,
            responseMimeType: request.responseMimeType,
            responseSchema: request.responseSchema,
            maxOutputTokens: AI_LIMITS.maxOutputTokens,
          },
        });

        const timeoutPromise = new Promise<never>((_, reject) => {
          const timer = setTimeout(() => {
            reject(new Error(`AI_TIMEOUT: Provider request exceeded ${timeoutMs}ms limit.`));
          }, timeoutMs);
          if (timer.unref) timer.unref();
        });

        const response = await Promise.race([generatePromise, timeoutPromise]);
        const text = response?.text || "";

        return {
          text,
          raw: response,
          modelUsed: model,
          latencyMs: Date.now() - startTime,
        };
      } catch (err: any) {
        lastError = err;
        const errMsg = err?.message || "";
        const isTimeout = errMsg.includes("AI_TIMEOUT");
        const isRateLimit = err?.status === 429 || errMsg.includes("RESOURCE_EXHAUSTED");
        const isUnavailable = err?.status === 503 || err?.code === "UNAVAILABLE" || errMsg.includes("high demand");
        const isNonRetryable = err?.status === 400 || err?.status === 403 || errMsg.includes("INVALID_ARGUMENT") || errMsg.includes("SAFETY");

        // Log privacy-safe metadata only (excludes child text, base64, secrets)
        console.warn(`[AI Provider Warning] RequestId=${request.requestId || "none"} Task=${request.task} Model=${model} Attempt=${attempt + 1} Status=${isTimeout ? "TIMEOUT" : isRateLimit ? "429" : isUnavailable ? "503" : isNonRetryable ? "NON_RETRYABLE" : "ERROR"}`);

        // If it's a non-retryable error (e.g. invalid arguments or safety rejection) or timeout limit exceeded, break immediately
        if (isNonRetryable || (isTimeout && Date.now() - startTime >= timeoutMs)) {
          break;
        }
      }
    }

    throw lastError || new Error("AI provider execution failed.");
  }
}

export const defaultGeminiProvider = new GeminiProvider();
