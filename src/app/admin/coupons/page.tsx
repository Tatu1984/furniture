"use client";

import * as React from "react";
import Link from "next/link";
import { type ColumnDef } from "@tanstack/react-table";
import { Plus, Pencil, Trash2 } from "lucide-react";

import { PageHeader } from "@/components/admin/shared/page-header";
import { DataTable, DataTableColumnHeader } from "@/components/admin/shared/data-table";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StatusBadge } from "@/components/shared/status-badge";

interface CouponRow {
  id: string;
  code: string;
  type: "percentage" | "fixed";
  value: number;
  minOrder: number;
  usageCurrent: number;
  usageMax: number;
  expiresAt: string;
  status: "active" | "expired" | "draft";
}

const coupons: CouponRow[] = [
  { id: "cpn-001", code: "WELCOME20", type: "percentage", value: 20, minOrder: 100, usageCurrent: 342, usageMax: 1000, expiresAt: "2026-06-30T23:59:59Z", status: "active" },
  { id: "cpn-002", code: "SUMMER15", type: "percentage", value: 15, minOrder: 200, usageCurrent: 189, usageMax: 500, expiresAt: "2026-08-31T23:59:59Z", status: "active" },
  { id: "cpn-003", code: "FLAT50", type: "fixed", value: 50, minOrder: 300, usageCurrent: 87, usageMax: 200, expiresAt: "2026-03-31T23:59:59Z", status: "active" },
  { id: "cpn-004", code: "VIP25", type: "percentage", value: 25, minOrder: 500, usageCurrent: 45, usageMax: 100, expiresAt: "2026-12-31T23:59:59Z", status: "active" },
  { id: "cpn-005", code: "HOLIDAY10", type: "percentage", value: 10, minOrder: 0, usageCurrent: 1200, usageMax: 0, expiresAt: "2025-12-31T23:59:59Z", status: "expired" },
  { id: "cpn-006", code: "FREESHIP", type: "fixed", value: 0, minOrder: 150, usageCurrent: 560, usageMax: 0, expiresAt: "2025-11-30T23:59:59Z", status: "expired" },
  { id: "cpn-007", code: "NEWYEAR30", type: "percentage", value: 30, minOrder: 400, usageCurrent: 0, usageMax: 300, expiresAt: "2026-01-31T23:59:59Z", status: "draft" },
  { id: "cpn-008", code: "SAVE100", type: "fixed", value: 100, minOrder: 800, usageCurrent: 23, usageMax: 50, expiresAt: "2026-04-30T23:59:59Z", status: "active" },
  { id: "cpn-009", code: "BDAY15", type: "percentage", value: 15, minOrder: 0, usageCurrent: 78, usageMax: 0, expiresAt: "2026-12-31T23:59:59Z", status: "active" },
  { id: "cpn-010", code: "FLASH40", type: "percentage", value: 40, minOrder: 250, usageCurrent: 150, usageMax: 150, expiresAt: "2025-10-15T23:59:59Z", status: "expired" },
  { id: "cpn-011", code: "SPRING10", type: "percentage", value: 10, minOrder: 100, usageCurrent: 0, usageMax: 500, expiresAt: "2026-05-31T23:59:59Z", status: "draft" },
  { id: "cpn-012", code: "REFER25", type: "fixed", value: 25, minOrder: 200, usageCurrent: 412, usageMax: 0, expiresAt: "2026-12-31T23:59:59Z", status: "active" },
];

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount);
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

const columns: ColumnDef<CouponRow>[] = [
  {
    accessorKey: "code",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Code" />,
    cell: ({ row }) => <span className="font-mono font-medium">{row.original.code}</span>,
  },
  {
    accessorKey: "type",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Type" />,
    cell: ({ row }) => (
      <span className="capitalize">{row.original.type === "percentage" ? "Percentage" : "Fixed Amount"}</span>
    ),
  },
  {
    accessorKey: "value",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Value" />,
    cell: ({ row }) => (
      <span className="font-medium">
        {row.original.type === "percentage" ? `${row.original.value}%` : formatCurrency(row.original.value)}
      </span>
    ),
  },
  {
    accessorKey: "minOrder",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Min Order" />,
    cell: ({ row }) => (
      <span className="text-muted-foreground">
        {row.original.minOrder > 0 ? formatCurrency(row.original.minOrder) : "None"}
      </span>
    ),
  },
  {
    id: "usage",
    header: "Usage",
    cell: ({ row }) => (
      <span className="text-muted-foreground">
        {row.original.usageCurrent} / {row.original.usageMax > 0 ? row.original.usageMax : "Unlimited"}
      </span>
    ),
  },
  {
    accessorKey: "expiresAt",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Expiry" />,
    cell: ({ row }) => (
      <span className="text-muted-foreground">{formatDate(row.original.expiresAt)}</span>
    ),
  },
  {
    accessorKey: "status",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
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
        <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
          <Trash2 className="size-4" />
        </Button>
      </div>
    ),
    enableSorting: false,
  },
];

export default function CouponsPage() {
  const [statusFilter, setStatusFilter] = React.useState("all");

  const filteredCoupons = statusFilter === "all"
    ? coupons
    : coupons.filter((c) => c.status === statusFilter);

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
          <TabsTrigger value="all">All ({coupons.length})</TabsTrigger>
          <TabsTrigger value="active">Active ({coupons.filter((c) => c.status === "active").length})</TabsTrigger>
          <TabsTrigger value="expired">Expired ({coupons.filter((c) => c.status === "expired").length})</TabsTrigger>
          <TabsTrigger value="draft">Draft ({coupons.filter((c) => c.status === "draft").length})</TabsTrigger>
        </TabsList>

        <TabsContent value={statusFilter} className="mt-4">
          <DataTable
            columns={columns}
            data={filteredCoupons}
            searchKey="code"
            searchPlaceholder="Search coupons..."
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
