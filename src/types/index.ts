// ---------------------------------------------------------------------------
// Barrel export for all FSOW type definitions
// ---------------------------------------------------------------------------

export type {
  Pagination,
  SortDirection,
  SortOption,
  FilterValue,
  FilterOption,
  FilterOptionValue,
  ActiveFilter,
  SEOData,
  Showroom,
  ShowroomAddress,
  ShowroomHours,
  Image,
  Dimensions,
  Money,
  BreadcrumbItem,
  DateRange,
  ApiResponse,
  ApiError,
} from "./common";

export type {
  Category,
  CategoryRef,
  CategoryOption,
  CategoryTree,
} from "./category";

export type {
  ProductStatus,
  StockStatus,
  ProductImage,
  ProductSpecification,
  ProductVariant,
  VariantAttribute,
  ProductReview,
  RatingSummary,
  Product,
  ProductCard,
  ProductListParams,
} from "./product";

export type {
  CustomerStatus,
  AddressType,
  CustomerAddress,
  OrderHistoryStats,
  WishlistItem,
  Customer,
  CustomerRef,
  CustomerListParams,
} from "./customer";

export type {
  OrderStatus,
  PaymentStatus,
  PaymentMethod,
  FulfillmentStatus,
  ShippingAddress,
  BillingAddress,
  PaymentInfo,
  OrderItem,
  OrderTimeline,
  OrderDiscount,
  Order,
  OrderListParams,
  OrderSummary,
} from "./order";

export type {
  BlogPostStatus,
  Author,
  AuthorSocialLinks,
  BlogCategory,
  BlogPost,
  BlogPostCard,
  BlogListParams,
  BlogComment,
} from "./blog";

export type {
  DiscountType,
  CouponStatus,
  CouponScope,
  Coupon,
  CouponValidation,
  CouponErrorCode,
  CouponListParams,
} from "./coupon";
