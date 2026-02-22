// ---------------------------------------------------------------------------
// Common / shared types used across the FSOW furniture e-commerce platform
// ---------------------------------------------------------------------------

/** Generic paginated response wrapper */
export type Pagination = {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  perPage: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
};

/** Sort direction */
export type SortDirection = "asc" | "desc";

/** Reusable sort option (e.g. for product listings) */
export type SortOption = {
  label: string;
  field: string;
  direction: SortDirection;
};

/** Filter value — supports single value, array, or numeric range */
export type FilterValue = string | string[] | { min: number; max: number };

/** Reusable filter option for faceted navigation */
export type FilterOption = {
  id: string;
  label: string;
  field: string;
  type: "checkbox" | "radio" | "range" | "color" | "toggle";
  values: FilterOptionValue[];
};

export type FilterOptionValue = {
  label: string;
  value: string;
  count?: number;
  colorHex?: string;
};

/** Active filter state (what the user has currently selected) */
export type ActiveFilter = {
  field: string;
  value: FilterValue;
};

/** SEO metadata attached to pages, products, blog posts, etc. */
export type SEOData = {
  metaTitle: string;
  metaDescription: string;
  metaKeywords?: string[];
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  canonicalUrl?: string;
  structuredData?: Record<string, unknown>;
};

/** Physical showroom location */
export type Showroom = {
  id: string;
  name: string;
  slug: string;
  address: ShowroomAddress;
  phone: string;
  email: string;
  hours: ShowroomHours[];
  coordinates: {
    latitude: number;
    longitude: number;
  };
  images: string[];
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type ShowroomAddress = {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
};

export type ShowroomHours = {
  day:
    | "monday"
    | "tuesday"
    | "wednesday"
    | "thursday"
    | "friday"
    | "saturday"
    | "sunday";
  open: string; // e.g. "09:00"
  close: string; // e.g. "18:00"
  isClosed: boolean;
};

/** Generic image type reusable across the platform */
export type Image = {
  id: string;
  url: string;
  alt: string;
  width?: number;
  height?: number;
};

/** Physical dimensions of a piece of furniture */
export type Dimensions = {
  width: number;
  height: number;
  depth: number;
  unit: "cm" | "in" | "mm";
};

/** Money value with currency */
export type Money = {
  amount: number;
  currency: string; // ISO 4217, e.g. "USD", "INR"
};

/** Breadcrumb item for navigation */
export type BreadcrumbItem = {
  label: string;
  href: string;
};

/** Date-range filter helper */
export type DateRange = {
  from: string; // ISO 8601
  to: string;
};

/** Generic API response wrapper */
export type ApiResponse<T> = {
  data: T;
  success: boolean;
  message?: string;
  pagination?: Pagination;
};

/** Generic API error */
export type ApiError = {
  code: string;
  message: string;
  details?: Record<string, string[]>;
};
