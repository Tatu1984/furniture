"use client";

import * as React from "react";
import { type ColumnDef } from "@tanstack/react-table";
import { Package, AlertTriangle, XCircle, CheckCircle, RotateCcw } from "lucide-react";

import { PageHeader } from "@/components/admin/shared/page-header";
import { DataTable, DataTableColumnHeader } from "@/components/admin/shared/data-table";
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
import { picsumUrl } from "@/lib/mock-data/images";

interface InventoryItem {
  id: string;
  name: string;
  image: string;
  sku: string;
  stock: number;
  lastUpdated: string;
}

const inventoryItems: InventoryItem[] = [
  { id: "inv-001", name: "Oakwood Sofa", image: picsumUrl("product-oakwood-sofa", 60, 60), sku: "FSOW-SOF-001", stock: 42, lastUpdated: "2025-12-10T10:00:00Z" },
  { id: "inv-002", name: "Walnut Dining Table", image: picsumUrl("product-walnut-dining", 60, 60), sku: "FSOW-DIN-001", stock: 18, lastUpdated: "2025-12-09T14:30:00Z" },
  { id: "inv-003", name: "Modern Bookshelf", image: picsumUrl("product-modern-bookshelf", 60, 60), sku: "FSOW-SHF-001", stock: 35, lastUpdated: "2025-12-08T09:15:00Z" },
  { id: "inv-004", name: "Leather Armchair", image: picsumUrl("product-leather-armchair", 60, 60), sku: "FSOW-CHR-001", stock: 7, lastUpdated: "2025-12-11T16:00:00Z" },
  { id: "inv-005", name: "Standing Desk", image: picsumUrl("product-standing-desk", 60, 60), sku: "FSOW-DSK-001", stock: 28, lastUpdated: "2025-12-07T11:45:00Z" },
  { id: "inv-006", name: "Bed Frame - King", image: picsumUrl("product-bed-frame-king", 60, 60), sku: "FSOW-BED-001", stock: 0, lastUpdated: "2025-12-05T08:00:00Z" },
  { id: "inv-007", name: "Coffee Table", image: picsumUrl("product-coffee-table", 60, 60), sku: "FSOW-TBL-001", stock: 53, lastUpdated: "2025-12-10T13:20:00Z" },
  { id: "inv-008", name: "Nightstand", image: picsumUrl("product-nightstand", 60, 60), sku: "FSOW-NST-001", stock: 3, lastUpdated: "2025-12-11T07:30:00Z" },
  { id: "inv-009", name: "TV Console", image: picsumUrl("product-tv-console", 60, 60), sku: "FSOW-CON-001", stock: 15, lastUpdated: "2025-12-09T10:00:00Z" },
  { id: "inv-010", name: "Dining Chair Set", image: picsumUrl("product-dining-chair", 60, 60), sku: "FSOW-DCH-001", stock: 0, lastUpdated: "2025-12-04T15:00:00Z" },
  { id: "inv-011", name: "Outdoor Lounge Chair", image: picsumUrl("product-outdoor-lounge", 60, 60), sku: "FSOW-OUT-001", stock: 22, lastUpdated: "2025-12-08T12:00:00Z" },
  { id: "inv-012", name: "Writing Desk", image: picsumUrl("product-writing-desk", 60, 60), sku: "FSOW-WDS-001", stock: 5, lastUpdated: "2025-12-10T09:00:00Z" },
  { id: "inv-013", name: "Bar Stool (Set of 2)", image: picsumUrl("product-bar-stool", 60, 60), sku: "FSOW-BST-001", stock: 0, lastUpdated: "2025-12-03T14:00:00Z" },
  { id: "inv-014", name: "Sideboard", image: picsumUrl("product-sideboard", 60, 60), sku: "FSOW-SDB-001", stock: 9, lastUpdated: "2025-12-11T11:00:00Z" },
  { id: "inv-015", name: "Wardrobe", image: picsumUrl("product-wardrobe", 60, 60), sku: "FSOW-WRD-001", stock: 12, lastUpdated: "2025-12-09T16:30:00Z" },
  { id: "inv-016", name: "Ottoman", image: picsumUrl("product-ottoman", 60, 60), sku: "FSOW-OTT-001", stock: 31, lastUpdated: "2025-12-10T08:00:00Z" },
  { id: "inv-017", name: "Floor Lamp", image: picsumUrl("product-floor-lamp", 60, 60), sku: "FSOW-LMP-001", stock: 45, lastUpdated: "2025-12-07T10:00:00Z" },
  { id: "inv-018", name: "Accent Table", image: picsumUrl("product-accent-table", 60, 60), sku: "FSOW-ACT-001", stock: 2, lastUpdated: "2025-12-11T14:45:00Z" },
  { id: "inv-019", name: "Recliner Chair", image: picsumUrl("product-recliner", 60, 60), sku: "FSOW-RCL-001", stock: 8, lastUpdated: "2025-12-10T15:30:00Z" },
  { id: "inv-020", name: "Patio Dining Set", image: picsumUrl("product-patio-dining", 60, 60), sku: "FSOW-PAT-001", stock: 0, lastUpdated: "2025-12-02T09:00:00Z" },
  { id: "inv-021", name: "Shoe Rack", image: picsumUrl("product-shoe-rack", 60, 60), sku: "FSOW-SHR-001", stock: 67, lastUpdated: "2025-12-08T13:00:00Z" },
  { id: "inv-022", name: "Vanity Mirror", image: picsumUrl("product-vanity-mirror", 60, 60), sku: "FSOW-VMR-001", stock: 4, lastUpdated: "2025-12-11T10:15:00Z" },
  { id: "inv-023", name: "Garden Bench", image: picsumUrl("product-garden-bench", 60, 60), sku: "FSOW-GBN-001", stock: 19, lastUpdated: "2025-12-06T11:00:00Z" },
  { id: "inv-024", name: "Desk Chair", image: picsumUrl("product-desk-chair", 60, 60), sku: "FSOW-DCR-001", stock: 33, lastUpdated: "2025-12-09T08:45:00Z" },
  { id: "inv-025", name: "Plant Stand", image: picsumUrl("product-plant-stand", 60, 60), sku: "FSOW-PLT-001", stock: 0, lastUpdated: "2025-12-01T10:00:00Z" },
];

function getStockStatus(stock: number): "in-stock" | "low" | "out-of-stock" {
  if (stock === 0) return "out-of-stock";
  if (stock <= 20) return "low";
  return "in-stock";
}

function getStockColor(stock: number): string {
  if (stock === 0) return "text-red-600";
  if (stock <= 20) return "text-amber-600";
  return "text-green-600";
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function InventoryPage() {
  const [items, setItems] = React.useState(inventoryItems);
  const [batchOpen, setBatchOpen] = React.useState(false);
  const [batchSelected, setBatchSelected] = React.useState<string[]>([]);
  const [batchMode, setBatchMode] = React.useState<"set" | "adjust">("set");
  const [batchValue, setBatchValue] = React.useState(0);

  const totalSkus = items.length;
  const inStockCount = items.filter((i) => i.stock > 20).length;
  const lowStockCount = items.filter((i) => i.stock > 0 && i.stock <= 20).length;
  const outOfStockCount = items.filter((i) => i.stock === 0).length;
  const lowStockItems = items.filter((i) => i.stock > 0 && i.stock < 10);

  const updateStock = (id: string, newStock: number) => {
    setItems(items.map((item) => item.id === id ? { ...item, stock: Math.max(0, newStock) } : item));
  };

  const applyBatchUpdate = () => {
    setItems(items.map((item) => {
      if (!batchSelected.includes(item.id)) return item;
      const newStock = batchMode === "set" ? batchValue : item.stock + batchValue;
      return { ...item, stock: Math.max(0, newStock) };
    }));
    setBatchOpen(false);
    setBatchSelected([]);
    setBatchValue(0);
  };

  const columns: ColumnDef<InventoryItem>[] = [
    {
      accessorKey: "image",
      header: "",
      cell: ({ row }) => (
        <img
          src={row.original.image}
          alt={row.original.name}
          className="size-10 rounded-md object-cover"
        />
      ),
      enableSorting: false,
    },
    {
      accessorKey: "name",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Name" />,
      cell: ({ row }) => <span className="font-medium">{row.original.name}</span>,
    },
    {
      accessorKey: "sku",
      header: ({ column }) => <DataTableColumnHeader column={column} title="SKU" />,
      cell: ({ row }) => <span className="font-mono text-sm text-muted-foreground">{row.original.sku}</span>,
    },
    {
      accessorKey: "stock",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Current Stock" />,
      cell: ({ row }) => (
        <Input
          type="number"
          value={row.original.stock}
          onChange={(e) => updateStock(row.original.id, parseInt(e.target.value) || 0)}
          className={`w-20 h-8 text-center font-medium ${getStockColor(row.original.stock)}`}
          min={0}
        />
      ),
    },
    {
      id: "status",
      header: "Status",
      cell: ({ row }) => <StatusBadge status={getStockStatus(row.original.stock)} />,
    },
    {
      accessorKey: "lastUpdated",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Last Updated" />,
      cell: ({ row }) => <span className="text-muted-foreground">{formatDate(row.original.lastUpdated)}</span>,
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Inventory Management" description="Track and manage product stock levels">
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
                  {items.map((item) => (
                    <div key={item.id} className="flex items-center gap-2">
                      <Checkbox
                        checked={batchSelected.includes(item.id)}
                        onCheckedChange={(checked) => {
                          setBatchSelected(
                            checked
                              ? [...batchSelected, item.id]
                              : batchSelected.filter((id) => id !== item.id)
                          );
                        }}
                      />
                      <span className="text-sm">{item.name} (Current: {item.stock})</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="grid gap-2">
                <Label>Update Mode</Label>
                <Select value={batchMode} onValueChange={(v) => setBatchMode(v as "set" | "adjust")}>
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
                <Label>{batchMode === "set" ? "New Quantity" : "Adjustment Amount"}</Label>
                <Input
                  type="number"
                  value={batchValue}
                  onChange={(e) => setBatchValue(parseInt(e.target.value) || 0)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setBatchOpen(false)}>Cancel</Button>
              <Button onClick={applyBatchUpdate} disabled={batchSelected.length === 0}>
                Apply to {batchSelected.length} item(s)
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
              <p className="text-2xl font-bold text-amber-600">{lowStockCount}</p>
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
              <p className="text-2xl font-bold text-red-600">{outOfStockCount}</p>
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
                <div key={item.id} className="flex items-center justify-between p-3 bg-white rounded-md border">
                  <div className="flex items-center gap-3">
                    <img src={item.image} alt={item.name} className="size-8 rounded object-cover" />
                    <div>
                      <p className="font-medium text-sm">{item.name}</p>
                      <p className="text-xs text-muted-foreground">{item.sku}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-medium text-amber-600">
                      {item.stock} left
                    </span>
                    <Button size="sm" variant="outline">
                      <RotateCcw className="mr-1 size-3" />
                      Reorder
                    </Button>
                  </div>
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
          <DataTable
            columns={columns}
            data={items}
            searchKey="name"
            searchPlaceholder="Search products..."
          />
        </CardContent>
      </Card>
    </div>
  );
}
