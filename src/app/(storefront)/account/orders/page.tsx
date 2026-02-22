import Link from "next/link";
import { Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/shared/status-badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// ---------------------------------------------------------------------------
// Mock data
// ---------------------------------------------------------------------------

const orders = [
  {
    id: "ORD-2024-001",
    date: "Jan 15, 2024",
    status: "delivered" as const,
    items: 3,
    total: 2499.0,
  },
  {
    id: "ORD-2024-002",
    date: "Feb 3, 2024",
    status: "shipped" as const,
    items: 1,
    total: 899.0,
  },
  {
    id: "ORD-2024-003",
    date: "Feb 20, 2024",
    status: "processing" as const,
    items: 2,
    total: 1645.0,
  },
  {
    id: "ORD-2024-004",
    date: "Mar 8, 2024",
    status: "pending" as const,
    items: 4,
    total: 3210.0,
  },
  {
    id: "ORD-2024-005",
    date: "Mar 22, 2024",
    status: "cancelled" as const,
    items: 1,
    total: 549.0,
  },
  {
    id: "ORD-2024-006",
    date: "Apr 5, 2024",
    status: "delivered" as const,
    items: 2,
    total: 1875.0,
  },
  {
    id: "ORD-2024-007",
    date: "Apr 18, 2024",
    status: "shipped" as const,
    items: 5,
    total: 4320.0,
  },
];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function AccountOrdersPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">My Orders</h2>
        <p className="text-muted-foreground mt-1">
          Track and manage your recent orders.
        </p>
      </div>

      {/* Desktop table */}
      <div className="hidden md:block rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order #</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-center">Items</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order.id}>
                <TableCell className="font-medium">{order.id}</TableCell>
                <TableCell className="text-muted-foreground">
                  {order.date}
                </TableCell>
                <TableCell>
                  <StatusBadge status={order.status} />
                </TableCell>
                <TableCell className="text-center">{order.items}</TableCell>
                <TableCell className="text-right font-medium">
                  ${order.total.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm" asChild>
                    <Link href={`/account/orders/${order.id}`}>View</Link>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Mobile cards */}
      <div className="flex flex-col gap-4 md:hidden">
        {orders.map((order) => (
          <Link
            key={order.id}
            href={`/account/orders/${order.id}`}
            className="flex items-center justify-between rounded-lg border p-4 transition-colors hover:bg-muted/50"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium text-sm">{order.id}</span>
              </div>
              <p className="text-xs text-muted-foreground">{order.date}</p>
              <StatusBadge status={order.status} />
            </div>
            <div className="text-right">
              <p className="font-semibold">
                ${order.total.toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </p>
              <p className="text-xs text-muted-foreground">
                {order.items} {order.items === 1 ? "item" : "items"}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
