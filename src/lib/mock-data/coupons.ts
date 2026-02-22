// ---------------------------------------------------------------------------
// Coupons mock data — 15 promotional coupons
// ---------------------------------------------------------------------------

// ---- Types ----------------------------------------------------------------

export type CouponType = "percentage" | "fixed";
export type CouponStatus = "active" | "expired" | "draft";

export interface Coupon {
  id: string;
  code: string;
  type: CouponType;
  value: number;
  minOrderAmount: number;
  maxUsage: number;
  currentUsage: number;
  startDate: string;
  endDate: string;
  status: CouponStatus;
  applicableCategories: string[];
  applicableProducts: string[];
}

// ---- Data -----------------------------------------------------------------

export const coupons: Coupon[] = [
  {
    id: "cpn-001",
    code: "WELCOME10",
    type: "percentage",
    value: 10,
    minOrderAmount: 200,
    maxUsage: 1000,
    currentUsage: 342,
    startDate: "2025-01-01T00:00:00Z",
    endDate: "2025-12-31T23:59:59Z",
    status: "active",
    applicableCategories: [],
    applicableProducts: [],
  },
  {
    id: "cpn-002",
    code: "SUMMER25",
    type: "percentage",
    value: 25,
    minOrderAmount: 500,
    maxUsage: 500,
    currentUsage: 498,
    startDate: "2025-06-01T00:00:00Z",
    endDate: "2025-08-31T23:59:59Z",
    status: "expired",
    applicableCategories: ["cat-outdoor"],
    applicableProducts: [],
  },
  {
    id: "cpn-003",
    code: "FREESHIP",
    type: "fixed",
    value: 99,
    minOrderAmount: 999,
    maxUsage: 2000,
    currentUsage: 876,
    startDate: "2025-01-01T00:00:00Z",
    endDate: "2025-12-31T23:59:59Z",
    status: "active",
    applicableCategories: [],
    applicableProducts: [],
  },
  {
    id: "cpn-004",
    code: "OFFICE15",
    type: "percentage",
    value: 15,
    minOrderAmount: 300,
    maxUsage: 300,
    currentUsage: 145,
    startDate: "2025-03-01T00:00:00Z",
    endDate: "2025-12-31T23:59:59Z",
    status: "active",
    applicableCategories: ["cat-office"],
    applicableProducts: [],
  },
  {
    id: "cpn-005",
    code: "BEDROOM20",
    type: "percentage",
    value: 20,
    minOrderAmount: 500,
    maxUsage: 200,
    currentUsage: 87,
    startDate: "2025-09-01T00:00:00Z",
    endDate: "2026-02-28T23:59:59Z",
    status: "active",
    applicableCategories: ["cat-bedroom"],
    applicableProducts: [],
  },
  {
    id: "cpn-006",
    code: "FLAT50",
    type: "fixed",
    value: 50,
    minOrderAmount: 500,
    maxUsage: 1000,
    currentUsage: 412,
    startDate: "2025-01-01T00:00:00Z",
    endDate: "2025-06-30T23:59:59Z",
    status: "expired",
    applicableCategories: [],
    applicableProducts: [],
  },
  {
    id: "cpn-007",
    code: "VIP30",
    type: "percentage",
    value: 30,
    minOrderAmount: 1000,
    maxUsage: 50,
    currentUsage: 23,
    startDate: "2025-10-01T00:00:00Z",
    endDate: "2026-03-31T23:59:59Z",
    status: "active",
    applicableCategories: [],
    applicableProducts: [],
  },
  {
    id: "cpn-008",
    code: "MATTRESS100",
    type: "fixed",
    value: 100,
    minOrderAmount: 800,
    maxUsage: 150,
    currentUsage: 92,
    startDate: "2025-05-01T00:00:00Z",
    endDate: "2025-12-31T23:59:59Z",
    status: "active",
    applicableCategories: [],
    applicableProducts: ["prod-022"],
  },
  {
    id: "cpn-009",
    code: "DINING10",
    type: "percentage",
    value: 10,
    minOrderAmount: 200,
    maxUsage: 400,
    currentUsage: 189,
    startDate: "2025-04-01T00:00:00Z",
    endDate: "2025-12-31T23:59:59Z",
    status: "active",
    applicableCategories: ["cat-dining"],
    applicableProducts: [],
  },
  {
    id: "cpn-010",
    code: "HOLIDAY200",
    type: "fixed",
    value: 200,
    minOrderAmount: 2000,
    maxUsage: 100,
    currentUsage: 15,
    startDate: "2025-11-15T00:00:00Z",
    endDate: "2026-01-15T23:59:59Z",
    status: "active",
    applicableCategories: [],
    applicableProducts: [],
  },
  {
    id: "cpn-011",
    code: "NEWYEAR15",
    type: "percentage",
    value: 15,
    minOrderAmount: 300,
    maxUsage: 500,
    currentUsage: 0,
    startDate: "2026-01-01T00:00:00Z",
    endDate: "2026-01-31T23:59:59Z",
    status: "draft",
    applicableCategories: [],
    applicableProducts: [],
  },
  {
    id: "cpn-012",
    code: "DECOR20",
    type: "percentage",
    value: 20,
    minOrderAmount: 100,
    maxUsage: 250,
    currentUsage: 134,
    startDate: "2025-07-01T00:00:00Z",
    endDate: "2025-12-31T23:59:59Z",
    status: "active",
    applicableCategories: ["cat-decor"],
    applicableProducts: [],
  },
  {
    id: "cpn-013",
    code: "FLASH500",
    type: "fixed",
    value: 500,
    minOrderAmount: 3000,
    maxUsage: 25,
    currentUsage: 25,
    startDate: "2025-11-29T00:00:00Z",
    endDate: "2025-11-29T23:59:59Z",
    status: "expired",
    applicableCategories: [],
    applicableProducts: [],
  },
  {
    id: "cpn-014",
    code: "SPRING2026",
    type: "percentage",
    value: 15,
    minOrderAmount: 400,
    maxUsage: 600,
    currentUsage: 0,
    startDate: "2026-03-01T00:00:00Z",
    endDate: "2026-05-31T23:59:59Z",
    status: "draft",
    applicableCategories: ["cat-living-room", "cat-outdoor"],
    applicableProducts: [],
  },
  {
    id: "cpn-015",
    code: "DESK75",
    type: "fixed",
    value: 75,
    minOrderAmount: 600,
    maxUsage: 200,
    currentUsage: 67,
    startDate: "2025-08-01T00:00:00Z",
    endDate: "2026-01-31T23:59:59Z",
    status: "active",
    applicableCategories: [],
    applicableProducts: ["prod-032", "prod-034", "prod-035"],
  },
];

// ---- Lookup helpers -------------------------------------------------------

export function getCouponByCode(code: string): Coupon | undefined {
  return coupons.find((c) => c.code.toUpperCase() === code.toUpperCase());
}

export function getActiveCoupons(): Coupon[] {
  return coupons.filter((c) => c.status === "active");
}

export function getCouponById(id: string): Coupon | undefined {
  return coupons.find((c) => c.id === id);
}
