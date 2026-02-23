import { NextResponse, type NextRequest } from "next/server";
import prisma from "@/lib/db";

// ---------------------------------------------------------------------------
// GET /api/admin/content/[id]
// ---------------------------------------------------------------------------

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const post = await prisma.blogPost.findUnique({
      where: { id },
      include: {
        author: true,
        category: true,
        comments: {
          orderBy: { createdAt: "desc" },
          take: 20,
          select: {
            id: true,
            authorName: true,
            authorEmail: true,
            body: true,
            isApproved: true,
            parentId: true,
            createdAt: true,
            user: { select: { id: true, firstName: true, lastName: true } },
          },
        },
        _count: { select: { comments: true } },
      },
    });

    if (!post) {
      return NextResponse.json(
        { error: "Blog post not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ data: post });
  } catch (error) {
    console.error("GET /api/admin/content/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to fetch blog post" },
      { status: 500 },
    );
  }
}

// ---------------------------------------------------------------------------
// PUT /api/admin/content/[id]
// ---------------------------------------------------------------------------

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const existing = await prisma.blogPost.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: "Blog post not found" },
        { status: 404 },
      );
    }

    // Check slug uniqueness if changed
    if (body.slug && body.slug !== existing.slug) {
      const slugExists = await prisma.blogPost.findFirst({
        where: { slug: body.slug, id: { not: id } },
      });
      if (slugExists) {
        return NextResponse.json(
          { error: "A blog post with this slug already exists" },
          { status: 409 },
        );
      }
    }

    // Set publishedAt if transitioning to PUBLISHED
    if (body.status === "PUBLISHED" && existing.status !== "PUBLISHED") {
      body.publishedAt = new Date();
    }

    // Rename body field to avoid conflict
    if (body.body !== undefined) {
      // body.body is the post content - Prisma field is called "body"
      // No renaming needed, just pass through
    }

    const post = await prisma.blogPost.update({
      where: { id },
      data: body,
      include: {
        author: { select: { id: true, name: true } },
        category: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json({ data: post });
  } catch (error) {
    console.error("PUT /api/admin/content/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to update blog post" },
      { status: 500 },
    );
  }
}

// ---------------------------------------------------------------------------
// DELETE /api/admin/content/[id]
// ---------------------------------------------------------------------------

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const existing = await prisma.blogPost.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: "Blog post not found" },
        { status: 404 },
      );
    }

    await prisma.blogPost.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/admin/content/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to delete blog post" },
      { status: 500 },
    );
  }
}
