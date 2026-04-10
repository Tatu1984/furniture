"use client";

import * as React from "react";
import Link from "next/link";
import { toast } from "sonner";
import { type ColumnDef } from "@tanstack/react-table";
import { Eye, Loader2 } from "lucide-react";

import { PageHeader } from "@/components/admin/shared/page-header";
import {
  DataTable,
  DataTableColumnHeader,
} from "@/components/admin/shared/data-table";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { formatPrice } from "@/lib/format";

type Customer = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  orderCount: number;
  totalSpent: number;
  createdAt: string;
};

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

const columns: ColumnDef<Customer>[] = [
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
    accessorKey: "avatar",
    header: "",
    cell: ({ row }) => (
      <Avatar size="sm">
        <AvatarFallback>
          {(row.original.firstName?.[0] ?? "").toUpperCase()}
          {(row.original.lastName?.[0] ?? "").toUpperCase()}
        </AvatarFallback>
      </Avatar>
    ),
    enableSorting: false,
  },
  {
    id: "name",
    accessorFn: (row) => `${row.firstName} ${row.lastName}`,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Name" />
    ),
    cell: ({ row }) => (
      <span className="font-medium">
        {row.original.firstName} {row.original.lastName}
      </span>
    ),
  },
  {
    accessorKey: "email",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Email" />
    ),
    cell: ({ row }) => (
      <span className="text-muted-foreground">{row.original.email}</span>
    ),
  },
  {
    accessorKey: "orderCount",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Orders" />
    ),
    cell: ({ row }) => row.original.orderCount,
  },
  {
    accessorKey: "totalSpent",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Total Spent" />
    ),
    cell: ({ row }) => (
      <span className="font-medium">
        {formatPrice(row.original.totalSpent)}
      </span>
    ),
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Joined" />
    ),
    cell: ({ row }) => formatDate(row.original.createdAt),
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => (
      <Link href={`/admin/customers/${row.original.id}`}>
        <Button variant="ghost" size="sm">
          <Eye className="mr-1 size-4" />
          View
        </Button>
      </Link>
    ),
    enableSorting: false,
  },
];

export default function CustomersPage() {
  const [customers, setCustomers] = React.useState<Customer[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/admin/customers?limit=100");
        if (!res.ok) throw new Error("Failed to load customers");
        const json = await res.json();
        setCustomers(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (json.data ?? []).map((c: any) => ({
            id: c.id,
            firstName: c.firstName ?? "",
            lastName: c.lastName ?? "",
            email: c.email,
            orderCount: c._count?.orders ?? 0,
            totalSpent: Number(c.totalSpent ?? 0),
            createdAt: c.createdAt,
          })),
        );
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : "Failed to load customers",
        );
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader title="Customers" description="Manage your customer base" />
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
          <span className="ml-2 text-muted-foreground">
            Loading customers...
          </span>
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={customers}
          searchKey="name"
          searchPlaceholder="Search by name or email..."
        />
      )}
    </div>
  );
}
