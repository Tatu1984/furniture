// ---------------------------------------------------------------------------
// CSRF Protection
// Generates and validates CSRF tokens using cryptographically secure random
// bytes. Tokens are expected in the X-CSRF-Token request header.
// ---------------------------------------------------------------------------

import { NextRequest } from "next/server";

const TOKEN_BYTE_LENGTH = 32;
const CSRF_HEADER = "X-CSRF-Token";

/**
 * Generates a cryptographically secure random CSRF token encoded as a
 * hex string.
 */
export function generateCsrfToken(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(TOKEN_BYTE_LENGTH));
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/**
 * Validates the CSRF token from the `X-CSRF-Token` request header against the
 * expected token (typically stored in a cookie or server-side session).
 *
 * Uses constant-time comparison to prevent timing attacks.
 *
 * @param request  - The incoming Next.js request.
 * @param expected - The CSRF token that was previously issued.
 * @returns `true` when the header token matches the expected token.
 */
export function validateCsrfToken(
  request: NextRequest,
  expected: string,
): boolean {
  const headerToken = request.headers.get(CSRF_HEADER);

  if (!headerToken || !expected) {
    return false;
  }

  if (headerToken.length !== expected.length) {
    return false;
  }

  // Constant-time comparison to prevent timing attacks
  const encoder = new TextEncoder();
  const a = encoder.encode(headerToken);
  const b = encoder.encode(expected);

  if (a.byteLength !== b.byteLength) {
    return false;
  }

  let mismatch = 0;
  for (let i = 0; i < a.byteLength; i++) {
    mismatch |= a[i]! ^ b[i]!;
  }

  return mismatch === 0;
}
