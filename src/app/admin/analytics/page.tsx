"use client";

import * as React from "react";
import { toast } from "sonner";
import {
  DollarSign,
  ShoppingCart,
  Users,
  Activity,
  TrendingUp,
  TrendingDown,
  Loader2,
} from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

import { PageHeader } from "@/components/admin/shared/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { formatPrice } from "@/lib/format";

// --- Types matching /api/admin/analytics response ---

type ApiAnalytics = {
  overview: {
    revenue: { current: number; previous: number; change: number };
    orders: { current: number; previous: number; change: number };
    customers: {
      current: number;
      previous: number;
      change: number;
      total: number;
    };
    products: {
      total: number;
      published: number;
      lowStock: number;
      outOfStock: number;
    };
    averageOrderValue: number;
  };
  topProducts: Array<{
    productId: string | null;
    _sum: { quantity: number | null; total: number | null };
    _count: number;
    product: { id: string; name: string; sku: string } | null;
  }>;
  orderStatusBreakdown: Array<{ status: string; count: number }>;
  chartData: Array<{ date: string; orders: number; revenue: number }>;
  period: string;
};

const COLORS = {
  gold: "#8B6914",
  forest: "#1B4332",
};

const dateRanges = [
  { label: "7 days", value: "7d" },
  { label: "30 days", value: "30d" },
  { label: "90 days", value: "90d" },
  { label: "12 months", value: "365d" },
];

const STATUS_COLORS: Record<string, string> = {
  PENDING: "#EAB308",
  PROCESSING: "#3B82F6",
  SHIPPED: "#A855F7",
  DELIVERED: "#22C55E",
  COMPLETED: "#22C55E",
  CANCELLED: "#EF4444",
  REFUNDED: "#6B7280",
  ON_HOLD: "#F97316",
};

const revenueConfig: ChartConfig = {
  revenue: { label: "Revenue", color: COLORS.forest },
};
const ordersConfig: ChartConfig = {
  orders: { label: "Orders", color: COLORS.gold },
};

export default function AnalyticsPage() {
  const [period, setPeriod] = React.useState("365d");
  const [data, setData] = React.useState<ApiAnalytics | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const res = await fetch(`/api/admin/analytics?period=${period}`);
        if (!res.ok) {
          const j = await res.json().catch(() => null);
          throw new Error(j?.error || "Failed to load analytics");
        }
        const json = await res.json();
        if (!cancelled) setData(json.data as ApiAnalytics);
      } catch (err) {
        if (!cancelled) {
          toast.error(
            err instanceof Error ? err.message : "Failed to load analytics",
          );
          setData(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [period]);

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Analytics" description="Track your store performance" />
        <div className="flex items-center justify-center py-24">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
          <span className="ml-2 text-muted-foreground">
            Loading analytics...
          </span>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="space-y-6">
        <PageHeader title="Analytics" description="Track your store performance" />
        <div className="text-center py-24 text-muted-foreground">
          <p className="text-sm">No analytics data available.</p>
        </div>
      </div>
    );
  }

  // Derived data
  const totalStatusCount = data.orderStatusBreakdown.reduce(
    (s, x) => s + x.count,
    0,
  );

  const metricCards = [
    {
      label: "Revenue",
      value: formatPrice(data.overview.revenue.current),
      trend: data.overview.revenue.change,
      icon: DollarSign,
      iconBg: "bg-green-100",
      iconColor: "text-green-700",
    },
    {
      label: "Orders",
      value: data.overview.orders.current.toLocaleString(),
      trend: data.overview.orders.change,
      icon: ShoppingCart,
      iconBg: "bg-blue-100",
      iconColor: "text-blue-700",
    },
    {
      label: "New Customers",
      value: data.overview.customers.current.toLocaleString(),
      trend: data.overview.customers.change,
      icon: Users,
      iconBg: "bg-purple-100",
      iconColor: "text-purple-700",
    },
    {
      label: "Avg. Order Value",
      value: formatPrice(data.overview.averageOrderValue),
      trend: 0,
      icon: Activity,
      iconBg: "bg-amber-100",
      iconColor: "text-amber-700",
      hideTrend: true,
    },
  ];

  // Format chart x-axis labels
  const chartData = data.chartData.map((d) => ({
    ...d,
    label: new Date(d.date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    }),
  }));

  const maxTopRevenue =
    Number(data.topProducts[0]?._sum.total ?? 0) || 1;

  return (
    <div className="space-y-6">
      <PageHeader title="Analytics" description="Track your store performance" />

      {/* Date Range Selector */}
      <Card>
        <CardContent className="flex flex-col sm:flex-row items-start sm:items-center gap-4 pt-6">
          <div className="flex gap-1">
            {dateRanges.map((range) => (
              <Button
                key={range.value}
                variant={period === range.value ? "default" : "outline"}
                size="sm"
                onClick={() => setPeriod(range.value)}
              >
                {range.label}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 4 Metric Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {metricCards.map((card) => {
          const Icon = card.icon;
          const isPositive = card.trend > 0;
          return (
            <Card key={card.label}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {card.label}
                </CardTitle>
                <div
                  className={`flex size-9 items-center justify-center rounded-full ${card.iconBg}`}
                >
                  <Icon className={`size-4 ${card.iconColor}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{card.value}</div>
                {!card.hideTrend && (
                  <div className="flex items-center gap-1 mt-1">
                    {isPositive ? (
                      <TrendingUp className="size-3.5 text-green-600" />
                    ) : (
                      <TrendingDown className="size-3.5 text-red-600" />
                    )}
                    <span
                      className={`text-xs font-medium ${
                        isPositive ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {isPositive ? "+" : ""}
                      {card.trend}%
                    </span>
                    <span className="text-xs text-muted-foreground">
                      vs prev period
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* 2 Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="border-[#1B4332]/20">
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="flex size-14 items-center justify-center rounded-full bg-[#1B4332]/10">
              <DollarSign className="size-7 text-[#1B4332]" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">
                Published Products
              </p>
              <p className="text-3xl font-bold text-[#1B4332]">
                {data.overview.products.published.toLocaleString()}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                of {data.overview.products.total} total
              </p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-[#8B6914]/20">
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="flex size-14 items-center justify-center rounded-full bg-[#8B6914]/10">
              <Users className="size-7 text-[#8B6914]" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Customers</p>
              <p className="text-3xl font-bold text-[#8B6914]">
                {data.overview.customers.total.toLocaleString()}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {data.overview.customers.current} new in this period
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Orders by Status */}
      <Card>
        <CardHeader>
          <CardTitle>Orders by Status</CardTitle>
        </CardHeader>
        <CardContent>
          {data.orderStatusBreakdown.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">
              No orders in this period.
            </p>
          ) : (
            <div className="space-y-4">
              {data.orderStatusBreakdown.map((item) => {
                const pct =
                  totalStatusCount > 0
                    ? (item.count / totalStatusCount) * 100
                    : 0;
                return (
                  <div key={item.status} className="space-y-1.5">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium capitalize">
                        {item.status.toLowerCase().replace(/_/g, " ")}
                      </span>
                      <div className="flex items-center gap-3">
                        <span className="text-muted-foreground">
                          {item.count} orders
                        </span>
                        <span className="font-medium w-12 text-right">
                          {pct.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                    <div className="h-3 w-full bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{
                          width: `${pct}%`,
                          backgroundColor:
                            STATUS_COLORS[item.status] ?? "#94a3b8",
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Revenue Line Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Revenue</CardTitle>
        </CardHeader>
        <CardContent>
          {chartData.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-12">
              No data for this period.
            </p>
          ) : (
            <ChartContainer
              config={revenueConfig}
              className="h-[350px] w-full"
            >
              <LineChart
                data={chartData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="label" />
                <YAxis tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      formatter={(value) => formatPrice(value as number)}
                    />
                  }
                />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="var(--color-revenue)"
                  strokeWidth={2}
                  dot={{ r: 3, fill: COLORS.forest }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ChartContainer>
          )}
        </CardContent>
      </Card>

      {/* Orders Bar Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Orders</CardTitle>
        </CardHeader>
        <CardContent>
          {chartData.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-12">
              No data for this period.
            </p>
          ) : (
            <ChartContainer
              config={ordersConfig}
              className="h-[300px] w-full"
            >
              <BarChart
                data={chartData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="label" />
                <YAxis allowDecimals={false} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar
                  dataKey="orders"
                  fill="var(--color-orders)"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ChartContainer>
          )}
        </CardContent>
      </Card>

      {/* Top Products */}
      <Card>
        <CardHeader>
          <CardTitle>Top Products</CardTitle>
        </CardHeader>
        <CardContent>
          {data.topProducts.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">
              No product sales in this period.
            </p>
          ) : (
            <div className="space-y-3">
              {data.topProducts.map((p, i) => {
                const revenue = Number(p._sum.total ?? 0);
                const units = Number(p._sum.quantity ?? 0);
                const barWidth = (revenue / maxTopRevenue) * 100;
                return (
                  <div
                    key={`${p.productId ?? i}-${i}`}
                    className="flex items-center gap-3"
                  >
                    <span className="text-sm font-bold text-muted-foreground w-6 text-right shrink-0">
                      {i + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium truncate">
                          {p.product?.name ?? "(deleted product)"}
                        </span>
                        <span className="text-sm font-bold text-[#8B6914] shrink-0 ml-2">
                          {formatPrice(revenue)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full bg-[#8B6914]/60"
                            style={{ width: `${barWidth}%` }}
                          />
                        </div>
                        <span className="text-xs text-muted-foreground shrink-0 w-16 text-right">
                          {units} sold
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
