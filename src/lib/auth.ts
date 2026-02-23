// ---------------------------------------------------------------------------
// JWT Authentication & Password Hashing
// Uses jose for JWT (HS256) and bcryptjs for password hashing.
// ---------------------------------------------------------------------------

import { SignJWT, jwtVerify, type JWTPayload } from "jose";
import { hash, compare } from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";
import { UserRole } from "@prisma/client";
import { env } from "@/lib/env";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type AuthPayload = {
  userId: string;
  email: string;
  role: string;
};

type AuthTokenJWTPayload = JWTPayload & AuthPayload;

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

const COOKIE_NAME = "auth-token";
const BCRYPT_ROUNDS = 12;

function getJwtSecret(): Uint8Array {
  return new TextEncoder().encode(env.JWT_SECRET);
}

function parseExpiresIn(value: string): string {
  return value || "7d";
}

// ---------------------------------------------------------------------------
// JWT: Create & Verify
// ---------------------------------------------------------------------------

/**
 * Creates a signed JWT containing the given payload.
 * Token expires based on JWT_EXPIRES_IN env var (default: 7 days).
 */
export async function createToken(payload: AuthPayload): Promise<string> {
  const secret = getJwtSecret();
  const expiresIn = parseExpiresIn(env.JWT_EXPIRES_IN);

  const token = await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(secret);

  return token;
}

/**
 * Verifies a JWT and returns its payload.
 * Throws if the token is invalid or expired.
 */
export async function verifyToken(token: string): Promise<AuthPayload> {
  const secret = getJwtSecret();
  const { payload } = await jwtVerify(token, secret);
  const decoded = payload as AuthTokenJWTPayload;

  return {
    userId: decoded.userId,
    email: decoded.email,
    role: decoded.role,
  };
}

// ---------------------------------------------------------------------------
// Request-level auth helpers
// ---------------------------------------------------------------------------

/**
 * Attempts to extract and verify the auth token from the request's HttpOnly
 * cookie. Returns the authenticated user payload or `null` if not
 * authenticated.
 */
export async function getAuthUser(
  request: NextRequest,
): Promise<AuthPayload | null> {
  try {
    const token = request.cookies.get(COOKIE_NAME)?.value;
    if (!token) {
      return null;
    }
    return await verifyToken(token);
  } catch {
    return null;
  }
}

/**
 * Requires an authenticated user. Returns the user payload on success, or a
 * 401 NextResponse on failure.
 */
export async function requireAuth(
  request: NextRequest,
): Promise<AuthPayload | NextResponse> {
  const user = await getAuthUser(request);
  if (!user) {
    return NextResponse.json(
      { error: "Authentication required" },
      { status: 401 },
    );
  }
  return user;
}

/**
 * Requires the authenticated user to have the ADMIN role.
 * Returns the user payload on success, or a 401/403 NextResponse on failure.
 */
export async function requireAdmin(
  request: NextRequest,
): Promise<AuthPayload | NextResponse> {
  const result = await requireAuth(request);
  if (result instanceof NextResponse) {
    return result;
  }
  if (result.role !== UserRole.ADMIN) {
    return NextResponse.json(
      { error: "Insufficient permissions" },
      { status: 403 },
    );
  }
  return result;
}

/**
 * Requires the authenticated user to have one of the specified roles.
 * Returns the user payload on success, or a 401/403 NextResponse on failure.
 */
export async function requireRoles(
  request: NextRequest,
  allowedRoles: string[],
): Promise<AuthPayload | NextResponse> {
  const result = await requireAuth(request);
  if (result instanceof NextResponse) {
    return result;
  }
  if (!allowedRoles.includes(result.role)) {
    return NextResponse.json(
      { error: "Insufficient permissions" },
      { status: 403 },
    );
  }
  return result;
}

// ---------------------------------------------------------------------------
// Password hashing
// ---------------------------------------------------------------------------

/**
 * Hashes a plaintext password using bcrypt with 12 rounds.
 */
export async function hashPassword(password: string): Promise<string> {
  return hash(password, BCRYPT_ROUNDS);
}

/**
 * Compares a plaintext password against a bcrypt hash.
 */
export async function comparePassword(
  plain: string,
  hashed: string,
): Promise<boolean> {
  return compare(plain, hashed);
}
