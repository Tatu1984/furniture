"use client";

import * as React from "react";
import Image from "next/image";
import { toast } from "sonner";
import { type ColumnDef } from "@tanstack/react-table";
import {
  Package,
  AlertTriangle,
  XCircle,
  CheckCircle,
  Loader2,
} from "lucide-react";

import { PageHeader } from "@/components/admin/shared/page-header";
import {
  DataTable,
  DataTableColumnHeader,
} from "@/components/admin/shared/data-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/shared/status-badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

// --- Types ---

type ApiInventoryProduct = {
  id: string;
  name: string;
  sku: string;
  stockQuantity: number;
  lowStockThreshold: number;
  stockStatus: "IN_STOCK" | "LOW_STOCK" | "OUT_OF_STOCK";
  images: { url: string; alt: string | null }[];
  updatedAt?: string;
};

type InventoryItem = {
  id: string;
  name: string;
  image: string | null;
  sku: string;
  stock: number;
  threshold: number;
  status: "in-stock" | "low" | "out-of-stock";
};

function statusFromStock(qty: number, threshold: number): InventoryItem["status"] {
  if (qty <= 0) return "out-of-stock";
  if (qty <= threshold) return "low";
  return "in-stock";
}

function mapApiProduct(p: ApiInventoryProduct): InventoryItem {
  return {
    id: p.id,
    name: p.name,
    image: p.images?.[0]?.url ?? null,
    sku: p.sku,
    stock: p.stockQuantity,
    threshold: p.lowStockThreshold ?? 5,
    status: statusFromStock(p.stockQuantity, p.lowStockThreshold ?? 5),
  };
}

function getStockColor(item: InventoryItem): string {
  if (item.status === "out-of-stock") return "text-red-600";
  if (item.status === "low") return "text-amber-600";
  return "text-green-600";
}

// --- Page ---

export default function InventoryPage() {
  const [items, setItems] = React.useState<InventoryItem[]>([]);
  const [loading, setLoading] = React.useState(true);

  // Per-row pending edits + saving state
  const [drafts, setDrafts] = React.useState<Record<string, number>>({});
  const [savingId, setSavingId] = React.useState<string | null>(null);

  // Batch dialog
  const [batchOpen, setBatchOpen] = React.useState(false);
  const [batchSelected, setBatchSelected] = React.useState<string[]>([]);
  const [batchMode, setBatchMode] = React.useState<"set" | "adjust">("set");
  const [batchValue, setBatchValue] = React.useState(0);
  const [batchBusy, setBatchBusy] = React.useState(false);

  const fetchInventory = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/inventory?limit=100");
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || "Failed to load inventory");
      }
      const json = await res.json();
      setItems((json.data as ApiInventoryProduct[]).map(mapApiProduct));
      setDrafts({});
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to load inventory",
      );
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchInventory();
  }, [fetchInventory]);

  // ── Single-row save ─────────────────────────────────────────────────
  async function saveRow(item: InventoryItem) {
    const draft = drafts[item.id];
    if (draft === undefined || draft === item.stock) return;
    setSavingId(item.id);
    try {
      const res = await fetch(`/api/admin/inventory/${item.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          stockQuantity: Math.max(0, draft),
          reason: "Manual update from inventory page",
        }),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(json?.error || "Failed to update stock");
      }
      toast.success(`Updated stock for "${item.name}"`);
      setDrafts((prev) => {
        const next = { ...prev };
        delete next[item.id];
        return next;
      });
      // Patch the item in place rather than full refetch
      setItems((prev) =>
        prev.map((it) =>
          it.id === item.id
            ? {
                ...it,
                stock: Math.max(0, draft),
                status: statusFromStock(Math.max(0, draft), it.threshold),
              }
            : it,
        ),
      );
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update");
    } finally {
      setSavingId(null);
    }
  }

  // ── Batch update ────────────────────────────────────────────────────
  async function applyBatchUpdate() {
    if (batchSelected.length === 0) return;
    setBatchBusy(true);
    try {
      const updates = batchSelected.map((productId) => {
        const item = items.find((i) => i.id === productId);
        const stockQuantity =
          batchMode === "set"
            ? Math.max(0, batchValue)
            : Math.max(0, (item?.stock ?? 0) + batchValue);
        return {
          productId,
          stockQuantity,
          reason:
            batchMode === "set"
              ? `Batch set to ${batchValue}`
              : `Batch adjustment ${batchValue >= 0 ? "+" : ""}${batchValue}`,
        };
      });

      const res = await fetch("/api/admin/inventory", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ updates }),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(json?.error || "Failed to apply batch update");
      }
      toast.success(`Updated ${updates.length} item(s)`);
      setBatchOpen(false);
      setBatchSelected([]);
      setBatchValue(0);
      fetchInventory();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to apply batch update",
      );
    } finally {
      setBatchBusy(false);
    }
  }

  // ── Stat counts ─────────────────────────────────────────────────────
  const totalSkus = items.length;
  const inStockCount = items.filter((i) => i.status === "in-stock").length;
  const lowStockCount = items.filter((i) => i.status === "low").length;
  const outOfStockCount = items.filter(
    (i) => i.status === "out-of-stock",
  ).length;
  const lowStockItems = items.filter((i) => i.status === "low");

  // ── Columns ────────────────────────────────────────────────────────
  const columns: ColumnDef<InventoryItem>[] = [
    {
      accessorKey: "image",
      header: "",
      cell: ({ row }) => (
        <div className="size-10 rounded-md overflow-hidden bg-muted">
          {row.original.image ? (
            <Image
              src={row.original.image}
              alt={row.original.name}
              width={40}
              height={40}
              className="size-full object-cover"
              unoptimized
            />
          ) : (
            <div className="size-full flex items-center justify-center text-[10px] text-muted-foreground">
              IMG
            </div>
          )}
        </div>
      ),
      enableSorting: false,
    },
    {
      accessorKey: "name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Name" />
      ),
      cell: ({ row }) => (
        <span className="font-medium">{row.original.name}</span>
      ),
    },
    {
      accessorKey: "sku",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="SKU" />
      ),
      cell: ({ row }) => (
        <span className="font-mono text-sm text-muted-foreground">
          {row.original.sku}
        </span>
      ),
    },
    {
      accessorKey: "stock",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Current Stock" />
      ),
      cell: ({ row }) => {
        const draft = drafts[row.original.id];
        const value = draft ?? row.original.stock;
        const dirty = draft !== undefined && draft !== row.original.stock;
        const isSaving = savingId === row.original.id;
        return (
          <div className="flex items-center gap-2">
            <Input
              type="number"
              value={value}
              onChange={(e) =>
                setDrafts((prev) => ({
                  ...prev,
                  [row.original.id]: parseInt(e.target.value) || 0,
                }))
              }
              className={`w-20 h-8 text-center font-medium ${getStockColor(row.original)}`}
              min={0}
            />
            {dirty && (
              <Button
                size="sm"
                variant="outline"
                disabled={isSaving}
                onClick={() => saveRow(row.original)}
              >
                {isSaving ? (
                  <Loader2 className="size-3 animate-spin" />
                ) : (
                  "Save"
                )}
              </Button>
            )}
          </div>
        );
      },
    },
    {
      id: "status",
      header: "Status",
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Inventory Management"
        description="Track and manage product stock levels"
      >
        <Dialog open={batchOpen} onOpenChange={setBatchOpen}>
          <DialogTrigger asChild>
            <Button variant="outline">Batch Update</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Batch Stock Update</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid gap-2">
                <Label>Select Products</Label>
                <div className="max-h-48 overflow-y-auto space-y-2 border rounded-md p-3">
                  {items.length === 0 ? (
                    <p className="text-xs text-muted-foreground text-center py-2">
                      No items to update.
                    </p>
                  ) : (
                    items.map((item) => (
                      <div key={item.id} className="flex items-center gap-2">
                        <Checkbox
                          checked={batchSelected.includes(item.id)}
                          onCheckedChange={(checked) => {
                            setBatchSelected(
                              checked
                                ? [...batchSelected, item.id]
                                : batchSelected.filter((id) => id !== item.id),
                            );
                          }}
                        />
                        <span className="text-sm">
                          {item.name} (Current: {item.stock})
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
              <div className="grid gap-2">
                <Label>Update Mode</Label>
                <Select
                  value={batchMode}
                  onValueChange={(v) => setBatchMode(v as "set" | "adjust")}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="set">Set to value</SelectItem>
                    <SelectItem value="adjust">Adjust by (+/-)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>
                  {batchMode === "set" ? "New Quantity" : "Adjustment Amount"}
                </Label>
                <Input
                  type="number"
                  value={batchValue}
                  onChange={(e) =>
                    setBatchValue(parseInt(e.target.value) || 0)
                  }
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setBatchOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={applyBatchUpdate}
                disabled={batchSelected.length === 0 || batchBusy}
              >
                {batchBusy ? (
                  <>
                    <Loader2 className="size-4 animate-spin mr-1" />
                    Applying…
                  </>
                ) : (
                  `Apply to ${batchSelected.length} item(s)`
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </PageHeader>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="flex size-10 items-center justify-center rounded-lg bg-blue-100 text-blue-700">
              <Package className="size-5" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total SKUs</p>
              <p className="text-2xl font-bold">{totalSkus}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="flex size-10 items-center justify-center rounded-lg bg-green-100 text-green-700">
              <CheckCircle className="size-5" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">In Stock</p>
              <p className="text-2xl font-bold">{inStockCount}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="flex size-10 items-center justify-center rounded-lg bg-amber-100 text-amber-700">
              <AlertTriangle className="size-5" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Low Stock</p>
              <p className="text-2xl font-bold text-amber-600">
                {lowStockCount}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="flex size-10 items-center justify-center rounded-lg bg-red-100 text-red-700">
              <XCircle className="size-5" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Out of Stock</p>
              <p className="text-2xl font-bold text-red-600">
                {outOfStockCount}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Low Stock Alerts */}
      {lowStockItems.length > 0 && (
        <Card className="border-amber-200 bg-amber-50/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-800">
              <AlertTriangle className="size-5" />
              Low Stock Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {lowStockItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 bg-white rounded-md border"
                >
                  <div className="flex items-center gap-3">
                    {item.image && (
                      <Image
                        src={item.image}
                        alt={item.name}
                        width={32}
                        height={32}
                        className="size-8 rounded object-cover"
                        unoptimized
                      />
                    )}
                    <div>
                      <p className="font-medium text-sm">{item.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.sku}
                      </p>
                    </div>
                  </div>
                  <span className="text-sm font-medium text-amber-600">
                    {item.stock} left
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stock Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Products</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="size-6 animate-spin text-muted-foreground" />
              <span className="ml-2 text-muted-foreground">
                Loading inventory...
              </span>
            </div>
          ) : (
            <DataTable
              columns={columns}
              data={items}
              searchKey="name"
              searchPlaceholder="Search products..."
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
