"use client";

import * as React from "react";
import Link from "next/link";
import { type ColumnDef } from "@tanstack/react-table";
import {
  MoreHorizontal,
  Plus,
  Edit,
  Copy,
  Archive,
  Trash2,
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
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { PageHeader } from "@/components/admin/shared/page-header";
import {
  DataTable,
  DataTableColumnHeader,
} from "@/components/admin/shared/data-table";
import { StatusBadge } from "@/components/shared/status-badge";

// --- Types ---

type Product = {
  id: string;
  image: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  status: "active" | "draft" | "archived";
};

// --- Hardcoded Data ---

const products: Product[] = [
  { id: "1", image: "/placeholder.svg", name: "Scandinavian Oak Dining Table", category: "Tables", price: 1299.99, stock: 12, status: "active" },
  { id: "2", image: "/placeholder.svg", name: "Velvet Accent Chair - Emerald", category: "Chairs", price: 449.00, stock: 5, status: "active" },
  { id: "3", image: "/placeholder.svg", name: "Walnut Floating Shelf Set", category: "Storage", price: 189.99, stock: 2, status: "active" },
  { id: "4", image: "/placeholder.svg", name: "Linen Throw Pillow - Sand", category: "Accessories", price: 59.99, stock: 45, status: "active" },
  { id: "5", image: "/placeholder.svg", name: "Ceramic Table Lamp - Matte Black", category: "Lighting", price: 129.00, stock: 4, status: "active" },
  { id: "6", image: "/placeholder.svg", name: "Mid-Century Modern Sofa", category: "Sofas", price: 2199.00, stock: 8, status: "active" },
  { id: "7", image: "/placeholder.svg", name: "Rattan Pendant Light", category: "Lighting", price: 249.00, stock: 15, status: "active" },
  { id: "8", image: "/placeholder.svg", name: "Marble Coffee Table", category: "Tables", price: 899.99, stock: 6, status: "active" },
  { id: "9", image: "/placeholder.svg", name: "Teak Garden Bench", category: "Outdoor", price: 549.00, stock: 10, status: "active" },
  { id: "10", image: "/placeholder.svg", name: "Wool Area Rug 8x10", category: "Accessories", price: 799.00, stock: 20, status: "active" },
  { id: "11", image: "/placeholder.svg", name: "Industrial Bookshelf", category: "Storage", price: 699.99, stock: 0, status: "draft" },
  { id: "12", image: "/placeholder.svg", name: "Leather Ottoman - Cognac", category: "Chairs", price: 349.00, stock: 18, status: "active" },
  { id: "13", image: "/placeholder.svg", name: "Minimalist Desk Lamp", category: "Lighting", price: 89.99, stock: 30, status: "active" },
  { id: "14", image: "/placeholder.svg", name: "Bamboo Side Table", category: "Tables", price: 199.00, stock: 22, status: "active" },
  { id: "15", image: "/placeholder.svg", name: "Velvet Curtain Panel - Navy", category: "Accessories", price: 119.99, stock: 0, status: "draft" },
  { id: "16", image: "/placeholder.svg", name: "Modular Sectional - Gray", category: "Sofas", price: 3499.00, stock: 3, status: "active" },
  { id: "17", image: "/placeholder.svg", name: "Woven Storage Basket Set", category: "Storage", price: 79.99, stock: 50, status: "active" },
  { id: "18", image: "/placeholder.svg", name: "Cedar Planter Box", category: "Outdoor", price: 149.00, stock: 14, status: "active" },
  { id: "19", image: "/placeholder.svg", name: "Art Deco Mirror - Gold", category: "Accessories", price: 299.00, stock: 0, status: "archived" },
  { id: "20", image: "/placeholder.svg", name: "Upholstered Bed Frame - Queen", category: "Bedroom", price: 1599.00, stock: 7, status: "active" },
  { id: "21", image: "/placeholder.svg", name: "Concrete Planter - Large", category: "Outdoor", price: 89.00, stock: 0, status: "draft" },
  { id: "22", image: "/placeholder.svg", name: "Brass Floor Lamp", category: "Lighting", price: 379.00, stock: 9, status: "active" },
];

// --- Columns ---

const columns: ColumnDef<Product>[] = [
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
    cell: ({ row }) => (
      <div className="size-10 rounded-md bg-muted overflow-hidden">
        <div className="size-full bg-muted flex items-center justify-center text-muted-foreground text-xs">
          IMG
        </div>
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
      <Link
        href={`/admin/products/${row.original.id}`}
        className="font-medium hover:underline"
      >
        {row.getValue("name")}
      </Link>
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
      const price = parseFloat(row.getValue("price"));
      return `$${price.toLocaleString("en-US", { minimumFractionDigits: 2 })}`;
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
        <span className={stock === 0 ? "text-red-600 font-medium" : stock < 10 ? "text-orange-600 font-medium" : ""}>
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
          <DropdownMenuItem>
            <Copy className="size-4" />
            Duplicate
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Archive className="size-4" />
            Archive
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem variant="destructive">
            <Trash2 className="size-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
    enableSorting: false,
  },
];

// --- Page ---

export default function ProductsPage() {
  const [activeTab, setActiveTab] = React.useState("all");

  const filteredProducts = React.useMemo(() => {
    if (activeTab === "all") return products;
    return products.filter((p) => p.status === activeTab);
  }, [activeTab]);

  const counts = React.useMemo(() => ({
    all: products.length,
    active: products.filter((p) => p.status === "active").length,
    draft: products.filter((p) => p.status === "draft").length,
    archived: products.filter((p) => p.status === "archived").length,
  }), []);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Products"
        description="Manage your product catalog"
      >
        <Button asChild>
          <Link href="/admin/products/new">
            <Plus className="size-4" />
            Add Product
          </Link>
        </Button>
      </PageHeader>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">All ({counts.all})</TabsTrigger>
          <TabsTrigger value="active">Active ({counts.active})</TabsTrigger>
          <TabsTrigger value="draft">Draft ({counts.draft})</TabsTrigger>
          <TabsTrigger value="archived">Archived ({counts.archived})</TabsTrigger>
        </TabsList>
      </Tabs>

      <DataTable
        columns={columns}
        data={filteredProducts}
        searchKey="name"
        searchPlaceholder="Search products..."
      />
    </div>
  );
}
