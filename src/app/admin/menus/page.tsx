"use client";

import * as React from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  Plus,
  Edit,
  Trash2,
  GripVertical,
  ChevronRight,
  EyeOff,
  Loader2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { PageHeader } from "@/components/admin/shared/page-header";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";

// --- Types ---

type ApiMenuItem = {
  id: string;
  title: string;
  url: string | null;
  type: "CUSTOM" | "PAGE" | "CATEGORY" | "PRODUCT" | "BLOG";
  isActive: boolean;
  parentId: string | null;
  children?: ApiMenuItem[];
};

type ApiMenu = {
  id: string;
  name: string;
  slug: string;
  location: "HEADER" | "FOOTER" | "MOBILE" | "SIDEBAR";
  items: ApiMenuItem[];
  _count: { items: number };
};

// --- Helpers ---

const locationConfig: Record<
  ApiMenu["location"],
  { label: string; className: string }
> = {
  HEADER: {
    label: "Header",
    className: "bg-blue-100 text-blue-800 border-blue-200",
  },
  FOOTER: {
    label: "Footer",
    className: "bg-green-100 text-green-800 border-green-200",
  },
  MOBILE: {
    label: "Mobile",
    className: "bg-purple-100 text-purple-800 border-purple-200",
  },
  SIDEBAR: {
    label: "Sidebar",
    className: "bg-yellow-100 text-yellow-800 border-yellow-200",
  },
};

const typeConfig: Record<
  ApiMenuItem["type"],
  { label: string; className: string }
> = {
  CUSTOM: { label: "Link", className: "bg-gray-100 text-gray-700 border-gray-200" },
  PAGE: { label: "Page", className: "bg-blue-50 text-blue-700 border-blue-200" },
  CATEGORY: {
    label: "Category",
    className: "bg-amber-50 text-amber-700 border-amber-200",
  },
  PRODUCT: {
    label: "Product",
    className: "bg-green-50 text-green-700 border-green-200",
  },
  BLOG: { label: "Blog", className: "bg-pink-50 text-pink-700 border-pink-200" },
};

// --- Sub-components ---

function MenuItemRow({
  item,
  isChild = false,
}: {
  item: ApiMenuItem;
  isChild?: boolean;
}) {
  const typeStyle = typeConfig[item.type];

  return (
    <div
      className={`flex items-center gap-2 py-2 px-3 rounded-md hover:bg-muted/50 transition-colors ${
        isChild ? "ml-8" : ""
      }`}
    >
      {isChild && (
        <ChevronRight className="size-3 text-muted-foreground shrink-0" />
      )}
      <GripVertical className="size-3.5 text-muted-foreground shrink-0" />
      <span
        className={`text-sm font-medium truncate flex-1 ${
          !item.isActive ? "opacity-50" : ""
        }`}
      >
        {item.title}
      </span>
      {item.url && (
        <span className="text-xs text-muted-foreground font-mono truncate max-w-[140px] hidden sm:inline">
          {item.url}
        </span>
      )}
      <Badge
        variant="outline"
        className={`text-[10px] px-1.5 py-0 shrink-0 ${typeStyle.className}`}
      >
        {typeStyle.label}
      </Badge>
      {!item.isActive && (
        <EyeOff className="size-3 text-muted-foreground shrink-0" />
      )}
    </div>
  );
}

// --- Page ---

export default function MenusPage() {
  const [menus, setMenus] = React.useState<ApiMenu[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [deleteTarget, setDeleteTarget] = React.useState<ApiMenu | null>(null);
  const [deleting, setDeleting] = React.useState(false);

  const fetchMenus = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/menus");
      if (!res.ok) throw new Error("Failed to load menus");
      const json = await res.json();
      setMenus(json.data ?? []);
    } catch (err) {
      console.error(err);
      toast.error(err instanceof Error ? err.message : "Failed to load menus");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchMenus();
  }, [fetchMenus]);

  async function handleConfirmDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/menus/${deleteTarget.id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || "Failed to delete menu");
      }
      toast.success(`Deleted menu "${deleteTarget.name}"`);
      setDeleteTarget(null);
      fetchMenus();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to delete menu",
      );
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Menus" description="Manage navigation menus for your store">
        <Button asChild>
          <Link href="/admin/menus/new">
            <Plus className="size-4" />
            Create Menu
          </Link>
        </Button>
      </PageHeader>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
          <span className="ml-2 text-muted-foreground">Loading menus...</span>
        </div>
      ) : menus.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <p className="text-sm">No menus yet.</p>
          <p className="text-xs mt-1">
            Click &quot;Create Menu&quot; to set up your first navigation menu.
          </p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {menus.map((menu) => {
            const locStyle = locationConfig[menu.location];
            return (
              <Card key={menu.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1.5">
                      <CardTitle className="text-base">{menu.name}</CardTitle>
                      <p className="text-xs font-mono text-muted-foreground">
                        {menu.slug}
                      </p>
                    </div>
                    <Badge
                      variant="outline"
                      className={`shrink-0 ${locStyle.className}`}
                    >
                      {locStyle.label}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {menu._count.items} item
                    {menu._count.items !== 1 ? "s" : ""}
                  </p>
                </CardHeader>
                <CardContent className="space-y-1">
                  <Separator className="mb-3" />
                  <div className="space-y-0.5 max-h-[260px] overflow-y-auto">
                    {menu.items.length === 0 ? (
                      <p className="text-xs text-muted-foreground py-4 text-center">
                        No items
                      </p>
                    ) : (
                      menu.items.map((item) => (
                        <React.Fragment key={item.id}>
                          <MenuItemRow item={item} />
                          {item.children?.map((child) => (
                            <MenuItemRow
                              key={child.id}
                              item={child}
                              isChild
                            />
                          ))}
                        </React.Fragment>
                      ))
                    )}
                  </div>
                  <Separator className="mt-3" />
                  <div className="flex items-center gap-2 pt-3">
                    <Button
                      variant="outline"
                      size="sm"
                      asChild
                      className="flex-1"
                    >
                      <Link href={`/admin/menus/${menu.id}`}>
                        <Edit className="size-3.5" />
                        Edit
                      </Link>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                      onClick={() => setDeleteTarget(menu)}
                    >
                      <Trash2 className="size-3.5" />
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open && !deleting) setDeleteTarget(null);
        }}
        title="Delete Menu"
        description={
          deleteTarget
            ? `Are you sure you want to delete "${deleteTarget.name}"? All items in this menu will be removed. This cannot be undone.`
            : ""
        }
        confirmLabel={deleting ? "Deleting…" : "Delete Menu"}
        cancelLabel="Cancel"
        onConfirm={handleConfirmDelete}
        variant="destructive"
      />
    </div>
  );
}
