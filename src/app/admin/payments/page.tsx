"use client";

import * as React from "react";
import Link from "next/link";
import { type ColumnDef } from "@tanstack/react-table";
import {
  DollarSign,
  TrendingDown,
  TrendingUp,
  CreditCard,
  Eye,
} from "lucide-react";

import { PageHeader } from "@/components/admin/shared/page-header";
import {
  DataTable,
  DataTableColumnHeader,
} from "@/components/admin/shared/data-table";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

// --- Types ---

type PaymentStatus = "pending" | "paid" | "failed" | "refunded";

type Payment = {
  id: string;
  orderId: string;
  customerName: string;
  customerEmail: string;
  amount: number;
  method: string;
  transactionId: string;
  status: PaymentStatus;
  date: string;
};

// --- Mock Data ---

const payments: Payment[] = [
  { id: "pay-001", orderId: "ORD-2024-001", customerName: "Sarah Johnson", customerEmail: "sarah.johnson@email.com", amount: 1249.99, method: "Visa *4242", transactionId: "txn_3Mq9Rt2eZvKYlo2C", status: "paid", date: "2025-12-15T14:30:00Z" },
  { id: "pay-002", orderId: "ORD-2024-002", customerName: "Michael Chen", customerEmail: "michael.chen@email.com", amount: 899.00, method: "Mastercard *5555", transactionId: "txn_1Np8Qs3fAwLZmp3D", status: "paid", date: "2025-12-14T09:15:00Z" },
  { id: "pay-003", orderId: "ORD-2024-003", customerName: "Emily Davis", customerEmail: "emily.davis@email.com", amount: 2450.00, method: "Visa *4242", transactionId: "txn_5Or0Vu5hCyNBor5F", status: "pending", date: "2025-12-14T16:45:00Z" },
  { id: "pay-004", orderId: "ORD-2024-004", customerName: "James Wilson", customerEmail: "james.wilson@email.com", amount: 675.50, method: "PayPal", transactionId: "txn_7Qt2Xw7jEzPDqt7H", status: "pending", date: "2025-12-13T10:00:00Z" },
  { id: "pay-005", orderId: "ORD-2024-005", customerName: "Lisa Anderson", customerEmail: "lisa.anderson@email.com", amount: 1850.00, method: "Amex *3782", transactionId: "txn_9Sv4Zy9lGbRFsv9J", status: "refunded", date: "2025-12-13T12:30:00Z" },
  { id: "pay-006", orderId: "ORD-2024-006", customerName: "Robert Taylor", customerEmail: "robert.taylor@email.com", amount: 3299.00, method: "Visa *4242", transactionId: "txn_2Ot1Yu8kFaQEru8I", status: "paid", date: "2025-12-12T15:00:00Z" },
  { id: "pay-007", orderId: "ORD-2024-007", customerName: "Amanda Martinez", customerEmail: "amanda.martinez@email.com", amount: 548.99, method: "Mastercard *5555", transactionId: "txn_4Pw3Wv0mHcSGpw0K", status: "paid", date: "2025-12-12T11:20:00Z" },
  { id: "pay-008", orderId: "ORD-2024-008", customerName: "David Brown", customerEmail: "david.brown@email.com", amount: 1299.99, method: "Visa *1234", transactionId: "txn_6Rx5Yx2oJeTInx2M", status: "paid", date: "2025-12-11T09:00:00Z" },
  { id: "pay-009", orderId: "ORD-2024-009", customerName: "Jennifer Lee", customerEmail: "jennifer.lee@email.com", amount: 987.00, method: "PayPal", transactionId: "txn_8Tz7Az4qLgVKpz4O", status: "failed", date: "2025-12-11T14:15:00Z" },
  { id: "pay-010", orderId: "ORD-2024-010", customerName: "Christopher Garcia", customerEmail: "chris.garcia@email.com", amount: 449.00, method: "Visa *4242", transactionId: "txn_0Vb9Cb6sNiXMrb6Q", status: "pending", date: "2025-12-10T16:00:00Z" },
  { id: "pay-011", orderId: "ORD-2024-011", customerName: "Michelle Robinson", customerEmail: "michelle.robinson@email.com", amount: 2199.00, method: "Mastercard *8888", transactionId: "txn_1Wc0Dc7tOjYNsc7R", status: "paid", date: "2025-12-10T08:45:00Z" },
  { id: "pay-012", orderId: "ORD-2024-012", customerName: "Daniel White", customerEmail: "daniel.white@email.com", amount: 1654.50, method: "Visa *4242", transactionId: "txn_2Xd1Ed8uPkZOtd8S", status: "paid", date: "2025-12-09T13:30:00Z" },
  { id: "pay-013", orderId: "ORD-2024-013", customerName: "Ashley Thompson", customerEmail: "ashley.thompson@email.com", amount: 738.00, method: "PayPal", transactionId: "txn_3Ye2Fe9vQlAPue9T", status: "failed", date: "2025-12-09T10:00:00Z" },
  { id: "pay-014", orderId: "ORD-2024-014", customerName: "Kevin Harris", customerEmail: "kevin.harris@email.com", amount: 549.00, method: "Amex *3782", transactionId: "txn_4Zf3Gf0wRmBQvf0U", status: "refunded", date: "2025-12-08T17:30:00Z" },
  { id: "pay-015", orderId: "ORD-2024-015", customerName: "Stephanie Clark", customerEmail: "stephanie.clark@email.com", amount: 1875.99, method: "Visa *4242", transactionId: "txn_5Ag4Hg1xSnCRwg1V", status: "paid", date: "2025-12-08T11:00:00Z" },
  { id: "pay-016", orderId: "ORD-2024-016", customerName: "Brian Lewis", customerEmail: "brian.lewis@email.com", amount: 999.00, method: "Mastercard *5555", transactionId: "txn_6Bh5Ih2yToDS0h2W", status: "paid", date: "2025-12-07T14:00:00Z" },
  { id: "pay-017", orderId: "ORD-2024-017", customerName: "Nicole Walker", customerEmail: "nicole.walker@email.com", amount: 2150.00, method: "Visa *1234", transactionId: "txn_7Ci6Ji3zUpET1i3X", status: "paid", date: "2025-12-07T09:30:00Z" },
  { id: "pay-018", orderId: "ORD-2024-018", customerName: "Ryan Hall", customerEmail: "ryan.hall@email.com", amount: 425.00, method: "PayPal", transactionId: "txn_8Dj7Kj4AVqFU2j4Y", status: "pending", date: "2025-12-06T16:45:00Z" },
  { id: "pay-019", orderId: "ORD-2024-019", customerName: "Rachel Allen", customerEmail: "rachel.allen@email.com", amount: 1320.00, method: "Visa *4242", transactionId: "txn_9Ek8Lk5BWrGV3k5Z", status: "paid", date: "2025-12-06T10:15:00Z" },
  { id: "pay-020", orderId: "ORD-2024-020", customerName: "Thomas Young", customerEmail: "thomas.young@email.com", amount: 780.50, method: "Mastercard *5555", transactionId: "txn_0Fl9Ml6CXsHW4l6A", status: "failed", date: "2025-12-05T13:00:00Z" },
  { id: "pay-021", orderId: "ORD-2024-021", customerName: "Lauren King", customerEmail: "lauren.king@email.com", amount: 1590.00, method: "Amex *3782", transactionId: "txn_1Gm0Nm7DYtIX5m7B", status: "paid", date: "2025-12-05T08:30:00Z" },
  { id: "pay-022", orderId: "ORD-2024-022", customerName: "Jason Wright", customerEmail: "jason.wright@email.com", amount: 3100.00, method: "Visa *4242", transactionId: "txn_2Hn1On8EZuJY6n8C", status: "paid", date: "2025-12-04T15:20:00Z" },
];

// --- Helpers ---

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

function formatDateTime(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// --- Columns ---

const columns: ColumnDef<Payment>[] = [
  {
    accessorKey: "orderId",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Order #" />
    ),
    cell: ({ row }) => (
      <Link
        href={`/admin/orders/${row.original.orderId}`}
        className="font-medium hover:underline"
      >
        {row.original.orderId}
      </Link>
    ),
  },
  {
    id: "customer",
    accessorFn: (row) => `${row.customerName} ${row.customerEmail}`,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Customer" />
    ),
    cell: ({ row }) => (
      <div>
        <p className="font-medium">{row.original.customerName}</p>
        <p className="text-sm text-muted-foreground">{row.original.customerEmail}</p>
      </div>
    ),
  },
  {
    accessorKey: "amount",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Amount" />
    ),
    cell: ({ row }) => (
      <span className="font-medium">{formatCurrency(row.original.amount)}</span>
    ),
  },
  {
    accessorKey: "method",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Payment Method" />
    ),
    cell: ({ row }) => row.original.method,
  },
  {
    accessorKey: "transactionId",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Transaction ID" />
    ),
    cell: ({ row }) => (
      <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">
        {row.original.transactionId}
      </code>
    ),
  },
  {
    accessorKey: "status",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ row }) => <StatusBadge status={row.original.status} />,
  },
  {
    accessorKey: "date",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Date" />
    ),
    cell: ({ row }) => (
      <span className="text-muted-foreground">
        {formatDateTime(row.original.date)}
      </span>
    ),
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <Button variant="ghost" size="sm" asChild>
        <Link href={`/admin/orders/${row.original.orderId}`}>
          <Eye className="size-4" />
        </Link>
      </Button>
    ),
    enableSorting: false,
  },
];

// --- Stats ---

const totalRevenue = payments
  .filter((p) => p.status === "paid")
  .reduce((sum, p) => sum + p.amount, 0);

const totalRefunds = payments
  .filter((p) => p.status === "refunded")
  .reduce((sum, p) => sum + p.amount, 0);

const netRevenue = totalRevenue - totalRefunds;

const totalTransactions = payments.length;

// --- Page ---

export default function PaymentsPage() {
  const [statusFilter, setStatusFilter] = React.useState<string>("all");

  const filteredPayments = React.useMemo(() => {
    if (statusFilter === "all") return payments;
    return payments.filter((p) => p.status === statusFilter);
  }, [statusFilter]);

  const statusFilters = ["all", "pending", "paid", "failed", "refunded"] as const;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Payments"
        description="Track and manage payment transactions"
      />

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="flex size-10 items-center justify-center rounded-lg bg-green-100 text-green-700">
              <TrendingUp className="size-5" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Revenue</p>
              <p className="text-2xl font-bold">{formatCurrency(totalRevenue)}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="flex size-10 items-center justify-center rounded-lg bg-red-100 text-red-700">
              <TrendingDown className="size-5" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Refunds</p>
              <p className="text-2xl font-bold">{formatCurrency(totalRefunds)}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="flex size-10 items-center justify-center rounded-lg bg-amber-100 text-amber-700">
              <DollarSign className="size-5" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Net Revenue</p>
              <p className="text-2xl font-bold">{formatCurrency(netRevenue)}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="flex size-10 items-center justify-center rounded-lg bg-yellow-100 text-yellow-700">
              <CreditCard className="size-5" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Transactions</p>
              <p className="text-2xl font-bold">{totalTransactions}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Status Filter */}
      <div className="flex items-center gap-1">
        <span className="text-sm text-muted-foreground mr-1">Status:</span>
        {statusFilters.map((s) => (
          <Button
            key={s}
            variant={statusFilter === s ? "default" : "outline"}
            size="sm"
            onClick={() => setStatusFilter(s)}
            className="capitalize"
          >
            {s}
          </Button>
        ))}
      </div>

      <DataTable
        columns={columns}
        data={filteredPayments}
        searchKey="customer"
        searchPlaceholder="Search by customer or order..."
      />
    </div>
  );
}
