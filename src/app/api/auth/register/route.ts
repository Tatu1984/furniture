import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { createToken, hashPassword } from "@/lib/auth";

const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, firstName, lastName } = body;

    // ── Validation ──────────────────────────────────────────────────────
    const errors: Record<string, string> = {};

    if (!email || typeof email !== "string" || !EMAIL_REGEX.test(email.trim())) {
      errors.email = "A valid email address is required";
    }

    if (!password || typeof password !== "string") {
      errors.password = "Password is required";
    } else if (!PASSWORD_REGEX.test(password)) {
      errors.password =
        "Password must be at least 8 characters with 1 uppercase, 1 lowercase, and 1 number";
    }

    if (!firstName || typeof firstName !== "string" || firstName.trim().length === 0) {
      errors.firstName = "First name is required";
    }

    if (!lastName || typeof lastName !== "string" || lastName.trim().length === 0) {
      errors.lastName = "Last name is required";
    }

    if (Object.keys(errors).length > 0) {
      return NextResponse.json({ error: "Validation failed", errors }, { status: 400 });
    }

    // ── Check duplicate email ───────────────────────────────────────────
    const normalizedEmail = email.trim().toLowerCase();

    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      select: { id: true },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 409 }
      );
    }

    // ── Create user ─────────────────────────────────────────────────────
    const hashedPassword = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        email: normalizedEmail,
        password: hashedPassword,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        role: "CUSTOMER",
        status: "ACTIVE",
        isActive: true,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        createdAt: true,
      },
    });

    // ── Issue JWT ────────────────────────────────────────────────────────
    const token = await createToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    const isProduction = process.env.NODE_ENV === "production";

    const response = NextResponse.json(
      {
        message: "Registration successful",
        user,
      },
      { status: 201 }
    );

    response.cookies.set("auth-token", token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
