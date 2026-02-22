// ---------------------------------------------------------------------------
// Blog types for the FSOW furniture e-commerce platform
// ---------------------------------------------------------------------------

import type { Image, SEOData } from "./common";

/** Blog post status */
export type BlogPostStatus = "draft" | "published" | "archived";

/** Blog author */
export type Author = {
  id: string;
  name: string;
  slug: string;
  bio?: string;
  avatar?: Image;
  email?: string;
  website?: string;
  socialLinks?: AuthorSocialLinks;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type AuthorSocialLinks = {
  twitter?: string;
  instagram?: string;
  linkedin?: string;
  facebook?: string;
  pinterest?: string;
};

/** Blog category (separate from product categories) */
export type BlogCategory = {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: Image;
  postCount: number;
  isActive: boolean;
  sortOrder: number;
  seo?: SEOData;
  createdAt: string;
  updatedAt: string;
};

/** Blog post entity */
export type BlogPost = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  body: string; // HTML or MDX content
  coverImage?: Image;

  author: Author;
  category: BlogCategory;

  tags: string[];
  status: BlogPostStatus;

  /** Related product IDs referenced in the post */
  relatedProductIds?: string[];

  /** Estimated read time in minutes */
  readTime: number;

  /** View count */
  viewCount: number;

  /** Whether the post is featured on the blog landing page */
  isFeatured: boolean;

  /** Allow comments */
  commentsEnabled: boolean;
  commentCount: number;

  seo?: SEOData;

  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
};

/** Minimal blog post card for listings */
export type BlogPostCard = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  coverImage?: Image;
  author: {
    name: string;
    slug: string;
    avatar?: Image;
  };
  category: {
    name: string;
    slug: string;
  };
  tags: string[];
  readTime: number;
  isFeatured: boolean;
  publishedAt?: string;
};

/** Blog list query parameters */
export type BlogListParams = {
  page?: number;
  perPage?: number;
  search?: string;
  categorySlug?: string;
  authorSlug?: string;
  tag?: string;
  status?: BlogPostStatus;
  isFeatured?: boolean;
  sort?: string;
  direction?: "asc" | "desc";
};

/** Blog comment */
export type BlogComment = {
  id: string;
  postId: string;
  authorName: string;
  authorEmail: string;
  body: string;
  isApproved: boolean;
  parentId?: string; // for nested / threaded replies
  replies?: BlogComment[];
  createdAt: string;
  updatedAt: string;
};
