"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type StatusType =
  | "active" | "draft" | "archived"
  | "pending" | "processing" | "shipped" | "delivered" | "cancelled"
  | "published" | "expired" | "low" | "in-stock" | "out-of-stock"
  | "suspended" | "paid" | "failed" | "refunded";

const statusConfig: Record<StatusType, { label: string; className: string }> = {
  active: { label: "Active", className: "bg-green-100 text-green-800 border-green-200" },
  draft: { label: "Draft", className: "bg-gray-100 text-gray-800 border-gray-200" },
  archived: { label: "Archived", className: "bg-red-100 text-red-800 border-red-200" },
  pending: { label: "Pending", className: "bg-yellow-100 text-yellow-800 border-yellow-200" },
  processing: { label: "Processing", className: "bg-blue-100 text-blue-800 border-blue-200" },
  shipped: { label: "Shipped", className: "bg-purple-100 text-purple-800 border-purple-200" },
  delivered: { label: "Delivered", className: "bg-green-100 text-green-800 border-green-200" },
  cancelled: { label: "Cancelled", className: "bg-red-100 text-red-800 border-red-200" },
  published: { label: "Published", className: "bg-green-100 text-green-800 border-green-200" },
  expired: { label: "Expired", className: "bg-red-100 text-red-800 border-red-200" },
  low: { label: "Low Stock", className: "bg-orange-100 text-orange-800 border-orange-200" },
  "in-stock": { label: "In Stock", className: "bg-green-100 text-green-800 border-green-200" },
  "out-of-stock": { label: "Out of Stock", className: "bg-red-100 text-red-800 border-red-200" },
  suspended: { label: "Suspended", className: "bg-red-100 text-red-800 border-red-200" },
  paid: { label: "Paid", className: "bg-green-100 text-green-800 border-green-200" },
  failed: { label: "Failed", className: "bg-red-100 text-red-800 border-red-200" },
  refunded: { label: "Refunded", className: "bg-purple-100 text-purple-800 border-purple-200" },
};

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status as StatusType] ?? {
    label: status,
    className: "bg-gray-100 text-gray-800 border-gray-200",
  };

  return (
    <Badge
      variant="outline"
      className={cn("font-medium", config.className, className)}
    >
      {config.label}
    </Badge>
  );
}
