"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { Plus, Edit, Trash2, FolderOpen } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PageHeader } from "@/components/admin/shared/page-header";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { EmptyState } from "@/components/shared/empty-state";

type Project = {
  id: string;
  title: string;
  slug: string;
  category: string | null;
  location: string | null;
  status: string;
  isFeatured: boolean;
  completedAt: string | null;
  createdAt: string;
  media: { url: string; type: string }[];
};

export default function ProjectsPage() {
  const [projects, setProjects] = React.useState<Project[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [deleteId, setDeleteId] = React.useState<string | null>(null);

  const fetchProjects = React.useCallback(async () => {
    try {
      const res = await fetch("/api/admin/projects");
      const data = await res.json();
      setProjects(data.data || []);
    } catch {
      toast.error("Failed to load projects");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      const res = await fetch(`/api/admin/projects/${deleteId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        toast.success("Project deleted");
        setProjects((prev) => prev.filter((p) => p.id !== deleteId));
      } else {
        toast.error("Failed to delete project");
      }
    } catch {
      toast.error("Failed to delete project");
    }
    setDeleteId(null);
  };

  const statusColor = (status: string) => {
    switch (status) {
      case "PUBLISHED":
        return "default";
      case "DRAFT":
        return "secondary";
      case "ARCHIVED":
        return "outline";
      default:
        return "secondary";
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Completed Projects"
        description="Showcase your completed furniture installations"
      >
        <Button asChild>
          <Link href="/admin/projects/new">
            <Plus className="mr-2 h-4 w-4" />
            Add Project
          </Link>
        </Button>
      </PageHeader>

      {loading ? (
        <div className="flex justify-center py-12 text-muted-foreground">
          Loading...
        </div>
      ) : projects.length === 0 ? (
        <EmptyState
          icon={FolderOpen}
          title="No projects yet"
          description="Add your first completed project to showcase your work."
          actionLabel="Add Project"
          actionHref="/admin/projects/new"
        />
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">Image</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-24">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {projects.map((project) => (
                <TableRow key={project.id}>
                  <TableCell>
                    {project.media[0] ? (
                      <div className="relative size-10 overflow-hidden rounded bg-muted">
                        <Image
                          src={project.media[0].url}
                          alt={project.title}
                          fill
                          className="object-cover"
                          sizes="40px"
                        />
                      </div>
                    ) : (
                      <div className="flex size-10 items-center justify-center rounded bg-muted">
                        <FolderOpen className="size-4 text-muted-foreground" />
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{project.title}</p>
                      {project.isFeatured && (
                        <Badge variant="outline" className="mt-1 text-xs">
                          Featured
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{project.category || "-"}</TableCell>
                  <TableCell>{project.location || "-"}</TableCell>
                  <TableCell>
                    <Badge variant={statusColor(project.status)}>
                      {project.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" asChild>
                        <Link href={`/admin/projects/${project.id}`}>
                          <Edit className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeleteId(project.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Delete Project"
        description="Are you sure you want to delete this project? This action cannot be undone."
        onConfirm={handleDelete}
        confirmLabel="Delete"
        variant="destructive"
      />
    </div>
  );
}
