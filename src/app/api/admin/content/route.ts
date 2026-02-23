import { NextResponse, type NextRequest } from "next/server";
import prisma from "@/lib/db";

// ---------------------------------------------------------------------------
// GET /api/admin/content - List blog posts with filtering, search, pagination
// ---------------------------------------------------------------------------

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(
      100,
      Math.max(1, parseInt(searchParams.get("limit") || "20", 10)),
    );
    const search = searchParams.get("search") || undefined;
    const status = searchParams.get("status") || undefined;
    const categoryId = searchParams.get("categoryId") || undefined;
    const authorId = searchParams.get("authorId") || undefined;
    const isFeatured = searchParams.get("isFeatured");
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") === "asc" ? "asc" : "desc";

    const where: Record<string, unknown> = {};

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { excerpt: { contains: search, mode: "insensitive" } },
        { body: { contains: search, mode: "insensitive" } },
      ];
    }

    if (status) {
      where.status = status;
    }

    if (categoryId) {
      where.categoryId = categoryId;
    }

    if (authorId) {
      where.authorId = authorId;
    }

    if (isFeatured !== null && isFeatured !== undefined) {
      where.isFeatured = isFeatured === "true";
    }

    const allowedSortFields = [
      "createdAt",
      "updatedAt",
      "publishedAt",
      "title",
      "viewCount",
    ];
    const safeSortBy = allowedSortFields.includes(sortBy)
      ? sortBy
      : "createdAt";

    const [posts, total] = await Promise.all([
      prisma.blogPost.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { [safeSortBy]: sortOrder },
        select: {
          id: true,
          title: true,
          slug: true,
          excerpt: true,
          coverImage: true,
          tags: true,
          status: true,
          readTime: true,
          viewCount: true,
          isFeatured: true,
          commentsEnabled: true,
          publishedAt: true,
          createdAt: true,
          updatedAt: true,
          author: {
            select: { id: true, name: true, avatar: true },
          },
          category: {
            select: { id: true, name: true, slug: true },
          },
          _count: { select: { comments: true } },
        },
      }),
      prisma.blogPost.count({ where }),
    ]);

    return NextResponse.json({
      data: posts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("GET /api/admin/content error:", error);
    return NextResponse.json(
      { error: "Failed to fetch blog posts" },
      { status: 500 },
    );
  }
}

// ---------------------------------------------------------------------------
// POST /api/admin/content - Create a new blog post
// ---------------------------------------------------------------------------

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      title,
      slug,
      excerpt,
      body: postBody,
      coverImage,
      authorId,
      categoryId,
      tags = [],
      status = "DRAFT",
      relatedProductIds = [],
      readTime = 5,
      isFeatured = false,
      commentsEnabled = true,
      seoTitle,
      seoDescription,
      ogImage,
    } = body;

    if (!title || !slug || !authorId || !categoryId) {
      return NextResponse.json(
        { error: "Title, slug, authorId, and categoryId are required" },
        { status: 400 },
      );
    }

    // Check for duplicate slug
    const existing = await prisma.blogPost.findUnique({
      where: { slug },
    });
    if (existing) {
      return NextResponse.json(
        { error: "A blog post with this slug already exists" },
        { status: 409 },
      );
    }

    const post = await prisma.blogPost.create({
      data: {
        title,
        slug,
        excerpt,
        body: postBody,
        coverImage,
        authorId,
        categoryId,
        tags,
        status,
        relatedProductIds,
        readTime,
        isFeatured,
        commentsEnabled,
        seoTitle,
        seoDescription,
        ogImage,
        publishedAt: status === "PUBLISHED" ? new Date() : null,
      },
      include: {
        author: { select: { id: true, name: true } },
        category: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json({ data: post }, { status: 201 });
  } catch (error) {
    console.error("POST /api/admin/content error:", error);
    return NextResponse.json(
      { error: "Failed to create blog post" },
      { status: 500 },
    );
  }
}
