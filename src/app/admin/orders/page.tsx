"use client";

import * as React from "react";
import Link from "next/link";
import { type ColumnDef } from "@tanstack/react-table";
import { Eye } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader } from "@/components/admin/shared/page-header";
import {
  DataTable,
  DataTableColumnHeader,
} from "@/components/admin/shared/data-table";
import { StatusBadge } from "@/components/shared/status-badge";

// --- Types ---

type Order = {
  id: string;
  customer: string;
  date: string;
  items: number;
  total: number;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
};

// --- Hardcoded Data ---

const orders: Order[] = [
  { id: "ORD-2024-001", customer: "Sarah Johnson", date: "2024-12-15", items: 3, total: 1249.99, status: "delivered" },
  { id: "ORD-2024-002", customer: "Michael Chen", date: "2024-12-14", items: 1, total: 899.00, status: "shipped" },
  { id: "ORD-2024-003", customer: "Emily Davis", date: "2024-12-14", items: 4, total: 2450.00, status: "processing" },
  { id: "ORD-2024-004", customer: "James Wilson", date: "2024-12-13", items: 2, total: 675.50, status: "pending" },
  { id: "ORD-2024-005", customer: "Lisa Anderson", date: "2024-12-13", items: 1, total: 1850.00, status: "cancelled" },
  { id: "ORD-2024-006", customer: "Robert Taylor", date: "2024-12-12", items: 5, total: 3299.00, status: "delivered" },
  { id: "ORD-2024-007", customer: "Amanda Martinez", date: "2024-12-12", items: 2, total: 548.99, status: "shipped" },
  { id: "ORD-2024-008", customer: "David Brown", date: "2024-12-11", items: 1, total: 1299.99, status: "delivered" },
  { id: "ORD-2024-009", customer: "Jennifer Lee", date: "2024-12-11", items: 3, total: 987.00, status: "processing" },
  { id: "ORD-2024-010", customer: "Christopher Garcia", date: "2024-12-10", items: 2, total: 449.00, status: "pending" },
  { id: "ORD-2024-011", customer: "Michelle Robinson", date: "2024-12-10", items: 1, total: 2199.00, status: "shipped" },
  { id: "ORD-2024-012", customer: "Daniel White", date: "2024-12-09", items: 4, total: 1654.50, status: "delivered" },
  { id: "ORD-2024-013", customer: "Ashley Thompson", date: "2024-12-09", items: 2, total: 738.00, status: "pending" },
  { id: "ORD-2024-014", customer: "Kevin Harris", date: "2024-12-08", items: 1, total: 549.00, status: "cancelled" },
  { id: "ORD-2024-015", customer: "Stephanie Clark", date: "2024-12-08", items: 3, total: 1875.99, status: "processing" },
  { id: "ORD-2024-016", customer: "Brian Lewis", date: "2024-12-07", items: 2, total: 999.00, status: "delivered" },
];

// --- Columns ---

const columns: ColumnDef<Order>[] = [
  {
    accessorKey: "id",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Order #" />
    ),
    cell: ({ row }) => (
      <Link
        href={`/admin/orders/${row.original.id}`}
        className="font-medium hover:underline"
      >
        {row.getValue("id")}
      </Link>
    ),
  },
  {
    accessorKey: "customer",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Customer" />
    ),
  },
  {
    accessorKey: "date",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Date" />
    ),
    cell: ({ row }) => (
      <span className="text-muted-foreground">{row.getValue("date")}</span>
    ),
  },
  {
    accessorKey: "items",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Items" />
    ),
    cell: ({ row }) => (
      <span>{row.getValue("items")} item(s)</span>
    ),
  },
  {
    accessorKey: "total",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Total" />
    ),
    cell: ({ row }) => {
      const total = parseFloat(row.getValue("total"));
      return (
        <span className="font-medium">
          ${total.toLocaleString("en-US", { minimumFractionDigits: 2 })}
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
      <Button variant="ghost" size="sm" asChild>
        <Link href={`/admin/orders/${row.original.id}`}>
          <Eye className="size-4" />
          View
        </Link>
      </Button>
    ),
    enableSorting: false,
  },
];

// --- Page ---

export default function OrdersPage() {
  const [activeTab, setActiveTab] = React.useState("all");
  const [dateFrom, setDateFrom] = React.useState("");
  const [dateTo, setDateTo] = React.useState("");

  const filteredOrders = React.useMemo(() => {
    let result = orders;
    if (activeTab !== "all") {
      result = result.filter((o) => o.status === activeTab);
    }
    if (dateFrom) {
      result = result.filter((o) => o.date >= dateFrom);
    }
    if (dateTo) {
      result = result.filter((o) => o.date <= dateTo);
    }
    return result;
  }, [activeTab, dateFrom, dateTo]);

  const counts = React.useMemo(() => ({
    all: orders.length,
    pending: orders.filter((o) => o.status === "pending").length,
    processing: orders.filter((o) => o.status === "processing").length,
    shipped: orders.filter((o) => o.status === "shipped").length,
    delivered: orders.filter((o) => o.status === "delivered").length,
    cancelled: orders.filter((o) => o.status === "cancelled").length,
  }), []);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Orders"
        description="Manage customer orders"
      />

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">All ({counts.all})</TabsTrigger>
          <TabsTrigger value="pending">Pending ({counts.pending})</TabsTrigger>
          <TabsTrigger value="processing">Processing ({counts.processing})</TabsTrigger>
          <TabsTrigger value="shipped">Shipped ({counts.shipped})</TabsTrigger>
          <TabsTrigger value="delivered">Delivered ({counts.delivered})</TabsTrigger>
          <TabsTrigger value="cancelled">Cancelled ({counts.cancelled})</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Date Range Filter */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">From:</span>
          <Input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="w-40"
          />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">To:</span>
          <Input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="w-40"
          />
        </div>
        {(dateFrom || dateTo) && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setDateFrom("");
              setDateTo("");
            }}
          >
            Clear dates
          </Button>
        )}
      </div>

      <DataTable
        columns={columns}
        data={filteredOrders}
        searchKey="id"
        searchPlaceholder="Search by order # or customer..."
      />
    </div>
  );
}
