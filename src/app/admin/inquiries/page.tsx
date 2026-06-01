"use client";

import * as React from "react";
import Link from "next/link";
import { type ColumnDef } from "@tanstack/react-table";
import { Eye, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader } from "@/components/admin/shared/page-header";
import {
  DataTable,
  DataTableColumnHeader,
} from "@/components/admin/shared/data-table";
import { InquiryStatusBadge } from "@/components/admin/inquiry-status-badge";

type Inquiry = {
  id: string;
  inquiryNumber: string;
  customer: string;
  email: string;
  phone: string | null;
  product: string;
  productSlug: string;
  quantity: number;
  status: string;
  date: string;
  lastContactedAt: string | null;
};

const columns: ColumnDef<Inquiry>[] = [
  {
    accessorKey: "inquiryNumber",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Inquiry #" />
    ),
    cell: ({ row }) => (
      <Link
        href={`/admin/inquiries/${row.original.id}`}
        className="font-mono text-xs font-medium hover:underline"
      >
        {row.getValue("inquiryNumber")}
      </Link>
    ),
  },
  {
    accessorKey: "customer",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Customer" />
    ),
    cell: ({ row }) => (
      <div>
        <p className="font-medium">{row.getValue("customer")}</p>
        <p className="text-xs text-muted-foreground">{row.original.email}</p>
      </div>
    ),
  },
  {
    accessorKey: "product",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Product" />
    ),
    cell: ({ row }) => (
      <div>
        <p className="line-clamp-1">{row.getValue("product")}</p>
        <p className="text-xs text-muted-foreground">
          Qty {row.original.quantity}
        </p>
      </div>
    ),
  },
  {
    accessorKey: "status",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ row }) => <InquiryStatusBadge status={row.getValue("status")} />,
  },
  {
    accessorKey: "date",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Received" />
    ),
    cell: ({ row }) => (
      <span className="text-muted-foreground text-sm">
        {new Date(row.getValue("date")).toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })}
      </span>
    ),
  },
  {
    accessorKey: "lastContactedAt",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Last contact" />
    ),
    cell: ({ row }) => {
      const value = row.original.lastContactedAt;
      if (!value)
        return <span className="text-xs text-muted-foreground">—</span>;
      return (
        <span className="text-sm text-muted-foreground">
          {new Date(value).toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
          })}
        </span>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <Button variant="ghost" size="sm" asChild>
        <Link href={`/admin/inquiries/${row.original.id}`}>
          <Eye className="size-4" />
          View
        </Link>
      </Button>
    ),
    enableSorting: false,
  },
];

const STATUS_TABS = [
  { value: "all", label: "All" },
  { value: "NEW", label: "New" },
  { value: "CONTACTED", label: "Contacted" },
  { value: "QUOTED", label: "Quoted" },
  { value: "CONFIRMED", label: "Confirmed" },
  { value: "CLOSED", label: "Closed" },
  { value: "CANCELLED", label: "Cancelled" },
] as const;

export default function InquiriesPage() {
  const [items, setItems] = React.useState<Inquiry[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [activeTab, setActiveTab] = React.useState<string>("all");
  const [dateFrom, setDateFrom] = React.useState("");
  const [dateTo, setDateTo] = React.useState("");
  const [counts, setCounts] = React.useState<Record<string, number>>({
    all: 0,
  });

  const fetchInquiries = React.useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("limit", "100");
      if (activeTab !== "all") params.set("status", activeTab);
      if (dateFrom) params.set("dateFrom", dateFrom);
      if (dateTo) params.set("dateTo", dateTo);

      const res = await fetch(`/api/admin/inquiries?${params}`);
      if (!res.ok) {
        setItems([]);
        return;
      }
      const data = await res.json();
      setItems(
        (data.data || []).map(
          (i: {
            id: string;
            inquiryNumber: string;
            customerName: string;
            customerEmail: string;
            customerPhone: string | null;
            productName: string;
            productSlug: string;
            quantity: number;
            status: string;
            createdAt: string;
            lastContactedAt: string | null;
          }) => ({
            id: i.id,
            inquiryNumber: i.inquiryNumber,
            customer: i.customerName,
            email: i.customerEmail,
            phone: i.customerPhone,
            product: i.productName,
            productSlug: i.productSlug,
            quantity: i.quantity,
            status: i.status,
            date: i.createdAt,
            lastContactedAt: i.lastContactedAt,
          }),
        ),
      );

      const sc = data.statusCounts ?? {};
      const total = data.pagination?.total ?? 0;
      setCounts({ all: total, ...sc });
    } catch {
      console.error("Failed to fetch inquiries");
    } finally {
      setLoading(false);
    }
  }, [activeTab, dateFrom, dateTo]);

  React.useEffect(() => {
    fetchInquiries();
  }, [fetchInquiries]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Order Inquiries"
        description="Customer quote requests submitted through Order Now"
      />

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          {STATUS_TABS.map((t) => (
            <TabsTrigger key={t.value} value={t.value}>
              {t.label}
              {counts[t.value] !== undefined && counts[t.value] > 0 && (
                <span className="ml-1.5 text-xs text-muted-foreground">
                  ({counts[t.value]})
                </span>
              )}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">From:</span>
          <Input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="w-40"
          />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">To:</span>
          <Input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="w-40"
          />
        </div>
        {(dateFrom || dateTo) && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setDateFrom("");
              setDateTo("");
            }}
          >
            Clear dates
          </Button>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="size-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={items}
          searchKey="inquiryNumber"
          searchPlaceholder="Search by inquiry #, customer, or product..."
        />
      )}
    </div>
  );
}
