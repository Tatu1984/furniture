import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await params;

    const project = await prisma.completedProject.findUnique({
      where: { slug, status: "PUBLISHED" },
      include: {
        media: { orderBy: { sortOrder: "asc" } },
      },
    });

    if (!project) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ data: project });
  } catch (error) {
    console.error("GET /api/projects/[slug] error:", error);
    return NextResponse.json(
      { error: "Failed to fetch project" },
      { status: 500 },
    );
  }
}
