"use client";

import { useState, useEffect, useRef, use } from "react";
import { useRouter } from "next/navigation";
import { Search as SearchIcon, SlidersHorizontal, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { ProductCard, type ProductCardData } from "@/components/storefront/product-card";
import { EmptyState } from "@/components/shared/empty-state";

// ---------------------------------------------------------------------------
// Mock catalog
// ---------------------------------------------------------------------------

const allProducts: ProductCardData[] = [
  {
    id: "sp-1",
    slug: "elara-sectional-sofa",
    name: "Elara Sectional Sofa",
    price: 1299,
    compareAtPrice: 1599,
    image: "https://picsum.photos/seed/elara-sofa/800/600",
    category: "Living Room",
    rating: 4.7,
    reviewCount: 124,
  },
  {
    id: "sp-2",
    slug: "noma-coffee-table",
    name: "Noma Coffee Table",
    price: 349,
    image: "https://picsum.photos/seed/noma-table/800/600",
    category: "Living Room",
    rating: 4.5,
    reviewCount: 87,
  },
  {
    id: "sp-3",
    slug: "haven-platform-bed",
    name: "Haven Platform Bed",
    price: 899,
    compareAtPrice: 1099,
    image: "https://picsum.photos/seed/haven-bed/800/600",
    category: "Bedroom",
    rating: 4.8,
    reviewCount: 203,
  },
  {
    id: "sp-4",
    slug: "oslo-dining-chair",
    name: "Oslo Dining Chair",
    price: 249,
    image: "https://picsum.photos/seed/oslo-chair/800/600",
    category: "Dining",
    rating: 4.4,
    reviewCount: 56,
  },
  {
    id: "sp-5",
    slug: "horizon-desk",
    name: "Horizon Standing Desk",
    price: 649,
    image: "https://picsum.photos/seed/horizon-desk/800/600",
    category: "Office",
    rating: 4.6,
    reviewCount: 142,
  },
  {
    id: "sp-6",
    slug: "lumina-floor-lamp",
    name: "Lumina Floor Lamp",
    price: 189,
    image: "https://picsum.photos/seed/lumina-lamp/800/600",
    category: "Decor",
    rating: 4.3,
    reviewCount: 34,
  },
  {
    id: "sp-7",
    slug: "cedar-bookshelf",
    name: "Cedar Bookshelf",
    price: 499,
    compareAtPrice: 599,
    image: "https://picsum.photos/seed/cedar-shelf/800/600",
    category: "Living Room",
    rating: 4.5,
    reviewCount: 91,
  },
  {
    id: "sp-8",
    slug: "villa-outdoor-set",
    name: "Villa Outdoor Lounge Set",
    price: 1899,
    image: "https://picsum.photos/seed/villa-outdoor/800/600",
    category: "Outdoor",
    rating: 4.7,
    reviewCount: 68,
  },
  {
    id: "sp-9",
    slug: "aura-nightstand",
    name: "Aura Nightstand",
    price: 199,
    image: "https://picsum.photos/seed/aura-nightstand/800/600",
    category: "Bedroom",
    rating: 4.4,
    reviewCount: 73,
  },
  {
    id: "sp-10",
    slug: "metro-dining-table",
    name: "Metro Dining Table",
    price: 1099,
    compareAtPrice: 1399,
    image: "https://picsum.photos/seed/metro-table/800/600",
    category: "Dining",
    rating: 4.8,
    reviewCount: 112,
  },
];

// ---------------------------------------------------------------------------
// Filter sidebar content
// ---------------------------------------------------------------------------

function FilterContent({
  priceRange,
  onPriceChange,
  inStockOnly,
  onInStockChange,
}: {
  priceRange: number[];
  onPriceChange: (value: number[]) => void;
  inStockOnly: boolean;
  onInStockChange: (value: boolean) => void;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-semibold mb-3">Filters</h3>
        <Separator />
      </div>

      {/* Price range */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">Price Range</Label>
        <Slider
          min={0}
          max={2000}
          step={50}
          value={priceRange}
          onValueChange={onPriceChange}
        />
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>${priceRange[0]}</span>
          <span>${priceRange[1]}</span>
        </div>
      </div>

      {/* In stock toggle */}
      <div className="flex items-center justify-between">
        <Label htmlFor="in-stock-toggle" className="text-sm font-medium">
          In Stock Only
        </Label>
        <Switch
          id="in-stock-toggle"
          checked={inStockOnly}
          onCheckedChange={onInStockChange}
        />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page component
// ---------------------------------------------------------------------------

export default function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const resolvedParams = use(searchParams);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  const [query, setQuery] = useState(resolvedParams.q ?? "");
  const [priceRange, setPriceRange] = useState([0, 2000]);
  const [inStockOnly, setInStockOnly] = useState(false);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Update query state when searchParams change
  useEffect(() => {
    setQuery(resolvedParams.q ?? "");
  }, [resolvedParams.q]);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  }

  const searchQuery = resolvedParams.q?.toLowerCase() ?? "";

  const filteredProducts = allProducts.filter((product) => {
    // Text match
    if (
      searchQuery &&
      !product.name.toLowerCase().includes(searchQuery) &&
      !product.category.toLowerCase().includes(searchQuery)
    ) {
      return false;
    }

    // Price range
    if (product.price < priceRange[0] || product.price > priceRange[1]) {
      return false;
    }

    return true;
  });

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Search input */}
      <form onSubmit={handleSearch} className="max-w-2xl mx-auto mb-8">
        <div className="relative">
          <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for furniture, decor, and more..."
            className="pl-12 pr-12 h-14 text-lg rounded-xl"
          />
          {query && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-2 top-1/2 -translate-y-1/2"
              onClick={() => {
                setQuery("");
                inputRef.current?.focus();
              }}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </form>

      {/* Results header */}
      {searchQuery && (
        <div className="flex items-center justify-between mb-6">
          <p className="text-muted-foreground">
            <span className="font-semibold text-foreground">
              {filteredProducts.length}
            </span>{" "}
            {filteredProducts.length === 1 ? "result" : "results"} for{" "}
            <span className="font-semibold text-foreground">
              &apos;{resolvedParams.q}&apos;
            </span>
          </p>

          {/* Mobile filter trigger */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm" className="lg:hidden">
                <SlidersHorizontal className="mr-2 h-4 w-4" />
                Filters
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-80">
              <SheetTitle className="sr-only">Filters</SheetTitle>
              <div className="mt-6">
                <FilterContent
                  priceRange={priceRange}
                  onPriceChange={setPriceRange}
                  inStockOnly={inStockOnly}
                  onInStockChange={setInStockOnly}
                />
              </div>
            </SheetContent>
          </Sheet>
        </div>
      )}

      <div className="flex gap-8">
        {/* Desktop sidebar */}
        <aside className="hidden lg:block w-64 shrink-0">
          <FilterContent
            priceRange={priceRange}
            onPriceChange={setPriceRange}
            inStockOnly={inStockOnly}
            onInStockChange={setInStockOnly}
          />
        </aside>

        {/* Product grid */}
        <div className="flex-1 min-w-0">
          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : searchQuery ? (
            <EmptyState
              icon={SearchIcon}
              title={`No products found for '${resolvedParams.q}'`}
              description="Try adjusting your search terms or filters to find what you're looking for."
              actionLabel="Clear Search"
              onAction={() => router.push("/search")}
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {allProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
