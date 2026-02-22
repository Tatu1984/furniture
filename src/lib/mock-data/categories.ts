// ---------------------------------------------------------------------------
// Categories mock data
// ---------------------------------------------------------------------------

import { categoryImage, categoryIcon } from "./images";

// ---- Types ----------------------------------------------------------------

export interface SubCategory {
  id: string;
  parentId: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  productCount: number;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  icon: string;
  productCount: number;
  subcategories: SubCategory[];
}

// ---- Data -----------------------------------------------------------------

export const categories: Category[] = [
  {
    id: "cat-living-room",
    name: "Living Room",
    slug: "living-room",
    description:
      "Transform your living space with stylish sofas, armchairs, coffee tables, and entertainment units designed for comfort and conversation.",
    image: categoryImage("living-room"),
    icon: categoryIcon("living-room"),
    productCount: 12,
    subcategories: [
      {
        id: "sub-sofas",
        parentId: "cat-living-room",
        name: "Sofas",
        slug: "sofas",
        description: "From sectionals to loveseats, find the perfect sofa for your space.",
        image: categoryImage("sofas"),
        productCount: 4,
      },
      {
        id: "sub-armchairs",
        parentId: "cat-living-room",
        name: "Armchairs",
        slug: "armchairs",
        description: "Accent chairs, recliners, and reading chairs for every room.",
        image: categoryImage("armchairs"),
        productCount: 2,
      },
      {
        id: "sub-coffee-tables",
        parentId: "cat-living-room",
        name: "Coffee Tables",
        slug: "coffee-tables",
        description: "Centerpieces for your living room in wood, glass, and stone.",
        image: categoryImage("coffee-tables"),
        productCount: 2,
      },
      {
        id: "sub-tv-stands",
        parentId: "cat-living-room",
        name: "TV Stands",
        slug: "tv-stands",
        description: "Media consoles and entertainment centers for every screen size.",
        image: categoryImage("tv-stands"),
        productCount: 2,
      },
      {
        id: "sub-bookshelves",
        parentId: "cat-living-room",
        name: "Bookshelves",
        slug: "bookshelves",
        description: "Open shelving, wall units, and library-style bookcases.",
        image: categoryImage("bookshelves"),
        productCount: 2,
      },
    ],
  },
  {
    id: "cat-bedroom",
    name: "Bedroom",
    slug: "bedroom",
    description:
      "Create your personal sanctuary with premium beds, nightstands, dressers, and wardrobes crafted for restful living.",
    image: categoryImage("bedroom"),
    icon: categoryIcon("bedroom"),
    productCount: 10,
    subcategories: [
      {
        id: "sub-beds",
        parentId: "cat-bedroom",
        name: "Beds",
        slug: "beds",
        description: "Platform beds, upholstered frames, and canopy beds in all sizes.",
        image: categoryImage("beds"),
        productCount: 3,
      },
      {
        id: "sub-nightstands",
        parentId: "cat-bedroom",
        name: "Nightstands",
        slug: "nightstands",
        description: "Bedside tables with storage, charging, and style.",
        image: categoryImage("nightstands"),
        productCount: 2,
      },
      {
        id: "sub-dressers",
        parentId: "cat-bedroom",
        name: "Dressers",
        slug: "dressers",
        description: "Spacious dressers and chests for organized living.",
        image: categoryImage("dressers"),
        productCount: 2,
      },
      {
        id: "sub-wardrobes",
        parentId: "cat-bedroom",
        name: "Wardrobes",
        slug: "wardrobes",
        description: "Freestanding wardrobes and armoires for generous storage.",
        image: categoryImage("wardrobes"),
        productCount: 2,
      },
      {
        id: "sub-mattresses",
        parentId: "cat-bedroom",
        name: "Mattresses",
        slug: "mattresses",
        description: "Memory foam, hybrid, and innerspring mattresses for every sleeper.",
        image: categoryImage("mattresses"),
        productCount: 1,
      },
    ],
  },
  {
    id: "cat-dining",
    name: "Dining",
    slug: "dining",
    description:
      "Set the stage for memorable meals with elegant dining tables, chairs, bar stools, and storage solutions.",
    image: categoryImage("dining"),
    icon: categoryIcon("dining"),
    productCount: 9,
    subcategories: [
      {
        id: "sub-dining-tables",
        parentId: "cat-dining",
        name: "Dining Tables",
        slug: "dining-tables",
        description: "Round, rectangular, and extendable tables for every gathering.",
        image: categoryImage("dining-tables"),
        productCount: 3,
      },
      {
        id: "sub-dining-chairs",
        parentId: "cat-dining",
        name: "Dining Chairs",
        slug: "dining-chairs",
        description: "Upholstered, wooden, and metal chairs to complement your table.",
        image: categoryImage("dining-chairs"),
        productCount: 2,
      },
      {
        id: "sub-bar-stools",
        parentId: "cat-dining",
        name: "Bar Stools",
        slug: "bar-stools",
        description: "Counter and bar height stools for kitchen islands and bars.",
        image: categoryImage("bar-stools"),
        productCount: 2,
      },
      {
        id: "sub-buffets",
        parentId: "cat-dining",
        name: "Buffets",
        slug: "buffets",
        description: "Sideboards and buffets for serving and storage.",
        image: categoryImage("buffets"),
        productCount: 1,
      },
      {
        id: "sub-china-cabinets",
        parentId: "cat-dining",
        name: "China Cabinets",
        slug: "china-cabinets",
        description: "Display cabinets and hutches to showcase your fine dinnerware.",
        image: categoryImage("china-cabinets"),
        productCount: 1,
      },
    ],
  },
  {
    id: "cat-office",
    name: "Office",
    slug: "office",
    description:
      "Boost your productivity with ergonomic desks, supportive chairs, and smart storage designed for the modern workspace.",
    image: categoryImage("office"),
    icon: categoryIcon("office"),
    productCount: 8,
    subcategories: [
      {
        id: "sub-desks",
        parentId: "cat-office",
        name: "Desks",
        slug: "desks",
        description: "Standing desks, writing desks, and executive desks.",
        image: categoryImage("desks"),
        productCount: 3,
      },
      {
        id: "sub-office-chairs",
        parentId: "cat-office",
        name: "Office Chairs",
        slug: "office-chairs",
        description: "Ergonomic task chairs, executive chairs, and mesh options.",
        image: categoryImage("office-chairs"),
        productCount: 2,
      },
      {
        id: "sub-filing-cabinets",
        parentId: "cat-office",
        name: "Filing Cabinets",
        slug: "filing-cabinets",
        description: "Vertical, lateral, and mobile filing solutions.",
        image: categoryImage("filing-cabinets"),
        productCount: 1,
      },
      {
        id: "sub-bookcases",
        parentId: "cat-office",
        name: "Bookcases",
        slug: "bookcases",
        description: "Office bookcases and shelving for reference materials.",
        image: categoryImage("bookcases"),
        productCount: 2,
      },
    ],
  },
  {
    id: "cat-outdoor",
    name: "Outdoor",
    slug: "outdoor",
    description:
      "Extend your living area outdoors with weather-resistant patio furniture, loungers, and dining sets built to last.",
    image: categoryImage("outdoor"),
    icon: categoryIcon("outdoor"),
    productCount: 6,
    subcategories: [
      {
        id: "sub-patio-sets",
        parentId: "cat-outdoor",
        name: "Patio Sets",
        slug: "patio-sets",
        description: "Complete patio dining and conversation sets.",
        image: categoryImage("patio-sets"),
        productCount: 2,
      },
      {
        id: "sub-lounge-chairs",
        parentId: "cat-outdoor",
        name: "Lounge Chairs",
        slug: "lounge-chairs",
        description: "Outdoor recliners, chaise lounges, and Adirondack chairs.",
        image: categoryImage("lounge-chairs"),
        productCount: 2,
      },
      {
        id: "sub-garden-tables",
        parentId: "cat-outdoor",
        name: "Garden Tables",
        slug: "garden-tables",
        description: "Bistro tables, side tables, and fire pit tables.",
        image: categoryImage("garden-tables"),
        productCount: 1,
      },
      {
        id: "sub-umbrellas",
        parentId: "cat-outdoor",
        name: "Umbrellas",
        slug: "umbrellas",
        description: "Market umbrellas, cantilever umbrellas, and shade solutions.",
        image: categoryImage("umbrellas"),
        productCount: 1,
      },
    ],
  },
  {
    id: "cat-decor",
    name: "Decor",
    slug: "decor",
    description:
      "Add the finishing touches with curated lighting, rugs, wall art, mirrors, and planters that bring your space to life.",
    image: categoryImage("decor"),
    icon: categoryIcon("decor"),
    productCount: 5,
    subcategories: [
      {
        id: "sub-lighting",
        parentId: "cat-decor",
        name: "Lighting",
        slug: "lighting",
        description: "Table lamps, floor lamps, pendants, and sconces.",
        image: categoryImage("lighting"),
        productCount: 2,
      },
      {
        id: "sub-rugs",
        parentId: "cat-decor",
        name: "Rugs",
        slug: "rugs",
        description: "Area rugs, runners, and accent rugs in all materials.",
        image: categoryImage("rugs"),
        productCount: 1,
      },
      {
        id: "sub-wall-art",
        parentId: "cat-decor",
        name: "Wall Art",
        slug: "wall-art",
        description: "Canvas prints, framed art, and wall sculptures.",
        image: categoryImage("wall-art"),
        productCount: 1,
      },
      {
        id: "sub-mirrors",
        parentId: "cat-decor",
        name: "Mirrors",
        slug: "mirrors",
        description: "Decorative mirrors, full-length, and wall mirrors.",
        image: categoryImage("mirrors"),
        productCount: 0,
      },
      {
        id: "sub-planters",
        parentId: "cat-decor",
        name: "Planters",
        slug: "planters",
        description: "Indoor and outdoor planters, pots, and plant stands.",
        image: categoryImage("planters"),
        productCount: 1,
      },
    ],
  },
];

// ---- Lookup helpers -------------------------------------------------------

export function getCategoryById(id: string): Category | undefined {
  return categories.find((c) => c.id === id);
}

export function getCategoryBySlug(slug: string): Category | undefined {
  return categories.find((c) => c.slug === slug);
}

export function getSubcategoryById(id: string): SubCategory | undefined {
  for (const cat of categories) {
    const sub = cat.subcategories.find((s) => s.id === id);
    if (sub) return sub;
  }
  return undefined;
}

export function getAllSubcategories(): SubCategory[] {
  return categories.flatMap((c) => c.subcategories);
}
