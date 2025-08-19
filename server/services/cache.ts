import crypto from 'crypto';
import { TravelRequest, ItineraryResponse } from '@shared/api';

// In-memory cache for development - in production, use Redis
const cache = new Map<string, { data: ItineraryResponse; expires: number }>();
const rateLimits = new Map<string, { credits: number; lastReset: number }>();

export class CacheService {
  private static readonly CACHE_TTL = 30 * 24 * 60 * 60 * 1000; // 30 days in milliseconds
  private static readonly RATE_RESET_INTERVAL = 24 * 60 * 60 * 1000; // 24 hours

  static generateCacheKey(request: TravelRequest): string {
    // Use LLM service normalization for consistency
    const normalized = {
      destination: request.destination.toLowerCase().trim(),
      startDate: request.startDate,
      endDate: request.endDate,
      travelers: request.travelers.toLowerCase().trim(),
      budget: request.budget,
      style: request.style,
      origin: request.origin?.toLowerCase().trim() || '',
      language: request.language || 'en'
    };

    // Sort keys for consistent hashing
    const sortedKeys = Object.keys(normalized).sort();
    const sortedObj: any = {};
    sortedKeys.forEach(key => {
      sortedObj[key] = normalized[key as keyof typeof normalized];
    });

    const str = JSON.stringify(sortedObj);
    return crypto.createHash('md5').update(str).digest('hex');
  }

  static getCachedItinerary(cacheKey: string): ItineraryResponse | null {
    const cached = cache.get(cacheKey);
    if (!cached) return null;

    if (Date.now() > cached.expires) {
      cache.delete(cacheKey);
      return null;
    }

    return cached.data;
  }

  static setCachedItinerary(cacheKey: string, itinerary: ItineraryResponse): void {
    cache.set(cacheKey, {
      data: itinerary,
      expires: Date.now() + this.CACHE_TTL
    });
  }

  static checkRateLimit(userIdOrIP: string, isRegistered: boolean = false): { allowed: boolean; creditsLeft: number } {
    const now = Date.now();
    let rateLimit = rateLimits.get(userIdOrIP);

    // Reset credits if 24 hours have passed
    if (!rateLimit || (now - rateLimit.lastReset) > this.RATE_RESET_INTERVAL) {
      const maxCredits = isRegistered ? 50 : 20; // Increased limits for development
      rateLimit = {
        credits: maxCredits,
        lastReset: now
      };
      rateLimits.set(userIdOrIP, rateLimit);
    }

    if (rateLimit.credits <= 0) {
      return { allowed: false, creditsLeft: 0 };
    }

    // Consume one credit
    rateLimit.credits--;
    rateLimits.set(userIdOrIP, rateLimit);

    return { allowed: true, creditsLeft: rateLimit.credits };
  }

  static getRemainingCredits(userIdOrIP: string): number {
    const rateLimit = rateLimits.get(userIdOrIP);
    if (!rateLimit) return 3; // Default for new users

    const now = Date.now();
    if ((now - rateLimit.lastReset) > this.RATE_RESET_INTERVAL) {
      return 3; // Credits would be reset
    }

    return rateLimit.credits;
  }

  // Cleanup old entries periodically
  static cleanup(): void {
    const now = Date.now();
    
    // Clean expired cache entries
    for (const [key, value] of cache.entries()) {
      if (now > value.expires) {
        cache.delete(key);
      }
    }

    // Clean old rate limit entries (older than 48 hours)
    for (const [key, value] of rateLimits.entries()) {
      if ((now - value.lastReset) > (2 * this.RATE_RESET_INTERVAL)) {
        rateLimits.delete(key);
      }
    }
  }
}

// Run cleanup every hour
setInterval(() => {
  CacheService.cleanup();
}, 60 * 60 * 1000);
