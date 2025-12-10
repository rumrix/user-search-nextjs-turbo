import { RateLimitInfo } from "./searchTypes";

export const parseRateLimit = (headers: Headers): RateLimitInfo => {
  const limit = headers.get("x-ratelimit-limit");
  const remaining = headers.get("x-ratelimit-remaining");
  const reset = headers.get("x-ratelimit-reset");
  const resource = headers.get("x-ratelimit-resource") ?? undefined;
  const resetNumber = reset ? Number(reset) : undefined;
  return {
    limit: limit ? Number(limit) : undefined,
    remaining: remaining ? Number(remaining) : undefined,
    reset: resetNumber,
    resetAt: resetNumber ? new Date(resetNumber * 1000).toISOString() : undefined,
    resource
  };
};

export const shouldShortCircuitRateLimit = (rateLimit: RateLimitInfo): boolean => {
  if (rateLimit.remaining === undefined || rateLimit.remaining > 0) return false;
  if (!rateLimit.reset) return false;
  const nowSec = Math.floor(Date.now() / 1000);
  const secondsUntilReset = rateLimit.reset - nowSec;
  return secondsUntilReset > 30;
};

export const computeBackoffMs = (attempt: number, base = 400, jitter = 150) => {
  const exp = Math.pow(2, attempt);
  const randomJitter = Math.floor(Math.random() * jitter);
  return exp * base + randomJitter;
};
