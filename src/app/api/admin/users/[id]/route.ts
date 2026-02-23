import { NextResponse, type NextRequest } from "next/server";
import prisma from "@/lib/db";

// ---------------------------------------------------------------------------
// GET /api/admin/users/[id]
// ---------------------------------------------------------------------------

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    // RBAC: Only ADMIN can manage users
    const userRole = _request.headers.get("x-user-role");
    if (userRole !== "ADMIN") {
      return NextResponse.json(
        { error: "Only administrators can manage users" },
        { status: 403 },
      );
    }

    const { id } = await params;

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        status: true,
        isActive: true,
        avatar: true,
        emailVerified: true,
        notes: true,
        lastLoginAt: true,
        createdAt: true,
        updatedAt: true,
        activityLogs: {
          orderBy: { createdAt: "desc" },
          take: 20,
          select: {
            id: true,
            action: true,
            entityType: true,
            entityId: true,
            description: true,
            createdAt: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ data: user });
  } catch (error) {
    console.error("GET /api/admin/users/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to fetch user" },
      { status: 500 },
    );
  }
}

// ---------------------------------------------------------------------------
// PUT /api/admin/users/[id]
// ---------------------------------------------------------------------------

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    // RBAC: Only ADMIN can manage users
    const userRole = request.headers.get("x-user-role");
    if (userRole !== "ADMIN") {
      return NextResponse.json(
        { error: "Only administrators can manage users" },
        { status: 403 },
      );
    }

    const { id } = await params;
    const body = await request.json();

    const existing = await prisma.user.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 },
      );
    }

    const {
      firstName,
      lastName,
      phone,
      role,
      status,
      isActive,
      notes,
      password,
    } = body;

    const updateData: Record<string, unknown> = {};
    if (firstName !== undefined) updateData.firstName = firstName;
    if (lastName !== undefined) updateData.lastName = lastName;
    if (phone !== undefined) updateData.phone = phone;
    if (role !== undefined) {
      const staffRoles = ["ADMIN", "EDITOR", "OPS", "MANAGER"];
      if (!staffRoles.includes(role)) {
        return NextResponse.json(
          { error: "Invalid role" },
          { status: 400 },
        );
      }
      updateData.role = role;
    }
    if (status !== undefined) updateData.status = status;
    if (isActive !== undefined) updateData.isActive = isActive;
    if (notes !== undefined) updateData.notes = notes;

    if (password) {
      const bcrypt = await import("bcryptjs");
      updateData.password = await bcrypt.hash(password, 12);
    }

    const user = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        status: true,
        isActive: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({ data: user });
  } catch (error) {
    console.error("PUT /api/admin/users/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to update user" },
      { status: 500 },
    );
  }
}

// ---------------------------------------------------------------------------
// DELETE /api/admin/users/[id]
// ---------------------------------------------------------------------------

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    // RBAC: Only ADMIN can manage users
    const userRole = request.headers.get("x-user-role");
    if (userRole !== "ADMIN") {
      return NextResponse.json(
        { error: "Only administrators can manage users" },
        { status: 403 },
      );
    }

    const { id } = await params;
    const currentUserId = request.headers.get("x-user-id");

    // Prevent self-deletion
    if (id === currentUserId) {
      return NextResponse.json(
        { error: "You cannot delete your own account" },
        { status: 400 },
      );
    }

    const existing = await prisma.user.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 },
      );
    }

    // Soft delete: deactivate the user
    await prisma.user.update({
      where: { id },
      data: { isActive: false, status: "SUSPENDED" },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/admin/users/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to delete user" },
      { status: 500 },
    );
  }
}
