import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import crypto from "crypto";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Always return success to prevent email enumeration
    const successResponse = NextResponse.json(
      {
        message:
          "If an account with that email exists, a password reset link has been sent.",
      },
      { status: 200 }
    );

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      select: { id: true, email: true, firstName: true, status: true, isActive: true },
    });

    if (!user || !user.isActive || user.status !== "ACTIVE") {
      return successResponse;
    }

    // Generate a secure reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenHash = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    // Store the token in the activity log as a workaround
    // In a full implementation, a separate PasswordReset table would be used.
    // We store the hashed token in a setting keyed by the user's id.
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await prisma.setting.upsert({
      where: { key: `password_reset_${user.id}` },
      update: {
        value: { tokenHash: resetTokenHash, expiresAt: expiresAt.toISOString() },
      },
      create: {
        key: `password_reset_${user.id}`,
        value: { tokenHash: resetTokenHash, expiresAt: expiresAt.toISOString() },
        group: "system",
        autoload: false,
      },
    });

    // Log reset token to console (email sending placeholder)
    console.log("─────────────────────────────────────────────────────");
    console.log("PASSWORD RESET REQUEST");
    console.log(`  User: ${user.email} (${user.firstName})`);
    console.log(`  Token: ${resetToken}`);
    console.log(`  Expires: ${expiresAt.toISOString()}`);
    console.log(
      `  Reset URL: ${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/reset-password?token=${resetToken}&email=${encodeURIComponent(user.email)}`
    );
    console.log("─────────────────────────────────────────────────────");

    return successResponse;
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
