"use client";

import * as React from "react";
import Link from "next/link";
import {
  ArrowLeft,
  GripVertical,
  Eye,
  EyeOff,
  Edit,
  Trash2,
  Plus,
  ChevronRight,
  ExternalLink,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
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
  DialogTrigger,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { PageHeader } from "@/components/admin/shared/page-header";

// --- Types ---

type MenuItemType = "link" | "page" | "category" | "product";

type MenuItem = {
  id: string;
  title: string;
  url: string;
  type: MenuItemType;
  visible: boolean;
  openInNewTab?: boolean;
  children?: MenuItem[];
};

type MenuLocation = "header" | "footer" | "mobile" | "sidebar";

// --- Helpers ---

const typeConfig: Record<MenuItemType, { label: string; className: string }> = {
  link: { label: "Link", className: "bg-gray-100 text-gray-700 border-gray-200" },
  page: { label: "Page", className: "bg-blue-50 text-blue-700 border-blue-200" },
  category: { label: "Category", className: "bg-amber-50 text-amber-700 border-amber-200" },
  product: { label: "Product", className: "bg-green-50 text-green-700 border-green-200" },
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
  onToggleVisibility,
  onEdit,
  onDelete,
}: {
  item: MenuItem;
  isChild?: boolean;
  onToggleVisibility: (id: string) => void;
  onEdit: (item: MenuItem) => void;
  onDelete: (id: string) => void;
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
      <GripVertical className="size-4 text-muted-foreground shrink-0 cursor-grab" />
      <span className={`text-sm font-medium truncate flex-1 ${!item.visible ? "opacity-50 line-through" : ""}`}>
        {item.title}
      </span>
      <span className="text-xs text-muted-foreground font-mono truncate max-w-[160px] hidden sm:inline">
        {item.url}
      </span>
      {item.openInNewTab && (
        <ExternalLink className="size-3 text-muted-foreground shrink-0" />
      )}
      <Badge variant="outline" className={`text-[10px] px-1.5 py-0 shrink-0 ${typeStyle.className}`}>
        {typeStyle.label}
      </Badge>
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button
          variant="ghost"
          size="icon-xs"
          onClick={() => onToggleVisibility(item.id)}
          title={item.visible ? "Hide item" : "Show item"}
        >
          {item.visible ? (
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
          onClick={() => onDelete(item.id)}
        >
          <Trash2 className="size-3.5" />
        </Button>
      </div>
    </div>
  );
}

// --- Page Component ---

export default function CreateMenuPage() {
  const [menuName, setMenuName] = React.useState("");
  const [menuSlug, setMenuSlug] = React.useState("");
  const [menuLocation, setMenuLocation] = React.useState<MenuLocation>("header");
  const [menuStatus, setMenuStatus] = React.useState(true);
  const [items, setItems] = React.useState<MenuItem[]>([]);

  // Add item dialog
  const [addDialogOpen, setAddDialogOpen] = React.useState(false);
  const [newItem, setNewItem] = React.useState({
    title: "",
    url: "",
    type: "link" as MenuItemType,
    parentId: "",
    openInNewTab: false,
  });

  // Edit item dialog
  const [editDialogOpen, setEditDialogOpen] = React.useState(false);
  const [editingItem, setEditingItem] = React.useState<MenuItem | null>(null);

  function handleNameChange(name: string) {
    setMenuName(name);
    setMenuSlug(generateSlug(name));
  }

  function handleToggleVisibility(itemId: string) {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id === itemId) {
          return { ...item, visible: !item.visible };
        }
        if (item.children) {
          return {
            ...item,
            children: item.children.map((child) =>
              child.id === itemId ? { ...child, visible: !child.visible } : child
            ),
          };
        }
        return item;
      })
    );
  }

  function handleDeleteItem(itemId: string) {
    setItems((prev) =>
      prev
        .filter((item) => item.id !== itemId)
        .map((item) => ({
          ...item,
          children: item.children?.filter((child) => child.id !== itemId),
        }))
    );
  }

  function handleEditItem(item: MenuItem) {
    setEditingItem(item);
    setEditDialogOpen(true);
  }

  function handleSaveEdit() {
    if (!editingItem) return;
    setItems((prev) =>
      prev.map((item) => {
        if (item.id === editingItem.id) return editingItem;
        if (item.children) {
          return {
            ...item,
            children: item.children.map((child) =>
              child.id === editingItem.id ? editingItem : child
            ),
          };
        }
        return item;
      })
    );
    setEditDialogOpen(false);
    setEditingItem(null);
  }

  function handleAddItem() {
    const newMenuItem: MenuItem = {
      id: `new-${Date.now()}`,
      title: newItem.title,
      url: newItem.url,
      type: newItem.type,
      visible: true,
      openInNewTab: newItem.openInNewTab,
    };

    if (newItem.parentId && newItem.parentId !== "none") {
      setItems((prev) =>
        prev.map((item) => {
          if (item.id === newItem.parentId) {
            return {
              ...item,
              children: [...(item.children ?? []), newMenuItem],
            };
          }
          return item;
        })
      );
    } else {
      setItems((prev) => [...prev, newMenuItem]);
    }

    setAddDialogOpen(false);
    setNewItem({ title: "", url: "", type: "link", parentId: "", openInNewTab: false });
  }

  function handleCreateMenu() {
    console.log("Creating menu:", {
      name: menuName,
      slug: menuSlug,
      location: menuLocation,
      status: menuStatus,
      items,
    });
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
                    <SelectItem value="header">Header</SelectItem>
                    <SelectItem value="footer">Footer</SelectItem>
                    <SelectItem value="mobile">Mobile</SelectItem>
                    <SelectItem value="sidebar">Sidebar</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between">
                <Label>Active</Label>
                <Switch
                  checked={menuStatus}
                  onCheckedChange={setMenuStatus}
                />
              </div>
              <Separator />
              <Button className="w-full" onClick={handleCreateMenu} disabled={!menuName}>
                Create Menu
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
                <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm">
                      <Plus className="size-3.5" />
                      Add Menu Item
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add Menu Item</DialogTitle>
                      <DialogDescription>
                        Add a new item to this menu.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label>Title</Label>
                        <Input
                          placeholder="Menu item title"
                          value={newItem.title}
                          onChange={(e) =>
                            setNewItem((prev) => ({ ...prev, title: e.target.value }))
                          }
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
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Type</Label>
                        <Select
                          value={newItem.type}
                          onValueChange={(val) =>
                            setNewItem((prev) => ({ ...prev, type: val as MenuItemType }))
                          }
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="link">Custom Link</SelectItem>
                            <SelectItem value="page">Page</SelectItem>
                            <SelectItem value="category">Category</SelectItem>
                            <SelectItem value="product">Product</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      {items.length > 0 && (
                        <div className="space-y-2">
                          <Label>Parent Item</Label>
                          <Select
                            value={newItem.parentId}
                            onValueChange={(val) =>
                              setNewItem((prev) => ({ ...prev, parentId: val }))
                            }
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="None (top-level)" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="none">None (top-level)</SelectItem>
                              {items.map((item) => (
                                <SelectItem key={item.id} value={item.id}>
                                  {item.title}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <Checkbox
                          id="create-new-tab"
                          checked={newItem.openInNewTab}
                          onCheckedChange={(checked) =>
                            setNewItem((prev) => ({
                              ...prev,
                              openInNewTab: checked === true,
                            }))
                          }
                        />
                        <Label htmlFor="create-new-tab" className="text-sm font-normal">
                          Open in new tab
                        </Label>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setAddDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleAddItem} disabled={!newItem.title || !newItem.url}>
                        Add Item
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {items.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <p className="text-sm">No menu items yet.</p>
                  <p className="text-xs mt-1">Click &quot;Add Menu Item&quot; to get started.</p>
                </div>
              ) : (
                <div className="space-y-0.5">
                  {items.map((item) => (
                    <React.Fragment key={item.id}>
                      <MenuItemRow
                        item={item}
                        onToggleVisibility={handleToggleVisibility}
                        onEdit={handleEditItem}
                        onDelete={handleDeleteItem}
                      />
                      {item.children?.map((child) => (
                        <MenuItemRow
                          key={child.id}
                          item={child}
                          isChild
                          onToggleVisibility={handleToggleVisibility}
                          onEdit={handleEditItem}
                          onDelete={handleDeleteItem}
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

      {/* Edit Item Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
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
                      prev ? { ...prev, title: e.target.value } : null
                    )
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>URL / Path</Label>
                <Input
                  value={editingItem.url}
                  onChange={(e) =>
                    setEditingItem((prev) =>
                      prev ? { ...prev, url: e.target.value } : null
                    )
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Type</Label>
                <Select
                  value={editingItem.type}
                  onValueChange={(val) =>
                    setEditingItem((prev) =>
                      prev ? { ...prev, type: val as MenuItemType } : null
                    )
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="link">Custom Link</SelectItem>
                    <SelectItem value="page">Page</SelectItem>
                    <SelectItem value="category">Category</SelectItem>
                    <SelectItem value="product">Product</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="edit-create-new-tab"
                  checked={editingItem.openInNewTab ?? false}
                  onCheckedChange={(checked) =>
                    setEditingItem((prev) =>
                      prev ? { ...prev, openInNewTab: checked === true } : null
                    )
                  }
                />
                <Label htmlFor="edit-create-new-tab" className="text-sm font-normal">
                  Open in new tab
                </Label>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveEdit}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
