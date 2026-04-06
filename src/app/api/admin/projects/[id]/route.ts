import { NextResponse, type NextRequest } from "next/server";
import prisma from "@/lib/db";

type RouteContext = { params: Promise<{ id: string }> };

// ---------------------------------------------------------------------------
// GET /api/admin/projects/:id
// ---------------------------------------------------------------------------

export async function GET(_request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;

    const project = await prisma.completedProject.findUnique({
      where: { id },
      include: { media: { orderBy: { sortOrder: "asc" } } },
    });

    if (!project) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ data: project });
  } catch (error) {
    console.error("GET /api/admin/projects/:id error:", error);
    return NextResponse.json(
      { error: "Failed to fetch project" },
      { status: 500 },
    );
  }
}

// ---------------------------------------------------------------------------
// PUT /api/admin/projects/:id
// ---------------------------------------------------------------------------

export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const body = await request.json();

    const {
      title,
      slug,
      description,
      category,
      location,
      clientName,
      completedAt,
      status,
      isFeatured,
      sortOrder,
      media,
    } = body;

    // Check project exists
    const existing = await prisma.completedProject.findUnique({
      where: { id },
    });
    if (!existing) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 },
      );
    }

    // Check slug uniqueness if changed
    if (slug && slug !== existing.slug) {
      const slugTaken = await prisma.completedProject.findUnique({
        where: { slug },
      });
      if (slugTaken) {
        return NextResponse.json(
          { error: "A project with this slug already exists" },
          { status: 409 },
        );
      }
    }

    // Build update data
    const updateData: Record<string, unknown> = {};
    if (title !== undefined) updateData.title = title;
    if (slug !== undefined) updateData.slug = slug;
    if (description !== undefined) updateData.description = description;
    if (category !== undefined) updateData.category = category;
    if (location !== undefined) updateData.location = location;
    if (clientName !== undefined) updateData.clientName = clientName;
    if (completedAt !== undefined)
      updateData.completedAt = completedAt ? new Date(completedAt) : null;
    if (status !== undefined) updateData.status = status;
    if (isFeatured !== undefined) updateData.isFeatured = isFeatured;
    if (sortOrder !== undefined) updateData.sortOrder = sortOrder;

    // Handle media: delete all existing and recreate
    if (media !== undefined) {
      await prisma.projectMedia.deleteMany({ where: { projectId: id } });
      updateData.media = {
        create: media.map(
          (
            m: {
              url: string;
              type?: string;
              caption?: string;
              alt?: string;
              sortOrder?: number;
              isDefault?: boolean;
            },
            i: number,
          ) => ({
            url: m.url,
            type: m.type || "IMAGE",
            caption: m.caption || null,
            alt: m.alt || "",
            sortOrder: m.sortOrder ?? i,
            isDefault: m.isDefault ?? i === 0,
          }),
        ),
      };
    }

    const project = await prisma.completedProject.update({
      where: { id },
      data: updateData,
      include: { media: { orderBy: { sortOrder: "asc" } } },
    });

    return NextResponse.json({ data: project });
  } catch (error) {
    console.error("PUT /api/admin/projects/:id error:", error);
    return NextResponse.json(
      { error: "Failed to update project" },
      { status: 500 },
    );
  }
}

// ---------------------------------------------------------------------------
// DELETE /api/admin/projects/:id
// ---------------------------------------------------------------------------

export async function DELETE(_request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;

    const existing = await prisma.completedProject.findUnique({
      where: { id },
    });
    if (!existing) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 },
      );
    }

    await prisma.completedProject.delete({ where: { id } });

    return NextResponse.json({ message: "Project deleted" });
  } catch (error) {
    console.error("DELETE /api/admin/projects/:id error:", error);
    return NextResponse.json(
      { error: "Failed to delete project" },
      { status: 500 },
    );
  }
}
