import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { MenuLocation } from "@/generated/prisma";

interface MenuItemNode {
  id: string;
  parentId: string | null;
  title: string;
  url: string | null;
  type: string;
  targetId: string | null;
  target: string;
  sortOrder: number;
  isActive: boolean;
  children: MenuItemNode[];
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const location = searchParams.get("location") || "";

    // ── Build where clause ──────────────────────────────────────────────
    const where: { location?: MenuLocation } = {};
    if (location) {
      const validLocations: MenuLocation[] = ["HEADER", "FOOTER", "MOBILE", "SIDEBAR"];
      if (validLocations.includes(location.toUpperCase() as MenuLocation)) {
        where.location = location.toUpperCase() as MenuLocation;
      }
    }

    const menus = await prisma.menu.findMany({
      where,
      select: {
        id: true,
        name: true,
        slug: true,
        location: true,
        items: {
          where: { isActive: true },
          orderBy: { sortOrder: "asc" },
          select: {
            id: true,
            parentId: true,
            title: true,
            url: true,
            type: true,
            targetId: true,
            target: true,
            sortOrder: true,
            isActive: true,
          },
        },
      },
    });

    // ── Build hierarchical item tree for each menu ──────────────────────
    const data = menus.map((menu) => {
      const itemMap = new Map<string, MenuItemNode>();

      for (const item of menu.items) {
        itemMap.set(item.id, { ...item, children: [] });
      }

      const rootItems: MenuItemNode[] = [];

      for (const item of menu.items) {
        const node = itemMap.get(item.id)!;
        if (item.parentId && itemMap.has(item.parentId)) {
          itemMap.get(item.parentId)!.children.push(node);
        } else {
          rootItems.push(node);
        }
      }

      return {
        id: menu.id,
        name: menu.name,
        slug: menu.slug,
        location: menu.location,
        items: rootItems,
      };
    });

    return NextResponse.json({ data }, { status: 200 });
  } catch (error) {
    console.error("Get menus error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
