import { NextResponse, type NextRequest } from "next/server";
import prisma from "@/lib/db";

// ---------------------------------------------------------------------------
// GET /api/admin/settings - Get all settings or by group
// ---------------------------------------------------------------------------

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const group = searchParams.get("group") || undefined;
    const key = searchParams.get("key") || undefined;

    const where: Record<string, unknown> = {};

    if (group) {
      where.group = group;
    }

    if (key) {
      where.key = key;
    }

    const settings = await prisma.setting.findMany({
      where,
      orderBy: [{ group: "asc" }, { key: "asc" }],
    });

    // Group settings by their group name for easier consumption
    if (!key) {
      const grouped: Record<string, Record<string, unknown>> = {};
      for (const setting of settings) {
        if (!grouped[setting.group]) {
          grouped[setting.group] = {};
        }
        grouped[setting.group][setting.key] = setting.value;
      }

      return NextResponse.json({
        data: settings,
        grouped,
      });
    }

    return NextResponse.json({ data: settings });
  } catch (error) {
    console.error("GET /api/admin/settings error:", error);
    return NextResponse.json(
      { error: "Failed to fetch settings" },
      { status: 500 },
    );
  }
}

// ---------------------------------------------------------------------------
// PUT /api/admin/settings - Batch update settings
// ---------------------------------------------------------------------------

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();

    const { settings } = body;

    if (!Array.isArray(settings) || settings.length === 0) {
      return NextResponse.json(
        { error: "Settings array is required" },
        { status: 400 },
      );
    }

    // Validate each setting
    for (const setting of settings) {
      if (!setting.key || setting.value === undefined) {
        return NextResponse.json(
          { error: "Each setting must have a key and value" },
          { status: 400 },
        );
      }
    }

    // Upsert all settings in a transaction
    const results = await prisma.$transaction(
      settings.map(
        (setting: {
          key: string;
          value: unknown;
          group?: string;
          autoload?: boolean;
        }) =>
          prisma.setting.upsert({
            where: { key: setting.key },
            create: {
              key: setting.key,
              value: setting.value as object,
              group: setting.group || "general",
              autoload: setting.autoload ?? false,
            },
            update: {
              value: setting.value as object,
              ...(setting.group !== undefined && { group: setting.group }),
              ...(setting.autoload !== undefined && {
                autoload: setting.autoload,
              }),
            },
          }),
      ),
    );

    return NextResponse.json({ data: results });
  } catch (error) {
    console.error("PUT /api/admin/settings error:", error);
    return NextResponse.json(
      { error: "Failed to update settings" },
      { status: 500 },
    );
  }
}
