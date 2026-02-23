"use client";

import { useState } from "react";
import { Filter } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetDescription,
} from "@/components/ui/sheet";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface FilterState {
  priceRange: [number, number];
  materials: string[];
  colors: string[];
  sizes: string[];
  inStockOnly: boolean;
}

interface FilterSidebarProps {
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
  className?: string;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const MATERIALS = ["Wood", "Metal", "Fabric", "Leather", "Glass", "Rattan"];

const COLORS: { name: string; hex: string }[] = [
  { name: "Natural", hex: "#C4A882" },
  { name: "Black", hex: "#1C1C1C" },
  { name: "White", hex: "#F5F5F5" },
  { name: "Walnut", hex: "#5C4033" },
  { name: "Gray", hex: "#9CA3AF" },
  { name: "Cream", hex: "#FFFDD0" },
];

const SIZES = ["Small", "Medium", "Large", "Extra Large"];

const PRICE_MIN = 0;
const PRICE_MAX = 5000;

// ---------------------------------------------------------------------------
// Inner filter content (shared between desktop sidebar and mobile sheet)
// ---------------------------------------------------------------------------

function FilterContent({
  filters,
  onChange,
  onClear,
  onApply,
}: {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
  onClear: () => void;
  onApply: () => void;
}) {
  const toggleArrayValue = (
    key: "materials" | "colors" | "sizes",
    value: string,
  ) => {
    const current = filters[key];
    const next = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    onChange({ ...filters, [key]: next });
  };

  return (
    <div className="flex flex-col gap-6">
      {/* ── Price Range ──────────────────────────────────────────────── */}
      <div>
        <h4 className="mb-4 text-sm font-semibold">Price Range</h4>
        <Slider
          min={PRICE_MIN}
          max={PRICE_MAX}
          step={50}
          value={filters.priceRange}
          onValueChange={(v) =>
            onChange({ ...filters, priceRange: v as [number, number] })
          }
        />
        <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
          <span>&#8377;{filters.priceRange[0].toLocaleString("en-IN")}</span>
          <span>&#8377;{filters.priceRange[1].toLocaleString("en-IN")}</span>
        </div>
      </div>

      <Separator />

      {/* ── Material ─────────────────────────────────────────────────── */}
      <div>
        <h4 className="mb-3 text-sm font-semibold">Material</h4>
        <div className="flex flex-col gap-2.5">
          {MATERIALS.map((material) => (
            <Label
              key={material}
              className="flex cursor-pointer items-center gap-2 text-sm font-normal"
            >
              <Checkbox
                checked={filters.materials.includes(material)}
                onCheckedChange={() => toggleArrayValue("materials", material)}
              />
              {material}
            </Label>
          ))}
        </div>
      </div>

      <Separator />

      {/* ── Color ────────────────────────────────────────────────────── */}
      <div>
        <h4 className="mb-3 text-sm font-semibold">Color</h4>
        <div className="flex flex-wrap gap-2">
          {COLORS.map((color) => (
            <button
              key={color.name}
              type="button"
              title={color.name}
              onClick={() => toggleArrayValue("colors", color.name)}
              className={cn(
                "size-8 rounded-full border-2 transition-all hover:scale-110",
                filters.colors.includes(color.name)
                  ? "border-primary ring-2 ring-primary/30"
                  : "border-border",
              )}
              style={{ backgroundColor: color.hex }}
            >
              <span className="sr-only">{color.name}</span>
            </button>
          ))}
        </div>
      </div>

      <Separator />

      {/* ── Size ─────────────────────────────────────────────────────── */}
      <div>
        <h4 className="mb-3 text-sm font-semibold">Size</h4>
        <div className="flex flex-col gap-2.5">
          {SIZES.map((size) => (
            <Label
              key={size}
              className="flex cursor-pointer items-center gap-2 text-sm font-normal"
            >
              <Checkbox
                checked={filters.sizes.includes(size)}
                onCheckedChange={() => toggleArrayValue("sizes", size)}
              />
              {size}
            </Label>
          ))}
        </div>
      </div>

      <Separator />

      {/* ── In Stock Only ────────────────────────────────────────────── */}
      <Label className="flex cursor-pointer items-center justify-between">
        <span className="text-sm font-semibold">In Stock Only</span>
        <Switch
          checked={filters.inStockOnly}
          onCheckedChange={(checked) =>
            onChange({ ...filters, inStockOnly: checked === true })
          }
        />
      </Label>

      <Separator />

      {/* ── Action buttons ───────────────────────────────────────────── */}
      <div className="flex gap-2">
        <Button variant="outline" className="flex-1" onClick={onClear}>
          Clear All
        </Button>
        <Button className="flex-1" onClick={onApply}>
          Apply
        </Button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Exported component
// ---------------------------------------------------------------------------

export const defaultFilters: FilterState = {
  priceRange: [PRICE_MIN, PRICE_MAX],
  materials: [],
  colors: [],
  sizes: [],
  inStockOnly: false,
};

export function FilterSidebar({
  filters,
  onFilterChange,
  className,
}: FilterSidebarProps) {
  const [localFilters, setLocalFilters] = useState<FilterState>(filters);
  const [sheetOpen, setSheetOpen] = useState(false);

  const handleClear = () => {
    setLocalFilters(defaultFilters);
    onFilterChange(defaultFilters);
  };

  const handleApply = () => {
    onFilterChange(localFilters);
    setSheetOpen(false);
  };

  // Keep local state in sync when prop changes
  const syncedOnChange = (next: FilterState) => {
    setLocalFilters(next);
  };

  return (
    <>
      {/* ── Desktop sidebar ──────────────────────────────────────────── */}
      <aside className={cn("hidden lg:block", className)}>
        <div className="sticky top-24 rounded-xl border bg-card p-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold">Filters</h3>
            <Filter className="size-4 text-muted-foreground" />
          </div>
          <FilterContent
            filters={localFilters}
            onChange={syncedOnChange}
            onClear={handleClear}
            onApply={handleApply}
          />
        </div>
      </aside>

      {/* ── Mobile sheet ─────────────────────────────────────────────── */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetTrigger asChild>
          <Button variant="outline" size="sm" className="lg:hidden">
            <Filter className="size-4" />
            Filters
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Filters</SheetTitle>
            <SheetDescription>
              Refine your product search with the options below.
            </SheetDescription>
          </SheetHeader>
          <div className="px-4 pb-6">
            <FilterContent
              filters={localFilters}
              onChange={syncedOnChange}
              onClear={handleClear}
              onApply={handleApply}
            />
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
