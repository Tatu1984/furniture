"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/admin/shared/page-header";

type MediaItem = {
  url: string;
  type: "IMAGE" | "VIDEO";
  caption: string;
};

const PROJECT_CATEGORIES = [
  "Living Room",
  "Bedroom",
  "Kitchen",
  "Office",
  "Dining Room",
  "Outdoor",
  "Commercial",
  "Hospitality",
];

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

export default function NewProjectPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = React.useState(false);

  const [title, setTitle] = React.useState("");
  const [slug, setSlug] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [category, setCategory] = React.useState("");
  const [location, setLocation] = React.useState("");
  const [clientName, setClientName] = React.useState("");
  const [completedAt, setCompletedAt] = React.useState("");
  const [status, setStatus] = React.useState("DRAFT");
  const [isFeatured, setIsFeatured] = React.useState(false);
  const [media, setMedia] = React.useState<MediaItem[]>([
    { url: "", type: "IMAGE", caption: "" },
  ]);

  const handleTitleChange = (value: string) => {
    setTitle(value);
    setSlug(slugify(value));
  };

  const addMedia = () => {
    setMedia([...media, { url: "", type: "IMAGE", caption: "" }]);
  };

  const removeMedia = (index: number) => {
    setMedia(media.filter((_, i) => i !== index));
  };

  const updateMedia = (
    index: number,
    field: keyof MediaItem,
    value: string,
  ) => {
    const updated = [...media];
    updated[index] = { ...updated[index], [field]: value };
    setMedia(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !slug) {
      toast.error("Title and slug are required");
      return;
    }

    setIsLoading(true);
    try {
      const validMedia = media.filter((m) => m.url.trim());
      const res = await fetch("/api/admin/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          slug,
          description,
          category: category || null,
          location: location || null,
          clientName: clientName || null,
          completedAt: completedAt || null,
          status,
          isFeatured,
          media: validMedia,
        }),
      });

      if (res.ok) {
        toast.success("Project created!");
        router.push("/admin/projects");
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to create project");
      }
    } catch {
      toast.error("Failed to create project");
    }
    setIsLoading(false);
  };

  return (
    <div className="space-y-6">
      <PageHeader title="New Project" description="Add a completed project to your portfolio" />

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Project Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Title *</Label>
                <Input
                  value={title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="Modern Living Room Setup"
                />
              </div>
              <div className="space-y-2">
                <Label>Slug *</Label>
                <Input
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="modern-living-room-setup"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the project..."
                rows={4}
              />
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {PROJECT_CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Location</Label>
                <Input
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Mumbai, Maharashtra"
                />
              </div>
              <div className="space-y-2">
                <Label>Client Name</Label>
                <Input
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="Acme Corp"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label>Completed Date</Label>
                <Input
                  type="date"
                  value={completedAt}
                  onChange={(e) => setCompletedAt(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DRAFT">Draft</SelectItem>
                    <SelectItem value="PUBLISHED">Published</SelectItem>
                    <SelectItem value="ARCHIVED">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end gap-2 pb-2">
                <Switch
                  checked={isFeatured}
                  onCheckedChange={setIsFeatured}
                  id="featured"
                />
                <Label htmlFor="featured">Featured Project</Label>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Media (Images & Videos)</CardTitle>
              <Button type="button" variant="outline" size="sm" onClick={addMedia}>
                <Plus className="mr-1 h-4 w-4" />
                Add Media
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {media.map((item, index) => (
              <div
                key={index}
                className="flex items-start gap-3 rounded-lg border p-3"
              >
                <div className="flex-1 space-y-3">
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                    <div className="md:col-span-2 space-y-1">
                      <Label className="text-xs">URL *</Label>
                      <Input
                        value={item.url}
                        onChange={(e) =>
                          updateMedia(index, "url", e.target.value)
                        }
                        placeholder="https://example.com/image.jpg or YouTube URL"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Type</Label>
                      <Select
                        value={item.type}
                        onValueChange={(v) =>
                          updateMedia(index, "type", v)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="IMAGE">Image</SelectItem>
                          <SelectItem value="VIDEO">Video</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Caption</Label>
                    <Input
                      value={item.caption}
                      onChange={(e) =>
                        updateMedia(index, "caption", e.target.value)
                      }
                      placeholder="Optional caption"
                    />
                  </div>
                </div>
                {media.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeMedia(index)}
                    className="mt-5"
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/admin/projects")}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Create Project
          </Button>
        </div>
      </form>
    </div>
  );
}
