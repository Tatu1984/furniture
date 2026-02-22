"use client";

import * as React from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Upload, Trash2, ImageIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { PageHeader } from "@/components/admin/shared/page-header";

// --- Schema ---

const bannerSchema = z.object({
  title: z.string().min(1, "Title is required"),
  subtitle: z.string().optional(),
  linkUrl: z.string().optional(),
  openInNewTab: z.boolean(),
  altText: z.string().optional(),
  position: z.enum(["hero", "sidebar", "promotional", "category"]),
  status: z.enum(["active", "inactive", "scheduled"]),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  sortOrder: z.number().min(0),
});

type BannerFormValues = z.infer<typeof bannerSchema>;

// --- Hardcoded Data ---

type BannerData = BannerFormValues & {
  id: string;
  imageUrl: string;
};

const bannersData: Record<string, BannerData> = {
  "1": {
    id: "1",
    title: "Spring Collection 2026",
    subtitle: "Discover our latest furniture pieces crafted with natural materials and warm tones for the perfect home refresh.",
    linkUrl: "/collections/spring-2026",
    openInNewTab: false,
    altText: "Spring 2026 furniture collection hero banner",
    position: "hero",
    status: "active",
    startDate: "2026-01-15",
    endDate: "2026-04-30",
    sortOrder: 1,
    imageUrl: "https://picsum.photos/seed/spring-collection/800/400",
  },
  "2": {
    id: "2",
    title: "Handcrafted Wooden Furniture",
    subtitle: "Each piece tells a story. Artisan-made tables, chairs, and shelving for modern living.",
    linkUrl: "/collections/handcrafted",
    openInNewTab: false,
    altText: "Handcrafted wooden furniture showcase",
    position: "hero",
    status: "active",
    startDate: "2026-01-01",
    endDate: "2026-12-31",
    sortOrder: 2,
    imageUrl: "https://picsum.photos/seed/handcrafted-wood/800/400",
  },
  "3": {
    id: "3",
    title: "Free Shipping Weekend",
    subtitle: "Enjoy free shipping on all orders over $200 this weekend only.",
    linkUrl: "/promotions/free-shipping",
    openInNewTab: false,
    altText: "Free shipping weekend promotion",
    position: "hero",
    status: "scheduled",
    startDate: "2026-03-01",
    endDate: "2026-03-03",
    sortOrder: 3,
    imageUrl: "https://picsum.photos/seed/free-shipping/800/400",
  },
  "4": {
    id: "4",
    title: "Cozy Reading Nooks",
    subtitle: "Create your perfect reading corner with our curated selection.",
    linkUrl: "/collections/reading-nooks",
    openInNewTab: false,
    altText: "Cozy reading nook furniture",
    position: "sidebar",
    status: "active",
    startDate: "2026-01-01",
    endDate: "2026-06-30",
    sortOrder: 1,
    imageUrl: "https://picsum.photos/seed/reading-nook/400/600",
  },
  "5": {
    id: "5",
    title: "New Lighting Arrivals",
    subtitle: "Warm ambient lighting for every room.",
    linkUrl: "/shop/lighting",
    openInNewTab: false,
    altText: "New lighting arrivals",
    position: "sidebar",
    status: "inactive",
    startDate: "2025-11-01",
    endDate: "2026-01-31",
    sortOrder: 2,
    imageUrl: "https://picsum.photos/seed/lighting-arrivals/400/600",
  },
  "6": {
    id: "6",
    title: "Up to 40% Off Select Items",
    subtitle: "Limited time offer on premium furniture pieces.",
    linkUrl: "/sale",
    openInNewTab: true,
    altText: "40% off sale banner",
    position: "promotional",
    status: "active",
    startDate: "2026-02-01",
    endDate: "2026-02-28",
    sortOrder: 1,
    imageUrl: "https://picsum.photos/seed/sale-40/1200/120",
  },
  "7": {
    id: "7",
    title: "Members Get 10% Extra",
    subtitle: "Sign up for our loyalty program and save.",
    linkUrl: "/membership",
    openInNewTab: false,
    altText: "Loyalty program membership banner",
    position: "promotional",
    status: "active",
    startDate: "2026-01-01",
    endDate: "2026-12-31",
    sortOrder: 2,
    imageUrl: "https://picsum.photos/seed/members-extra/1200/120",
  },
  "8": {
    id: "8",
    title: "Living Room Essentials",
    subtitle: "Everything you need for a warm, inviting living space.",
    linkUrl: "/shop/living-room",
    openInNewTab: false,
    altText: "Living room furniture essentials",
    position: "category",
    status: "active",
    startDate: "2026-01-01",
    endDate: "2026-12-31",
    sortOrder: 1,
    imageUrl: "https://picsum.photos/seed/living-essentials/600/300",
  },
  "9": {
    id: "9",
    title: "Outdoor Collection",
    subtitle: "Get ready for summer with our outdoor furniture range.",
    linkUrl: "/shop/outdoor",
    openInNewTab: false,
    altText: "Outdoor furniture collection",
    position: "category",
    status: "scheduled",
    startDate: "2026-04-01",
    endDate: "2026-09-30",
    sortOrder: 2,
    imageUrl: "https://picsum.photos/seed/outdoor-furniture/600/300",
  },
};

// --- Component ---

export default function EditBannerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = React.use(params);
  const bannerData = bannersData[id] ?? bannersData["1"];

  const [mockImage, setMockImage] = React.useState<string | null>(
    bannerData.imageUrl
  );

  const form = useForm<BannerFormValues>({
    resolver: zodResolver(bannerSchema),
    defaultValues: {
      title: bannerData.title,
      subtitle: bannerData.subtitle,
      linkUrl: bannerData.linkUrl,
      openInNewTab: bannerData.openInNewTab,
      altText: bannerData.altText,
      position: bannerData.position,
      status: bannerData.status,
      startDate: bannerData.startDate,
      endDate: bannerData.endDate,
      sortOrder: bannerData.sortOrder,
    },
  });

  const watchStatus = form.watch("status");

  function onSubmit(data: BannerFormValues) {
    console.log("Updated banner:", { ...data, image: mockImage });
  }

  function handleMockUpload() {
    const seed = form.getValues("title") || "banner";
    setMockImage(
      `https://picsum.photos/seed/${seed.toLowerCase().replace(/\s+/g, "-")}/800/400`
    );
  }

  function handleDeleteBanner() {
    console.log("Deleting banner:", id);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Edit Banner"
        description={`Editing: ${bannerData.title}`}
      >
        <Button variant="outline" asChild>
          <Link href="/admin/banners">
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
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Banner Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Title</FormLabel>
                        <FormControl>
                          <Input placeholder="Banner title" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="subtitle"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Subtitle</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Optional description or tagline..."
                            className="min-h-20"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="linkUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Link URL</FormLabel>
                        <FormControl>
                          <Input placeholder="/collections/spring-2026 or https://..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="openInNewTab"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex items-center gap-2">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <Label className="text-sm font-normal">Open in new tab</Label>
                        </div>
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Banner Image</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {mockImage ? (
                    <div className="space-y-3">
                      <div className="relative rounded-lg border overflow-hidden bg-muted aspect-[2/1]">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={mockImage}
                          alt="Banner preview"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setMockImage(null)}
                      >
                        Remove Image
                      </Button>
                    </div>
                  ) : (
                    <div
                      className="border-2 border-dashed rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer"
                      onClick={handleMockUpload}
                    >
                      <Upload className="size-8 mx-auto text-muted-foreground mb-3" />
                      <p className="text-sm font-medium">
                        Drag and drop an image here, or click to browse
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Recommended: 1200x600px for hero, 400x600px for sidebar
                      </p>
                    </div>
                  )}
                  <FormField
                    control={form.control}
                    name="altText"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Alt Text</FormLabel>
                        <FormControl>
                          <Input placeholder="Describe the banner image for accessibility" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </div>

            {/* Sidebar - 1/3 */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Position</CardTitle>
                </CardHeader>
                <CardContent>
                  <FormField
                    control={form.control}
                    name="position"
                    render={({ field }) => (
                      <FormItem>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select position" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="hero">
                              <div className="flex items-center gap-2">
                                <ImageIcon className="size-3.5" />
                                Hero
                              </div>
                            </SelectItem>
                            <SelectItem value="sidebar">Sidebar</SelectItem>
                            <SelectItem value="promotional">Promotional Strip</SelectItem>
                            <SelectItem value="category">Category</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Status</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
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
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="inactive">Inactive</SelectItem>
                            <SelectItem value="scheduled">Scheduled</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {(watchStatus === "scheduled" || bannerData.startDate) && (
                    <div className="space-y-3">
                      <FormField
                        control={form.control}
                        name="startDate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Start Date</FormLabel>
                            <FormControl>
                              <Input type="date" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="endDate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>End Date</FormLabel>
                            <FormControl>
                              <Input type="date" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Sort Order</CardTitle>
                </CardHeader>
                <CardContent>
                  <FormField
                    control={form.control}
                    name="sortOrder"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input
                            type="number"
                            min={0}
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              <div className="space-y-2">
                <Button type="submit" className="w-full">
                  Save Banner
                </Button>
                <Separator />
                <Button
                  type="button"
                  variant="destructive"
                  className="w-full"
                  onClick={handleDeleteBanner}
                >
                  <Trash2 className="size-4" />
                  Delete Banner
                </Button>
              </div>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}
