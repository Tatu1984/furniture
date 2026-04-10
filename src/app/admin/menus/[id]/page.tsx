"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  ArrowLeft,
  GripVertical,
  Eye,
  EyeOff,
  Edit,
  Trash2,
  Plus,
  ChevronRight,
  Loader2,
  ArrowUp,
  ArrowDown,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
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
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { PageHeader } from "@/components/admin/shared/page-header";

// --- Types ---

type MenuItemType = "CUSTOM" | "PAGE" | "CATEGORY" | "PRODUCT" | "BLOG";
type MenuLocation = "HEADER" | "FOOTER" | "MOBILE" | "SIDEBAR";

type ApiMenuItem = {
  id: string;
  menuId: string;
  parentId: string | null;
  title: string;
  url: string | null;
  type: MenuItemType;
  targetId: string | null;
  target: string;
  sortOrder: number;
  isActive: boolean;
  children?: ApiMenuItem[];
};

type ApiMenu = {
  id: string;
  name: string;
  slug: string;
  location: MenuLocation;
  items: ApiMenuItem[];
};

type CategoryOption = {
  id: string;
  name: string;
  slug: string;
  parent: { id: string; name: string } | null;
};

type PageOption = {
  id: string;
  title: string;
  slug: string;
};

// --- Helpers ---

const typeConfig: Record<MenuItemType, { label: string; className: string }> = {
  CUSTOM: { label: "Link", className: "bg-gray-100 text-gray-700 border-gray-200" },
  PAGE: { label: "Page", className: "bg-blue-50 text-blue-700 border-blue-200" },
  CATEGORY: {
    label: "Category",
    className: "bg-amber-50 text-amber-700 border-amber-200",
  },
  PRODUCT: {
    label: "Product",
    className: "bg-green-50 text-green-700 border-green-200",
  },
  BLOG: { label: "Blog", className: "bg-pink-50 text-pink-700 border-pink-200" },
};

function generateSlug(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

// --- Sub-components ---

function MenuItemRow({
  item,
  isChild = false,
  canMoveUp,
  canMoveDown,
  onToggleVisibility,
  onEdit,
  onDelete,
  onMoveUp,
  onMoveDown,
}: {
  item: ApiMenuItem;
  isChild?: boolean;
  canMoveUp: boolean;
  canMoveDown: boolean;
  onToggleVisibility: (item: ApiMenuItem) => void;
  onEdit: (item: ApiMenuItem) => void;
  onDelete: (item: ApiMenuItem) => void;
  onMoveUp: (item: ApiMenuItem) => void;
  onMoveDown: (item: ApiMenuItem) => void;
}) {
  const typeStyle = typeConfig[item.type];

  return (
    <div
      className={`flex items-center gap-2 py-2.5 px-3 rounded-md hover:bg-muted/50 transition-colors group ${
        isChild ? "ml-8" : ""
      }`}
    >
      {isChild && (
        <ChevronRight className="size-3 text-muted-foreground shrink-0" />
      )}
      <GripVertical className="size-4 text-muted-foreground shrink-0" />
      <span
        className={`text-sm font-medium truncate flex-1 ${
          !item.isActive ? "opacity-50 line-through" : ""
        }`}
      >
        {item.title}
      </span>
      {item.url && (
        <span className="text-xs text-muted-foreground font-mono truncate max-w-[160px] hidden sm:inline">
          {item.url}
        </span>
      )}
      <Badge
        variant="outline"
        className={`text-[10px] px-1.5 py-0 shrink-0 ${typeStyle.className}`}
      >
        {typeStyle.label}
      </Badge>
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button
          variant="ghost"
          size="icon-xs"
          disabled={!canMoveUp}
          onClick={() => onMoveUp(item)}
          title="Move up"
        >
          <ArrowUp className="size-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="icon-xs"
          disabled={!canMoveDown}
          onClick={() => onMoveDown(item)}
          title="Move down"
        >
          <ArrowDown className="size-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="icon-xs"
          onClick={() => onToggleVisibility(item)}
          title={item.isActive ? "Hide item" : "Show item"}
        >
          {item.isActive ? (
            <Eye className="size-3.5" />
          ) : (
            <EyeOff className="size-3.5" />
          )}
        </Button>
        <Button variant="ghost" size="icon-xs" onClick={() => onEdit(item)}>
          <Edit className="size-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="icon-xs"
          className="text-destructive hover:text-destructive"
          onClick={() => onDelete(item)}
        >
          <Trash2 className="size-3.5" />
        </Button>
      </div>
    </div>
  );
}

// --- Page ---

type NewItemForm = {
  type: MenuItemType;
  title: string;
  url: string;
  targetId: string;
  parentId: string;
  openInNewTab: boolean;
};

const EMPTY_NEW_ITEM: NewItemForm = {
  type: "CUSTOM",
  title: "",
  url: "",
  targetId: "",
  parentId: "",
  openInNewTab: false,
};

export default function MenuEditorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: menuId } = React.use(params);
  const router = useRouter();

  const [menu, setMenu] = React.useState<ApiMenu | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [savingMenu, setSavingMenu] = React.useState(false);

  const [categories, setCategories] = React.useState<CategoryOption[]>([]);
  const [pages, setPages] = React.useState<PageOption[]>([]);

  // Settings form state
  const [menuName, setMenuName] = React.useState("");
  const [menuSlug, setMenuSlug] = React.useState("");
  const [menuLocation, setMenuLocation] =
    React.useState<MenuLocation>("HEADER");

  // Add item dialog state
  const [addOpen, setAddOpen] = React.useState(false);
  const [addBusy, setAddBusy] = React.useState(false);
  const [newItem, setNewItem] = React.useState<NewItemForm>(EMPTY_NEW_ITEM);

  // Edit item dialog state
  const [editOpen, setEditOpen] = React.useState(false);
  const [editBusy, setEditBusy] = React.useState(false);
  const [editingItem, setEditingItem] = React.useState<ApiMenuItem | null>(
    null,
  );

  // ── Loaders ───────────────────────────────────────────────────────────
  const fetchMenu = React.useCallback(async () => {
    try {
      const res = await fetch(`/api/admin/menus/${menuId}`);
      if (!res.ok) throw new Error("Menu not found");
      const json = await res.json();
      const m = json.data as ApiMenu;
      setMenu(m);
      setMenuName(m.name);
      setMenuSlug(m.slug);
      setMenuLocation(m.location);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to load menu");
    } finally {
      setLoading(false);
    }
  }, [menuId]);

  React.useEffect(() => {
    fetchMenu();
  }, [fetchMenu]);

  React.useEffect(() => {
    // Categories for picker
    fetch("/api/admin/categories?flat=true&limit=100")
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => {
        if (j?.data) setCategories(j.data);
      })
      .catch(() => {});

    // Pages for picker
    fetch("/api/admin/pages?limit=100&status=PUBLISHED")
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => {
        if (j?.data) setPages(j.data);
      })
      .catch(() => {});
  }, []);

  // ── Helpers to find / locate items ────────────────────────────────────
  function siblingsOf(item: ApiMenuItem): ApiMenuItem[] {
    if (!menu) return [];
    if (!item.parentId) return menu.items;
    const parent = menu.items.find((i) => i.id === item.parentId);
    return parent?.children ?? [];
  }

  function indexAmongSiblings(item: ApiMenuItem): number {
    return siblingsOf(item).findIndex((s) => s.id === item.id);
  }

  // ── Save menu settings ───────────────────────────────────────────────
  async function handleSaveMenu() {
    if (!menu) return;
    setSavingMenu(true);
    try {
      const res = await fetch(`/api/admin/menus/${menu.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: menuName,
          slug: menuSlug,
          location: menuLocation,
        }),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok) throw new Error(json?.error || "Failed to save menu");
      toast.success("Menu settings saved");
      await fetchMenu();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to save menu",
      );
    } finally {
      setSavingMenu(false);
    }
  }

  // ── Add item ─────────────────────────────────────────────────────────
  function openAddDialog() {
    setNewItem(EMPTY_NEW_ITEM);
    setAddOpen(true);
  }

  function handleNewItemTypeChange(type: MenuItemType) {
    setNewItem((prev) => ({
      ...prev,
      type,
      title: "",
      url: "",
      targetId: "",
    }));
  }

  function handlePickCategory(catId: string) {
    const cat = categories.find((c) => c.id === catId);
    if (!cat) return;
    setNewItem((prev) => ({
      ...prev,
      targetId: cat.id,
      title: cat.name,
      url: `/categories/${cat.slug}`,
    }));
  }

  function handlePickPage(pageId: string) {
    const p = pages.find((x) => x.id === pageId);
    if (!p) return;
    setNewItem((prev) => ({
      ...prev,
      targetId: p.id,
      title: p.title,
      url: `/${p.slug}`,
    }));
  }

  async function handleCreateItem() {
    if (!menu) return;
    if (!newItem.title) {
      toast.error("Title is required");
      return;
    }
    setAddBusy(true);
    try {
      const res = await fetch(`/api/admin/menus/${menu.id}/items`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newItem.title,
          url: newItem.url || null,
          type: newItem.type,
          targetId: newItem.targetId || null,
          target: newItem.openInNewTab ? "_blank" : "_self",
          parentId:
            newItem.parentId && newItem.parentId !== "none"
              ? newItem.parentId
              : null,
        }),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok) throw new Error(json?.error || "Failed to add item");
      toast.success("Menu item added");
      setAddOpen(false);
      await fetchMenu();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to add item");
    } finally {
      setAddBusy(false);
    }
  }

  // ── Edit item ────────────────────────────────────────────────────────
  function openEditDialog(item: ApiMenuItem) {
    setEditingItem({ ...item });
    setEditOpen(true);
  }

  async function handleSaveEdit() {
    if (!menu || !editingItem) return;
    setEditBusy(true);
    try {
      const res = await fetch(
        `/api/admin/menus/${menu.id}/items/${editingItem.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: editingItem.title,
            url: editingItem.url,
            type: editingItem.type,
            targetId: editingItem.targetId,
            target: editingItem.target,
            isActive: editingItem.isActive,
          }),
        },
      );
      const json = await res.json().catch(() => null);
      if (!res.ok) throw new Error(json?.error || "Failed to save item");
      toast.success("Item updated");
      setEditOpen(false);
      setEditingItem(null);
      await fetchMenu();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save item");
    } finally {
      setEditBusy(false);
    }
  }

  // ── Delete item ──────────────────────────────────────────────────────
  async function handleDelete(item: ApiMenuItem) {
    if (!menu) return;
    if (
      !confirm(
        `Delete "${item.title}"${
          item.children?.length ? " and all its child items" : ""
        }?`,
      )
    ) {
      return;
    }
    try {
      const res = await fetch(
        `/api/admin/menus/${menu.id}/items/${item.id}`,
        { method: "DELETE" },
      );
      const json = await res.json().catch(() => null);
      if (!res.ok) throw new Error(json?.error || "Failed to delete item");
      toast.success("Item deleted");
      await fetchMenu();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to delete item",
      );
    }
  }

  // ── Toggle visibility ────────────────────────────────────────────────
  async function handleToggleVisibility(item: ApiMenuItem) {
    if (!menu) return;
    try {
      const res = await fetch(
        `/api/admin/menus/${menu.id}/items/${item.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isActive: !item.isActive }),
        },
      );
      if (!res.ok) {
        const json = await res.json().catch(() => null);
        throw new Error(json?.error || "Failed to update item");
      }
      await fetchMenu();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to update item",
      );
    }
  }

  // ── Reorder ──────────────────────────────────────────────────────────
  async function handleMove(item: ApiMenuItem, direction: -1 | 1) {
    if (!menu) return;
    const siblings = siblingsOf(item);
    const idx = indexAmongSiblings(item);
    const swapIdx = idx + direction;
    if (swapIdx < 0 || swapIdx >= siblings.length) return;
    const reordered = [...siblings];
    const [moved] = reordered.splice(idx, 1);
    reordered.splice(swapIdx, 0, moved);
    try {
      const res = await fetch(`/api/admin/menus/${menu.id}/reorder`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: reordered.map((it, i) => ({
            id: it.id,
            sortOrder: i,
          })),
        }),
      });
      if (!res.ok) {
        const json = await res.json().catch(() => null);
        throw new Error(json?.error || "Failed to reorder");
      }
      await fetchMenu();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to reorder");
    }
  }

  // ── Render ───────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
        <span className="ml-2 text-muted-foreground">Loading menu...</span>
      </div>
    );
  }

  if (!menu) {
    return (
      <div className="space-y-4">
        <PageHeader title="Menu not found" description="">
          <Button variant="outline" onClick={() => router.push("/admin/menus")}>
            <ArrowLeft className="size-4" /> Back
          </Button>
        </PageHeader>
      </div>
    );
  }

  const topLevelItems = menu.items;

  return (
    <div className="space-y-6">
      <PageHeader title={menu.name} description="Edit menu structure and items">
        <Button variant="outline" asChild>
          <Link href="/admin/menus">
            <ArrowLeft className="size-4" />
            Back
          </Link>
        </Button>
      </PageHeader>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Menu Settings */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Menu Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Name</Label>
                <Input
                  value={menuName}
                  onChange={(e) => {
                    setMenuName(e.target.value);
                    setMenuSlug(generateSlug(e.target.value));
                  }}
                />
              </div>
              <div className="space-y-2">
                <Label>Slug</Label>
                <Input
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
              </div>
              <Separator />
              <Button
                className="w-full"
                onClick={handleSaveMenu}
                disabled={savingMenu}
              >
                {savingMenu ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Saving…
                  </>
                ) : (
                  "Save Menu"
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Menu Items */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Menu Items</CardTitle>
                <Button size="sm" onClick={openAddDialog}>
                  <Plus className="size-3.5" />
                  Add Menu Item
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {topLevelItems.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <p className="text-sm">No menu items yet.</p>
                  <p className="text-xs mt-1">
                    Click &quot;Add Menu Item&quot; to get started.
                  </p>
                </div>
              ) : (
                <div className="space-y-0.5">
                  {topLevelItems.map((item, i) => (
                    <React.Fragment key={item.id}>
                      <MenuItemRow
                        item={item}
                        canMoveUp={i > 0}
                        canMoveDown={i < topLevelItems.length - 1}
                        onToggleVisibility={handleToggleVisibility}
                        onEdit={openEditDialog}
                        onDelete={handleDelete}
                        onMoveUp={(it) => handleMove(it, -1)}
                        onMoveDown={(it) => handleMove(it, 1)}
                      />
                      {item.children?.map((child, j) => (
                        <MenuItemRow
                          key={child.id}
                          item={child}
                          isChild
                          canMoveUp={j > 0}
                          canMoveDown={j < (item.children?.length ?? 0) - 1}
                          onToggleVisibility={handleToggleVisibility}
                          onEdit={openEditDialog}
                          onDelete={handleDelete}
                          onMoveUp={(it) => handleMove(it, -1)}
                          onMoveDown={(it) => handleMove(it, 1)}
                        />
                      ))}
                    </React.Fragment>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Add Item Dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Menu Item</DialogTitle>
            <DialogDescription>
              Pick a category, page, or add a custom link.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Type</Label>
              <Select
                value={newItem.type}
                onValueChange={(val) =>
                  handleNewItemTypeChange(val as MenuItemType)
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CATEGORY">Category</SelectItem>
                  <SelectItem value="PAGE">Page</SelectItem>
                  <SelectItem value="CUSTOM">Custom Link</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {newItem.type === "CATEGORY" && (
              <div className="space-y-2">
                <Label>Category</Label>
                <Select
                  value={newItem.targetId}
                  onValueChange={handlePickCategory}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.length === 0 ? (
                      <div className="px-2 py-1.5 text-xs text-muted-foreground">
                        No categories found
                      </div>
                    ) : (
                      categories.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.parent ? `${c.parent.name} › ${c.name}` : c.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
            )}

            {newItem.type === "PAGE" && (
              <div className="space-y-2">
                <Label>Page</Label>
                <Select value={newItem.targetId} onValueChange={handlePickPage}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a page" />
                  </SelectTrigger>
                  <SelectContent>
                    {pages.length === 0 ? (
                      <div className="px-2 py-1.5 text-xs text-muted-foreground">
                        No published pages
                      </div>
                    ) : (
                      pages.map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.title}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <Label>Title</Label>
              <Input
                placeholder="Display label"
                value={newItem.title}
                onChange={(e) => {
                  const title = e.target.value;
                  setNewItem((prev) => ({
                    ...prev,
                    title,
                    // Auto-generate URL slug for custom links as user types
                    ...(prev.type === "CUSTOM"
                      ? {
                          url:
                            "/" +
                            title
                              .toLowerCase()
                              .replace(/[^a-z0-9]+/g, "-")
                              .replace(/(^-|-$)/g, ""),
                        }
                      : {}),
                  }));
                }}
              />
            </div>

            <div className="space-y-2">
              <Label>URL / Path</Label>
              <Input
                placeholder="/page-path or https://..."
                value={newItem.url}
                onChange={(e) =>
                  setNewItem((prev) => ({ ...prev, url: e.target.value }))
                }
                disabled={newItem.type === "CATEGORY" || newItem.type === "PAGE"}
                className={
                  newItem.type === "CATEGORY" || newItem.type === "PAGE"
                    ? "font-mono text-xs"
                    : ""
                }
              />
              {(newItem.type === "CATEGORY" || newItem.type === "PAGE") && (
                <p className="text-xs text-muted-foreground">
                  URL is filled in automatically from the selected{" "}
                  {newItem.type.toLowerCase()}.
                </p>
              )}
            </div>

            {topLevelItems.length > 0 && (
              <div className="space-y-2">
                <Label>Parent Item</Label>
                <Select
                  value={newItem.parentId || "none"}
                  onValueChange={(val) =>
                    setNewItem((prev) => ({ ...prev, parentId: val }))
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None (top-level)</SelectItem>
                    {topLevelItems.map((item) => (
                      <SelectItem key={item.id} value={item.id}>
                        {item.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleCreateItem}
              disabled={!newItem.title || addBusy}
            >
              {addBusy ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Adding…
                </>
              ) : (
                "Add Item"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Item Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Menu Item</DialogTitle>
            <DialogDescription>
              Update this menu item&apos;s details.
            </DialogDescription>
          </DialogHeader>
          {editingItem && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Title</Label>
                <Input
                  value={editingItem.title}
                  onChange={(e) =>
                    setEditingItem((prev) =>
                      prev ? { ...prev, title: e.target.value } : null,
                    )
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>URL / Path</Label>
                <Input
                  value={editingItem.url ?? ""}
                  onChange={(e) =>
                    setEditingItem((prev) =>
                      prev ? { ...prev, url: e.target.value } : null,
                    )
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <Label>Active</Label>
                <Switch
                  checked={editingItem.isActive}
                  onCheckedChange={(checked) =>
                    setEditingItem((prev) =>
                      prev ? { ...prev, isActive: checked } : null,
                    )
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <Label>Open in new tab</Label>
                <Switch
                  checked={editingItem.target === "_blank"}
                  onCheckedChange={(checked) =>
                    setEditingItem((prev) =>
                      prev
                        ? { ...prev, target: checked ? "_blank" : "_self" }
                        : null,
                    )
                  }
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveEdit} disabled={editBusy}>
              {editBusy ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Saving…
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
