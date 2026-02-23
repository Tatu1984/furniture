import { NextResponse } from "next/server";
import prisma from "@/lib/db";

interface CategoryTree {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  icon: string | null;
  level: number;
  sortOrder: number;
  isFeatured: boolean;
  productCount: number;
  children: CategoryTree[];
}

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        image: true,
        bannerImage: true,
        icon: true,
        parentId: true,
        level: true,
        sortOrder: true,
        isFeatured: true,
        _count: {
          select: {
            products: {
              where: { status: "PUBLISHED" },
            },
          },
        },
      },
    });

    // ── Build tree structure ────────────────────────────────────────────
    const categoryMap = new Map<string, CategoryTree>();
    const roots: CategoryTree[] = [];

    // First pass: create all nodes
    for (const cat of categories) {
      categoryMap.set(cat.id, {
        id: cat.id,
        name: cat.name,
        slug: cat.slug,
        description: cat.description,
        image: cat.image,
        icon: cat.icon,
        level: cat.level,
        sortOrder: cat.sortOrder,
        isFeatured: cat.isFeatured,
        productCount: cat._count.products,
        children: [],
      });
    }

    // Second pass: attach children to parents
    for (const cat of categories) {
      const node = categoryMap.get(cat.id)!;
      if (cat.parentId && categoryMap.has(cat.parentId)) {
        categoryMap.get(cat.parentId)!.children.push(node);
      } else {
        roots.push(node);
      }
    }

    return NextResponse.json({ categories: roots }, { status: 200 });
  } catch (error) {
    console.error("List categories error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
