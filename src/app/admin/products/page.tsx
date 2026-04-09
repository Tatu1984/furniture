"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { type ColumnDef } from "@tanstack/react-table";
import { toast } from "sonner";
import {
  MoreHorizontal,
  Plus,
  Edit,
  Copy,
  Archive,
  Trash2,
  Loader2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader } from "@/components/admin/shared/page-header";
import {
  DataTable,
  DataTableColumnHeader,
} from "@/components/admin/shared/data-table";
import { StatusBadge } from "@/components/shared/status-badge";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { formatPrice } from "@/lib/format";

// --- Types ---

type Product = {
  id: string;
  image: string | null;
  imageAlt: string;
  name: string;
  slug: string;
  sku: string | null;
  category: string;
  price: number;
  compareAtPrice: number | null;
  stock: number;
  stockStatus: string;
  status: string;
};

type ApiProduct = {
  id: string;
  name: string;
  slug: string;
  sku: string | null;
  status: string;
  price: number;
  compareAtPrice: number | null;
  stockQuantity: number;
  stockStatus: string;
  category: { id: string; name: string; slug: string } | null;
  images: { id: string; url: string; alt: string }[];
  _count: { variants: number; reviews: number; orderItems: number };
};

type PaginationInfo = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

// --- Columns ---

function createColumns(
  onDeleteRequest: (product: Product) => void,
  onDuplicate: (product: Product) => void,
  onArchive: (product: Product) => void
): ColumnDef<Product>[] {
  return [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
  },
  {
    accessorKey: "image",
    header: "Image",
    cell: ({ row }) => {
      const imageUrl = row.original.image;
      return (
        <div className="size-10 rounded-md bg-muted overflow-hidden">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={row.original.imageAlt || row.original.name}
              width={40}
              height={40}
              className="size-full object-cover"
            />
          ) : (
            <div className="size-full bg-muted flex items-center justify-center text-muted-foreground text-xs">
              IMG
            </div>
          )}
        </div>
      );
    },
    enableSorting: false,
  },
  {
    accessorKey: "name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Name" />
    ),
    cell: ({ row }) => (
      <div>
        <Link
          href={`/admin/products/${row.original.id}`}
          className="font-medium hover:underline"
        >
          {row.getValue("name")}
        </Link>
        {row.original.sku && (
          <p className="text-xs text-muted-foreground">{row.original.sku}</p>
        )}
      </div>
    ),
  },
  {
    accessorKey: "category",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Category" />
    ),
  },
  {
    accessorKey: "price",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Price" />
    ),
    cell: ({ row }) => {
      const price = row.original.price;
      const compareAt = row.original.compareAtPrice;
      return (
        <div>
          <span>{formatPrice(price)}</span>
          {compareAt && compareAt > price && (
            <span className="ml-2 text-xs text-muted-foreground line-through">
              {formatPrice(compareAt)}
            </span>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "stock",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Stock" />
    ),
    cell: ({ row }) => {
      const stock = row.getValue("stock") as number;
      return (
        <span
          className={
            stock === 0
              ? "text-red-600 font-medium"
              : stock < 10
                ? "text-orange-600 font-medium"
                : ""
          }
        >
          {stock}
        </span>
      );
    },
  },
  {
    accessorKey: "status",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ row }) => <StatusBadge status={row.getValue("status")} />,
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon-xs">
            <MoreHorizontal className="size-4" />
            <span className="sr-only">Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem asChild>
            <Link href={`/admin/products/${row.original.id}`}>
              <Edit className="size-4" />
              Edit
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem
            onSelect={(event) => {
              event.preventDefault();
              onDuplicate(row.original);
            }}
          >
            <Copy className="size-4" />
            Duplicate
          </DropdownMenuItem>
          <DropdownMenuItem
            disabled={row.original.status === "archived"}
            onSelect={(event) => {
              event.preventDefault();
              onArchive(row.original);
            }}
          >
            <Archive className="size-4" />
            Archive
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            variant="destructive"
            onSelect={(event) => {
              event.preventDefault();
              onDeleteRequest(row.original);
            }}
          >
            <Trash2 className="size-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
    enableSorting: false,
  },
  ];
}

// --- Helpers ---

function mapApiProduct(p: ApiProduct): Product {
  const statusMap: Record<string, string> = {
    PUBLISHED: "published",
    DRAFT: "draft",
    ARCHIVED: "archived",
  };

  return {
    id: p.id,
    image: p.images?.[0]?.url ?? null,
    imageAlt: p.images?.[0]?.alt ?? "",
    name: p.name,
    slug: p.slug,
    sku: p.sku,
    category: p.category?.name ?? "Uncategorized",
    price: p.price,
    compareAtPrice: p.compareAtPrice,
    stock: p.stockQuantity,
    stockStatus: p.stockStatus,
    status: statusMap[p.status] ?? p.status.toLowerCase(),
  };
}

// --- Page ---

export default function ProductsPage() {
  const [activeTab, setActiveTab] = React.useState("all");
  const [products, setProducts] = React.useState<Product[]>([]);
  const [pagination, setPagination] = React.useState<PaginationInfo>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });
  const [counts, setCounts] = React.useState({
    all: 0,
    published: 0,
    draft: 0,
    archived: 0,
  });
  const [loading, setLoading] = React.useState(true);
  const [deleteTarget, setDeleteTarget] = React.useState<Product | null>(null);
  const [deleting, setDeleting] = React.useState(false);
  const [refreshKey, setRefreshKey] = React.useState(0);
  const [selected, setSelected] = React.useState<Product[]>([]);
  const [bulkBusy, setBulkBusy] = React.useState(false);
  const [bulkDeleteOpen, setBulkDeleteOpen] = React.useState(false);

  const handleSelectionChange = React.useCallback((rows: Product[]) => {
    setSelected(rows);
  }, []);

  async function runBulkAction(action: "delete" | "archive" | "publish") {
    if (selected.length === 0) return;
    setBulkBusy(true);
    try {
      const res = await fetch("/api/admin/products/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          ids: selected.map((p) => p.id),
        }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(data?.error || `Bulk ${action} failed`);
      }
      if (action === "delete") {
        const parts: string[] = [];
        if (data.deleted) parts.push(`${data.deleted} deleted`);
        if (data.archived)
          parts.push(`${data.archived} archived (have order history)`);
        toast.success(parts.join(", ") || "Done");
      } else {
        toast.success(`${data.updated ?? selected.length} product(s) ${action}d`);
      }
      setSelected([]);
      setBulkDeleteOpen(false);
      setRefreshKey((k) => k + 1);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : `Bulk ${action} failed`);
    } finally {
      setBulkBusy(false);
    }
  }

  // Fetch tab counts once on mount
  React.useEffect(() => {
    async function fetchCounts() {
      try {
        const [allRes, pubRes, draftRes, archRes] = await Promise.all([
          fetch("/api/admin/products?limit=1"),
          fetch("/api/admin/products?limit=1&status=PUBLISHED"),
          fetch("/api/admin/products?limit=1&status=DRAFT"),
          fetch("/api/admin/products?limit=1&status=ARCHIVED"),
        ]);
        const [allData, pubData, draftData, archData] = await Promise.all([
          allRes.json(),
          pubRes.json(),
          draftRes.json(),
          archRes.json(),
        ]);
        setCounts({
          all: allData.pagination?.total ?? 0,
          published: pubData.pagination?.total ?? 0,
          draft: draftData.pagination?.total ?? 0,
          archived: archData.pagination?.total ?? 0,
        });
      } catch {
        // Counts will remain at 0 on error
      }
    }
    fetchCounts();
  }, []);

  // Fetch products whenever tab, search, or page changes
  React.useEffect(() => {
    let cancelled = false;

    async function fetchProducts() {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        params.set("page", String(pagination.page));
        params.set("limit", String(pagination.limit));

        if (activeTab !== "all") {
          params.set("status", activeTab.toUpperCase());
        }

        const res = await fetch(`/api/admin/products?${params.toString()}`);
        if (!res.ok) throw new Error("Failed to fetch products");

        const json = await res.json();
        if (cancelled) return;

        setProducts((json.data as ApiProduct[]).map(mapApiProduct));
        setPagination(json.pagination);
      } catch (err) {
        console.error("Error fetching products:", err);
        if (!cancelled) {
          setProducts([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchProducts();
    return () => {
      cancelled = true;
    };
  }, [activeTab, pagination.page, pagination.limit, refreshKey]);

  const handleTabChange = React.useCallback((value: string) => {
    setActiveTab(value);
    setPagination((prev) => ({ ...prev, page: 1 }));
  }, []);

  const handleDeleteRequest = React.useCallback((product: Product) => {
    setDeleteTarget(product);
  }, []);

  async function handleConfirmDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/products/${deleteTarget.id}`, {
        method: "DELETE",
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(data?.error || "Failed to delete product");
      }
      if (data?.archived) {
        toast.success(
          data.message ?? "Product archived (has order history)."
        );
      } else {
        toast.success("Product deleted successfully");
      }
      setDeleteTarget(null);
      setRefreshKey((k) => k + 1);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to delete product"
      );
    } finally {
      setDeleting(false);
    }
  }

  const handleDuplicate = React.useCallback(
    async (product: Product) => {
      try {
        const res = await fetch(
          `/api/admin/products/${product.id}/duplicate`,
          { method: "POST" }
        );
        const data = await res.json().catch(() => null);
        if (!res.ok) {
          throw new Error(data?.error || "Failed to duplicate product");
        }
        toast.success(`Duplicated as "${data?.data?.name ?? "copy"}"`);
        setRefreshKey((k) => k + 1);
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : "Failed to duplicate product"
        );
      }
    },
    []
  );

  const handleArchive = React.useCallback(async (product: Product) => {
    try {
      const res = await fetch(`/api/admin/products/${product.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "ARCHIVED" }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(data?.error || "Failed to archive product");
      }
      toast.success(`Archived "${product.name}"`);
      setRefreshKey((k) => k + 1);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to archive product"
      );
    }
  }, []);

  const columns = React.useMemo(
    () => createColumns(handleDeleteRequest, handleDuplicate, handleArchive),
    [handleDeleteRequest, handleDuplicate, handleArchive]
  );

  return (
    <div className="space-y-6">
      <PageHeader title="Products" description="Manage your product catalog">
        <Button asChild>
          <Link href="/admin/products/new">
            <Plus className="size-4" />
            Add Product
          </Link>
        </Button>
      </PageHeader>

      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList>
          <TabsTrigger value="all">All ({counts.all})</TabsTrigger>
          <TabsTrigger value="published">
            Published ({counts.published})
          </TabsTrigger>
          <TabsTrigger value="draft">Draft ({counts.draft})</TabsTrigger>
          <TabsTrigger value="archived">
            Archived ({counts.archived})
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
          <span className="ml-2 text-muted-foreground">
            Loading products...
          </span>
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={products}
          searchKey="name"
          searchPlaceholder="Search products..."
          onSelectionChange={handleSelectionChange}
          toolbar={
            selected.length > 0 ? (
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  {selected.length} selected
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={bulkBusy}
                  onClick={() => runBulkAction("archive")}
                >
                  <Archive className="size-3.5" />
                  Archive
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={bulkBusy}
                  className="text-destructive hover:text-destructive"
                  onClick={() => setBulkDeleteOpen(true)}
                >
                  <Trash2 className="size-3.5" />
                  Delete
                </Button>
              </div>
            ) : null
          }
        />
      )}

      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open && !deleting) setDeleteTarget(null);
        }}
        title="Delete Product"
        description={
          deleteTarget
            ? `Are you sure you want to delete "${deleteTarget.name}"? This action cannot be undone. Products with order history will be archived instead of permanently removed.`
            : ""
        }
        confirmLabel={deleting ? "Deleting…" : "Delete Product"}
        cancelLabel="Cancel"
        onConfirm={handleConfirmDelete}
        variant="destructive"
      />

      <ConfirmDialog
        open={bulkDeleteOpen}
        onOpenChange={(open) => {
          if (!open && !bulkBusy) setBulkDeleteOpen(false);
        }}
        title={`Delete ${selected.length} product(s)?`}
        description="Products with order history will be archived instead of permanently removed. This cannot be undone."
        confirmLabel={bulkBusy ? "Deleting…" : "Delete Selected"}
        cancelLabel="Cancel"
        onConfirm={() => runBulkAction("delete")}
        variant="destructive"
      />
    </div>
  );
}
