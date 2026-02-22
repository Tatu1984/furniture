"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { Plus, Edit, Trash2, ExternalLink } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { PageHeader } from "@/components/admin/shared/page-header";

// --- Types ---

type BannerStatus = "active" | "inactive" | "scheduled";
type BannerPosition = "hero" | "sidebar" | "promotional" | "category";

type Banner = {
  id: string;
  title: string;
  subtitle: string;
  imageUrl: string;
  linkUrl: string;
  status: BannerStatus;
  position: BannerPosition;
  startDate: string;
  endDate: string;
  updatedAt: string;
  sortOrder: number;
};

// --- Hardcoded Data ---

const banners: Banner[] = [
  {
    id: "1",
    title: "Spring Collection 2026",
    subtitle: "Discover our latest furniture pieces crafted with natural materials and warm tones for the perfect home refresh.",
    imageUrl: "https://picsum.photos/seed/spring-collection/800/400",
    linkUrl: "/collections/spring-2026",
    status: "active",
    position: "hero",
    startDate: "2026-01-15",
    endDate: "2026-04-30",
    updatedAt: "2026-02-18",
    sortOrder: 1,
  },
  {
    id: "2",
    title: "Handcrafted Wooden Furniture",
    subtitle: "Each piece tells a story. Artisan-made tables, chairs, and shelving for modern living.",
    imageUrl: "https://picsum.photos/seed/handcrafted-wood/800/400",
    linkUrl: "/collections/handcrafted",
    status: "active",
    position: "hero",
    startDate: "2026-01-01",
    endDate: "2026-12-31",
    updatedAt: "2026-02-10",
    sortOrder: 2,
  },
  {
    id: "3",
    title: "Free Shipping Weekend",
    subtitle: "Enjoy free shipping on all orders over $200 this weekend only.",
    imageUrl: "https://picsum.photos/seed/free-shipping/800/400",
    linkUrl: "/promotions/free-shipping",
    status: "scheduled",
    position: "hero",
    startDate: "2026-03-01",
    endDate: "2026-03-03",
    updatedAt: "2026-02-20",
    sortOrder: 3,
  },
  {
    id: "4",
    title: "Cozy Reading Nooks",
    subtitle: "Create your perfect reading corner with our curated selection.",
    imageUrl: "https://picsum.photos/seed/reading-nook/400/600",
    linkUrl: "/collections/reading-nooks",
    status: "active",
    position: "sidebar",
    startDate: "2026-01-01",
    endDate: "2026-06-30",
    updatedAt: "2026-02-05",
    sortOrder: 1,
  },
  {
    id: "5",
    title: "New Lighting Arrivals",
    subtitle: "Warm ambient lighting for every room.",
    imageUrl: "https://picsum.photos/seed/lighting-arrivals/400/600",
    linkUrl: "/shop/lighting",
    status: "inactive",
    position: "sidebar",
    startDate: "2025-11-01",
    endDate: "2026-01-31",
    updatedAt: "2026-01-15",
    sortOrder: 2,
  },
  {
    id: "6",
    title: "Up to 40% Off Select Items",
    subtitle: "Limited time offer on premium furniture pieces.",
    imageUrl: "https://picsum.photos/seed/sale-40/1200/120",
    linkUrl: "/sale",
    status: "active",
    position: "promotional",
    startDate: "2026-02-01",
    endDate: "2026-02-28",
    updatedAt: "2026-02-01",
    sortOrder: 1,
  },
  {
    id: "7",
    title: "Members Get 10% Extra",
    subtitle: "Sign up for our loyalty program and save.",
    imageUrl: "https://picsum.photos/seed/members-extra/1200/120",
    linkUrl: "/membership",
    status: "active",
    position: "promotional",
    startDate: "2026-01-01",
    endDate: "2026-12-31",
    updatedAt: "2026-01-20",
    sortOrder: 2,
  },
  {
    id: "8",
    title: "Living Room Essentials",
    subtitle: "Everything you need for a warm, inviting living space.",
    imageUrl: "https://picsum.photos/seed/living-essentials/600/300",
    linkUrl: "/shop/living-room",
    status: "active",
    position: "category",
    startDate: "2026-01-01",
    endDate: "2026-12-31",
    updatedAt: "2026-02-12",
    sortOrder: 1,
  },
  {
    id: "9",
    title: "Outdoor Collection",
    subtitle: "Get ready for summer with our outdoor furniture range.",
    imageUrl: "https://picsum.photos/seed/outdoor-furniture/600/300",
    linkUrl: "/shop/outdoor",
    status: "scheduled",
    position: "category",
    startDate: "2026-04-01",
    endDate: "2026-09-30",
    updatedAt: "2026-02-19",
    sortOrder: 2,
  },
];

// --- Helpers ---

const positionConfig: Record<BannerPosition, { label: string; description: string }> = {
  hero: { label: "Hero Banners", description: "Full-width banners displayed at the top of the homepage" },
  sidebar: { label: "Sidebar Banners", description: "Vertical banners shown in sidebar areas" },
  promotional: { label: "Promotional Strip", description: "Thin banners for announcements and promotions" },
  category: { label: "Category Banners", description: "Banners displayed on category pages" },
};

const statusConfig: Record<BannerStatus, { label: string; className: string }> = {
  active: { label: "Active", className: "bg-green-100 text-green-800 border-green-200" },
  inactive: { label: "Inactive", className: "bg-gray-100 text-gray-800 border-gray-200" },
  scheduled: { label: "Scheduled", className: "bg-blue-100 text-blue-800 border-blue-200" },
};

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

const positions: BannerPosition[] = ["hero", "sidebar", "promotional", "category"];

// --- Component ---

function BannerCard({ banner }: { banner: Banner }) {
  const statusStyle = statusConfig[banner.status];

  return (
    <Card className="overflow-hidden">
      <div className="flex flex-col sm:flex-row">
        {/* Image Preview */}
        <div className="relative w-full sm:w-[200px] h-[100px] shrink-0 bg-muted">
          <Image
            src={banner.imageUrl}
            alt={banner.title}
            fill
            className="object-cover"
            sizes="200px"
          />
        </div>

        {/* Content */}
        <CardContent className="flex-1 py-3 px-4">
          <div className="flex items-start justify-between gap-2">
            <div className="space-y-1 min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-sm truncate">{banner.title}</h3>
                <Badge
                  variant="outline"
                  className={`shrink-0 text-[10px] px-1.5 py-0 ${statusStyle.className}`}
                >
                  {statusStyle.label}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground truncate">
                {banner.subtitle}
              </p>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <ExternalLink className="size-3 shrink-0" />
                <span className="font-mono truncate max-w-[200px]">{banner.linkUrl}</span>
              </div>
              <div className="flex items-center gap-3 text-[11px] text-muted-foreground pt-0.5">
                <span>{formatDate(banner.startDate)} - {formatDate(banner.endDate)}</span>
                <span>Updated {formatDate(banner.updatedAt)}</span>
              </div>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              <Button variant="outline" size="icon-xs" asChild>
                <Link href={`/admin/banners/${banner.id}`}>
                  <Edit className="size-3.5" />
                </Link>
              </Button>
              <Button
                variant="outline"
                size="icon-xs"
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="size-3.5" />
              </Button>
            </div>
          </div>
        </CardContent>
      </div>
    </Card>
  );
}

export default function BannersPage() {
  const grouped = React.useMemo(() => {
    const map: Record<BannerPosition, Banner[]> = {
      hero: [],
      sidebar: [],
      promotional: [],
      category: [],
    };
    for (const banner of banners) {
      map[banner.position].push(banner);
    }
    return map;
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader title="Banners" description="Manage promotional banners and hero images">
        <Button asChild>
          <Link href="/admin/banners/new">
            <Plus className="size-4" />
            Create Banner
          </Link>
        </Button>
      </PageHeader>

      <Accordion type="multiple" defaultValue={positions} className="space-y-4">
        {positions.map((position) => {
          const config = positionConfig[position];
          const positionBanners = grouped[position];

          return (
            <AccordionItem
              key={position}
              value={position}
              className="rounded-lg border bg-card px-4"
            >
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center gap-3">
                  <span className="font-semibold">{config.label}</span>
                  <Badge variant="secondary" className="text-xs">
                    {positionBanners.length}
                  </Badge>
                  <span className="text-xs text-muted-foreground hidden sm:inline">
                    {config.description}
                  </span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="space-y-3 pb-4">
                {positionBanners.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-6">
                    No banners in this position.
                  </p>
                ) : (
                  positionBanners.map((banner) => (
                    <BannerCard key={banner.id} banner={banner} />
                  ))
                )}
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>
    </div>
  );
}
