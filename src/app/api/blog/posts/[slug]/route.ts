import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const post = await prisma.blogPost.findUnique({
      where: { slug },
      select: {
        id: true,
        title: true,
        slug: true,
        excerpt: true,
        body: true,
        coverImage: true,
        tags: true,
        status: true,
        readTime: true,
        viewCount: true,
        isFeatured: true,
        commentsEnabled: true,
        relatedProductIds: true,
        seoTitle: true,
        seoDescription: true,
        ogImage: true,
        publishedAt: true,
        createdAt: true,
        updatedAt: true,
        author: {
          select: {
            id: true,
            name: true,
            slug: true,
            bio: true,
            avatar: true,
            website: true,
            twitter: true,
            instagram: true,
            linkedin: true,
          },
        },
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        comments: {
          where: {
            isApproved: true,
            parentId: null,
          },
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            authorName: true,
            body: true,
            createdAt: true,
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                avatar: true,
              },
            },
            replies: {
              where: { isApproved: true },
              orderBy: { createdAt: "asc" },
              select: {
                id: true,
                authorName: true,
                body: true,
                createdAt: true,
                user: {
                  select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    avatar: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!post || post.status !== "PUBLISHED") {
      return NextResponse.json(
        { error: "Blog post not found" },
        { status: 404 }
      );
    }

    // ── Increment view count ────────────────────────────────────────────
    await prisma.blogPost.update({
      where: { id: post.id },
      data: { viewCount: { increment: 1 } },
    });

    return NextResponse.json(
      {
        data: {
          ...post,
          viewCount: post.viewCount + 1,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Get blog post error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
