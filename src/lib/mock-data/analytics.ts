// ---------------------------------------------------------------------------
// Analytics mock data — Dashboard statistics and charts
// ---------------------------------------------------------------------------

// ---- Types ----------------------------------------------------------------

export interface MonthlyRevenueEntry {
  month: string;
  revenue: number;
  orders: number;
}

export interface DailyOrdersEntry {
  date: string;
  orders: number;
  revenue: number;
}

export interface TopProductEntry {
  id: string;
  name: string;
  sales: number;
  revenue: number;
}

export interface CategoryRevenueEntry {
  category: string;
  revenue: number;
  percentage: number;
}

export interface ConversionFunnelEntry {
  stage: string;
  count: number;
  rate: number;
}

export interface OverviewStats {
  totalRevenue: number;
  totalOrders: number;
  totalProducts: number;
  totalCustomers: number;
}

// ---- Data -----------------------------------------------------------------

/** Monthly revenue for the past 12 months (Jan 2025 – Dec 2025) */
export const monthlyRevenue: MonthlyRevenueEntry[] = [
  { month: "Jan 2025", revenue: 124500, orders: 68 },
  { month: "Feb 2025", revenue: 98200, orders: 52 },
  { month: "Mar 2025", revenue: 142800, orders: 78 },
  { month: "Apr 2025", revenue: 156300, orders: 85 },
  { month: "May 2025", revenue: 168900, orders: 92 },
  { month: "Jun 2025", revenue: 189400, orders: 104 },
  { month: "Jul 2025", revenue: 175600, orders: 96 },
  { month: "Aug 2025", revenue: 162300, orders: 89 },
  { month: "Sep 2025", revenue: 198700, orders: 108 },
  { month: "Oct 2025", revenue: 215400, orders: 118 },
  { month: "Nov 2025", revenue: 248600, orders: 136 },
  { month: "Dec 2025", revenue: 267300, orders: 146 },
];

/** Daily orders for the last 30 days (Nov 23 – Dec 22, 2025) */
export const dailyOrders: DailyOrdersEntry[] = [
  { date: "2025-11-23", orders: 4, revenue: 6250 },
  { date: "2025-11-24", orders: 6, revenue: 9870 },
  { date: "2025-11-25", orders: 5, revenue: 8420 },
  { date: "2025-11-26", orders: 7, revenue: 12340 },
  { date: "2025-11-27", orders: 3, revenue: 4560 },
  { date: "2025-11-28", orders: 9, revenue: 18900 },
  { date: "2025-11-29", orders: 12, revenue: 24500 },
  { date: "2025-11-30", orders: 8, revenue: 15680 },
  { date: "2025-12-01", orders: 6, revenue: 11200 },
  { date: "2025-12-02", orders: 5, revenue: 8950 },
  { date: "2025-12-03", orders: 4, revenue: 7230 },
  { date: "2025-12-04", orders: 7, revenue: 13400 },
  { date: "2025-12-05", orders: 6, revenue: 10890 },
  { date: "2025-12-06", orders: 8, revenue: 16750 },
  { date: "2025-12-07", orders: 5, revenue: 9100 },
  { date: "2025-12-08", orders: 4, revenue: 7650 },
  { date: "2025-12-09", orders: 6, revenue: 11400 },
  { date: "2025-12-10", orders: 7, revenue: 14200 },
  { date: "2025-12-11", orders: 5, revenue: 8900 },
  { date: "2025-12-12", orders: 8, revenue: 17300 },
  { date: "2025-12-13", orders: 9, revenue: 19800 },
  { date: "2025-12-14", orders: 6, revenue: 11500 },
  { date: "2025-12-15", orders: 5, revenue: 9200 },
  { date: "2025-12-16", orders: 7, revenue: 13600 },
  { date: "2025-12-17", orders: 8, revenue: 16400 },
  { date: "2025-12-18", orders: 6, revenue: 12100 },
  { date: "2025-12-19", orders: 9, revenue: 19500 },
  { date: "2025-12-20", orders: 11, revenue: 22800 },
  { date: "2025-12-21", orders: 7, revenue: 14600 },
  { date: "2025-12-22", orders: 5, revenue: 10200 },
];

/** Top 10 selling products */
export const topProducts: TopProductEntry[] = [
  { id: "prod-001", name: "Modern Sofa", sales: 124, revenue: 235476 },
  { id: "prod-022", name: "Hybrid Mattress", sales: 203, revenue: 202797 },
  { id: "prod-032", name: "Standing Desk", sales: 156, revenue: 124644 },
  { id: "prod-033", name: "Ergonomic Office Chair", sales: 189, revenue: 170011 },
  { id: "prod-013", name: "Upholstered Bed Frame", sales: 112, revenue: 179088 },
  { id: "prod-043", name: "Adirondack Chair", sales: 82, revenue: 32718 },
  { id: "prod-023", name: "Extendable Dining Table", sales: 68, revenue: 122332 },
  { id: "prod-004", name: "Modular Sectional Sofa", sales: 47, revenue: 164453 },
  { id: "prod-046", name: "Arc Floor Lamp", sales: 64, revenue: 28736 },
  { id: "prod-014", name: "Walnut Nightstand", sales: 87, revenue: 39063 },
];

/** Revenue breakdown by category */
export const categoryRevenue: CategoryRevenueEntry[] = [
  { category: "Living Room", revenue: 624800, percentage: 28.5 },
  { category: "Bedroom", revenue: 518200, percentage: 23.6 },
  { category: "Dining", revenue: 312400, percentage: 14.2 },
  { category: "Office", revenue: 398600, percentage: 18.2 },
  { category: "Outdoor", revenue: 224500, percentage: 10.2 },
  { category: "Decor", revenue: 115500, percentage: 5.3 },
];

/** Conversion funnel data */
export const conversionFunnel: ConversionFunnelEntry[] = [
  { stage: "Site Visitors", count: 285000, rate: 100 },
  { stage: "Product Views", count: 142500, rate: 50.0 },
  { stage: "Add to Cart", count: 28500, rate: 10.0 },
  { stage: "Checkout Started", count: 14250, rate: 5.0 },
  { stage: "Order Completed", count: 1172, rate: 0.41 },
];

/** Overview statistics for dashboard header */
export const overviewStats: OverviewStats = {
  totalRevenue: 2148000,
  totalOrders: 1172,
  totalProducts: 50,
  totalCustomers: 843,
};
