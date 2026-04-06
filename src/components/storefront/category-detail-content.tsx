"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { Grid3X3, LayoutList, Loader2 } from "lucide-react";
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
// Types
// ---------------------------------------------------------------------------

type ApiProduct = {
  id: string;
  name: string;
  slug: string;
  price: number;
  compareAtPrice: number | null;
  image: { url: string; alt: string } | null;
  rating: { average: number; count: number };
  stockStatus: string;
  materials: string[];
  isFeatured: boolean;
};

type CategoryData = {
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  bannerImage: string | null;
};

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const ITEMS_PER_PAGE = 12;

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

interface CategoryDetailContentProps {
  slug: string;
}

export function CategoryDetailContent({ slug }: CategoryDetailContentProps) {
  const [products, setProducts] = useState<ApiProduct[]>([]);
  const [category, setCategory] = useState<CategoryData | null>(null);
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const [filters, setFilters] = useState<FilterState>(defaultFilters);
  const [sortBy, setSortBy] = useState("newest");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [currentPage, setCurrentPage] = useState(1);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("page", String(currentPage));
      params.set("limit", String(ITEMS_PER_PAGE));

      // Map sort values
      const sortMap: Record<string, string> = {
        newest: "newest",
        "price-asc": "price_asc",
        "price-desc": "price_desc",
        rating: "featured",
      };
      params.set("sort", sortMap[sortBy] || "newest");

      if (filters.priceRange[0] > 0) {
        params.set("minPrice", String(filters.priceRange[0]));
      }
      if (filters.priceRange[1] < 500000) {
        params.set("maxPrice", String(filters.priceRange[1]));
      }
      if (filters.materials.length > 0) {
        params.set("materials", filters.materials.join(","));
      }
      if (filters.inStockOnly) {
        params.set("inStock", "true");
      }

      const res = await fetch(`/api/categories/${slug}?${params}`);
      if (!res.ok) {
        setProducts([]);
        setCategory(null);
        return;
      }

      const data = await res.json();
      setCategory(data.category);
      setProducts(data.products || []);
      setTotalProducts(data.pagination?.total || 0);
      setTotalPages(data.pagination?.totalPages || 1);
    } catch {
      console.error("Failed to fetch products");
    } finally {
      setLoading(false);
    }
  }, [slug, currentPage, sortBy, filters]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleFilterChange = (next: FilterState) => {
    setFilters(next);
    setCurrentPage(1);
  };

  const handleSortChange = (value: string) => {
    setSortBy(value);
    setCurrentPage(1);
  };

  const categoryName = category?.name || slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

  const bannerImage = category?.bannerImage || category?.image || `https://picsum.photos/seed/category-${slug}/1200/400`;

  return (
    <div className="container mx-auto px-4 py-6 md:py-10">
      {/* Breadcrumb */}
      <BreadcrumbNav
        items={[
          { label: "Categories", href: "/categories" },
          { label: categoryName },
        ]}
      />

      {/* Category Banner */}
      <div className="relative mt-6 overflow-hidden rounded-2xl">
        <div className="relative aspect-[3/1] w-full md:aspect-[4/1]">
          <Image
            src={bannerImage}
            alt={categoryName}
            fill
            sizes="100vw"
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent" />
        </div>
        <div className="absolute inset-0 flex flex-col justify-center px-8 md:px-12">
          <h1 className="text-3xl font-bold text-white md:text-4xl lg:text-5xl">
            {categoryName}
          </h1>
          {category?.description && (
            <p className="mt-2 max-w-xl text-sm text-white/80 md:text-base">
              {category.description}
            </p>
          )}
        </div>
      </div>

      {/* Content layout */}
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
              <div className="lg:hidden">
                <FilterSidebar
                  filters={filters}
                  onFilterChange={handleFilterChange}
                />
              </div>
              <p className="text-sm text-muted-foreground">
                {totalProducts}{" "}
                {totalProducts === 1 ? "product" : "products"}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Select value={sortBy} onValueChange={handleSortChange}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest</SelectItem>
                  <SelectItem value="price-asc">Price: Low to High</SelectItem>
                  <SelectItem value="price-desc">
                    Price: High to Low
                  </SelectItem>
                  <SelectItem value="rating">Featured</SelectItem>
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

          {/* Loading */}
          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="size-8 animate-spin text-muted-foreground" />
            </div>
          ) : products.length > 0 ? (
            <div
              className={
                viewMode === "grid"
                  ? "grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4"
                  : "flex flex-col gap-4"
              }
            >
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={{
                    id: product.id,
                    slug: product.slug,
                    name: product.name,
                    price: Number(product.price),
                    compareAtPrice: product.compareAtPrice
                      ? Number(product.compareAtPrice)
                      : undefined,
                    image: product.image?.url || "/placeholder.svg",
                    category: categoryName,
                    rating: product.rating.average,
                    reviewCount: product.rating.count,
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
