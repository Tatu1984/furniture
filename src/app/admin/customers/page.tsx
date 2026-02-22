"use client";

import * as React from "react";
import Link from "next/link";
import { type ColumnDef } from "@tanstack/react-table";
import { Eye } from "lucide-react";

import { PageHeader } from "@/components/admin/shared/page-header";
import { DataTable, DataTableColumnHeader } from "@/components/admin/shared/data-table";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { customers, type Customer } from "@/lib/mock-data/customers";

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount);
}

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
        checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
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
        <AvatarImage src={row.original.avatar} alt={`${row.original.firstName} ${row.original.lastName}`} />
        <AvatarFallback>
          {row.original.firstName[0]}
          {row.original.lastName[0]}
        </AvatarFallback>
      </Avatar>
    ),
    enableSorting: false,
  },
  {
    id: "name",
    accessorFn: (row) => `${row.firstName} ${row.lastName}`,
    header: ({ column }) => <DataTableColumnHeader column={column} title="Name" />,
    cell: ({ row }) => (
      <span className="font-medium">
        {row.original.firstName} {row.original.lastName}
      </span>
    ),
  },
  {
    accessorKey: "email",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Email" />,
    cell: ({ row }) => (
      <span className="text-muted-foreground">{row.original.email}</span>
    ),
  },
  {
    accessorKey: "orderCount",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Orders" />,
    cell: ({ row }) => row.original.orderCount,
  },
  {
    accessorKey: "totalSpent",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Total Spent" />,
    cell: ({ row }) => (
      <span className="font-medium">{formatCurrency(row.original.totalSpent)}</span>
    ),
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Joined" />,
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
  return (
    <div className="space-y-6">
      <PageHeader title="Customers" description="Manage your customer base" />
      <DataTable
        columns={columns}
        data={customers}
        searchKey="name"
        searchPlaceholder="Search by name or email..."
      />
    </div>
  );
}
