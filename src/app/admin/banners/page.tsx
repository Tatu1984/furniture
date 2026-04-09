"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { toast } from "sonner";
import { Plus, Edit, Trash2, ExternalLink, Loader2 } from "lucide-react";

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
import { ConfirmDialog } from "@/components/shared/confirm-dialog";

// --- Types ---

type BannerPosition =
  | "HOME_HERO"
  | "HOME_SECONDARY"
  | "CATEGORY_TOP"
  | "SIDEBAR"
  | "PROMOTIONAL_STRIP";

type ApiBanner = {
  id: string;
  title: string;
  subtitle: string | null;
  image: string;
  imageMobile: string | null;
  link: string | null;
  buttonText: string | null;
  position: BannerPosition;
  sortOrder: number;
  isActive: boolean;
  startsAt: string | null;
  endsAt: string | null;
  updatedAt: string;
};

// --- Config ---

const positionConfig: Record<
  BannerPosition,
  { label: string; description: string }
> = {
  HOME_HERO: {
    label: "Home Hero",
    description: "Full-width banners displayed at the top of the homepage",
  },
  HOME_SECONDARY: {
    label: "Home Secondary",
    description: "Secondary banners on the homepage",
  },
  CATEGORY_TOP: {
    label: "Category Top",
    description: "Banners displayed at the top of category pages",
  },
  SIDEBAR: {
    label: "Sidebar",
    description: "Vertical banners shown in sidebar areas",
  },
  PROMOTIONAL_STRIP: {
    label: "Promotional Strip",
    description: "Thin banners for announcements and promotions",
  },
};

const positions: BannerPosition[] = [
  "HOME_HERO",
  "HOME_SECONDARY",
  "CATEGORY_TOP",
  "SIDEBAR",
  "PROMOTIONAL_STRIP",
];

function formatDate(dateStr: string | null) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function bannerStatus(b: ApiBanner): {
  label: string;
  className: string;
} {
  if (!b.isActive) {
    return {
      label: "Inactive",
      className: "bg-gray-100 text-gray-800 border-gray-200",
    };
  }
  const now = Date.now();
  if (b.startsAt && new Date(b.startsAt).getTime() > now) {
    return {
      label: "Scheduled",
      className: "bg-blue-100 text-blue-800 border-blue-200",
    };
  }
  if (b.endsAt && new Date(b.endsAt).getTime() < now) {
    return {
      label: "Expired",
      className: "bg-amber-100 text-amber-800 border-amber-200",
    };
  }
  return {
    label: "Active",
    className: "bg-green-100 text-green-800 border-green-200",
  };
}

// --- Banner Card ---

function BannerCard({
  banner,
  onDelete,
}: {
  banner: ApiBanner;
  onDelete: (b: ApiBanner) => void;
}) {
  const status = bannerStatus(banner);

  return (
    <Card className="overflow-hidden">
      <div className="flex flex-col sm:flex-row">
        <div className="relative w-full sm:w-[200px] h-[100px] shrink-0 bg-muted">
          {banner.image && (
            <Image
              src={banner.image}
              alt={banner.title}
              fill
              className="object-cover"
              sizes="200px"
              unoptimized
            />
          )}
        </div>

        <CardContent className="flex-1 py-3 px-4">
          <div className="flex items-start justify-between gap-2">
            <div className="space-y-1 min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-sm truncate">
                  {banner.title}
                </h3>
                <Badge
                  variant="outline"
                  className={`shrink-0 text-[10px] px-1.5 py-0 ${status.className}`}
                >
                  {status.label}
                </Badge>
              </div>
              {banner.subtitle && (
                <p className="text-xs text-muted-foreground truncate">
                  {banner.subtitle}
                </p>
              )}
              {banner.link && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <ExternalLink className="size-3 shrink-0" />
                  <span className="font-mono truncate max-w-[200px]">
                    {banner.link}
                  </span>
                </div>
              )}
              <div className="flex items-center gap-3 text-[11px] text-muted-foreground pt-0.5">
                <span>
                  {formatDate(banner.startsAt)} – {formatDate(banner.endsAt)}
                </span>
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
                onClick={() => onDelete(banner)}
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

// --- Page ---

export default function BannersPage() {
  const [banners, setBanners] = React.useState<ApiBanner[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [deleteTarget, setDeleteTarget] = React.useState<ApiBanner | null>(
    null,
  );
  const [deleting, setDeleting] = React.useState(false);

  const fetchBanners = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/banners?limit=100");
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || "Failed to load banners");
      }
      const json = await res.json();
      setBanners(json.data ?? []);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to load banners",
      );
      setBanners([]);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchBanners();
  }, [fetchBanners]);

  async function handleConfirmDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/banners/${deleteTarget.id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || "Failed to delete banner");
      }
      toast.success(`Deleted "${deleteTarget.title}"`);
      setDeleteTarget(null);
      fetchBanners();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to delete banner",
      );
    } finally {
      setDeleting(false);
    }
  }

  const grouped = React.useMemo(() => {
    const map: Record<BannerPosition, ApiBanner[]> = {
      HOME_HERO: [],
      HOME_SECONDARY: [],
      CATEGORY_TOP: [],
      SIDEBAR: [],
      PROMOTIONAL_STRIP: [],
    };
    for (const b of banners) {
      map[b.position]?.push(b);
    }
    return map;
  }, [banners]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Banners"
        description="Manage promotional banners and hero images"
      >
        <Button asChild>
          <Link href="/admin/banners/new">
            <Plus className="size-4" />
            Create Banner
          </Link>
        </Button>
      </PageHeader>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
          <span className="ml-2 text-muted-foreground">
            Loading banners...
          </span>
        </div>
      ) : (
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
                      <BannerCard
                        key={banner.id}
                        banner={banner}
                        onDelete={(b) => setDeleteTarget(b)}
                      />
                    ))
                  )}
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      )}

      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open && !deleting) setDeleteTarget(null);
        }}
        title="Delete Banner"
        description={
          deleteTarget
            ? `Are you sure you want to delete "${deleteTarget.title}"? This cannot be undone.`
            : ""
        }
        confirmLabel={deleting ? "Deleting…" : "Delete Banner"}
        cancelLabel="Cancel"
        onConfirm={handleConfirmDelete}
        variant="destructive"
      />
    </div>
  );
}
