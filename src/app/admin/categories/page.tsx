"use client";

import * as React from "react";
import {
  Plus,
  Edit,
  Trash2,
  ChevronRight,
  FolderOpen,
  Upload,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PageHeader } from "@/components/admin/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";

// --- Types ---

type Category = {
  id: string;
  name: string;
  slug: string;
  description: string;
  parentId: string | null;
  productsCount: number;
  status: "active" | "draft";
  children?: Category[];
};

// --- Hardcoded Data ---

const categories: Category[] = [
  {
    id: "1",
    name: "Living Room",
    slug: "living-room",
    description: "Furniture and decor for living spaces",
    parentId: null,
    productsCount: 42,
    status: "active",
    children: [
      { id: "1a", name: "Sofas & Couches", slug: "sofas-couches", description: "", parentId: "1", productsCount: 18, status: "active" },
      { id: "1b", name: "Coffee Tables", slug: "coffee-tables", description: "", parentId: "1", productsCount: 12, status: "active" },
      { id: "1c", name: "TV Stands", slug: "tv-stands", description: "", parentId: "1", productsCount: 8, status: "active" },
      { id: "1d", name: "Accent Chairs", slug: "accent-chairs", description: "", parentId: "1", productsCount: 4, status: "draft" },
    ],
  },
  {
    id: "2",
    name: "Dining Room",
    slug: "dining-room",
    description: "Tables, chairs, and dining accessories",
    parentId: null,
    productsCount: 28,
    status: "active",
    children: [
      { id: "2a", name: "Dining Tables", slug: "dining-tables", description: "", parentId: "2", productsCount: 15, status: "active" },
      { id: "2b", name: "Dining Chairs", slug: "dining-chairs", description: "", parentId: "2", productsCount: 10, status: "active" },
      { id: "2c", name: "Bar Stools", slug: "bar-stools", description: "", parentId: "2", productsCount: 3, status: "active" },
    ],
  },
  {
    id: "3",
    name: "Bedroom",
    slug: "bedroom",
    description: "Beds, dressers, and bedroom furniture",
    parentId: null,
    productsCount: 35,
    status: "active",
    children: [
      { id: "3a", name: "Beds & Frames", slug: "beds-frames", description: "", parentId: "3", productsCount: 14, status: "active" },
      { id: "3b", name: "Dressers", slug: "dressers", description: "", parentId: "3", productsCount: 9, status: "active" },
      { id: "3c", name: "Nightstands", slug: "nightstands", description: "", parentId: "3", productsCount: 12, status: "active" },
    ],
  },
  {
    id: "4",
    name: "Office",
    slug: "office",
    description: "Desks, office chairs, and workspace furniture",
    parentId: null,
    productsCount: 22,
    status: "active",
    children: [
      { id: "4a", name: "Desks", slug: "desks", description: "", parentId: "4", productsCount: 10, status: "active" },
      { id: "4b", name: "Office Chairs", slug: "office-chairs", description: "", parentId: "4", productsCount: 8, status: "active" },
      { id: "4c", name: "Bookcases", slug: "bookcases", description: "", parentId: "4", productsCount: 4, status: "draft" },
    ],
  },
  {
    id: "5",
    name: "Outdoor",
    slug: "outdoor",
    description: "Patio and garden furniture",
    parentId: null,
    productsCount: 18,
    status: "active",
    children: [
      { id: "5a", name: "Patio Sets", slug: "patio-sets", description: "", parentId: "5", productsCount: 6, status: "active" },
      { id: "5b", name: "Garden Furniture", slug: "garden-furniture", description: "", parentId: "5", productsCount: 7, status: "active" },
      { id: "5c", name: "Planters", slug: "planters", description: "", parentId: "5", productsCount: 5, status: "active" },
    ],
  },
  {
    id: "6",
    name: "Lighting",
    slug: "lighting",
    description: "Lamps, pendants, and lighting fixtures",
    parentId: null,
    productsCount: 24,
    status: "active",
    children: [
      { id: "6a", name: "Table Lamps", slug: "table-lamps", description: "", parentId: "6", productsCount: 8, status: "active" },
      { id: "6b", name: "Floor Lamps", slug: "floor-lamps", description: "", parentId: "6", productsCount: 6, status: "active" },
      { id: "6c", name: "Pendant Lights", slug: "pendant-lights", description: "", parentId: "6", productsCount: 10, status: "active" },
    ],
  },
];

// --- Helper ---

function generateSlug(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

// --- Component ---

export default function CategoriesPage() {
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [formData, setFormData] = React.useState({
    name: "",
    slug: "",
    description: "",
    parentId: "",
    status: "active",
  });

  function handleNameChange(name: string) {
    setFormData((prev) => ({
      ...prev,
      name,
      slug: generateSlug(name),
    }));
  }

  function handleSubmit() {
    console.log("Category data:", formData);
    setDialogOpen(false);
    setFormData({ name: "", slug: "", description: "", parentId: "", status: "active" });
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Categories"
        description="Organize your product catalog"
      >
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="size-4" />
              Add Category
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Category</DialogTitle>
              <DialogDescription>
                Create a new product category or subcategory.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Name</Label>
                <Input
                  placeholder="Category name"
                  value={formData.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Slug</Label>
                <Input
                  placeholder="auto-generated"
                  value={formData.slug}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, slug: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  placeholder="Category description (optional)"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, description: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Parent Category</Label>
                <Select
                  value={formData.parentId}
                  onValueChange={(val) =>
                    setFormData((prev) => ({ ...prev, parentId: val }))
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="None (top-level)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None (top-level)</SelectItem>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(val) =>
                    setFormData((prev) => ({ ...prev, status: val }))
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Image</Label>
                <div className="border-2 border-dashed rounded-lg p-6 text-center hover:border-primary/50 transition-colors cursor-pointer">
                  <Upload className="size-6 mx-auto text-muted-foreground mb-2" />
                  <p className="text-xs text-muted-foreground">
                    Click to upload category image
                  </p>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSubmit}>Create Category</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </PageHeader>

      {/* Categories Table with Hierarchy */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead className="text-center">Products</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories.map((category) => (
              <React.Fragment key={category.id}>
                {/* Parent Row */}
                <TableRow>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <FolderOpen className="size-4 text-muted-foreground" />
                      <span className="font-medium">{category.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {category.slug}
                  </TableCell>
                  <TableCell className="text-center">
                    {category.productsCount}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={category.status} />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="icon-xs">
                        <Edit className="size-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon-xs">
                        <Trash2 className="size-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>

                {/* Children Rows */}
                {category.children?.map((child) => (
                  <TableRow key={child.id}>
                    <TableCell>
                      <div className="flex items-center gap-2 pl-8">
                        <ChevronRight className="size-3.5 text-muted-foreground" />
                        <span className="text-sm">{child.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {child.slug}
                    </TableCell>
                    <TableCell className="text-center text-sm">
                      {child.productsCount}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={child.status} />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon-xs">
                          <Edit className="size-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon-xs">
                          <Trash2 className="size-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </React.Fragment>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
