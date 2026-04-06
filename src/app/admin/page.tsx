"use client";

import * as React from "react";
import Link from "next/link";
import {
  DollarSign,
  ShoppingCart,
  Package,
  Users,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  ArrowUpRight,
  Star,
  Loader2,
} from "lucide-react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { StatusBadge } from "@/components/shared/status-badge";
import { formatPrice } from "@/lib/format";

// --- Chart configs ---

const revenueChartConfig: ChartConfig = {
  revenue: { label: "Revenue", color: "#c2703e" },
};

const ordersChartConfig: ChartConfig = {
  orders: { label: "Orders", color: "#b45c2f" },
};

// --- Types ---

type DashboardData = {
  overview: {
    revenue: { current: number; change: number };
    orders: { current: number; change: number };
    customers: { total: number; change: number };
    products: { total: number; lowStock: number; outOfStock: number };
    averageOrderValue: number;
  };
  recentOrders: Array<{
    id: string;
    orderNumber: string;
    email: string;
    status: string;
    paymentStatus: string;
    total: number;
    createdAt: string;
    user?: { firstName: string; lastName: string };
    _count?: { items: number };
  }>;
  topProducts: Array<{
    productId: string;
    product?: { name: string };
    _sum?: { quantity: number; total: number };
    _count: number;
  }>;
  chartData: Array<{ date: string; orders: number; revenue: number }>;
};

// --- Component ---

export default function AdminDashboardPage() {
  const [data, setData] = React.useState<DashboardData | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchDashboard() {
      try {
        const res = await fetch("/api/admin/analytics?period=30d");
        if (res.ok) {
          const json = await res.json();
          setData(json.data);
        }
      } catch {
        console.error("Failed to fetch dashboard data");
      } finally {
        setLoading(false);
      }
    }
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-24 text-muted-foreground">
        <p>Failed to load dashboard. Make sure the database is connected.</p>
        <Button variant="outline" className="mt-4" onClick={() => window.location.reload()}>
          Retry
        </Button>
      </div>
    );
  }

  const { overview, recentOrders, topProducts, chartData } = data;

  const stats = [
    {
      label: "Revenue (30d)",
      value: formatPrice(overview.revenue.current),
      trend: overview.revenue.change,
      icon: DollarSign,
      iconBg: "bg-green-100",
      iconColor: "text-green-700",
    },
    {
      label: "Orders (30d)",
      value: String(overview.orders.current),
      trend: overview.orders.change,
      icon: ShoppingCart,
      iconBg: "bg-blue-100",
      iconColor: "text-blue-700",
    },
    {
      label: "Total Products",
      value: String(overview.products.total),
      trend: 0,
      icon: Package,
      iconBg: "bg-amber-100",
      iconColor: "text-amber-700",
    },
    {
      label: "Total Customers",
      value: String(overview.customers.total),
      trend: overview.customers.change,
      icon: Users,
      iconBg: "bg-purple-100",
      iconColor: "text-purple-700",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Stat Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          const isPositive = stat.trend >= 0;
          return (
            <Card key={stat.label}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.label}
                </CardTitle>
                <div className={`flex size-9 items-center justify-center rounded-full ${stat.iconBg}`}>
                  <Icon className={`size-4 ${stat.iconColor}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                {stat.trend !== 0 && (
                  <div className="flex items-center gap-1 mt-1">
                    {isPositive ? (
                      <TrendingUp className="size-3.5 text-green-600" />
                    ) : (
                      <TrendingDown className="size-3.5 text-red-600" />
                    )}
                    <span className={`text-xs font-medium ${isPositive ? "text-green-600" : "text-red-600"}`}>
                      {isPositive ? "+" : ""}{stat.trend.toFixed(1)}%
                    </span>
                    <span className="text-xs text-muted-foreground">vs prev period</span>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Charts Row */}
      {chartData.length > 0 && (
        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Revenue (Last 30 Days)</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={revenueChartConfig} className="h-[300px] w-full">
                <AreaChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8}
                    tickFormatter={(d) => new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })} />
                  <YAxis tickLine={false} axisLine={false} tickMargin={8}
                    tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
                  <ChartTooltip content={<ChartTooltipContent formatter={(v) => formatPrice(Number(v))} />} />
                  <defs>
                    <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#c2703e" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="#c2703e" stopOpacity={0.05} />
                    </linearGradient>
                  </defs>
                  <Area type="monotone" dataKey="revenue" stroke="var(--color-revenue)" strokeWidth={2} fill="url(#revenueGrad)" />
                </AreaChart>
              </ChartContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Orders (Last 30 Days)</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={ordersChartConfig} className="h-[300px] w-full">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8}
                    tickFormatter={(d) => new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })} />
                  <YAxis tickLine={false} axisLine={false} tickMargin={8} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="orders" fill="var(--color-orders)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Recent Orders Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Recent Orders</CardTitle>
          <Button variant="outline" size="sm" asChild>
            <Link href="/admin/orders">
              View All Orders
              <ArrowUpRight className="ml-1 size-3.5" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          {recentOrders.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No orders yet</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order #</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead className="text-center">Items</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell>
                      <Link href={`/admin/orders/${order.id}`} className="font-medium text-[#8B6914] hover:underline">
                        {order.orderNumber}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium text-sm">
                          {order.user ? `${order.user.firstName} ${order.user.lastName}` : order.email}
                        </p>
                        <p className="text-xs text-muted-foreground">{order.email}</p>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">{order._count?.items || 0}</TableCell>
                    <TableCell className="text-right font-medium">
                      {formatPrice(Number(order.total))}
                    </TableCell>
                    <TableCell><StatusBadge status={order.status} /></TableCell>
                    <TableCell><StatusBadge status={order.paymentStatus} /></TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {new Date(order.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Low Stock + Top Selling Row */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Low Stock Alerts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="size-4 text-orange-500" />
              Stock Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-3 rounded-lg border p-3 bg-red-50 dark:bg-red-950/20">
                <Package className="size-4 text-red-600 shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Out of Stock</p>
                </div>
                <p className="text-lg font-bold text-red-600">{overview.products.outOfStock}</p>
              </div>
              <div className="flex items-center gap-3 rounded-lg border p-3 bg-orange-50 dark:bg-orange-950/20">
                <Package className="size-4 text-orange-600 shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Low Stock</p>
                </div>
                <p className="text-lg font-bold text-orange-600">{overview.products.lowStock}</p>
              </div>
              <Button variant="outline" size="sm" asChild className="w-full">
                <Link href="/admin/inventory">View Inventory</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Top Selling Products */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="size-4 text-[#8B6914]" />
              Top Selling Products
            </CardTitle>
          </CardHeader>
          <CardContent>
            {topProducts.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No sales data yet</p>
            ) : (
              <div className="space-y-3">
                {topProducts.slice(0, 5).map((item, index) => (
                  <div key={item.productId || index} className="flex items-center gap-3 rounded-lg border p-3">
                    <div className="flex size-8 items-center justify-center rounded-full bg-[#8B6914]/10 text-[#8B6914] text-sm font-bold shrink-0">
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {item.product?.name || "Unknown Product"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {item._sum?.quantity || item._count} units sold
                      </p>
                    </div>
                    <p className="text-sm font-bold text-[#8B6914] shrink-0">
                      {formatPrice(Number(item._sum?.total || 0))}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Average Order Value */}
      {overview.averageOrderValue > 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Average Order Value</p>
                <p className="text-2xl font-bold">{formatPrice(overview.averageOrderValue)}</p>
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link href="/admin/analytics">
                  View Full Analytics
                  <ArrowUpRight className="ml-1 size-3.5" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
