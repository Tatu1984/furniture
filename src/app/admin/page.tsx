"use client";

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
  Clock,
  Star,
  RefreshCw,
  Eye,
  UserPlus,
  Edit,
  CheckCircle2,
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
import { Badge } from "@/components/ui/badge";
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

// --- Hardcoded Data ---

const stats = [
  {
    label: "Total Revenue",
    value: 1245890,
    prefix: "$",
    trend: 12.5,
    icon: DollarSign,
    iconBg: "bg-green-100",
    iconColor: "text-green-700",
  },
  {
    label: "Orders Today",
    value: 24,
    prefix: "",
    trend: 8.3,
    icon: ShoppingCart,
    iconBg: "bg-blue-100",
    iconColor: "text-blue-700",
  },
  {
    label: "Total Products",
    value: 156,
    prefix: "",
    trend: 3.2,
    icon: Package,
    iconBg: "bg-amber-100",
    iconColor: "text-amber-700",
  },
  {
    label: "Total Customers",
    value: 1847,
    prefix: "",
    trend: 15.7,
    icon: Users,
    iconBg: "bg-purple-100",
    iconColor: "text-purple-700",
  },
];

const revenueData = [
  { month: "Jan", revenue: 65000 },
  { month: "Feb", revenue: 72000 },
  { month: "Mar", revenue: 89000 },
  { month: "Apr", revenue: 95000 },
  { month: "May", revenue: 110000 },
  { month: "Jun", revenue: 102000 },
  { month: "Jul", revenue: 118000 },
  { month: "Aug", revenue: 125000 },
  { month: "Sep", revenue: 130000 },
  { month: "Oct", revenue: 115000 },
  { month: "Nov", revenue: 140000 },
  { month: "Dec", revenue: 155000 },
];

const ordersData = [
  { day: "Mon", orders: 18 },
  { day: "Tue", orders: 24 },
  { day: "Wed", orders: 32 },
  { day: "Thu", orders: 28 },
  { day: "Fri", orders: 35 },
  { day: "Sat", orders: 42 },
  { day: "Sun", orders: 22 },
];

const recentOrders = [
  {
    id: "ORD-2024-051",
    customer: "Sarah Mitchell",
    email: "sarah.mitchell@email.com",
    items: 3,
    status: "delivered",
    paymentStatus: "paid",
    total: 2499.0,
    date: "2024-12-15",
  },
  {
    id: "ORD-2024-050",
    customer: "James Rodriguez",
    email: "james.rodriguez@email.com",
    items: 1,
    status: "shipped",
    paymentStatus: "paid",
    total: 899.0,
    date: "2024-12-14",
  },
  {
    id: "ORD-2024-049",
    customer: "Emily Chen",
    email: "emily.chen@email.com",
    items: 5,
    status: "processing",
    paymentStatus: "paid",
    total: 4250.0,
    date: "2024-12-14",
  },
  {
    id: "ORD-2024-048",
    customer: "Michael Thompson",
    email: "m.thompson@email.com",
    items: 2,
    status: "pending",
    paymentStatus: "pending",
    total: 1675.5,
    date: "2024-12-13",
  },
  {
    id: "ORD-2024-047",
    customer: "Olivia Williams",
    email: "olivia.w@email.com",
    items: 4,
    status: "cancelled",
    paymentStatus: "refunded",
    total: 3150.0,
    date: "2024-12-13",
  },
];

const lowStockProducts = [
  {
    name: "Scandinavian Oak Dining Table",
    sku: "FSOW-DT-4201",
    stock: 0,
    threshold: 5,
    image: "/placeholder.svg",
  },
  {
    name: "Velvet Accent Chair - Emerald",
    sku: "FSOW-AC-1102",
    stock: 2,
    threshold: 10,
    image: "/placeholder.svg",
  },
  {
    name: "Walnut Floating Shelf Set",
    sku: "FSOW-SH-3305",
    stock: 3,
    threshold: 8,
    image: "/placeholder.svg",
  },
  {
    name: "Linen Throw Pillow - Sand",
    sku: "FSOW-TP-5501",
    stock: 4,
    threshold: 15,
    image: "/placeholder.svg",
  },
  {
    name: "Ceramic Table Lamp - Matte Black",
    sku: "FSOW-LM-7703",
    stock: 1,
    threshold: 5,
    image: "/placeholder.svg",
  },
];

const topSellingProducts = [
  { name: "Oakwood Sofa", unitsSold: 142, revenue: 284000 },
  { name: "Walnut Dining Table", unitsSold: 98, revenue: 195510 },
  { name: "Modern Bookshelf", unitsSold: 87, revenue: 86913 },
  { name: "Leather Armchair", unitsSold: 76, revenue: 113924 },
  { name: "Standing Desk", unitsSold: 68, revenue: 67932 },
];

const recentActivity = [
  {
    icon: ShoppingCart,
    text: "New order #ORD-2024-051 received from Sarah Mitchell",
    time: "2 minutes ago",
    color: "text-blue-600",
  },
  {
    icon: CheckCircle2,
    text: "Order #ORD-2024-048 marked as shipped",
    time: "15 minutes ago",
    color: "text-green-600",
  },
  {
    icon: Edit,
    text: "Product 'Scandinavian Oak Dining Table' updated",
    time: "32 minutes ago",
    color: "text-amber-600",
  },
  {
    icon: UserPlus,
    text: "Customer Kevin Harris registered",
    time: "1 hour ago",
    color: "text-purple-600",
  },
  {
    icon: Star,
    text: "New 5-star review on 'Oakwood Sofa' from Emily Chen",
    time: "1 hour ago",
    color: "text-yellow-600",
  },
  {
    icon: RefreshCw,
    text: "Refund processed for order #ORD-2024-047",
    time: "2 hours ago",
    color: "text-red-600",
  },
  {
    icon: Package,
    text: "Inventory restocked: 'Leather Armchair' +25 units",
    time: "3 hours ago",
    color: "text-green-600",
  },
  {
    icon: Eye,
    text: "Coupon 'WINTER25' created with 25% discount",
    time: "4 hours ago",
    color: "text-blue-600",
  },
  {
    icon: ShoppingCart,
    text: "New order #ORD-2024-050 received from James Rodriguez",
    time: "5 hours ago",
    color: "text-blue-600",
  },
  {
    icon: Edit,
    text: "Product 'Walnut Floating Shelf Set' price updated to $89.99",
    time: "6 hours ago",
    color: "text-amber-600",
  },
];

const revenueChartConfig: ChartConfig = {
  revenue: {
    label: "Revenue",
    color: "#c2703e",
  },
};

const ordersChartConfig: ChartConfig = {
  orders: {
    label: "Orders",
    color: "#b45c2f",
  },
};

// --- Helpers ---

function formatNumber(num: number) {
  return num.toLocaleString("en-US");
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(amount);
}

// --- Component ---

export default function AdminDashboardPage() {
  return (
    <div className="space-y-6">
      {/* Stat Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          const isPositive = stat.trend > 0;
          return (
            <Card key={stat.label}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.label}
                </CardTitle>
                <div
                  className={`flex size-9 items-center justify-center rounded-full ${stat.iconBg}`}
                >
                  <Icon className={`size-4 ${stat.iconColor}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stat.prefix}
                  {formatNumber(stat.value)}
                </div>
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
                    {stat.trend}%
                  </span>
                  <span className="text-xs text-muted-foreground">
                    vs last month
                  </span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Charts Row */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Revenue Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={revenueChartConfig}
              className="h-[300px] w-full"
            >
              <AreaChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                />
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      formatter={(value) =>
                        `$${Number(value).toLocaleString()}`
                      }
                    />
                  }
                />
                <defs>
                  <linearGradient
                    id="revenueGrad"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="0%" stopColor="#c2703e" stopOpacity={0.3} />
                    <stop
                      offset="100%"
                      stopColor="#c2703e"
                      stopOpacity={0.05}
                    />
                  </linearGradient>
                </defs>
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="var(--color-revenue)"
                  strokeWidth={2}
                  fill="url(#revenueGrad)"
                />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Orders Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Orders This Week</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={ordersChartConfig}
              className="h-[300px] w-full"
            >
              <BarChart data={ordersData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="day"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                />
                <YAxis tickLine={false} axisLine={false} tickMargin={8} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar
                  dataKey="orders"
                  fill="var(--color-orders)"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

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
                    <Link
                      href={`/admin/orders/${order.id}`}
                      className="font-medium text-[#8B6914] hover:underline"
                    >
                      #{order.id}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium text-sm">{order.customer}</p>
                      <p className="text-xs text-muted-foreground">
                        {order.email}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">{order.items}</TableCell>
                  <TableCell className="text-right font-medium">
                    {formatCurrency(order.total)}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={order.status} />
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={order.paymentStatus} />
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {order.date}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Low Stock + Top Selling Row */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Low Stock Alerts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="size-4 text-orange-500" />
              Low Stock Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {lowStockProducts.map((product) => (
                <div
                  key={product.sku}
                  className="flex items-center gap-3 rounded-lg border p-3"
                >
                  <div className="flex size-8 items-center justify-center rounded bg-muted overflow-hidden shrink-0">
                    <Package className="size-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {product.name}
                    </p>
                    <p className="text-xs text-muted-foreground font-mono">
                      {product.sku}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p
                      className={`text-sm font-bold ${
                        product.stock === 0
                          ? "text-red-600"
                          : product.stock < 5
                            ? "text-orange-600"
                            : "text-muted-foreground"
                      }`}
                    >
                      {product.stock} in stock
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Threshold: {product.threshold}
                    </p>
                  </div>
                  <Button variant="outline" size="sm" className="shrink-0">
                    Reorder
                  </Button>
                </div>
              ))}
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
            <div className="space-y-3">
              {topSellingProducts.map((product, index) => (
                <div
                  key={product.name}
                  className="flex items-center gap-3 rounded-lg border p-3"
                >
                  <div className="flex size-8 items-center justify-center rounded-full bg-[#8B6914]/10 text-[#8B6914] text-sm font-bold shrink-0">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {product.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {product.unitsSold} units sold
                    </p>
                  </div>
                  <p className="text-sm font-bold text-[#8B6914] shrink-0">
                    {formatCurrency(product.revenue)}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="size-4 text-muted-foreground" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-1">
            {recentActivity.map((activity, index) => {
              const ActivityIcon = activity.icon;
              return (
                <div
                  key={index}
                  className="flex items-start gap-3 rounded-lg p-2.5 hover:bg-muted/50 transition-colors"
                >
                  <div
                    className={`mt-0.5 flex size-7 items-center justify-center rounded-full bg-muted shrink-0`}
                  >
                    <ActivityIcon className={`size-3.5 ${activity.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm">{activity.text}</p>
                  </div>
                  <Badge
                    variant="outline"
                    className="text-xs text-muted-foreground font-normal shrink-0"
                  >
                    {activity.time}
                  </Badge>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
