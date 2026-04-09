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
import { StatusBadge } from "@/components/shared/status-badge";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";

// --- Types ---

type ApiPage = {
  id: string;
  title: string;
  slug: string;
  status: "PUBLISHED" | "DRAFT" | "SCHEDULED" | "ARCHIVED";
  updatedAt: string;
  publishedAt: string | null;
};

type PageRow = {
  id: string;
  title: string;
  slug: string;
  status: string;
  lastModified: string;
};

function mapApiPage(p: ApiPage): PageRow {
  return {
    id: p.id,
    title: p.title,
    slug: `/${p.slug}`,
    status: p.status.toLowerCase(),
    lastModified: p.updatedAt,
  };
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function createColumns(
  onDelete: (row: PageRow) => void,
): ColumnDef<PageRow>[] {
  return [
    {
      accessorKey: "title",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Title" />
      ),
      cell: ({ row }) => (
        <span className="font-medium">{row.original.title}</span>
      ),
    },
    {
      accessorKey: "slug",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Slug" />
      ),
      cell: ({ row }) => (
        <span className="text-muted-foreground font-mono text-sm">
          {row.original.slug}
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
      accessorKey: "lastModified",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Last Modified" />
      ),
      cell: ({ row }) => (
        <span className="text-muted-foreground">
          {formatDate(row.original.lastModified)}
        </span>
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
          <Button
            variant="ghost"
            size="sm"
            className="text-destructive hover:text-destructive"
            onClick={() => onDelete(row.original)}
          >
            <Trash2 className="mr-1 size-4" />
            Delete
          </Button>
        </div>
      ),
      enableSorting: false,
    },
  ];
}

export default function ContentListPage() {
  const [pages, setPages] = React.useState<PageRow[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [deleteTarget, setDeleteTarget] = React.useState<PageRow | null>(null);
  const [deleting, setDeleting] = React.useState(false);

  const fetchPages = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/pages?limit=100");
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || "Failed to load pages");
      }
      const json = await res.json();
      setPages((json.data as ApiPage[]).map(mapApiPage));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to load pages");
      setPages([]);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchPages();
  }, [fetchPages]);

  const handleDeleteRequest = React.useCallback((row: PageRow) => {
    setDeleteTarget(row);
  }, []);

  async function handleConfirmDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/pages/${deleteTarget.id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || "Failed to delete page");
      }
      toast.success(`Deleted "${deleteTarget.title}"`);
      setDeleteTarget(null);
      fetchPages();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete page");
    } finally {
      setDeleting(false);
    }
  }

  const columns = React.useMemo(
    () => createColumns(handleDeleteRequest),
    [handleDeleteRequest],
  );

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

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
          <span className="ml-2 text-muted-foreground">Loading pages...</span>
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={pages}
          searchKey="title"
          searchPlaceholder="Search pages..."
        />
      )}

      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open && !deleting) setDeleteTarget(null);
        }}
        title="Delete Page"
        description={
          deleteTarget
            ? `Are you sure you want to delete "${deleteTarget.title}"? This cannot be undone.`
            : ""
        }
        confirmLabel={deleting ? "Deleting…" : "Delete Page"}
        cancelLabel="Cancel"
        onConfirm={handleConfirmDelete}
        variant="destructive"
      />
    </div>
  );
}
