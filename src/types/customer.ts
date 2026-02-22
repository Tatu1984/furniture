// ---------------------------------------------------------------------------
// Customer types for the FSOW furniture e-commerce platform
// ---------------------------------------------------------------------------

/** Customer account status */
export type CustomerStatus = "active" | "inactive" | "suspended" | "banned";

/** Address type */
export type AddressType = "shipping" | "billing" | "both";

/** A saved customer address */
export type CustomerAddress = {
  id: string;
  type: AddressType;
  isDefault: boolean;
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
  label?: string; // e.g. "Home", "Office"
  createdAt: string;
  updatedAt: string;
};

/** Aggregated order history statistics */
export type OrderHistoryStats = {
  totalOrders: number;
  totalSpent: number;
  currency: string;
  averageOrderValue: number;
  lastOrderDate?: string;
  firstOrderDate?: string;
};

/** Wishlist item */
export type WishlistItem = {
  id: string;
  productId: string;
  productName: string;
  productSlug: string;
  productImage: string;
  price: number;
  compareAtPrice?: number;
  currency: string;
  addedAt: string;
};

/** Customer entity */
export type Customer = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string; // derived: `${firstName} ${lastName}`
  phone?: string;
  avatar?: string;

  status: CustomerStatus;

  addresses: CustomerAddress[];
  defaultShippingAddressId?: string;
  defaultBillingAddressId?: string;

  orderStats: OrderHistoryStats;

  wishlist?: WishlistItem[];

  /** Newsletter / marketing opt-in */
  isSubscribedToNewsletter: boolean;

  /** Whether the customer has verified their email */
  isEmailVerified: boolean;

  /** Preferred communication channel */
  preferredContact?: "email" | "phone" | "sms" | "whatsapp";

  /** Internal notes visible only to staff */
  notes?: string;

  /** Tags for segmentation (e.g. "VIP", "wholesale") */
  tags?: string[];

  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
};

/** Minimal customer reference embedded in orders, reviews, etc. */
export type CustomerRef = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  phone?: string;
};

/** Customer list query parameters (admin) */
export type CustomerListParams = {
  page?: number;
  perPage?: number;
  search?: string;
  status?: CustomerStatus;
  sort?: string;
  direction?: "asc" | "desc";
  tags?: string[];
  hasOrders?: boolean;
  subscribedToNewsletter?: boolean;
};
