"use client";

import * as React from "react";
import Link from "next/link";
import { type ColumnDef } from "@tanstack/react-table";
import { Plus, Pencil, Trash2 } from "lucide-react";

import { PageHeader } from "@/components/admin/shared/page-header";
import { DataTable, DataTableColumnHeader } from "@/components/admin/shared/data-table";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/shared/status-badge";

interface ContentPage {
  id: string;
  title: string;
  slug: string;
  status: "published" | "draft";
  lastModified: string;
}

const contentPages: ContentPage[] = [
  { id: "page-001", title: "Home", slug: "/", status: "published", lastModified: "2025-12-10T14:30:00Z" },
  { id: "page-002", title: "About Us", slug: "/about", status: "published", lastModified: "2025-11-25T10:00:00Z" },
  { id: "page-003", title: "Contact", slug: "/contact", status: "published", lastModified: "2025-11-20T16:45:00Z" },
  { id: "page-004", title: "FAQ", slug: "/faq", status: "published", lastModified: "2025-12-01T09:15:00Z" },
  { id: "page-005", title: "Shipping Policy", slug: "/shipping-policy", status: "published", lastModified: "2025-10-15T11:30:00Z" },
  { id: "page-006", title: "Privacy Policy", slug: "/privacy-policy", status: "published", lastModified: "2025-09-20T14:00:00Z" },
  { id: "page-007", title: "Terms & Conditions", slug: "/terms", status: "published", lastModified: "2025-09-20T14:00:00Z" },
  { id: "page-008", title: "Sustainability", slug: "/sustainability", status: "draft", lastModified: "2025-12-12T08:00:00Z" },
];

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const columns: ColumnDef<ContentPage>[] = [
  {
    accessorKey: "title",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Title" />,
    cell: ({ row }) => <span className="font-medium">{row.original.title}</span>,
  },
  {
    accessorKey: "slug",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Slug" />,
    cell: ({ row }) => (
      <span className="text-muted-foreground font-mono text-sm">{row.original.slug}</span>
    ),
  },
  {
    accessorKey: "status",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
    cell: ({ row }) => <StatusBadge status={row.original.status} />,
  },
  {
    accessorKey: "lastModified",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Last Modified" />,
    cell: ({ row }) => (
      <span className="text-muted-foreground">{formatDate(row.original.lastModified)}</span>
    ),
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => (
      <div className="flex items-center gap-1">
        <Link href={`/admin/content/${row.original.id}`}>
          <Button variant="ghost" size="sm">
            <Pencil className="mr-1 size-4" />
            Edit
          </Button>
        </Link>
        <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
          <Trash2 className="mr-1 size-4" />
          Delete
        </Button>
      </div>
    ),
    enableSorting: false,
  },
];

export default function ContentListPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Content Pages" description="Manage your site content">
        <Link href="/admin/content/new">
          <Button>
            <Plus className="mr-2 size-4" />
            Create Page
          </Button>
        </Link>
      </PageHeader>
      <DataTable
        columns={columns}
        data={contentPages}
        searchKey="title"
        searchPlaceholder="Search pages..."
      />
    </div>
  );
}
