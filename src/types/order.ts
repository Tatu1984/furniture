// ---------------------------------------------------------------------------
// Order types for the FSOW furniture e-commerce platform
// ---------------------------------------------------------------------------

import type { Dimensions, Money } from "./common";
import type { CustomerRef } from "./customer";

/** Order lifecycle status */
export type OrderStatus =
  | "pending"
  | "confirmed"
  | "processing"
  | "shipped"
  | "out_for_delivery"
  | "delivered"
  | "cancelled"
  | "returned"
  | "refunded";

/** Payment status */
export type PaymentStatus =
  | "pending"
  | "authorized"
  | "captured"
  | "partially_refunded"
  | "refunded"
  | "failed"
  | "voided";

/** Payment method identifier */
export type PaymentMethod =
  | "credit_card"
  | "debit_card"
  | "upi"
  | "net_banking"
  | "wallet"
  | "cod"
  | "emi"
  | "bank_transfer";

/** Fulfillment status */
export type FulfillmentStatus =
  | "unfulfilled"
  | "partially_fulfilled"
  | "fulfilled"
  | "returned";

/** Shipping address on an order (snapshot at time of purchase) */
export type ShippingAddress = {
  firstName: string;
  lastName: string;
  company?: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone?: string;
};

/** Billing address on an order */
export type BillingAddress = ShippingAddress & {
  email: string;
  gstin?: string; // GST identification (India-specific)
};

/** Payment information recorded against the order */
export type PaymentInfo = {
  method: PaymentMethod;
  status: PaymentStatus;
  transactionId?: string;
  gatewayOrderId?: string;
  gateway?: string; // e.g. "razorpay", "stripe"
  cardLast4?: string;
  cardBrand?: string;
  bankName?: string;
  walletProvider?: string;
  emiTenure?: number; // months
  amount: number;
  currency: string;
  paidAt?: string;
  refundedAmount?: number;
  refundedAt?: string;
};

/** An individual line item inside an order */
export type OrderItem = {
  id: string;
  productId: string;
  variantId?: string;
  sku: string;
  name: string;
  slug: string;
  image: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  compareAtPrice?: number;
  currency: string;

  /** Variant attributes selected (e.g. "Colour: Walnut, Fabric: Linen") */
  attributes?: { name: string; value: string }[];

  /** Furniture-specific snapshot */
  dimensions?: Dimensions;
  weight?: number;
  weightUnit?: "kg" | "lb";
  assemblyRequired?: boolean;

  /** Discount applied to this line item */
  discountAmount?: number;
  couponCode?: string;

  /** Fulfillment */
  fulfillmentStatus: FulfillmentStatus;
  shippedAt?: string;
  deliveredAt?: string;
  trackingNumber?: string;
  trackingUrl?: string;
  carrier?: string;
};

/** Timeline / activity event on an order */
export type OrderTimeline = {
  id: string;
  orderId: string;
  status: OrderStatus;
  title: string;
  description?: string;
  createdBy?: string; // staff user ID or "system"
  createdAt: string;
};

/** Discount / coupon snapshot applied to the order */
export type OrderDiscount = {
  code: string;
  type: "percentage" | "fixed";
  value: number;
  amount: number; // actual discount amount in order currency
};

/** Full order entity */
export type Order = {
  id: string;
  orderNumber: string; // human-readable, e.g. "FSOW-10042"

  customer: CustomerRef;

  status: OrderStatus;
  paymentStatus: PaymentStatus;
  fulfillmentStatus: FulfillmentStatus;

  items: OrderItem[];

  // Addresses (snapshot)
  shippingAddress: ShippingAddress;
  billingAddress: BillingAddress;

  // Payment
  payment: PaymentInfo;

  // Money
  subtotal: number;
  shippingCost: number;
  taxAmount: number;
  taxRate?: number;
  discountAmount: number;
  total: number;
  currency: string;

  // Discounts
  discounts?: OrderDiscount[];

  // Shipping
  shippingMethod?: string; // e.g. "standard", "express", "white_glove"
  estimatedDeliveryDate?: string;
  trackingNumber?: string;
  trackingUrl?: string;
  carrier?: string;

  // Timeline
  timeline: OrderTimeline[];

  // Customer-facing notes
  customerNote?: string;

  // Internal staff notes
  internalNotes?: string;

  // Tags for filtering / segmentation
  tags?: string[];

  // Source / channel
  source?: "website" | "admin" | "phone" | "showroom" | "marketplace";

  // IP & device info (for fraud detection)
  ipAddress?: string;
  userAgent?: string;

  // Timestamps
  createdAt: string;
  updatedAt: string;
  confirmedAt?: string;
  shippedAt?: string;
  deliveredAt?: string;
  cancelledAt?: string;
  refundedAt?: string;
};

/** Order list query parameters */
export type OrderListParams = {
  page?: number;
  perPage?: number;
  search?: string;
  status?: OrderStatus;
  paymentStatus?: PaymentStatus;
  fulfillmentStatus?: FulfillmentStatus;
  customerId?: string;
  sort?: string;
  direction?: "asc" | "desc";
  dateFrom?: string;
  dateTo?: string;
  minTotal?: number;
  maxTotal?: number;
  source?: Order["source"];
};

/** Order summary for dashboards / customer account */
export type OrderSummary = {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  total: number;
  currency: string;
  itemCount: number;
  firstItemImage?: string;
  firstItemName?: string;
  createdAt: string;
};
