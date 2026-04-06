"use client";

import * as React from "react";
import Link from "next/link";
import { type ColumnDef } from "@tanstack/react-table";
import { Eye, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader } from "@/components/admin/shared/page-header";
import {
  DataTable,
  DataTableColumnHeader,
} from "@/components/admin/shared/data-table";
import { StatusBadge } from "@/components/shared/status-badge";
import { formatPrice } from "@/lib/format";

// --- Types ---

type Order = {
  id: string;
  orderNumber: string;
  customer: string;
  email: string;
  date: string;
  items: number;
  total: number;
  status: string;
  paymentStatus: string;
};

// --- Columns ---

const columns: ColumnDef<Order>[] = [
  {
    accessorKey: "orderNumber",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Order #" />
    ),
    cell: ({ row }) => (
      <Link
        href={`/admin/orders/${row.original.id}`}
        className="font-medium hover:underline"
      >
        {row.getValue("orderNumber")}
      </Link>
    ),
  },
  {
    accessorKey: "customer",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Customer" />
    ),
    cell: ({ row }) => (
      <div>
        <p className="font-medium">{row.getValue("customer")}</p>
        <p className="text-xs text-muted-foreground">{row.original.email}</p>
      </div>
    ),
  },
  {
    accessorKey: "date",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Date" />
    ),
    cell: ({ row }) => (
      <span className="text-muted-foreground">
        {new Date(row.getValue("date")).toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })}
      </span>
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
    cell: ({ row }) => (
      <span className="font-medium">
        {formatPrice(parseFloat(row.getValue("total")))}
      </span>
    ),
  },
  {
    accessorKey: "status",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ row }) => <StatusBadge status={row.getValue("status")} />,
  },
  {
    accessorKey: "paymentStatus",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Payment" />
    ),
    cell: ({ row }) => <StatusBadge status={row.getValue("paymentStatus")} />,
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
  const [orders, setOrders] = React.useState<Order[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [activeTab, setActiveTab] = React.useState("all");
  const [dateFrom, setDateFrom] = React.useState("");
  const [dateTo, setDateTo] = React.useState("");
  const [counts, setCounts] = React.useState({
    all: 0,
    PENDING: 0,
    CONFIRMED: 0,
    PROCESSING: 0,
    SHIPPED: 0,
    DELIVERED: 0,
    CANCELLED: 0,
  });

  const fetchOrders = React.useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("limit", "100");
      if (activeTab !== "all") params.set("status", activeTab);
      if (dateFrom) params.set("dateFrom", dateFrom);
      if (dateTo) params.set("dateTo", dateTo);

      const res = await fetch(`/api/admin/orders?${params}`);
      if (!res.ok) {
        setOrders([]);
        return;
      }
      const data = await res.json();
      const mapped = (data.data || []).map((o: {
        id: string;
        orderNumber: string;
        email: string;
        status: string;
        paymentStatus: string;
        total: number;
        createdAt: string;
        user?: { firstName: string; lastName: string; email: string };
        _count?: { items: number };
      }) => ({
        id: o.id,
        orderNumber: o.orderNumber,
        customer: o.user ? `${o.user.firstName} ${o.user.lastName}` : o.email,
        email: o.user?.email || o.email,
        date: o.createdAt,
        items: o._count?.items || 0,
        total: Number(o.total),
        status: o.status,
        paymentStatus: o.paymentStatus,
      }));
      setOrders(mapped);

      // Fetch counts for all statuses
      if (activeTab === "all") {
        setCounts((prev) => ({ ...prev, all: data.pagination?.total || mapped.length }));
      }
    } catch {
      console.error("Failed to fetch orders");
    } finally {
      setLoading(false);
    }
  }, [activeTab, dateFrom, dateTo]);

  // Fetch all counts on mount
  React.useEffect(() => {
    async function fetchCounts() {
      try {
        const res = await fetch("/api/admin/orders?limit=1");
        if (res.ok) {
          const data = await res.json();
          setCounts((prev) => ({ ...prev, all: data.pagination?.total || 0 }));
        }
      } catch { /* ignore */ }
    }
    fetchCounts();
  }, []);

  React.useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Orders"
        description="Manage customer orders"
      />

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">All ({counts.all})</TabsTrigger>
          <TabsTrigger value="PENDING">Pending</TabsTrigger>
          <TabsTrigger value="PROCESSING">Processing</TabsTrigger>
          <TabsTrigger value="SHIPPED">Shipped</TabsTrigger>
          <TabsTrigger value="DELIVERED">Delivered</TabsTrigger>
          <TabsTrigger value="CANCELLED">Cancelled</TabsTrigger>
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

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="size-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={orders}
          searchKey="orderNumber"
          searchPlaceholder="Search by order # or customer..."
        />
      )}
    </div>
  );
}
