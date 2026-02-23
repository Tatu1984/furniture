import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { BannerPosition, Prisma } from "@/generated/prisma";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const position = searchParams.get("position") || "";

    const now = new Date();

    // ── Build where clause ──────────────────────────────────────────────
    const where: Prisma.BannerWhereInput = {
      isActive: true,
      OR: [
        { startsAt: null },
        { startsAt: { lte: now } },
      ],
      AND: [
        {
          OR: [
            { endsAt: null },
            { endsAt: { gte: now } },
          ],
        },
      ],
    };

    if (position) {
      const validPositions: BannerPosition[] = [
        "HOME_HERO",
        "HOME_SECONDARY",
        "CATEGORY_TOP",
        "SIDEBAR",
        "PROMOTIONAL_STRIP",
      ];
      if (validPositions.includes(position.toUpperCase() as BannerPosition)) {
        where.position = position.toUpperCase() as BannerPosition;
      }
    }

    const banners = await prisma.banner.findMany({
      where,
      orderBy: { sortOrder: "asc" },
    });

    return NextResponse.json({ data: banners }, { status: 200 });
  } catch (error) {
    console.error("Get banners error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
