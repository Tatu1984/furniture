import { NextResponse, type NextRequest } from "next/server";
import prisma from "@/lib/db";

// ---------------------------------------------------------------------------
// GET /api/admin/analytics - Dashboard statistics
// ---------------------------------------------------------------------------

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const period = searchParams.get("period") || "30d";

    // Calculate date range based on period
    const now = new Date();
    let startDate: Date;

    switch (period) {
      case "7d":
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case "30d":
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case "90d":
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case "365d":
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    // Previous period for comparison
    const periodMs = now.getTime() - startDate.getTime();
    const prevStartDate = new Date(startDate.getTime() - periodMs);

    // Run all queries in parallel for maximum performance
    const [
      // Current period metrics
      currentOrders,
      currentRevenue,
      currentCustomers,
      // Previous period metrics for comparison
      prevOrders,
      prevRevenue,
      prevCustomers,
      // General counts
      totalProducts,
      publishedProducts,
      lowStockProducts,
      outOfStockProducts,
      totalCustomers,
      // Recent orders
      recentOrders,
      // Top products by order count
      topProducts,
      // Order status breakdown
      orderStatusBreakdown,
      // Payment status breakdown
      paymentStatusBreakdown,
      // Revenue by day (for chart data)
      dailyOrders,
    ] = await Promise.all([
      // Current period order count
      prisma.order.count({
        where: { createdAt: { gte: startDate } },
      }),
      // Current period revenue
      prisma.order.aggregate({
        where: {
          createdAt: { gte: startDate },
          paymentStatus: { in: ["CAPTURED", "AUTHORIZED"] },
        },
        _sum: { total: true },
      }),
      // Current period new customers
      prisma.user.count({
        where: { role: "CUSTOMER", createdAt: { gte: startDate } },
      }),
      // Previous period order count
      prisma.order.count({
        where: {
          createdAt: { gte: prevStartDate, lt: startDate },
        },
      }),
      // Previous period revenue
      prisma.order.aggregate({
        where: {
          createdAt: { gte: prevStartDate, lt: startDate },
          paymentStatus: { in: ["CAPTURED", "AUTHORIZED"] },
        },
        _sum: { total: true },
      }),
      // Previous period new customers
      prisma.user.count({
        where: {
          role: "CUSTOMER",
          createdAt: { gte: prevStartDate, lt: startDate },
        },
      }),
      // Total products
      prisma.product.count(),
      // Published products
      prisma.product.count({ where: { status: "PUBLISHED" } }),
      // Low stock products
      prisma.product.count({
        where: { stockStatus: "LOW_STOCK", manageStock: true },
      }),
      // Out of stock products
      prisma.product.count({
        where: { stockStatus: "OUT_OF_STOCK", manageStock: true },
      }),
      // Total customers
      prisma.user.count({ where: { role: "CUSTOMER" } }),
      // Recent orders
      prisma.order.findMany({
        orderBy: { createdAt: "desc" },
        take: 10,
        select: {
          id: true,
          orderNumber: true,
          email: true,
          status: true,
          paymentStatus: true,
          total: true,
          currency: true,
          createdAt: true,
          user: {
            select: {
              firstName: true,
              lastName: true,
              avatar: true,
            },
          },
          _count: { select: { items: true } },
        },
      }),
      // Top products by order items
      prisma.orderItem.groupBy({
        by: ["productId"],
        where: {
          order: { createdAt: { gte: startDate } },
          productId: { not: null },
        },
        _sum: { quantity: true, total: true },
        _count: true,
        orderBy: { _sum: { total: "desc" } },
        take: 10,
      }),
      // Order status breakdown
      prisma.order.groupBy({
        by: ["status"],
        where: { createdAt: { gte: startDate } },
        _count: true,
      }),
      // Payment status breakdown
      prisma.order.groupBy({
        by: ["paymentStatus"],
        where: { createdAt: { gte: startDate } },
        _count: true,
      }),
      // Daily orders for chart
      prisma.order.groupBy({
        by: ["createdAt"],
        where: { createdAt: { gte: startDate } },
        _count: true,
        _sum: { total: true },
        orderBy: { createdAt: "asc" },
      }),
    ]);

    // Fetch product names for top products
    const topProductIds = topProducts
      .map((p) => p.productId)
      .filter(Boolean) as string[];
    const productDetails = topProductIds.length > 0
      ? await prisma.product.findMany({
          where: { id: { in: topProductIds } },
          select: { id: true, name: true, slug: true, sku: true },
        })
      : [];
    const productMap = new Map(productDetails.map((p) => [p.id, p]));

    const topProductsWithNames = topProducts.map((p) => ({
      ...p,
      product: p.productId ? productMap.get(p.productId) : null,
    }));

    // Calculate percentage changes
    const currentRevenueValue = Number(currentRevenue._sum.total ?? 0);
    const prevRevenueValue = Number(prevRevenue._sum.total ?? 0);

    const revenueChange =
      prevRevenueValue > 0
        ? ((currentRevenueValue - prevRevenueValue) / prevRevenueValue) * 100
        : currentRevenueValue > 0
          ? 100
          : 0;

    const ordersChange =
      prevOrders > 0
        ? ((currentOrders - prevOrders) / prevOrders) * 100
        : currentOrders > 0
          ? 100
          : 0;

    const customersChange =
      prevCustomers > 0
        ? ((currentCustomers - prevCustomers) / prevCustomers) * 100
        : currentCustomers > 0
          ? 100
          : 0;

    // Aggregate daily orders into date buckets
    const dailyMap = new Map<string, { count: number; revenue: number }>();
    for (const entry of dailyOrders) {
      const dateKey = new Date(entry.createdAt).toISOString().split("T")[0];
      const existing = dailyMap.get(dateKey) || { count: 0, revenue: 0 };
      existing.count += entry._count;
      existing.revenue += Number(entry._sum.total ?? 0);
      dailyMap.set(dateKey, existing);
    }

    const chartData = Array.from(dailyMap.entries()).map(
      ([date, data]) => ({
        date,
        orders: data.count,
        revenue: data.revenue,
      }),
    );

    return NextResponse.json({
      data: {
        overview: {
          revenue: {
            current: currentRevenueValue,
            previous: prevRevenueValue,
            change: Math.round(revenueChange * 100) / 100,
          },
          orders: {
            current: currentOrders,
            previous: prevOrders,
            change: Math.round(ordersChange * 100) / 100,
          },
          customers: {
            current: currentCustomers,
            previous: prevCustomers,
            change: Math.round(customersChange * 100) / 100,
            total: totalCustomers,
          },
          products: {
            total: totalProducts,
            published: publishedProducts,
            lowStock: lowStockProducts,
            outOfStock: outOfStockProducts,
          },
          averageOrderValue:
            currentOrders > 0
              ? Math.round((currentRevenueValue / currentOrders) * 100) / 100
              : 0,
        },
        recentOrders,
        topProducts: topProductsWithNames,
        orderStatusBreakdown: orderStatusBreakdown.map((s) => ({
          status: s.status,
          count: s._count,
        })),
        paymentStatusBreakdown: paymentStatusBreakdown.map((s) => ({
          status: s.paymentStatus,
          count: s._count,
        })),
        chartData,
        period,
      },
    });
  } catch (error) {
    console.error("GET /api/admin/analytics error:", error);
    return NextResponse.json(
      { error: "Failed to fetch analytics" },
      { status: 500 },
    );
  }
}
