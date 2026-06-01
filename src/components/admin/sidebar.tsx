"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  Box,
  ClipboardList,
  CreditCard,
  FolderOpen,
  FolderTree,
  Image,
  LayoutDashboard,
  Menu,
  Package,
  Settings,
  ShoppingCart,
  Tag,
  FileText,
  Users,
  UserCog,
  Warehouse,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

const navGroups = [
  {
    label: "Main",
    items: [
      { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
      { label: "Inquiries", href: "/admin/inquiries", icon: ClipboardList },
      { label: "Orders", href: "/admin/orders", icon: ShoppingCart },
      { label: "Products", href: "/admin/products", icon: Box },
      { label: "Categories", href: "/admin/categories", icon: FolderTree },
    ],
  },
  {
    label: "Marketing",
    items: [
      { label: "Coupons", href: "/admin/coupons", icon: Tag },
      { label: "Content", href: "/admin/content", icon: FileText },
      { label: "Menus", href: "/admin/menus", icon: Menu },
      { label: "Banners", href: "/admin/banners", icon: Image },
      { label: "Projects", href: "/admin/projects", icon: FolderOpen },
    ],
  },
  {
    label: "Management",
    items: [
      { label: "Inventory", href: "/admin/inventory", icon: Warehouse },
      { label: "Customers", href: "/admin/customers", icon: Users },
      { label: "Users", href: "/admin/users", icon: UserCog },
      { label: "Payments", href: "/admin/payments", icon: CreditCard },
    ],
  },
  {
    label: "Reports",
    items: [
      { label: "Analytics", href: "/admin/analytics", icon: BarChart3 },
      { label: "Settings", href: "/admin/settings", icon: Settings },
    ],
  },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar>
      <SidebarHeader className="border-b px-6 py-4">
        <Link href="/admin" className="flex items-center gap-2">
          <Package className="h-6 w-6 text-primary" />
          <span className="text-lg font-bold">FSOW Admin</span>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        {navGroups.map((group) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => {
                  const isActive =
                    item.href === "/admin"
                      ? pathname === "/admin"
                      : pathname.startsWith(item.href);
                  return (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton
                        asChild
                        isActive={isActive}
                      >
                        <Link href={item.href}>
                          <item.icon className="h-4 w-4" />
                          <span>{item.label}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
    </Sidebar>
  );
}
