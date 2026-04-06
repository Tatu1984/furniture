import { NextResponse, type NextRequest } from "next/server";
import { jwtVerify } from "jose";
import {
  checkRateLimit,
  getRateLimitHeaders,
  RATE_LIMITS,
  type RateLimitConfig,
} from "@/lib/rate-limit";

// ---------------------------------------------------------------------------
// Allowed Origins
// ---------------------------------------------------------------------------

const ALLOWED_ORIGINS = [
  "http://localhost:3000",
  "http://localhost:3001",
  process.env.NEXT_PUBLIC_APP_URL,
  process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined,
].filter(Boolean) as string[];

// ---------------------------------------------------------------------------
// JWT Secret
// ---------------------------------------------------------------------------

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "dev-secret-change-in-production",
);

// ---------------------------------------------------------------------------
// Admin Roles
// ---------------------------------------------------------------------------

const ADMIN_ROLES = ["ADMIN", "OPS", "EDITOR", "MANAGER"] as const;

// ---------------------------------------------------------------------------
// Rate Limit Route Matching
// ---------------------------------------------------------------------------

function getRateLimitConfigForPath(pathname: string): { config: RateLimitConfig; prefix: string } | null {
  if (
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/api/admin/login")
  ) {
    return { config: RATE_LIMITS.AUTH, prefix: "auth" };
  }
  if (pathname.startsWith("/api/search")) {
    return { config: RATE_LIMITS.SEARCH, prefix: "search" };
  }
  if (pathname.startsWith("/api/upload")) {
    return { config: RATE_LIMITS.UPLOAD, prefix: "upload" };
  }
  if (pathname.startsWith("/api/")) {
    return { config: RATE_LIMITS.GENERAL_API, prefix: "api" };
  }
  return null;
}

// ---------------------------------------------------------------------------
// Security Headers
// ---------------------------------------------------------------------------

function applySecurityHeaders(response: NextResponse): void {
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-XSS-Protection", "1; mode=block");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(), interest-cohort=()",
  );

  if (process.env.NODE_ENV === "production") {
    response.headers.set(
      "Strict-Transport-Security",
      "max-age=63072000; includeSubDomains; preload",
    );
  }
}

// ---------------------------------------------------------------------------
// CORS Helpers
// ---------------------------------------------------------------------------

function isAllowedOrigin(origin: string | null): boolean {
  if (!origin) return true; // Same-origin requests have no Origin header
  return ALLOWED_ORIGINS.some(
    (allowed) => origin === allowed || origin.endsWith(".vercel.app"),
  );
}

function applyCorsHeaders(
  response: NextResponse,
  origin: string | null,
): void {
  if (origin && isAllowedOrigin(origin)) {
    response.headers.set("Access-Control-Allow-Origin", origin);
  }
  response.headers.set(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, PATCH, OPTIONS",
  );
  response.headers.set(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, X-Requested-With",
  );
  response.headers.set("Access-Control-Allow-Credentials", "true");
  response.headers.set("Access-Control-Max-Age", "86400");
}

// ---------------------------------------------------------------------------
// Middleware
// ---------------------------------------------------------------------------

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const origin = request.headers.get("origin");

  // ---- Handle CORS preflight ----
  if (request.method === "OPTIONS") {
    const preflightResponse = new NextResponse(null, { status: 204 });
    applyCorsHeaders(preflightResponse, origin);
    applySecurityHeaders(preflightResponse);
    return preflightResponse;
  }

  // ---- CORS origin validation for API routes ----
  if (pathname.startsWith("/api/") && origin && !isAllowedOrigin(origin)) {
    return NextResponse.json(
      { error: "Origin not allowed" },
      { status: 403 },
    );
  }

  // ---- Rate Limiting ----
  const rlMatch = getRateLimitConfigForPath(pathname);
  if (rlMatch) {
    const result = checkRateLimit(request, rlMatch.config, rlMatch.prefix);

    if (!result.allowed) {
      const headers = getRateLimitHeaders(result);
      const rateLimitResponse = NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429, headers },
      );
      applySecurityHeaders(rateLimitResponse);
      applyCorsHeaders(rateLimitResponse, origin);
      return rateLimitResponse;
    }
  }

  // ---- Checkout Auth Gate ----
  if (pathname === "/checkout") {
    const token = request.cookies.get("auth-token")?.value;
    if (!token) {
      const loginUrl = new URL("/auth/login", request.url);
      loginUrl.searchParams.set("redirect", "/checkout");
      return NextResponse.redirect(loginUrl);
    }
  }

  // ---- Admin Page Auth Gate ----
  if (pathname.startsWith("/admin") && !pathname.startsWith("/admin/login")) {
    const token = request.cookies.get("auth-token")?.value;
    if (!token) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
    try {
      const { payload } = await jwtVerify(token, JWT_SECRET);
      const role = payload.role as string;
      if (!ADMIN_ROLES.includes(role as (typeof ADMIN_ROLES)[number])) {
        return NextResponse.redirect(new URL("/admin/login", request.url));
      }
    } catch {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
  }

  // ---- Payment API Auth Check ----
  if (pathname.startsWith("/api/payments")) {
    const token = request.cookies.get("auth-token")?.value;
    if (!token) {
      return NextResponse.json(
        { error: "Authentication required. Please login to continue." },
        { status: 401 },
      );
    }
  }

  // ---- Admin API Auth Check ----
  if (pathname.startsWith("/api/admin")) {
    const token = request.cookies.get("auth-token")?.value;

    if (!token) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 },
      );
    }

    try {
      const { payload } = await jwtVerify(token, JWT_SECRET);
      const role = payload.role as string;

      if (!ADMIN_ROLES.includes(role as (typeof ADMIN_ROLES)[number])) {
        return NextResponse.json(
          { error: "Insufficient permissions" },
          { status: 403 },
        );
      }

      // Attach user info to request headers so route handlers can access it
      const response = NextResponse.next();
      response.headers.set("x-user-id", payload.sub as string);
      response.headers.set("x-user-role", role);
      response.headers.set(
        "x-user-email",
        (payload.email as string) || "",
      );
      applySecurityHeaders(response);
      applyCorsHeaders(response, origin);
      return response;
    } catch {
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 401 },
      );
    }
  }

  // ---- Default: continue with security headers ----
  const response = NextResponse.next();
  applySecurityHeaders(response);
  if (pathname.startsWith("/api/")) {
    applyCorsHeaders(response, origin);
  }
  return response;
}

// ---------------------------------------------------------------------------
// Matcher
// ---------------------------------------------------------------------------

export const config = {
  matcher: ["/api/:path*", "/admin/:path*", "/checkout"],
};
