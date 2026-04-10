import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getAuthUser } from "@/lib/auth";
import { hash, compare } from "bcryptjs";

export async function GET(request: NextRequest) {
  try {
    const authPayload = await getAuthUser(request);

    if (!authPayload) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: authPayload.userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        status: true,
        isActive: true,
        emailVerified: true,
        avatar: true,
        preferredContact: true,
        isSubscribedToNewsletter: true,
        lastLoginAt: true,
        createdAt: true,
        updatedAt: true,
        addresses: {
          select: {
            id: true,
            type: true,
            firstName: true,
            lastName: true,
            company: true,
            phone: true,
            line1: true,
            line2: true,
            city: true,
            state: true,
            postalCode: true,
            country: true,
            label: true,
            isDefault: true,
          },
          orderBy: { isDefault: "desc" },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ user }, { status: 200 });
  } catch (error) {
    console.error("Get current user error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// ---------------------------------------------------------------------------
// PUT /api/auth/me — Update current user profile + optional password change
// ---------------------------------------------------------------------------

export async function PUT(request: NextRequest) {
  try {
    const authPayload = await getAuthUser(request);
    if (!authPayload) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 },
      );
    }

    const body = await request.json();
    const { firstName, lastName, phone, currentPassword, newPassword } = body;

    const data: Record<string, unknown> = {};
    if (firstName !== undefined) data.firstName = firstName;
    if (lastName !== undefined) data.lastName = lastName;
    if (phone !== undefined) data.phone = phone;

    // Password change
    if (newPassword) {
      if (!currentPassword) {
        return NextResponse.json(
          { error: "Current password is required to set a new password" },
          { status: 400 },
        );
      }
      const existing = await prisma.user.findUnique({
        where: { id: authPayload.userId },
        select: { password: true },
      });
      if (!existing?.password) {
        return NextResponse.json(
          { error: "Account has no password set" },
          { status: 400 },
        );
      }
      const valid = await compare(currentPassword, existing.password);
      if (!valid) {
        return NextResponse.json(
          { error: "Current password is incorrect" },
          { status: 400 },
        );
      }
      data.password = await hash(newPassword, 12);
    }

    const user = await prisma.user.update({
      where: { id: authPayload.userId },
      data,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
      },
    });

    return NextResponse.json({ user });
  } catch (error) {
    console.error("PUT /api/auth/me error:", error);
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 },
    );
  }
}
