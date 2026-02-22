"use client";

import * as React from "react";
import {
  DollarSign,
  ShoppingCart,
  Users,
  Activity,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

import { PageHeader } from "@/components/admin/shared/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from "@/components/ui/chart";

// Color palette
const COLORS = {
  gold: "#8B6914",
  forest: "#1B4332",
  sienna: "#A0522D",
  wheat: "#D4A854",
  sage: "#6B8F71",
};

// Date range options
const dateRanges = [
  { label: "7 days", value: "7d" },
  { label: "30 days", value: "30d" },
  { label: "90 days", value: "90d" },
  { label: "12 months", value: "12m" },
];

// Metric cards data
const metricCards = [
  {
    label: "Revenue This Month",
    value: "$267,450",
    trend: 18.2,
    icon: DollarSign,
    iconBg: "bg-green-100",
    iconColor: "text-green-700",
  },
  {
    label: "Orders This Month",
    value: "312",
    trend: 12.5,
    icon: ShoppingCart,
    iconBg: "bg-blue-100",
    iconColor: "text-blue-700",
  },
  {
    label: "New Customers",
    value: "89",
    trend: 22.1,
    icon: Users,
    iconBg: "bg-purple-100",
    iconColor: "text-purple-700",
  },
  {
    label: "Conversion Rate",
    value: "3.2%",
    trend: -0.5,
    icon: Activity,
    iconBg: "bg-amber-100",
    iconColor: "text-amber-700",
  },
];

// Orders by status
const ordersByStatus = [
  { status: "Pending", count: 42, percentage: 13.5, color: "#EAB308" },
  { status: "Processing", count: 68, percentage: 21.8, color: "#3B82F6" },
  { status: "Shipped", count: 87, percentage: 27.9, color: "#A855F7" },
  { status: "Delivered", count: 98, percentage: 31.4, color: "#22C55E" },
  { status: "Cancelled", count: 17, percentage: 5.4, color: "#EF4444" },
];

// Revenue data (monthly)
const revenueData = [
  { month: "Jan", revenue: 42500 },
  { month: "Feb", revenue: 38900 },
  { month: "Mar", revenue: 51200 },
  { month: "Apr", revenue: 47800 },
  { month: "May", revenue: 53400 },
  { month: "Jun", revenue: 58200 },
  { month: "Jul", revenue: 62100 },
  { month: "Aug", revenue: 55800 },
  { month: "Sep", revenue: 49300 },
  { month: "Oct", revenue: 67500 },
  { month: "Nov", revenue: 78900 },
  { month: "Dec", revenue: 92400 },
];

const revenueConfig: ChartConfig = {
  revenue: {
    label: "Revenue",
    color: COLORS.forest,
  },
};

// Orders data (weekly)
const ordersData = [
  { week: "W1", orders: 45 },
  { week: "W2", orders: 52 },
  { week: "W3", orders: 38 },
  { week: "W4", orders: 65 },
  { week: "W5", orders: 58 },
  { week: "W6", orders: 72 },
  { week: "W7", orders: 49 },
  { week: "W8", orders: 84 },
  { week: "W9", orders: 67 },
  { week: "W10", orders: 91 },
  { week: "W11", orders: 103 },
  { week: "W12", orders: 118 },
];

const ordersConfig: ChartConfig = {
  orders: {
    label: "Orders",
    color: COLORS.gold,
  },
};

// Conversion funnel data (enhanced)
const funnelData = [
  { stage: "Site Visitors", count: 285000 },
  { stage: "Product Views", count: 142000 },
  { stage: "Add to Cart", count: 28500 },
  { stage: "Checkout", count: 8200 },
  { stage: "Purchase", count: 4500 },
];

// Top products (enhanced)
const topProducts = [
  { name: "Oakwood Sofa", unitsSold: 142, revenue: 284000 },
  { name: "Walnut Dining Table", unitsSold: 98, revenue: 195510 },
  { name: "Modern Bookshelf", unitsSold: 87, revenue: 86913 },
  { name: "Leather Armchair", unitsSold: 76, revenue: 113924 },
  { name: "Standing Desk", unitsSold: 68, revenue: 67932 },
  { name: "Bed Frame - King", unitsSold: 54, revenue: 107946 },
  { name: "Coffee Table", unitsSold: 52, revenue: 36348 },
  { name: "TV Console", unitsSold: 49, revenue: 53851 },
  { name: "Nightstand", unitsSold: 45, revenue: 22455 },
  { name: "Outdoor Lounge Chair", unitsSold: 41, revenue: 32759 },
];

// Category revenue data (for pie chart)
const categoryData = [
  { name: "Living Room", value: 245800, fill: COLORS.gold },
  { name: "Bedroom", value: 189400, fill: COLORS.forest },
  { name: "Dining", value: 156200, fill: COLORS.sienna },
  { name: "Office", value: 134600, fill: COLORS.wheat },
  { name: "Outdoor", value: 78500, fill: COLORS.sage },
];

const categoryConfig: ChartConfig = {
  "Living Room": { label: "Living Room", color: COLORS.gold },
  Bedroom: { label: "Bedroom", color: COLORS.forest },
  Dining: { label: "Dining", color: COLORS.sienna },
  Office: { label: "Office", color: COLORS.wheat },
  Outdoor: { label: "Outdoor", color: COLORS.sage },
};

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatLargeNumber(num: number): string {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toLocaleString();
}

export default function AnalyticsPage() {
  const [selectedRange, setSelectedRange] = React.useState("12m");
  const [customFrom, setCustomFrom] = React.useState("");
  const [customTo, setCustomTo] = React.useState("");

  const maxTopRevenue = topProducts[0]?.revenue ?? 1;

  // Funnel gradient colors from light to dark
  const funnelColors = ["#D4A854", "#C2943A", "#A0522D", "#8B6914", "#1B4332"];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Analytics"
        description="Track your store performance"
      />

      {/* Date Range Selector */}
      <Card>
        <CardContent className="flex flex-col sm:flex-row items-start sm:items-center gap-4 pt-6">
          <div className="flex gap-1">
            {dateRanges.map((range) => (
              <Button
                key={range.value}
                variant={selectedRange === range.value ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedRange(range.value)}
              >
                {range.label}
              </Button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <Label className="text-sm text-muted-foreground whitespace-nowrap">
              Custom:
            </Label>
            <Input
              type="date"
              value={customFrom}
              onChange={(e) => setCustomFrom(e.target.value)}
              className="h-8 w-36"
            />
            <span className="text-muted-foreground">to</span>
            <Input
              type="date"
              value={customTo}
              onChange={(e) => setCustomTo(e.target.value)}
              className="h-8 w-36"
            />
          </div>
        </CardContent>
      </Card>

      {/* 4 Metric Cards with Trends */}
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
                    vs last month
                  </span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* 2 Large Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="border-[#1B4332]/20">
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="flex size-14 items-center justify-center rounded-full bg-[#1B4332]/10">
              <DollarSign className="size-7 text-[#1B4332]" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">
                Total Revenue (All Time)
              </p>
              <p className="text-3xl font-bold text-[#1B4332]">$1,245,890</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-[#8B6914]/20">
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="flex size-14 items-center justify-center rounded-full bg-[#8B6914]/10">
              <ShoppingCart className="size-7 text-[#8B6914]" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">
                Total Orders (All Time)
              </p>
              <p className="text-3xl font-bold text-[#8B6914]">4,523</p>
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
          <div className="space-y-4">
            {ordersByStatus.map((item) => (
              <div key={item.status} className="space-y-1.5">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{item.status}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-muted-foreground">
                      {item.count} orders
                    </span>
                    <span className="font-medium w-12 text-right">
                      {item.percentage}%
                    </span>
                  </div>
                </div>
                <div className="h-3 w-full bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${item.percentage}%`,
                      backgroundColor: item.color,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Revenue Line Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Revenue</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={revenueConfig}
            className="h-[350px] w-full"
          >
            <LineChart
              data={revenueData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis
                tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
              />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    formatter={(value) => formatCurrency(value as number)}
                  />
                }
              />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="var(--color-revenue)"
                strokeWidth={2}
                dot={{ r: 4, fill: COLORS.forest }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Orders Bar Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={ordersConfig}
            className="h-[300px] w-full"
          >
            <BarChart
              data={ordersData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="week" />
              <YAxis />
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products Table (enhanced) */}
        <Card>
          <CardHeader>
            <CardTitle>Top Products</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topProducts.map((product, i) => {
                const barWidth = (product.revenue / maxTopRevenue) * 100;
                return (
                  <div
                    key={product.name}
                    className="flex items-center gap-3"
                  >
                    <span className="text-sm font-bold text-muted-foreground w-6 text-right shrink-0">
                      {i + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium truncate">
                          {product.name}
                        </span>
                        <span className="text-sm font-bold text-[#8B6914] shrink-0 ml-2">
                          {formatCurrency(product.revenue)}
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
                          {product.unitsSold} sold
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Category Revenue Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={categoryConfig}
              className="h-[350px] w-full"
            >
              <PieChart>
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      formatter={(value) => formatCurrency(value as number)}
                      nameKey="name"
                    />
                  }
                />
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={120}
                  paddingAngle={2}
                  dataKey="value"
                  nameKey="name"
                >
                  {categoryData.map((entry) => (
                    <Cell key={entry.name} fill={entry.fill} />
                  ))}
                </Pie>
                <ChartLegend
                  content={<ChartLegendContent nameKey="name" />}
                />
              </PieChart>
            </ChartContainer>
            <div className="mt-4 space-y-2">
              {categoryData.map((cat) => (
                <div
                  key={cat.name}
                  className="flex items-center justify-between text-sm"
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="size-3 rounded-full"
                      style={{ backgroundColor: cat.fill }}
                    />
                    <span>{cat.name}</span>
                  </div>
                  <span className="font-medium">
                    {formatCurrency(cat.value)}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Conversion Funnel (enhanced) */}
      <Card>
        <CardHeader>
          <CardTitle>Conversion Funnel</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-w-3xl mx-auto">
            {funnelData.map((stage, index) => {
              const maxCount = funnelData[0].count;
              const widthPct = Math.max(
                (stage.count / maxCount) * 100,
                15
              );
              const conversionFromPrevious =
                index > 0
                  ? (
                      (stage.count / funnelData[index - 1].count) *
                      100
                    ).toFixed(1)
                  : null;

              return (
                <div key={stage.stage}>
                  {index > 0 && (
                    <div className="flex justify-center py-1">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <TrendingDown className="size-3" />
                        <span>{conversionFromPrevious}% conversion</span>
                      </div>
                    </div>
                  )}
                  <div className="flex items-center justify-center">
                    <div
                      className="h-12 rounded-lg flex items-center justify-between px-4 text-white transition-all duration-500"
                      style={{
                        width: `${widthPct}%`,
                        backgroundColor: funnelColors[index],
                        minWidth: "200px",
                      }}
                    >
                      <span className="text-sm font-medium">
                        {stage.stage}
                      </span>
                      <span className="text-sm font-bold">
                        {formatLargeNumber(stage.count)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Overall conversion rate:{" "}
              <span className="font-bold text-foreground">
                {(
                  (funnelData[funnelData.length - 1].count /
                    funnelData[0].count) *
                  100
                ).toFixed(2)}
                %
              </span>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
