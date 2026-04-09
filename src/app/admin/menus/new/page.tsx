"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PageHeader } from "@/components/admin/shared/page-header";

type MenuLocation = "HEADER" | "FOOTER" | "MOBILE" | "SIDEBAR";

function generateSlug(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export default function CreateMenuPage() {
  const router = useRouter();
  const [menuName, setMenuName] = React.useState("");
  const [menuSlug, setMenuSlug] = React.useState("");
  const [menuLocation, setMenuLocation] =
    React.useState<MenuLocation>("HEADER");
  const [creating, setCreating] = React.useState(false);

  function handleNameChange(name: string) {
    setMenuName(name);
    setMenuSlug(generateSlug(name));
  }

  async function handleCreateMenu() {
    if (!menuName || !menuSlug) return;
    setCreating(true);
    try {
      const res = await fetch("/api/admin/menus", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: menuName,
          slug: menuSlug,
          location: menuLocation,
        }),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(json?.error || "Failed to create menu");
      }
      toast.success("Menu created");
      router.push(`/admin/menus/${json.data.id}`);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to create menu",
      );
      setCreating(false);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Create Menu" description="Set up a new navigation menu">
        <Button variant="outline" asChild>
          <Link href="/admin/menus">
            <ArrowLeft className="size-4" />
            Back
          </Link>
        </Button>
      </PageHeader>

      <Card className="max-w-xl">
        <CardHeader>
          <CardTitle className="text-base">Menu Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Name</Label>
            <Input
              placeholder="e.g., Main Navigation"
              value={menuName}
              onChange={(e) => handleNameChange(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Slug</Label>
            <Input
              placeholder="auto-generated"
              value={menuSlug}
              onChange={(e) => setMenuSlug(e.target.value)}
              className="font-mono text-sm"
            />
          </div>
          <div className="space-y-2">
            <Label>Location</Label>
            <Select
              value={menuLocation}
              onValueChange={(val) => setMenuLocation(val as MenuLocation)}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="HEADER">Header</SelectItem>
                <SelectItem value="FOOTER">Footer</SelectItem>
                <SelectItem value="MOBILE">Mobile</SelectItem>
                <SelectItem value="SIDEBAR">Sidebar</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Only one active menu per location is rendered on the storefront.
            </p>
          </div>
          <Separator />
          <Button
            className="w-full"
            onClick={handleCreateMenu}
            disabled={!menuName || !menuSlug || creating}
          >
            {creating ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Creating…
              </>
            ) : (
              "Create Menu"
            )}
          </Button>
          <p className="text-xs text-muted-foreground text-center">
            You&apos;ll add menu items in the next step.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
