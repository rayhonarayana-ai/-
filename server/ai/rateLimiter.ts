/**
 * Server AI Gateway - In-Memory Rate Limiter
 * Gate 5 Architecture: Rate protection and cost defense per client route.
 */

import { RATE_LIMIT_CONFIGS } from "./limits.js";

interface RateRecord {
  timestamps: number[];
}

export class AIRateLimiter {
  private records = new Map<string, RateRecord>();
  private readonly MAX_MAP_ENTRIES = 5000;
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor() {
    // Run periodic cleanup every 5 minutes
    this.cleanupInterval = setInterval(() => this.cleanup(), 5 * 60 * 1000);
    if (this.cleanupInterval.unref) {
      this.cleanupInterval.unref();
    }
  }

  public checkLimit(
    clientKey: string,
    route: keyof typeof RATE_LIMIT_CONFIGS
  ): { allowed: boolean; retryAfterSeconds?: number } {
    const config = RATE_LIMIT_CONFIGS[route] || { windowMs: 60000, maxRequests: 20 };
    const now = Date.now();
    const mapKey = `${route}:${clientKey || "anonymous"}`;

    // Memory bounding: If map exceeds maximum allowed entries, prune or evict oldest
    if (this.records.size >= this.MAX_MAP_ENTRIES && !this.records.has(mapKey)) {
      this.cleanup();
      // If still exceeding, evict oldest entries
      while (this.records.size >= this.MAX_MAP_ENTRIES) {
        const oldestKey = this.records.keys().next().value;
        if (oldestKey) {
          this.records.delete(oldestKey);
        } else {
          break;
        }
      }
    }

    let record = this.records.get(mapKey);
    if (!record) {
      record = { timestamps: [] };
      this.records.set(mapKey, record);
    }

    // Filter out timestamps outside the current window
    const windowStart = now - config.windowMs;
    record.timestamps = record.timestamps.filter((ts) => ts > windowStart);

    if (record.timestamps.length >= config.maxRequests) {
      const oldestInWindow = record.timestamps[0];
      const resetTime = oldestInWindow + config.windowMs;
      const retryAfterSeconds = Math.max(1, Math.ceil((resetTime - now) / 1000));
      return {
        allowed: false,
        retryAfterSeconds,
      };
    }

    record.timestamps.push(now);
    return { allowed: true };
  }

  public reset(): void {
    this.records.clear();
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [key, record] of this.records.entries()) {
      // Keep only entries from the last 5 minutes
      record.timestamps = record.timestamps.filter((ts) => ts > now - 5 * 60 * 1000);
      if (record.timestamps.length === 0) {
        this.records.delete(key);
      }
    }
  }
}

export const aiRateLimiter = new AIRateLimiter();
