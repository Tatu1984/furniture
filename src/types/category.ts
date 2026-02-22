// ---------------------------------------------------------------------------
// Category types for the FSOW furniture e-commerce platform
// ---------------------------------------------------------------------------

import type { Image, SEOData } from "./common";

/** Top-level or nested furniture category */
export type Category = {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: Image;
  bannerImage?: Image;
  icon?: string;

  /** ID of the parent category; `null` for root-level categories */
  parentId: string | null;

  /** Resolved parent category (optional — included when relations are loaded) */
  parent?: Category | null;

  /** Direct child categories */
  subcategories: Category[];

  /** Nesting depth (0 = root) */
  level: number;

  /** Display order within its parent */
  sortOrder: number;

  /** Number of products in this category (including subcategories) */
  productCount: number;

  /** Whether the category is visible on the storefront */
  isActive: boolean;

  /** Whether to feature this category on the homepage / navigation */
  isFeatured: boolean;

  seo?: SEOData;

  createdAt: string;
  updatedAt: string;
};

/** Flat reference used inside a Product to avoid circular nesting */
export type CategoryRef = {
  id: string;
  name: string;
  slug: string;
  parentId: string | null;
};

/** Minimal category option for dropdowns / filters */
export type CategoryOption = {
  id: string;
  name: string;
  slug: string;
  level: number;
  parentId: string | null;
};

/** Tree structure returned by the category navigation API */
export type CategoryTree = {
  categories: Category[];
};
