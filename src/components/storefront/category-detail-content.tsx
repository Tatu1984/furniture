"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import { Grid3X3, LayoutList } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "@/components/ui/pagination";
import { BreadcrumbNav } from "@/components/shared/breadcrumb-nav";
import { ProductCard } from "@/components/storefront/product-card";
import {
  FilterSidebar,
  defaultFilters,
  type FilterState,
} from "@/components/storefront/filter-sidebar";

// ---------------------------------------------------------------------------
// Mock product data
// ---------------------------------------------------------------------------

interface MockProduct {
  id: string;
  slug: string;
  name: string;
  price: number;
  compareAtPrice?: number;
  image: string;
  category: string;
  categorySlug: string;
  rating: number;
  reviewCount: number;
  material: string;
  createdAt: string;
}

const allProducts: MockProduct[] = [
  // Living Room
  { id: "p1", slug: "modern-sofa", name: "Modern Sectional Sofa", price: 2499, compareAtPrice: 2999, image: "https://picsum.photos/seed/product-modern-sofa/600/450", category: "Living Room", categorySlug: "living-room", rating: 4.8, reviewCount: 124, material: "Fabric", createdAt: "2025-12-01" },
  { id: "p2", slug: "leather-armchair", name: "Leather Lounge Armchair", price: 899, image: "https://picsum.photos/seed/product-leather-armchair/600/450", category: "Living Room", categorySlug: "living-room", rating: 4.7, reviewCount: 89, material: "Leather", createdAt: "2025-11-15" },
  { id: "p3", slug: "oak-coffee-table", name: "Oak Coffee Table", price: 649, compareAtPrice: 799, image: "https://picsum.photos/seed/product-oak-coffee-table/600/450", category: "Living Room", categorySlug: "living-room", rating: 4.6, reviewCount: 56, material: "Wood", createdAt: "2025-10-20" },
  { id: "p4", slug: "walnut-bookshelf", name: "Walnut Standing Bookshelf", price: 1299, image: "https://picsum.photos/seed/product-walnut-bookshelf/600/450", category: "Living Room", categorySlug: "living-room", rating: 4.5, reviewCount: 34, material: "Wood", createdAt: "2025-09-10" },
  { id: "p5", slug: "glass-side-table", name: "Tempered Glass Side Table", price: 349, image: "https://picsum.photos/seed/product-glass-side-table/600/450", category: "Living Room", categorySlug: "living-room", rating: 4.3, reviewCount: 28, material: "Glass", createdAt: "2025-08-22" },
  { id: "p6", slug: "rattan-accent-chair", name: "Rattan Accent Chair", price: 599, compareAtPrice: 749, image: "https://picsum.photos/seed/product-rattan-accent-chair/600/450", category: "Living Room", categorySlug: "living-room", rating: 4.4, reviewCount: 41, material: "Rattan", createdAt: "2025-07-18" },
  { id: "p7", slug: "media-console", name: "Walnut Media Console", price: 1149, image: "https://picsum.photos/seed/product-media-console/600/450", category: "Living Room", categorySlug: "living-room", rating: 4.7, reviewCount: 63, material: "Wood", createdAt: "2025-06-05" },
  { id: "p8", slug: "metal-floor-lamp", name: "Metal Arc Floor Lamp", price: 279, image: "https://picsum.photos/seed/product-metal-floor-lamp/600/450", category: "Living Room", categorySlug: "living-room", rating: 4.2, reviewCount: 19, material: "Metal", createdAt: "2025-05-12" },
  // Bedroom
  { id: "p9", slug: "platform-bed", name: "Walnut Platform Bed Frame", price: 1599, compareAtPrice: 1899, image: "https://picsum.photos/seed/product-platform-bed/600/450", category: "Bedroom", categorySlug: "bedroom", rating: 4.9, reviewCount: 203, material: "Wood", createdAt: "2025-12-10" },
  { id: "p10", slug: "oak-nightstand", name: "Oak Nightstand", price: 399, image: "https://picsum.photos/seed/product-oak-nightstand/600/450", category: "Bedroom", categorySlug: "bedroom", rating: 4.6, reviewCount: 87, material: "Wood", createdAt: "2025-11-25" },
  { id: "p11", slug: "wide-dresser", name: "Wide 6-Drawer Dresser", price: 1099, image: "https://picsum.photos/seed/product-wide-dresser/600/450", category: "Bedroom", categorySlug: "bedroom", rating: 4.5, reviewCount: 54, material: "Wood", createdAt: "2025-10-30" },
  { id: "p12", slug: "upholstered-headboard", name: "Upholstered Headboard", price: 449, compareAtPrice: 599, image: "https://picsum.photos/seed/product-upholstered-headboard/600/450", category: "Bedroom", categorySlug: "bedroom", rating: 4.4, reviewCount: 38, material: "Fabric", createdAt: "2025-09-15" },
  { id: "p13", slug: "wardrobe-armoire", name: "Sliding Door Wardrobe", price: 1899, image: "https://picsum.photos/seed/product-wardrobe-armoire/600/450", category: "Bedroom", categorySlug: "bedroom", rating: 4.7, reviewCount: 45, material: "Wood", createdAt: "2025-08-01" },
  { id: "p14", slug: "vanity-desk", name: "Vanity Desk with Mirror", price: 749, image: "https://picsum.photos/seed/product-vanity-desk/600/450", category: "Bedroom", categorySlug: "bedroom", rating: 4.3, reviewCount: 22, material: "Wood", createdAt: "2025-07-20" },
  // Dining
  { id: "p15", slug: "dining-table-set", name: "Dining Table Set for 6", price: 2199, compareAtPrice: 2699, image: "https://picsum.photos/seed/product-dining-table-set/600/450", category: "Dining", categorySlug: "dining", rating: 4.8, reviewCount: 156, material: "Wood", createdAt: "2025-12-05" },
  { id: "p16", slug: "upholstered-dining-chairs", name: "Upholstered Dining Chair Set", price: 899, image: "https://picsum.photos/seed/product-dining-chairs/600/450", category: "Dining", categorySlug: "dining", rating: 4.6, reviewCount: 98, material: "Fabric", createdAt: "2025-11-18" },
  { id: "p17", slug: "bar-stool-set", name: "Metal Bar Stool Set of 2", price: 399, image: "https://picsum.photos/seed/product-bar-stool-set/600/450", category: "Dining", categorySlug: "dining", rating: 4.4, reviewCount: 67, material: "Metal", createdAt: "2025-10-08" },
  { id: "p18", slug: "buffet-sideboard", name: "Oak Buffet Sideboard", price: 1399, image: "https://picsum.photos/seed/product-buffet-sideboard/600/450", category: "Dining", categorySlug: "dining", rating: 4.5, reviewCount: 34, material: "Wood", createdAt: "2025-09-22" },
  { id: "p19", slug: "round-dining-table", name: "Marble Round Dining Table", price: 1699, compareAtPrice: 1999, image: "https://picsum.photos/seed/product-round-dining-table/600/450", category: "Dining", categorySlug: "dining", rating: 4.7, reviewCount: 52, material: "Glass", createdAt: "2025-08-12" },
  // Office
  { id: "p20", slug: "standing-desk", name: "Adjustable Standing Desk", price: 899, compareAtPrice: 1099, image: "https://picsum.photos/seed/product-standing-desk/600/450", category: "Office", categorySlug: "office", rating: 4.9, reviewCount: 234, material: "Wood", createdAt: "2025-12-08" },
  { id: "p21", slug: "ergonomic-chair", name: "Ergonomic Mesh Office Chair", price: 699, image: "https://picsum.photos/seed/product-ergonomic-chair/600/450", category: "Office", categorySlug: "office", rating: 4.8, reviewCount: 189, material: "Metal", createdAt: "2025-11-20" },
  { id: "p22", slug: "executive-desk", name: "Walnut Executive Desk", price: 1499, image: "https://picsum.photos/seed/product-executive-desk/600/450", category: "Office", categorySlug: "office", rating: 4.6, reviewCount: 45, material: "Wood", createdAt: "2025-10-15" },
  { id: "p23", slug: "filing-cabinet", name: "3-Drawer Filing Cabinet", price: 349, image: "https://picsum.photos/seed/product-filing-cabinet/600/450", category: "Office", categorySlug: "office", rating: 4.3, reviewCount: 28, material: "Metal", createdAt: "2025-09-01" },
  { id: "p24", slug: "office-bookcase", name: "Tall Office Bookcase", price: 599, image: "https://picsum.photos/seed/product-office-bookcase/600/450", category: "Office", categorySlug: "office", rating: 4.5, reviewCount: 31, material: "Wood", createdAt: "2025-08-18" },
  // Outdoor
  { id: "p25", slug: "teak-lounge-chair", name: "Teak Outdoor Lounge Chair", price: 799, compareAtPrice: 999, image: "https://picsum.photos/seed/product-teak-lounge-chair/600/450", category: "Outdoor", categorySlug: "outdoor", rating: 4.7, reviewCount: 78, material: "Wood", createdAt: "2025-12-12" },
  { id: "p26", slug: "patio-dining-set", name: "Patio Dining Set for 4", price: 1599, image: "https://picsum.photos/seed/product-patio-dining-set/600/450", category: "Outdoor", categorySlug: "outdoor", rating: 4.6, reviewCount: 56, material: "Metal", createdAt: "2025-11-22" },
  { id: "p27", slug: "garden-bistro-table", name: "Garden Bistro Table", price: 299, image: "https://picsum.photos/seed/product-garden-bistro-table/600/450", category: "Outdoor", categorySlug: "outdoor", rating: 4.4, reviewCount: 42, material: "Metal", createdAt: "2025-10-10" },
  { id: "p28", slug: "rattan-sofa-outdoor", name: "Rattan Outdoor Sofa Set", price: 2199, image: "https://picsum.photos/seed/product-rattan-sofa-outdoor/600/450", category: "Outdoor", categorySlug: "outdoor", rating: 4.8, reviewCount: 93, material: "Rattan", createdAt: "2025-09-05" },
  // Decor
  { id: "p29", slug: "ceramic-planter", name: "Large Ceramic Planter", price: 89, image: "https://picsum.photos/seed/product-ceramic-planter/600/450", category: "Decor", categorySlug: "decor", rating: 4.5, reviewCount: 112, material: "Glass", createdAt: "2025-12-15" },
  { id: "p30", slug: "woven-area-rug", name: "Hand-Woven Area Rug", price: 449, compareAtPrice: 599, image: "https://picsum.photos/seed/product-woven-area-rug/600/450", category: "Decor", categorySlug: "decor", rating: 4.7, reviewCount: 67, material: "Fabric", createdAt: "2025-11-28" },
  { id: "p31", slug: "wall-art-set", name: "Abstract Wall Art Set", price: 199, image: "https://picsum.photos/seed/product-wall-art-set/600/450", category: "Decor", categorySlug: "decor", rating: 4.3, reviewCount: 34, material: "Wood", createdAt: "2025-10-25" },
  { id: "p32", slug: "pendant-light", name: "Brass Pendant Light", price: 329, image: "https://picsum.photos/seed/product-pendant-light/600/450", category: "Decor", categorySlug: "decor", rating: 4.6, reviewCount: 51, material: "Metal", createdAt: "2025-09-12" },
  { id: "p33", slug: "decorative-mirror", name: "Round Decorative Mirror", price: 249, image: "https://picsum.photos/seed/product-decorative-mirror/600/450", category: "Decor", categorySlug: "decor", rating: 4.4, reviewCount: 29, material: "Glass", createdAt: "2025-08-30" },
];

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const ITEMS_PER_PAGE = 8;

const categoriesData: Record<
  string,
  { name: string; description: string; image: string }
> = {
  "living-room": {
    name: "Living Room",
    description:
      "Transform your living space with stylish sofas, armchairs, coffee tables, and entertainment units designed for comfort and conversation.",
    image: "https://picsum.photos/seed/category-living-room/1200/400",
  },
  bedroom: {
    name: "Bedroom",
    description:
      "Create your personal sanctuary with premium beds, nightstands, dressers, and wardrobes crafted for restful living.",
    image: "https://picsum.photos/seed/category-bedroom/1200/400",
  },
  dining: {
    name: "Dining",
    description:
      "Set the stage for memorable meals with elegant dining tables, chairs, bar stools, and storage solutions.",
    image: "https://picsum.photos/seed/category-dining/1200/400",
  },
  office: {
    name: "Office",
    description:
      "Boost your productivity with ergonomic desks, supportive chairs, and smart storage designed for the modern workspace.",
    image: "https://picsum.photos/seed/category-office/1200/400",
  },
  outdoor: {
    name: "Outdoor",
    description:
      "Extend your living area outdoors with weather-resistant patio furniture, loungers, and dining sets built to last.",
    image: "https://picsum.photos/seed/category-outdoor/1200/400",
  },
  decor: {
    name: "Decor",
    description:
      "Add the finishing touches with curated lighting, rugs, wall art, mirrors, and planters that bring your space to life.",
    image: "https://picsum.photos/seed/category-decor/1200/400",
  },
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

interface CategoryDetailContentProps {
  slug: string;
}

export function CategoryDetailContent({ slug }: CategoryDetailContentProps) {
  const category = categoriesData[slug] ?? {
    name: slug
      .split("-")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" "),
    description: "",
    image: `https://picsum.photos/seed/category-${slug}/1200/400`,
  };

  const [filters, setFilters] = useState<FilterState>(defaultFilters);
  const [sortBy, setSortBy] = useState("newest");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [currentPage, setCurrentPage] = useState(1);

  // Filter products by category
  const categoryProducts = useMemo(
    () => allProducts.filter((p) => p.categorySlug === slug),
    [slug],
  );

  // Apply filters & sort
  const filteredProducts = useMemo(() => {
    let result = [...categoryProducts];

    // Price range
    result = result.filter(
      (p) =>
        p.price >= filters.priceRange[0] && p.price <= filters.priceRange[1],
    );

    // Materials
    if (filters.materials.length > 0) {
      result = result.filter((p) => filters.materials.includes(p.material));
    }

    // Sort
    switch (sortBy) {
      case "price-asc":
        result.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        result.sort((a, b) => b.price - a.price);
        break;
      case "rating":
        result.sort((a, b) => b.rating - a.rating);
        break;
      case "newest":
      default:
        result.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        );
        break;
    }

    return result;
  }, [categoryProducts, filters, sortBy]);

  // Paginate
  const totalPages = Math.max(
    1,
    Math.ceil(filteredProducts.length / ITEMS_PER_PAGE),
  );
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  const handleFilterChange = (next: FilterState) => {
    setFilters(next);
    setCurrentPage(1);
  };

  return (
    <div className="container mx-auto px-4 py-6 md:py-10">
      {/* ── Breadcrumb ───────────────────────────────────────────────── */}
      <BreadcrumbNav
        items={[
          { label: "Categories", href: "/categories" },
          { label: category.name },
        ]}
      />

      {/* ── Category Banner ──────────────────────────────────────────── */}
      <div className="relative mt-6 overflow-hidden rounded-2xl">
        <div className="relative aspect-[3/1] w-full md:aspect-[4/1]">
          <Image
            src={category.image}
            alt={category.name}
            fill
            sizes="100vw"
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent" />
        </div>
        <div className="absolute inset-0 flex flex-col justify-center px-8 md:px-12">
          <h1 className="text-3xl font-bold text-white md:text-4xl lg:text-5xl">
            {category.name}
          </h1>
          <p className="mt-2 max-w-xl text-sm text-white/80 md:text-base">
            {category.description}
          </p>
        </div>
      </div>

      {/* ── Content layout ───────────────────────────────────────────── */}
      <div className="mt-8 flex gap-8">
        {/* Sidebar (desktop) */}
        <FilterSidebar
          filters={filters}
          onFilterChange={handleFilterChange}
          className="w-64 shrink-0"
        />

        {/* Main content */}
        <div className="flex-1 min-w-0">
          {/* Toolbar */}
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              {/* Mobile filter trigger */}
              <FilterSidebar
                filters={filters}
                onFilterChange={handleFilterChange}
              />
              <p className="text-sm text-muted-foreground">
                {filteredProducts.length}{" "}
                {filteredProducts.length === 1 ? "product" : "products"}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest</SelectItem>
                  <SelectItem value="price-asc">Price: Low to High</SelectItem>
                  <SelectItem value="price-desc">
                    Price: High to Low
                  </SelectItem>
                  <SelectItem value="rating">Highest Rated</SelectItem>
                </SelectContent>
              </Select>

              <div className="hidden items-center gap-1 sm:flex">
                <Button
                  variant={viewMode === "grid" ? "default" : "ghost"}
                  size="icon-sm"
                  onClick={() => setViewMode("grid")}
                >
                  <Grid3X3 className="size-4" />
                  <span className="sr-only">Grid view</span>
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "ghost"}
                  size="icon-sm"
                  onClick={() => setViewMode("list")}
                >
                  <LayoutList className="size-4" />
                  <span className="sr-only">List view</span>
                </Button>
              </div>
            </div>
          </div>

          {/* Product grid */}
          {paginatedProducts.length > 0 ? (
            <div
              className={
                viewMode === "grid"
                  ? "grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4"
                  : "flex flex-col gap-4"
              }
            >
              {paginatedProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={{
                    id: product.id,
                    slug: product.slug,
                    name: product.name,
                    price: product.price,
                    compareAtPrice: product.compareAtPrice,
                    image: product.image,
                    category: product.category,
                    rating: product.rating,
                    reviewCount: product.reviewCount,
                  }}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <p className="text-lg font-medium">No products found</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Try adjusting your filters to find what you are looking for.
              </p>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-10">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        setCurrentPage((p) => Math.max(1, p - 1));
                      }}
                      aria-disabled={currentPage === 1}
                      className={
                        currentPage === 1
                          ? "pointer-events-none opacity-50"
                          : ""
                      }
                    />
                  </PaginationItem>

                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (page) => {
                      if (
                        totalPages <= 7 ||
                        page === 1 ||
                        page === totalPages ||
                        Math.abs(page - currentPage) <= 1
                      ) {
                        return (
                          <PaginationItem key={page}>
                            <PaginationLink
                              href="#"
                              isActive={page === currentPage}
                              onClick={(e) => {
                                e.preventDefault();
                                setCurrentPage(page);
                              }}
                            >
                              {page}
                            </PaginationLink>
                          </PaginationItem>
                        );
                      }
                      if (
                        (page === 2 && currentPage > 3) ||
                        (page === totalPages - 1 &&
                          currentPage < totalPages - 2)
                      ) {
                        return (
                          <PaginationItem key={page}>
                            <PaginationEllipsis />
                          </PaginationItem>
                        );
                      }
                      return null;
                    },
                  )}

                  <PaginationItem>
                    <PaginationNext
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        setCurrentPage((p) => Math.min(totalPages, p + 1));
                      }}
                      aria-disabled={currentPage === totalPages}
                      className={
                        currentPage === totalPages
                          ? "pointer-events-none opacity-50"
                          : ""
                      }
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
