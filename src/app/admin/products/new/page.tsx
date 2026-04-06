"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Plus,
  Trash2,
  Upload,
  X,
  ArrowLeft,
  Loader2,
  Package,
  Globe,
  Star,
  TrendingUp,
  Layers,
  Tag,
  DollarSign,
  BarChart3,
  Truck,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { PageHeader } from "@/components/admin/shared/page-header";

// --- Schema ---

const productSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  slug: z.string().min(1, "Slug is required"),
  sku: z.string().optional(),
  shortDescription: z.string().optional(),
  fullDescription: z.string().optional(),
  price: z.coerce.number().min(0.01, "Price is required"),
  compareAtPrice: z.coerce.number().optional(),
  costPerItem: z.coerce.number().optional(),
  stockQuantity: z.coerce.number().min(0).optional(),
  lowStockThreshold: z.coerce.number().min(0).optional(),
  stockStatus: z.enum(["in_stock", "low_stock", "out_of_stock", "on_backorder"]),
  continueSelling: z.boolean(),
  trackQuantity: z.boolean(),
  requiresShipping: z.boolean(),
  weight: z.coerce.number().optional(),
  length: z.coerce.number().optional(),
  width: z.coerce.number().optional(),
  height: z.coerce.number().optional(),
  shippingClass: z.enum(["standard", "oversized", "fragile", "white_glove"]).optional(),
  status: z.enum(["draft", "published", "archived"]),
  visibility: z.enum(["visible", "catalog_only", "search_only", "hidden"]),
  productType: z.enum(["simple", "variable", "grouped", "virtual", "downloadable"]),
  category: z.string().optional(),
  tags: z.array(z.string()),
  featured: z.boolean(),
  bestseller: z.boolean(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  variants: z.array(
    z.object({
      optionName: z.string().min(1),
      values: z.string(),
    })
  ),
});

type ProductFormValues = z.infer<typeof productSchema>;

// --- Helpers ---

function generateSlug(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function generateSKU(name: string) {
  const initials = name
    .split(/\s+/)
    .map((w) => w.charAt(0).toUpperCase())
    .join("")
    .slice(0, 4);
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `${initials}-${rand}`;
}

// --- Component ---

export default function NewProductPage() {
  const router = useRouter();
  const [tagInput, setTagInput] = React.useState("");
  const [mockImages, setMockImages] = React.useState<string[]>([]);
  const [activeTab, setActiveTab] = React.useState("general");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [categories, setCategories] = React.useState<{ id: string; name: string }[]>([]);

  const form = useForm<ProductFormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(productSchema) as any,
    defaultValues: {
      name: "",
      slug: "",
      sku: "",
      shortDescription: "",
      fullDescription: "",
      price: 0,
      compareAtPrice: undefined,
      costPerItem: undefined,
      stockQuantity: 0,
      lowStockThreshold: 5,
      stockStatus: "in_stock",
      continueSelling: false,
      trackQuantity: true,
      requiresShipping: true,
      weight: undefined,
      length: undefined,
      width: undefined,
      height: undefined,
      shippingClass: "standard",
      status: "draft",
      visibility: "visible",
      productType: "simple",
      category: "",
      tags: [],
      featured: false,
      bestseller: false,
      metaTitle: "",
      metaDescription: "",
      variants: [],
    },
  });

  const {
    fields: variantFields,
    append: addVariant,
    remove: removeVariant,
  } = useFieldArray({
    control: form.control,
    name: "variants",
  });

  const watchName = form.watch("name");
  const watchPrice = form.watch("price");
  const watchCost = form.watch("costPerItem");
  const watchMetaTitle = form.watch("metaTitle");
  const watchMetaDescription = form.watch("metaDescription");
  const watchSlug = form.watch("slug");
  const watchRequiresShipping = form.watch("requiresShipping");
  const tags = form.watch("tags");
  const variants = form.watch("variants");

  React.useEffect(() => {
    if (watchName) {
      form.setValue("slug", generateSlug(watchName));
    }
  }, [watchName, form]);

  React.useEffect(() => {
    fetch("/api/admin/categories?flat=true")
      .then((res) => res.json())
      .then((data) => {
        const list = data?.data ?? data?.categories ?? (Array.isArray(data) ? data : []);
        setCategories(list.map((c: { id: string; name: string }) => ({ id: c.id, name: c.name })));
      })
      .catch(() => {
        // silently fail – the hardcoded options will remain as fallback
      });
  }, []);

  // Calculate profit margin
  const profitMargin = React.useMemo(() => {
    if (watchPrice && watchCost && watchPrice > 0 && watchCost > 0) {
      const profit = watchPrice - watchCost;
      const margin = (profit / watchPrice) * 100;
      const markup = (profit / watchCost) * 100;
      return { profit, margin, markup };
    }
    return null;
  }, [watchPrice, watchCost]);

  // Generate variant combinations
  const variantCombinations = React.useMemo(() => {
    const validVariants = variants.filter(
      (v) => v.optionName && v.values.trim().length > 0
    );
    if (validVariants.length === 0) return [];

    let combos: { label: string; parts: string[] }[] = [{ label: "", parts: [] }];
    for (const variant of validVariants) {
      const vals = variant.values
        .split(",")
        .map((v) => v.trim())
        .filter(Boolean);
      const newCombos: { label: string; parts: string[] }[] = [];
      for (const combo of combos) {
        for (const val of vals) {
          newCombos.push({
            label: combo.label ? `${combo.label} / ${val}` : val,
            parts: [...combo.parts, val],
          });
        }
      }
      combos = newCombos;
    }
    return combos;
  }, [variants]);

  async function onSubmit(data: ProductFormValues) {
    setIsSubmitting(true);
    try {
      const stockStatusMap: Record<string, string> = {
        in_stock: "IN_STOCK",
        low_stock: "LOW_STOCK",
        out_of_stock: "OUT_OF_STOCK",
        on_backorder: "ON_BACKORDER",
      };
      const statusMap: Record<string, string> = {
        draft: "DRAFT",
        published: "PUBLISHED",
        archived: "ARCHIVED",
      };
      const visibilityMap: Record<string, string> = {
        visible: "VISIBLE",
        catalog_only: "CATALOG",
        search_only: "SEARCH",
        hidden: "HIDDEN",
      };
      const typeMap: Record<string, string> = {
        simple: "SIMPLE",
        variable: "VARIABLE",
        grouped: "GROUPED",
        virtual: "VIRTUAL",
        downloadable: "DOWNLOADABLE",
      };

      const sku = data.sku?.trim() || generateSKU(data.name);

      const body = {
        name: data.name,
        slug: data.slug,
        sku,
        shortDescription: data.shortDescription || "",
        description: data.fullDescription || "",
        price: data.price,
        compareAtPrice: data.compareAtPrice ?? null,
        costPrice: data.costPerItem ?? null,
        stockQuantity: data.stockQuantity ?? 0,
        lowStockThreshold: data.lowStockThreshold ?? 5,
        stockStatus: stockStatusMap[data.stockStatus] || "IN_STOCK",
        status: statusMap[data.status] || "DRAFT",
        visibility: visibilityMap[data.visibility] || "VISIBLE",
        type: typeMap[data.productType] || "SIMPLE",
        categoryId: data.category || null,
        tags: data.tags,
        isFeatured: data.featured,
        isBestseller: data.bestseller,
        metaTitle: data.metaTitle || "",
        metaDescription: data.metaDescription || "",
        weight: data.weight ?? null,
        width: data.width ?? null,
        height: data.height ?? null,
        depth: data.length ?? null,
        manageStock: data.trackQuantity,
        allowBackorders: data.continueSelling,
        requiresShipping: data.requiresShipping,
        assemblyRequired: false,
      };

      const res = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const result = await res.json();

      if (!res.ok) {
        toast.error(result.error || "Failed to create product");
        return;
      }

      toast.success("Product created!");
      router.push("/admin/products");
    } catch {
      toast.error("Failed to create product");
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleAddTag() {
    if (tagInput.trim()) {
      const current = form.getValues("tags");
      if (!current.includes(tagInput.trim())) {
        form.setValue("tags", [...current, tagInput.trim()]);
      }
      setTagInput("");
    }
  }

  function handleRemoveTag(tag: string) {
    const current = form.getValues("tags");
    form.setValue(
      "tags",
      current.filter((t) => t !== tag)
    );
  }

  function handleAutoGenerateSKU() {
    const name = form.getValues("name");
    if (name) {
      form.setValue("sku", generateSKU(name));
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Add Product" description="Create a new product listing">
        <Button variant="outline" asChild>
          <Link href="/admin/products">
            <ArrowLeft className="size-4" />
            Back
          </Link>
        </Button>
      </PageHeader>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Main Content - 2/3 */}
            <div className="lg:col-span-2 space-y-6">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="w-full justify-start">
                  <TabsTrigger value="general">
                    <Package className="size-3.5" />
                    General
                  </TabsTrigger>
                  <TabsTrigger value="pricing">
                    <DollarSign className="size-3.5" />
                    Pricing
                  </TabsTrigger>
                  <TabsTrigger value="inventory">
                    <BarChart3 className="size-3.5" />
                    Inventory
                  </TabsTrigger>
                  <TabsTrigger value="shipping">
                    <Truck className="size-3.5" />
                    Shipping
                  </TabsTrigger>
                  <TabsTrigger value="variants">
                    <Layers className="size-3.5" />
                    Variants
                  </TabsTrigger>
                  <TabsTrigger value="seo">
                    <Globe className="size-3.5" />
                    SEO
                  </TabsTrigger>
                </TabsList>

                {/* General Tab */}
                <TabsContent value="general">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Basic Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Product Name</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="e.g., Scandinavian Oak Dining Table"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid gap-4 sm:grid-cols-2">
                        <FormField
                          control={form.control}
                          name="slug"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Slug</FormLabel>
                              <FormControl>
                                <Input placeholder="auto-generated-slug" {...field} />
                              </FormControl>
                              <FormDescription>
                                Auto-generated from product name
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="sku"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>SKU</FormLabel>
                              <div className="flex gap-2">
                                <FormControl>
                                  <Input placeholder="e.g., SODT-1234" {...field} />
                                </FormControl>
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  className="shrink-0 h-9"
                                  onClick={handleAutoGenerateSKU}
                                >
                                  Auto
                                </Button>
                              </div>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="shortDescription"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Short Description</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Brief product summary for listings and cards..."
                                className="min-h-[4.5rem] resize-y"
                                rows={3}
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="fullDescription"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Full Description</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Detailed product description with features, materials, care instructions..."
                                className="min-h-[9rem] resize-y"
                                rows={6}
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Pricing Tab */}
                <TabsContent value="pricing">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Pricing</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="grid gap-4 sm:grid-cols-3">
                        <FormField
                          control={form.control}
                          name="price"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>
                                Price <span className="text-destructive">*</span>
                              </FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                                    ₹
                                  </span>
                                  <Input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    placeholder="0.00"
                                    className="pl-7"
                                    {...field}
                                  />
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="compareAtPrice"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Compare At Price</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                                    ₹
                                  </span>
                                  <Input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    placeholder="0.00"
                                    className="pl-7"
                                    {...field}
                                    value={field.value ?? ""}
                                  />
                                </div>
                              </FormControl>
                              <FormDescription>
                                Original price for strikethrough display
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="costPerItem"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Cost Per Item</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                                    ₹
                                  </span>
                                  <Input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    placeholder="0.00"
                                    className="pl-7"
                                    {...field}
                                    value={field.value ?? ""}
                                  />
                                </div>
                              </FormControl>
                              <FormDescription>
                                Used for profit margin calculation
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      {/* Profit Margin Display */}
                      {profitMargin && (
                        <div className="rounded-lg border border-green-200 bg-green-50 p-4">
                          <div className="flex items-center gap-2 mb-3">
                            <TrendingUp className="size-4 text-green-700" />
                            <span className="text-sm font-medium text-green-800">
                              Profit Analysis
                            </span>
                          </div>
                          <div className="grid grid-cols-3 gap-4">
                            <div>
                              <p className="text-xs text-green-600">Profit</p>
                              <p className="text-lg font-semibold text-green-800">
                                ₹{profitMargin.profit.toFixed(2)}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-green-600">Margin</p>
                              <p className="text-lg font-semibold text-green-800">
                                {profitMargin.margin.toFixed(1)}%
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-green-600">Markup</p>
                              <p className="text-lg font-semibold text-green-800">
                                {profitMargin.markup.toFixed(1)}%
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Inventory Tab */}
                <TabsContent value="inventory">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Inventory Management</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="grid gap-4 sm:grid-cols-2">
                        <FormField
                          control={form.control}
                          name="stockQuantity"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Stock Quantity</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  min="0"
                                  placeholder="0"
                                  {...field}
                                  value={field.value ?? ""}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="lowStockThreshold"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Low Stock Threshold</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  min="0"
                                  placeholder="5"
                                  {...field}
                                  value={field.value ?? ""}
                                />
                              </FormControl>
                              <FormDescription>
                                Alert when stock falls below this number
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="stockStatus"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Stock Status</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger className="w-full sm:w-[280px]">
                                  <SelectValue placeholder="Select stock status" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="in_stock">In Stock</SelectItem>
                                <SelectItem value="low_stock">Low Stock</SelectItem>
                                <SelectItem value="out_of_stock">Out of Stock</SelectItem>
                                <SelectItem value="on_backorder">On Backorder</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <Separator />

                      <FormField
                        control={form.control}
                        name="trackQuantity"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center gap-3 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div>
                              <FormLabel className="font-normal">
                                Track quantity
                              </FormLabel>
                              <FormDescription>
                                Automatically update stock when orders are placed
                              </FormDescription>
                            </div>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="continueSelling"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center gap-3 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div>
                              <FormLabel className="font-normal">
                                Continue selling when out of stock
                              </FormLabel>
                              <FormDescription>
                                Allow customers to purchase even when inventory is zero
                              </FormDescription>
                            </div>
                          </FormItem>
                        )}
                      />
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Shipping Tab */}
                <TabsContent value="shipping">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Shipping</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <FormField
                        control={form.control}
                        name="requiresShipping"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div>
                              <FormLabel className="text-sm font-medium">
                                This product requires shipping
                              </FormLabel>
                              <FormDescription>
                                Enable if this is a physical product that needs to be
                                delivered
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      {watchRequiresShipping && (
                        <>
                          <FormField
                            control={form.control}
                            name="weight"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Weight</FormLabel>
                                <FormControl>
                                  <div className="relative w-full sm:w-[200px]">
                                    <Input
                                      type="number"
                                      step="0.1"
                                      min="0"
                                      placeholder="0.0"
                                      {...field}
                                      value={field.value ?? ""}
                                    />
                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                                      kg
                                    </span>
                                  </div>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <div>
                            <Label className="text-sm font-medium mb-3 block">
                              Dimensions
                            </Label>
                            <div className="grid grid-cols-3 gap-3">
                              <FormField
                                control={form.control}
                                name="length"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel className="text-xs text-muted-foreground">
                                      Length
                                    </FormLabel>
                                    <FormControl>
                                      <div className="relative">
                                        <Input
                                          type="number"
                                          step="0.1"
                                          min="0"
                                          placeholder="0"
                                          {...field}
                                          value={field.value ?? ""}
                                        />
                                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-xs">
                                          cm
                                        </span>
                                      </div>
                                    </FormControl>
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={form.control}
                                name="width"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel className="text-xs text-muted-foreground">
                                      Width
                                    </FormLabel>
                                    <FormControl>
                                      <div className="relative">
                                        <Input
                                          type="number"
                                          step="0.1"
                                          min="0"
                                          placeholder="0"
                                          {...field}
                                          value={field.value ?? ""}
                                        />
                                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-xs">
                                          cm
                                        </span>
                                      </div>
                                    </FormControl>
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={form.control}
                                name="height"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel className="text-xs text-muted-foreground">
                                      Height
                                    </FormLabel>
                                    <FormControl>
                                      <div className="relative">
                                        <Input
                                          type="number"
                                          step="0.1"
                                          min="0"
                                          placeholder="0"
                                          {...field}
                                          value={field.value ?? ""}
                                        />
                                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-xs">
                                          cm
                                        </span>
                                      </div>
                                    </FormControl>
                                  </FormItem>
                                )}
                              />
                            </div>
                          </div>

                          <FormField
                            control={form.control}
                            name="shippingClass"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Shipping Class</FormLabel>
                                <Select
                                  onValueChange={field.onChange}
                                  defaultValue={field.value}
                                >
                                  <FormControl>
                                    <SelectTrigger className="w-full sm:w-[280px]">
                                      <SelectValue placeholder="Select shipping class" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="standard">Standard</SelectItem>
                                    <SelectItem value="oversized">Oversized</SelectItem>
                                    <SelectItem value="fragile">Fragile</SelectItem>
                                    <SelectItem value="white_glove">
                                      White Glove Delivery
                                    </SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormDescription>
                                  Determines shipping rates and handling requirements
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Variants Tab */}
                <TabsContent value="variants">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Product Variants</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-sm text-muted-foreground">
                        Add options like Color, Size, or Material. Separate values with
                        commas. Variant combinations will be auto-generated below.
                      </p>

                      {variantFields.map((field, index) => (
                        <div
                          key={field.id}
                          className="rounded-lg border bg-muted/30 p-4 space-y-3"
                        >
                          <div className="flex items-center justify-between">
                            <Label className="font-medium text-sm">
                              Option {index + 1}
                            </Label>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon-xs"
                              onClick={() => removeVariant(index)}
                            >
                              <Trash2 className="size-3.5 text-destructive" />
                            </Button>
                          </div>
                          <div className="grid gap-3 sm:grid-cols-2">
                            <FormField
                              control={form.control}
                              name={`variants.${index}.optionName`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-xs">Option Name</FormLabel>
                                  <FormControl>
                                    <Input
                                      placeholder="e.g., Color, Size, Material"
                                      {...field}
                                    />
                                  </FormControl>
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name={`variants.${index}.values`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-xs">
                                    Values (comma-separated)
                                  </FormLabel>
                                  <FormControl>
                                    <Input
                                      placeholder="e.g., Natural, Walnut, Black"
                                      {...field}
                                    />
                                  </FormControl>
                                </FormItem>
                              )}
                            />
                          </div>
                        </div>
                      ))}

                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => addVariant({ optionName: "", values: "" })}
                      >
                        <Plus className="size-4" />
                        Add Option
                      </Button>

                      {/* Variant Combinations Table */}
                      {variantCombinations.length > 0 && (
                        <div className="mt-6">
                          <Separator className="mb-4" />
                          <Label className="font-medium mb-3 block">
                            Variant Combinations ({variantCombinations.length})
                          </Label>
                          <div className="rounded-md border">
                            <table className="w-full text-sm">
                              <thead>
                                <tr className="border-b bg-muted/50">
                                  <th className="text-left p-3 font-medium">Variant</th>
                                  <th className="text-left p-3 font-medium">
                                    Price Override
                                  </th>
                                  <th className="text-left p-3 font-medium">Stock</th>
                                  <th className="text-left p-3 font-medium">SKU</th>
                                </tr>
                              </thead>
                              <tbody>
                                {variantCombinations.map((combo) => (
                                  <tr
                                    key={combo.label}
                                    className="border-b last:border-0"
                                  >
                                    <td className="p-3 font-medium">{combo.label}</td>
                                    <td className="p-3">
                                      <div className="relative">
                                        <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground text-xs">
                                          ₹
                                        </span>
                                        <Input
                                          type="number"
                                          step="0.01"
                                          className="w-28 pl-6"
                                          placeholder="0.00"
                                          defaultValue={
                                            form.getValues("price") || ""
                                          }
                                        />
                                      </div>
                                    </td>
                                    <td className="p-3">
                                      <Input
                                        type="number"
                                        placeholder="0"
                                        className="w-20"
                                        defaultValue={0}
                                      />
                                    </td>
                                    <td className="p-3">
                                      <Input
                                        placeholder="Auto"
                                        className="w-28"
                                        defaultValue=""
                                      />
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* SEO Tab */}
                <TabsContent value="seo">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">
                        Search Engine Optimization
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <FormField
                        control={form.control}
                        name="metaTitle"
                        render={({ field }) => (
                          <FormItem>
                            <div className="flex items-center justify-between">
                              <FormLabel>Meta Title</FormLabel>
                              <span
                                className={`text-xs ${
                                  (watchMetaTitle?.length || 0) > 60
                                    ? "text-destructive"
                                    : "text-muted-foreground"
                                }`}
                              >
                                {watchMetaTitle?.length || 0}/60
                              </span>
                            </div>
                            <FormControl>
                              <Input
                                placeholder="SEO-optimized title for search results"
                                maxLength={60}
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="metaDescription"
                        render={({ field }) => (
                          <FormItem>
                            <div className="flex items-center justify-between">
                              <FormLabel>Meta Description</FormLabel>
                              <span
                                className={`text-xs ${
                                  (watchMetaDescription?.length || 0) > 160
                                    ? "text-destructive"
                                    : "text-muted-foreground"
                                }`}
                              >
                                {watchMetaDescription?.length || 0}/160
                              </span>
                            </div>
                            <FormControl>
                              <Textarea
                                placeholder="Compelling description for search engine results..."
                                className="min-h-[5rem] resize-y"
                                maxLength={160}
                                rows={3}
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Search Preview */}
                      <div>
                        <Label className="text-sm font-medium mb-3 block">
                          Search Result Preview
                        </Label>
                        <div className="rounded-lg border bg-muted/30 p-4 space-y-1">
                          <p className="text-blue-600 text-base font-medium truncate">
                            {watchMetaTitle || watchName || "Page Title"}
                          </p>
                          <p className="text-green-700 text-xs truncate">
                            https://fsow.com/products/
                            {watchSlug || "product-slug"}
                          </p>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {watchMetaDescription ||
                              "Add a meta description to see how this product will appear in search results."}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>

            {/* Sidebar - 1/3 */}
            <div className="space-y-6">
              {/* Status */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Publishing</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs text-muted-foreground">
                          Status
                        </FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="draft">Draft</SelectItem>
                            <SelectItem value="published">Published</SelectItem>
                            <SelectItem value="archived">Archived</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="visibility"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs text-muted-foreground">
                          Visibility
                        </FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select visibility" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="visible">Visible</SelectItem>
                            <SelectItem value="catalog_only">Catalog Only</SelectItem>
                            <SelectItem value="search_only">Search Only</SelectItem>
                            <SelectItem value="hidden">Hidden</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="productType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs text-muted-foreground">
                          Product Type
                        </FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="simple">Simple</SelectItem>
                            <SelectItem value="variable">Variable</SelectItem>
                            <SelectItem value="grouped">Grouped</SelectItem>
                            <SelectItem value="virtual">Virtual</SelectItem>
                            <SelectItem value="downloadable">Downloadable</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Category */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Organization</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs text-muted-foreground">
                          Category
                        </FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {categories.length > 0 ? (
                              categories.map((cat) => (
                                <SelectItem key={cat.id} value={cat.id}>
                                  {cat.name}
                                </SelectItem>
                              ))
                            ) : (
                              <>
                                <SelectItem value="living_room">Living Room</SelectItem>
                                <SelectItem value="bedroom">Bedroom</SelectItem>
                                <SelectItem value="dining">Dining</SelectItem>
                                <SelectItem value="office">Office</SelectItem>
                                <SelectItem value="outdoor">Outdoor</SelectItem>
                                <SelectItem value="decor">Decor</SelectItem>
                              </>
                            )}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Tags */}
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">Tags</Label>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Add a tag..."
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleAddTag();
                          }
                        }}
                        className="text-sm"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="shrink-0 h-9"
                        onClick={handleAddTag}
                      >
                        <Tag className="size-3.5" />
                      </Button>
                    </div>
                    {tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {tags.map((tag) => (
                          <Badge key={tag} variant="secondary" className="gap-1 text-xs">
                            {tag}
                            <button
                              type="button"
                              onClick={() => handleRemoveTag(tag)}
                              className="hover:text-destructive transition-colors"
                            >
                              <X className="size-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>

                  <Separator />

                  <FormField
                    control={form.control}
                    name="featured"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center gap-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="flex items-center gap-1.5">
                          <Star className="size-3.5 text-amber-500" />
                          <FormLabel className="font-normal text-sm">
                            Featured Product
                          </FormLabel>
                        </div>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="bestseller"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center gap-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="flex items-center gap-1.5">
                          <TrendingUp className="size-3.5 text-green-600" />
                          <FormLabel className="font-normal text-sm">
                            Bestseller
                          </FormLabel>
                        </div>
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Image Upload */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Media</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="border-2 border-dashed rounded-lg p-6 text-center hover:border-primary/50 hover:bg-primary/5 transition-colors cursor-pointer">
                    <Upload className="size-8 mx-auto text-muted-foreground mb-2" />
                    <p className="text-sm font-medium">Click to upload or drag and drop</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      PNG, JPG, WebP up to 10MB
                    </p>
                  </div>

                  {mockImages.length > 0 && (
                    <div className="grid grid-cols-3 gap-2">
                      {mockImages.map((img, idx) => (
                        <div
                          key={idx}
                          className="relative group rounded-lg border overflow-hidden aspect-square bg-muted"
                        >
                          <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">
                            {img}
                          </div>
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon-xs"
                            className="absolute top-1.5 right-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() =>
                              setMockImages((prev) =>
                                prev.filter((_, i) => i !== idx)
                              )
                            }
                          >
                            <X className="size-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() =>
                      setMockImages((prev) => [
                        ...prev,
                        `Image ${prev.length + 1}`,
                      ])
                    }
                  >
                    <Plus className="size-3.5" />
                    Add Mock Image
                  </Button>
                </CardContent>
              </Card>

              {/* Actions */}
              <div className="space-y-2">
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Package className="size-4" />
                  )}
                  {isSubmitting ? "Saving..." : "Save Product"}
                </Button>
              </div>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}
