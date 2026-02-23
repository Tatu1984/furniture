import { NextResponse, type NextRequest } from "next/server";
import prisma from "@/lib/db";

// ---------------------------------------------------------------------------
// GET /api/admin/users - List staff users (ADMIN only)
// ---------------------------------------------------------------------------

export async function GET(request: NextRequest) {
  try {
    // RBAC: Only ADMIN can manage users
    const userRole = request.headers.get("x-user-role");
    if (userRole !== "ADMIN") {
      return NextResponse.json(
        { error: "Only administrators can manage users" },
        { status: 403 },
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(
      100,
      Math.max(1, parseInt(searchParams.get("limit") || "20", 10)),
    );
    const search = searchParams.get("search") || undefined;
    const role = searchParams.get("role") || undefined;
    const status = searchParams.get("status") || undefined;
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") === "asc" ? "asc" : "desc";

    const where: Record<string, unknown> = {
      role: { in: ["ADMIN", "EDITOR", "OPS", "MANAGER"] },
    };

    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: "insensitive" } },
        { lastName: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ];
    }

    if (role) {
      where.role = role;
    }

    if (status) {
      where.status = status;
    }

    const allowedSortFields = [
      "createdAt",
      "updatedAt",
      "firstName",
      "lastName",
      "email",
      "lastLoginAt",
    ];
    const safeSortBy = allowedSortFields.includes(sortBy)
      ? sortBy
      : "createdAt";

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { [safeSortBy]: sortOrder },
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
          lastLoginAt: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      prisma.user.count({ where }),
    ]);

    return NextResponse.json({
      data: users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("GET /api/admin/users error:", error);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 },
    );
  }
}

// ---------------------------------------------------------------------------
// POST /api/admin/users - Create a new staff user
// ---------------------------------------------------------------------------

export async function POST(request: NextRequest) {
  try {
    // RBAC: Only ADMIN can manage users
    const userRole = request.headers.get("x-user-role");
    if (userRole !== "ADMIN") {
      return NextResponse.json(
        { error: "Only administrators can manage users" },
        { status: 403 },
      );
    }

    const body = await request.json();

    const {
      email,
      firstName,
      lastName,
      phone,
      role = "EDITOR",
      status = "ACTIVE",
      password,
    } = body;

    if (!email || !firstName || !lastName) {
      return NextResponse.json(
        { error: "Email, first name, and last name are required" },
        { status: 400 },
      );
    }

    // Validate role is a staff role
    const staffRoles = ["ADMIN", "EDITOR", "OPS", "MANAGER"];
    if (!staffRoles.includes(role)) {
      return NextResponse.json(
        { error: "Invalid role. Must be ADMIN, EDITOR, OPS, or MANAGER" },
        { status: 400 },
      );
    }

    // Check for duplicate email
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { error: "A user with this email already exists" },
        { status: 409 },
      );
    }

    // Hash password if provided
    let hashedPassword: string | undefined;
    if (password) {
      const bcrypt = await import("bcryptjs");
      hashedPassword = await bcrypt.hash(password, 12);
    }

    const user = await prisma.user.create({
      data: {
        email,
        firstName,
        lastName,
        phone,
        role,
        status,
        password: hashedPassword,
        emailVerified: true,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        status: true,
        isActive: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ data: user }, { status: 201 });
  } catch (error) {
    console.error("POST /api/admin/users error:", error);
    return NextResponse.json(
      { error: "Failed to create user" },
      { status: 500 },
    );
  }
}
