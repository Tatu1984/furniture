"use client";

import * as React from "react";
import Link from "next/link";
import {
  Plus,
  Edit,
  Trash2,
  GripVertical,
  ChevronRight,
  EyeOff,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { PageHeader } from "@/components/admin/shared/page-header";

// --- Types ---

type MenuItemType = "link" | "page" | "category";

type MenuItem = {
  id: string;
  title: string;
  url: string;
  type: MenuItemType;
  visible: boolean;
  children?: MenuItem[];
};

type MenuLocation = "header" | "footer" | "mobile" | "sidebar";

type Menu = {
  id: string;
  name: string;
  slug: string;
  location: MenuLocation;
  items: MenuItem[];
};

// --- Hardcoded Data ---

const menus: Menu[] = [
  {
    id: "1",
    name: "Main Navigation",
    slug: "main-navigation",
    location: "header",
    items: [
      { id: "1a", title: "Home", url: "/", type: "page", visible: true },
      {
        id: "1b",
        title: "Shop",
        url: "/shop",
        type: "page",
        visible: true,
        children: [
          { id: "1b1", title: "Living Room", url: "/shop/living-room", type: "category", visible: true },
          { id: "1b2", title: "Bedroom", url: "/shop/bedroom", type: "category", visible: true },
        ],
      },
      {
        id: "1c",
        title: "Collections",
        url: "/collections",
        type: "page",
        visible: true,
        children: [
          { id: "1c1", title: "New Arrivals", url: "/collections/new-arrivals", type: "page", visible: true },
          { id: "1c2", title: "Best Sellers", url: "/collections/best-sellers", type: "page", visible: false },
        ],
      },
      { id: "1d", title: "About", url: "/about", type: "page", visible: true },
      { id: "1e", title: "Blog", url: "/blog", type: "page", visible: true },
      { id: "1f", title: "Contact", url: "/contact", type: "page", visible: true },
    ],
  },
  {
    id: "2",
    name: "Footer Links",
    slug: "footer-links",
    location: "footer",
    items: [
      { id: "2a", title: "About Us", url: "/about", type: "page", visible: true },
      { id: "2b", title: "Careers", url: "/careers", type: "page", visible: true },
      { id: "2c", title: "Privacy Policy", url: "/privacy", type: "page", visible: true },
      { id: "2d", title: "Terms of Service", url: "/terms", type: "page", visible: true },
      { id: "2e", title: "Shipping Info", url: "/shipping", type: "page", visible: true },
      { id: "2f", title: "Returns & Exchanges", url: "/returns", type: "page", visible: true },
      { id: "2g", title: "FAQ", url: "/faq", type: "page", visible: true },
      { id: "2h", title: "Contact Us", url: "/contact", type: "link", visible: true },
    ],
  },
  {
    id: "3",
    name: "Mobile Menu",
    slug: "mobile-menu",
    location: "mobile",
    items: [
      { id: "3a", title: "Shop All", url: "/shop", type: "page", visible: true },
      { id: "3b", title: "New Arrivals", url: "/collections/new-arrivals", type: "page", visible: true },
      { id: "3c", title: "Sale", url: "/sale", type: "page", visible: true },
      { id: "3d", title: "About", url: "/about", type: "page", visible: true },
      { id: "3e", title: "Contact", url: "/contact", type: "link", visible: true },
    ],
  },
  {
    id: "4",
    name: "Sidebar Menu",
    slug: "sidebar-menu",
    location: "sidebar",
    items: [
      { id: "4a", title: "Living Room", url: "/shop/living-room", type: "category", visible: true },
      { id: "4b", title: "Dining Room", url: "/shop/dining-room", type: "category", visible: true },
      { id: "4c", title: "Bedroom", url: "/shop/bedroom", type: "category", visible: true },
      { id: "4d", title: "Office", url: "/shop/office", type: "category", visible: false },
    ],
  },
];

// --- Helpers ---

const locationConfig: Record<MenuLocation, { label: string; className: string }> = {
  header: { label: "Header", className: "bg-blue-100 text-blue-800 border-blue-200" },
  footer: { label: "Footer", className: "bg-green-100 text-green-800 border-green-200" },
  mobile: { label: "Mobile", className: "bg-purple-100 text-purple-800 border-purple-200" },
  sidebar: { label: "Sidebar", className: "bg-yellow-100 text-yellow-800 border-yellow-200" },
};

const typeConfig: Record<MenuItemType, { label: string; className: string }> = {
  link: { label: "Link", className: "bg-gray-100 text-gray-700 border-gray-200" },
  page: { label: "Page", className: "bg-blue-50 text-blue-700 border-blue-200" },
  category: { label: "Category", className: "bg-amber-50 text-amber-700 border-amber-200" },
};

function countAllItems(items: MenuItem[]): number {
  let count = 0;
  for (const item of items) {
    count += 1;
    if (item.children) {
      count += item.children.length;
    }
  }
  return count;
}

// --- Component ---

function MenuItemRow({ item, isChild = false }: { item: MenuItem; isChild?: boolean }) {
  const typeStyle = typeConfig[item.type];

  return (
    <div
      className={`flex items-center gap-2 py-2 px-3 rounded-md hover:bg-muted/50 transition-colors ${
        isChild ? "ml-8" : ""
      }`}
    >
      {isChild && (
        <ChevronRight className="size-3 text-muted-foreground shrink-0" />
      )}
      <GripVertical className="size-3.5 text-muted-foreground shrink-0 cursor-grab" />
      <span className={`text-sm font-medium truncate ${!item.visible ? "opacity-50" : ""}`}>
        {item.title}
      </span>
      <span className="text-xs text-muted-foreground font-mono truncate max-w-[140px]">
        {item.url}
      </span>
      <Badge variant="outline" className={`text-[10px] px-1.5 py-0 shrink-0 ${typeStyle.className}`}>
        {typeStyle.label}
      </Badge>
      {!item.visible && (
        <EyeOff className="size-3 text-muted-foreground shrink-0" />
      )}
    </div>
  );
}

export default function MenusPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Menus" description="Manage navigation menus for your store">
        <Button asChild>
          <Link href="/admin/menus/new">
            <Plus className="size-4" />
            Create Menu
          </Link>
        </Button>
      </PageHeader>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {menus.map((menu) => {
          const locStyle = locationConfig[menu.location];
          const totalItems = countAllItems(menu.items);

          return (
            <Card key={menu.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1.5">
                    <CardTitle className="text-base">{menu.name}</CardTitle>
                    <p className="text-xs font-mono text-muted-foreground">
                      {menu.slug}
                    </p>
                  </div>
                  <Badge
                    variant="outline"
                    className={`shrink-0 ${locStyle.className}`}
                  >
                    {locStyle.label}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  {totalItems} item{totalItems !== 1 ? "s" : ""}
                </p>
              </CardHeader>
              <CardContent className="space-y-1">
                <Separator className="mb-3" />
                <div className="space-y-0.5 max-h-[260px] overflow-y-auto">
                  {menu.items.map((item) => (
                    <React.Fragment key={item.id}>
                      <MenuItemRow item={item} />
                      {item.children?.map((child) => (
                        <MenuItemRow key={child.id} item={child} isChild />
                      ))}
                    </React.Fragment>
                  ))}
                </div>
                <Separator className="mt-3" />
                <div className="flex items-center gap-2 pt-3">
                  <Button variant="outline" size="sm" asChild className="flex-1">
                    <Link href={`/admin/menus/${menu.id}`}>
                      <Edit className="size-3.5" />
                      Edit
                    </Link>
                  </Button>
                  <Button variant="outline" size="sm" className="text-destructive hover:text-destructive">
                    <Trash2 className="size-3.5" />
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
