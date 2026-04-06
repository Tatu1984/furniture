// ---------------------------------------------------------------------------
// Rate Limiting (In-Memory)
// Provides configurable rate limiting with automatic cleanup of expired
// entries. Designed for use in Next.js API route handlers.
// ---------------------------------------------------------------------------

import { NextRequest, NextResponse } from "next/server";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type RateLimitConfig = {
  /** Maximum number of requests allowed within the window. */
  maxRequests: number;
  /** Time window in milliseconds. */
  windowMs: number;
};

type RateLimitEntry = {
  count: number;
  resetAt: number;
};

// ---------------------------------------------------------------------------
// Pre-defined rate limit configurations
// ---------------------------------------------------------------------------

export const RATE_LIMITS = {
  /** Login / register / password reset: 20 requests per 15 minutes */
  AUTH: { maxRequests: 20, windowMs: 15 * 60 * 1000 } satisfies RateLimitConfig,

  /** Search API: 60 requests per minute */
  SEARCH: { maxRequests: 60, windowMs: 60 * 1000 } satisfies RateLimitConfig,

  /** File upload: 20 requests per hour */
  UPLOAD: { maxRequests: 20, windowMs: 60 * 60 * 1000 } satisfies RateLimitConfig,

  /** General API endpoints: 100 requests per minute */
  GENERAL_API: { maxRequests: 100, windowMs: 60 * 1000 } satisfies RateLimitConfig,

  /** Checkout / payment: 10 requests per minute */
  CHECKOUT: { maxRequests: 10, windowMs: 60 * 1000 } satisfies RateLimitConfig,
} as const;

// ---------------------------------------------------------------------------
// In-memory store
// ---------------------------------------------------------------------------

const store = new Map<string, RateLimitEntry>();

const CLEANUP_INTERVAL_MS = 60 * 1000; // 60 seconds
let cleanupTimer: ReturnType<typeof setInterval> | null = null;

function ensureCleanup(): void {
  if (cleanupTimer !== null) return;
  cleanupTimer = setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of store) {
      if (entry.resetAt <= now) {
        store.delete(key);
      }
    }
    // Stop the timer if the store is empty to avoid unnecessary work
    if (store.size === 0 && cleanupTimer !== null) {
      clearInterval(cleanupTimer);
      cleanupTimer = null;
    }
  }, CLEANUP_INTERVAL_MS);

  // Allow the Node.js process to exit even if the timer is running
  if (cleanupTimer && typeof cleanupTimer === "object" && "unref" in cleanupTimer) {
    cleanupTimer.unref();
  }
}

// ---------------------------------------------------------------------------
// Client identification
// ---------------------------------------------------------------------------

function getClientIdentifier(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    // x-forwarded-for can contain a comma-separated list; take the first IP
    return forwarded.split(",")[0]!.trim();
  }
  const realIp = request.headers.get("x-real-ip");
  if (realIp) {
    return realIp.trim();
  }
  return "unknown-client";
}

// ---------------------------------------------------------------------------
// Core rate-limit check
// ---------------------------------------------------------------------------

export type RateLimitResult = {
  allowed: boolean;
  remaining: number;
  resetAt: number;
  limit: number;
};

/**
 * Checks whether the request is within the allowed rate limit.
 *
 * @param request - The incoming NextRequest used to identify the client.
 * @param config  - The rate-limit configuration (max requests & window).
 * @param prefix  - An optional key prefix to namespace different endpoints.
 * @returns A result object indicating whether the request is allowed.
 */
export function checkRateLimit(
  request: NextRequest,
  config: RateLimitConfig,
  prefix = "rl",
): RateLimitResult {
  ensureCleanup();

  const clientId = getClientIdentifier(request);
  const key = `${prefix}:${clientId}`;
  const now = Date.now();

  let entry = store.get(key);

  // If the window has expired, reset
  if (!entry || entry.resetAt <= now) {
    entry = {
      count: 0,
      resetAt: now + config.windowMs,
    };
    store.set(key, entry);
  }

  entry.count += 1;

  const allowed = entry.count <= config.maxRequests;
  const remaining = Math.max(0, config.maxRequests - entry.count);

  return {
    allowed,
    remaining,
    resetAt: entry.resetAt,
    limit: config.maxRequests,
  };
}

// ---------------------------------------------------------------------------
// Rate-limit response headers
// ---------------------------------------------------------------------------

/**
 * Returns standard rate-limit headers to attach to a response.
 */
export function getRateLimitHeaders(result: RateLimitResult): Record<string, string> {
  const headers: Record<string, string> = {
    "X-RateLimit-Limit": String(result.limit),
    "X-RateLimit-Remaining": String(result.remaining),
    "X-RateLimit-Reset": String(Math.ceil(result.resetAt / 1000)),
  };

  if (!result.allowed) {
    headers["Retry-After"] = String(
      Math.ceil((result.resetAt - Date.now()) / 1000),
    );
  }

  return headers;
}

// ---------------------------------------------------------------------------
// Higher-order wrapper
// ---------------------------------------------------------------------------

type RouteHandler = (
  request: NextRequest,
  context?: unknown,
) => Promise<NextResponse> | NextResponse;

/**
 * Wraps an API route handler with rate limiting.
 *
 * @param config  - The rate-limit configuration.
 * @param handler - The route handler to protect.
 * @param prefix  - An optional key prefix to namespace the limiter.
 * @returns A new route handler that enforces the rate limit.
 */
export function withRateLimit(
  config: RateLimitConfig,
  handler: RouteHandler,
  prefix?: string,
): RouteHandler {
  return async (request: NextRequest, context?: unknown) => {
    const result = checkRateLimit(request, config, prefix);
    const headers = getRateLimitHeaders(result);

    if (!result.allowed) {
      return NextResponse.json(
        {
          error: "Too many requests",
          retryAfter: Math.ceil((result.resetAt - Date.now()) / 1000),
        },
        { status: 429, headers },
      );
    }

    const response = await handler(request, context);

    // Attach rate-limit headers to the successful response
    for (const [key, value] of Object.entries(headers)) {
      if (value) {
        response.headers.set(key, value);
      }
    }

    return response;
  };
}
