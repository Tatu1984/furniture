"use client";

import * as React from "react";
import Link from "next/link";
import { toast } from "sonner";
import { type ColumnDef } from "@tanstack/react-table";
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react";

import { PageHeader } from "@/components/admin/shared/page-header";
import {
  DataTable,
  DataTableColumnHeader,
} from "@/components/admin/shared/data-table";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StatusBadge } from "@/components/shared/status-badge";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { formatPrice } from "@/lib/format";

// --- Types ---

type ApiCoupon = {
  id: string;
  code: string;
  name: string;
  type: "PERCENTAGE" | "FIXED_AMOUNT" | "FREE_SHIPPING";
  value: number;
  minOrderValue: number | null;
  usageCount: number;
  usageLimit: number | null;
  status: "ACTIVE" | "EXPIRED" | "DRAFT" | "DISABLED";
  expiresAt: string | null;
};

type CouponRow = {
  id: string;
  code: string;
  name: string;
  type: "percentage" | "fixed";
  value: number;
  minOrder: number;
  usageCurrent: number;
  usageMax: number;
  expiresAt: string | null;
  status: string;
};

function mapApiCoupon(c: ApiCoupon): CouponRow {
  return {
    id: c.id,
    code: c.code,
    name: c.name,
    type: c.type === "PERCENTAGE" ? "percentage" : "fixed",
    value: Number(c.value ?? 0),
    minOrder: Number(c.minOrderValue ?? 0),
    usageCurrent: c.usageCount ?? 0,
    usageMax: c.usageLimit ?? 0,
    expiresAt: c.expiresAt,
    status: c.status.toLowerCase(),
  };
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function createColumns(
  onDelete: (row: CouponRow) => void,
): ColumnDef<CouponRow>[] {
  return [
    {
      accessorKey: "code",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Code" />
      ),
      cell: ({ row }) => (
        <div>
          <p className="font-mono font-medium">{row.original.code}</p>
          {row.original.name && (
            <p className="text-xs text-muted-foreground">{row.original.name}</p>
          )}
        </div>
      ),
    },
    {
      accessorKey: "type",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Type" />
      ),
      cell: ({ row }) => (
        <span className="capitalize">
          {row.original.type === "percentage" ? "Percentage" : "Fixed Amount"}
        </span>
      ),
    },
    {
      accessorKey: "value",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Value" />
      ),
      cell: ({ row }) => (
        <span className="font-medium">
          {row.original.type === "percentage"
            ? `${row.original.value}%`
            : formatPrice(row.original.value)}
        </span>
      ),
    },
    {
      accessorKey: "minOrder",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Min Order" />
      ),
      cell: ({ row }) => (
        <span className="text-muted-foreground">
          {row.original.minOrder > 0
            ? formatPrice(row.original.minOrder)
            : "None"}
        </span>
      ),
    },
    {
      id: "usage",
      header: "Usage",
      cell: ({ row }) => (
        <span className="text-muted-foreground">
          {row.original.usageCurrent} /{" "}
          {row.original.usageMax > 0 ? row.original.usageMax : "Unlimited"}
        </span>
      ),
    },
    {
      accessorKey: "expiresAt",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Expiry" />
      ),
      cell: ({ row }) => (
        <span className="text-muted-foreground">
          {formatDate(row.original.expiresAt)}
        </span>
      ),
    },
    {
      accessorKey: "status",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Status" />
      ),
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          <Link href={`/admin/coupons/${row.original.id}`}>
            <Button variant="ghost" size="sm">
              <Pencil className="mr-1 size-4" />
              Edit
            </Button>
          </Link>
          <Button
            variant="ghost"
            size="sm"
            className="text-destructive hover:text-destructive"
            onClick={() => onDelete(row.original)}
          >
            <Trash2 className="size-4" />
          </Button>
        </div>
      ),
      enableSorting: false,
    },
  ];
}

export default function CouponsPage() {
  const [coupons, setCoupons] = React.useState<CouponRow[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [statusFilter, setStatusFilter] = React.useState("all");
  const [deleteTarget, setDeleteTarget] = React.useState<CouponRow | null>(
    null,
  );
  const [deleting, setDeleting] = React.useState(false);

  const fetchCoupons = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/coupons?limit=100");
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || "Failed to load coupons");
      }
      const json = await res.json();
      setCoupons((json.data as ApiCoupon[]).map(mapApiCoupon));
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to load coupons",
      );
      setCoupons([]);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchCoupons();
  }, [fetchCoupons]);

  const handleDeleteRequest = React.useCallback((row: CouponRow) => {
    setDeleteTarget(row);
  }, []);

  async function handleConfirmDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/coupons/${deleteTarget.id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || "Failed to delete coupon");
      }
      toast.success(`Deleted "${deleteTarget.code}"`);
      setDeleteTarget(null);
      fetchCoupons();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to delete coupon",
      );
    } finally {
      setDeleting(false);
    }
  }

  const columns = React.useMemo(
    () => createColumns(handleDeleteRequest),
    [handleDeleteRequest],
  );

  const filteredCoupons =
    statusFilter === "all"
      ? coupons
      : coupons.filter((c) => c.status === statusFilter);

  const counts = React.useMemo(
    () => ({
      all: coupons.length,
      active: coupons.filter((c) => c.status === "active").length,
      expired: coupons.filter((c) => c.status === "expired").length,
      draft: coupons.filter((c) => c.status === "draft").length,
    }),
    [coupons],
  );

  return (
    <div className="space-y-6">
      <PageHeader title="Coupons" description="Manage discount coupons">
        <Link href="/admin/coupons/new">
          <Button>
            <Plus className="mr-2 size-4" />
            Create Coupon
          </Button>
        </Link>
      </PageHeader>

      <Tabs value={statusFilter} onValueChange={setStatusFilter}>
        <TabsList>
          <TabsTrigger value="all">All ({counts.all})</TabsTrigger>
          <TabsTrigger value="active">Active ({counts.active})</TabsTrigger>
          <TabsTrigger value="expired">Expired ({counts.expired})</TabsTrigger>
          <TabsTrigger value="draft">Draft ({counts.draft})</TabsTrigger>
        </TabsList>
      </Tabs>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
          <span className="ml-2 text-muted-foreground">
            Loading coupons...
          </span>
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={filteredCoupons}
          searchKey="code"
          searchPlaceholder="Search coupons..."
        />
      )}

      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open && !deleting) setDeleteTarget(null);
        }}
        title="Delete Coupon"
        description={
          deleteTarget
            ? `Are you sure you want to delete "${deleteTarget.code}"? This cannot be undone.`
            : ""
        }
        confirmLabel={deleting ? "Deleting…" : "Delete Coupon"}
        cancelLabel="Cancel"
        onConfirm={handleConfirmDelete}
        variant="destructive"
      />
    </div>
  );
}
