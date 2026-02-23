import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { hashPassword } from "@/lib/auth";
import crypto from "crypto";

const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, token, password } = body;

    // ── Validation ──────────────────────────────────────────────────────
    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    if (!token || typeof token !== "string") {
      return NextResponse.json(
        { error: "Reset token is required" },
        { status: 400 }
      );
    }

    if (!password || typeof password !== "string" || !PASSWORD_REGEX.test(password)) {
      return NextResponse.json(
        {
          error:
            "Password must be at least 8 characters with 1 uppercase, 1 lowercase, and 1 number",
        },
        { status: 400 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();

    // ── Find user ───────────────────────────────────────────────────────
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      select: { id: true, email: true, isActive: true, status: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Invalid or expired reset token" },
        { status: 400 }
      );
    }

    // ── Verify token ────────────────────────────────────────────────────
    const resetSetting = await prisma.setting.findUnique({
      where: { key: `password_reset_${user.id}` },
    });

    if (!resetSetting) {
      return NextResponse.json(
        { error: "Invalid or expired reset token" },
        { status: 400 }
      );
    }

    const { tokenHash, expiresAt } = resetSetting.value as {
      tokenHash: string;
      expiresAt: string;
    };

    // Check token expiration
    if (new Date(expiresAt) < new Date()) {
      // Clean up expired token
      await prisma.setting.delete({
        where: { key: `password_reset_${user.id}` },
      });
      return NextResponse.json(
        { error: "Reset token has expired. Please request a new one." },
        { status: 400 }
      );
    }

    // Compare token hash
    const providedTokenHash = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    if (providedTokenHash !== tokenHash) {
      return NextResponse.json(
        { error: "Invalid or expired reset token" },
        { status: 400 }
      );
    }

    // ── Update password ─────────────────────────────────────────────────
    const hashedPassword = await hashPassword(password);

    await prisma.$transaction([
      prisma.user.update({
        where: { id: user.id },
        data: { password: hashedPassword },
      }),
      prisma.setting.delete({
        where: { key: `password_reset_${user.id}` },
      }),
    ]);

    // ── Log activity ────────────────────────────────────────────────────
    await prisma.activityLog.create({
      data: {
        userId: user.id,
        action: "UPDATE",
        entityType: "User",
        entityId: user.id,
        description: "Password reset completed",
      },
    });

    return NextResponse.json(
      { message: "Password has been reset successfully. You can now log in." },
      { status: 200 }
    );
  } catch (error) {
    console.error("Reset password error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
