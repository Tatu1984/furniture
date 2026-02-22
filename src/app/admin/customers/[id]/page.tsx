"use client";

import * as React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  Package,
  DollarSign,
  ShoppingCart,
  Star,
  CreditCard,
  Calculator,
  Mail,
  Phone,
  Calendar,
  Clock,
  MapPin,
  Tag,
  Plus,
  Edit,
  Trash2,
  Heart,
  LogIn,
  MessageSquare,
  UserPlus,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { StatusBadge } from "@/components/shared/status-badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getCustomerById } from "@/lib/mock-data/customers";

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatDateTime(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

// --- Hardcoded Rich Data for cust-001 Sarah Mitchell ---

const customerOrders = [
  {
    id: "FSOW-10042",
    date: "2025-12-05T14:30:00Z",
    items: 3,
    status: "delivered" as const,
    paymentStatus: "paid" as const,
    total: 2499,
  },
  {
    id: "FSOW-10038",
    date: "2025-11-18T09:15:00Z",
    items: 1,
    status: "delivered" as const,
    paymentStatus: "paid" as const,
    total: 1899,
  },
  {
    id: "FSOW-10029",
    date: "2025-10-22T11:00:00Z",
    items: 5,
    status: "delivered" as const,
    paymentStatus: "paid" as const,
    total: 3450,
  },
  {
    id: "FSOW-10015",
    date: "2025-08-14T16:30:00Z",
    items: 2,
    status: "delivered" as const,
    paymentStatus: "paid" as const,
    total: 1250,
  },
  {
    id: "FSOW-10008",
    date: "2025-06-02T10:00:00Z",
    items: 1,
    status: "delivered" as const,
    paymentStatus: "paid" as const,
    total: 899,
  },
  {
    id: "FSOW-09994",
    date: "2025-03-20T14:00:00Z",
    items: 2,
    status: "delivered" as const,
    paymentStatus: "paid" as const,
    total: 1799,
  },
  {
    id: "FSOW-09982",
    date: "2025-01-10T12:00:00Z",
    items: 1,
    status: "cancelled" as const,
    paymentStatus: "refunded" as const,
    total: 654,
  },
  {
    id: "FSOW-09970",
    date: "2024-11-05T09:30:00Z",
    items: 4,
    status: "delivered" as const,
    paymentStatus: "paid" as const,
    total: 2100,
  },
];

const customerReviews = [
  {
    id: "rev-1",
    productName: "Oakwood Sofa",
    productLink: "/admin/products/prod-001",
    rating: 5,
    title: "Absolutely stunning piece!",
    text: "This sofa exceeded all my expectations. The craftsmanship is impeccable, and the oak wood frame gives it such a warm, inviting feel. The cushions are perfectly firm yet comfortable. I receive compliments every time someone visits.",
    date: "2025-12-08T10:00:00Z",
  },
  {
    id: "rev-2",
    productName: "Walnut Dining Table",
    productLink: "/admin/products/prod-005",
    rating: 4,
    title: "Beautiful but minor scratch on delivery",
    text: "The table itself is gorgeous and the walnut grain is beautiful. Unfortunately there was a small scratch on one leg from shipping, but customer service sent a touch-up kit quickly. Would still recommend.",
    date: "2025-10-25T14:30:00Z",
  },
  {
    id: "rev-3",
    productName: "Leather Armchair",
    productLink: "/admin/products/prod-008",
    rating: 5,
    title: "My favorite reading spot",
    text: "The leather quality is exceptional and the chair has become my go-to spot for evening reading. It is aging beautifully and developing a lovely patina. Worth every penny.",
    date: "2025-08-20T09:00:00Z",
  },
  {
    id: "rev-4",
    productName: "Linen Throw Pillow Set",
    productLink: "/admin/products/prod-022",
    rating: 4,
    title: "Great quality, slightly smaller than expected",
    text: "The linen quality is top-notch and the sand color matches my living room perfectly. They were slightly smaller than I expected from the photos, but still a great purchase overall.",
    date: "2025-06-15T11:00:00Z",
  },
];

const customerAddresses = [
  {
    id: "addr-1",
    type: "Shipping",
    label: "Home",
    isDefault: true,
    street: "742 Evergreen Terrace",
    city: "San Francisco",
    state: "CA",
    zip: "94102",
    country: "US",
  },
  {
    id: "addr-2",
    type: "Billing",
    label: "Office",
    isDefault: false,
    street: "1 Market Street, Suite 400",
    city: "San Francisco",
    state: "CA",
    zip: "94105",
    country: "US",
  },
  {
    id: "addr-3",
    type: "Shipping",
    label: "Vacation Home",
    isDefault: false,
    street: "88 Lighthouse Ave",
    city: "Carmel-by-the-Sea",
    state: "CA",
    zip: "93921",
    country: "US",
  },
];

const customerActivity = [
  {
    icon: ShoppingCart,
    text: "Placed order #FSOW-10042 for 3 items",
    time: "2025-12-05T14:30:00Z",
    color: "text-blue-600",
  },
  {
    icon: Star,
    text: "Added review for 'Oakwood Sofa' (5 stars)",
    time: "2025-12-08T10:00:00Z",
    color: "text-yellow-600",
  },
  {
    icon: MapPin,
    text: "Updated shipping address (Vacation Home)",
    time: "2025-11-28T16:00:00Z",
    color: "text-purple-600",
  },
  {
    icon: LogIn,
    text: "Logged in from San Francisco, CA",
    time: "2025-12-12T09:15:00Z",
    color: "text-gray-600",
  },
  {
    icon: Heart,
    text: "Added 'Standing Desk - Walnut' to wishlist",
    time: "2025-12-10T14:30:00Z",
    color: "text-red-500",
  },
  {
    icon: ShoppingCart,
    text: "Placed order #FSOW-10038 for 1 item",
    time: "2025-11-18T09:15:00Z",
    color: "text-blue-600",
  },
  {
    icon: Star,
    text: "Added review for 'Walnut Dining Table' (4 stars)",
    time: "2025-10-25T14:30:00Z",
    color: "text-yellow-600",
  },
  {
    icon: MessageSquare,
    text: "Contacted support about delivery schedule",
    time: "2025-10-20T11:00:00Z",
    color: "text-blue-500",
  },
  {
    icon: LogIn,
    text: "Logged in from Carmel-by-the-Sea, CA",
    time: "2025-10-18T08:30:00Z",
    color: "text-gray-600",
  },
  {
    icon: Heart,
    text: "Added 'Ceramic Vase Set - Terracotta' to wishlist",
    time: "2025-10-15T16:45:00Z",
    color: "text-red-500",
  },
];

// Star rating component
function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          className={`size-3.5 ${
            i < rating
              ? "fill-yellow-400 text-yellow-400"
              : "fill-muted text-muted"
          }`}
        />
      ))}
    </div>
  );
}

export default function CustomerDetailPage() {
  const params = useParams();
  const customer = getCustomerById(params.id as string);
  const [notes, setNotes] = React.useState("");

  React.useEffect(() => {
    if (customer) {
      setNotes(customer.notes);
    }
  }, [customer]);

  if (!customer) {
    return (
      <div className="space-y-6">
        <Link href="/admin/customers">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 size-4" />
            Back to Customers
          </Button>
        </Link>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Customer not found.</p>
        </div>
      </div>
    );
  }

  const avgOrder =
    customer.orderCount > 0 ? customer.totalSpent / customer.orderCount : 0;
  const reviewCount = customerReviews.length;

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Link href="/admin/customers">
        <Button variant="ghost" size="sm">
          <ArrowLeft className="mr-2 size-4" />
          Back to Customers
        </Button>
      </Link>

      {/* Header Card */}
      <Card>
        <CardContent className="flex flex-col sm:flex-row items-start sm:items-center gap-6 pt-6">
          <Avatar className="size-20">
            <AvatarImage
              src={customer.avatar}
              alt={`${customer.firstName} ${customer.lastName}`}
            />
            <AvatarFallback className="text-2xl bg-[#8B6914]/10 text-[#8B6914]">
              {customer.firstName[0]}
              {customer.lastName[0]}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-1">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold">
                {customer.firstName} {customer.lastName}
              </h1>
              <StatusBadge status="active" />
            </div>
            <a
              href={`mailto:${customer.email}`}
              className="text-muted-foreground hover:underline text-sm"
            >
              {customer.email}
            </a>
            {customer.tags.length > 0 && (
              <div className="flex gap-2 pt-1">
                {customer.tags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="outline"
                    className={
                      tag === "vip"
                        ? "bg-amber-100 text-amber-800 border-amber-200"
                        : tag === "repeat-buyer"
                          ? "bg-blue-100 text-blue-800 border-blue-200"
                          : "bg-gray-100 text-gray-800 border-gray-200"
                    }
                  >
                    {tag
                      .split("-")
                      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                      .join(" ")}
                  </Badge>
                ))}
              </div>
            )}
          </div>
          <Button>
            <Edit className="mr-2 size-4" />
            Edit Customer
          </Button>
        </CardContent>
      </Card>

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="flex size-10 items-center justify-center rounded-lg bg-blue-100 text-blue-700">
              <ShoppingCart className="size-5" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Orders</p>
              <p className="text-2xl font-bold">{customer.orderCount}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="flex size-10 items-center justify-center rounded-lg bg-green-100 text-green-700">
              <CreditCard className="size-5" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Spent</p>
              <p className="text-2xl font-bold">
                {formatCurrency(customer.totalSpent)}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="flex size-10 items-center justify-center rounded-lg bg-purple-100 text-purple-700">
              <Calculator className="size-5" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">
                Average Order Value
              </p>
              <p className="text-2xl font-bold">{formatCurrency(avgOrder)}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="flex size-10 items-center justify-center rounded-lg bg-yellow-100 text-yellow-700">
              <Star className="size-5" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Reviews Given</p>
              <p className="text-2xl font-bold">{reviewCount}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content: Tabs + Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content — Tabs */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="orders">
            <TabsList>
              <TabsTrigger value="orders">Recent Orders</TabsTrigger>
              <TabsTrigger value="reviews">Reviews</TabsTrigger>
              <TabsTrigger value="addresses">Addresses</TabsTrigger>
              <TabsTrigger value="activity">Activity Log</TabsTrigger>
            </TabsList>

            {/* Tab 1 — Recent Orders */}
            <TabsContent value="orders" className="mt-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Order History</CardTitle>
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/admin/orders">View All Orders</Link>
                  </Button>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Order #</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead className="text-center">Items</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Payment</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {customerOrders.map((order) => (
                        <TableRow key={order.id}>
                          <TableCell>
                            <Link
                              href={`/admin/orders/${order.id}`}
                              className="font-medium text-[#8B6914] hover:underline"
                            >
                              {order.id}
                            </Link>
                          </TableCell>
                          <TableCell className="text-sm">
                            {formatDate(order.date)}
                          </TableCell>
                          <TableCell className="text-center">
                            {order.items}
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            {formatCurrency(order.total)}
                          </TableCell>
                          <TableCell>
                            <StatusBadge status={order.status} />
                          </TableCell>
                          <TableCell>
                            <StatusBadge status={order.paymentStatus} />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Tab 2 — Reviews */}
            <TabsContent value="reviews" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Customer Reviews</CardTitle>
                  <CardDescription>
                    {reviewCount} reviews written by this customer
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {customerReviews.map((review) => (
                      <div
                        key={review.id}
                        className="rounded-lg border p-4 space-y-2"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <Link
                              href={review.productLink}
                              className="text-sm font-semibold text-[#8B6914] hover:underline"
                            >
                              {review.productName}
                            </Link>
                            <div className="flex items-center gap-2 mt-1">
                              <StarRating rating={review.rating} />
                              <span className="text-xs text-muted-foreground">
                                {review.rating}/5
                              </span>
                            </div>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {formatDate(review.date)}
                          </span>
                        </div>
                        <p className="text-sm font-medium">{review.title}</p>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {review.text}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Tab 3 — Addresses */}
            <TabsContent value="addresses" className="mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {customerAddresses.map((addr) => (
                  <Card key={addr.id}>
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <CardTitle className="text-base">
                            {addr.label}
                          </CardTitle>
                          <Badge
                            variant="outline"
                            className={
                              addr.type === "Shipping"
                                ? "bg-blue-50 text-blue-700 border-blue-200"
                                : "bg-purple-50 text-purple-700 border-purple-200"
                            }
                          >
                            {addr.type}
                          </Badge>
                          {addr.isDefault && (
                            <Badge
                              variant="outline"
                              className="bg-green-50 text-green-700 border-green-200"
                            >
                              Default
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-1 text-sm text-muted-foreground">
                        <p>{addr.street}</p>
                        <p>
                          {addr.city}, {addr.state} {addr.zip}
                        </p>
                        <p>{addr.country}</p>
                      </div>
                      <div className="flex items-center gap-2 mt-3">
                        <Button variant="outline" size="sm">
                          <Edit className="mr-1 size-3" />
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="mr-1 size-3" />
                          Delete
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Tab 4 — Activity Log */}
            <TabsContent value="activity" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Activity Log</CardTitle>
                  <CardDescription>
                    Recent actions by this customer
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="relative">
                    {/* Timeline line */}
                    <div className="absolute left-[15px] top-0 bottom-0 w-px bg-border" />
                    <div className="space-y-1">
                      {customerActivity.map((activity, index) => {
                        const ActivityIcon = activity.icon;
                        return (
                          <div
                            key={index}
                            className="relative flex items-start gap-3 py-2.5 pl-1"
                          >
                            <div className="relative z-10 flex size-7 items-center justify-center rounded-full bg-background border shrink-0">
                              <ActivityIcon
                                className={`size-3.5 ${activity.color}`}
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm">{activity.text}</p>
                              <p className="text-xs text-muted-foreground">
                                {formatDateTime(activity.time)}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3">
                <Mail className="size-4 text-muted-foreground shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground">Email</p>
                  <a
                    href={`mailto:${customer.email}`}
                    className="text-sm hover:underline truncate block"
                  >
                    {customer.email}
                  </a>
                </div>
              </div>
              <Separator />
              <div className="flex items-center gap-3">
                <Phone className="size-4 text-muted-foreground shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">Phone</p>
                  <p className="text-sm">{customer.phone}</p>
                </div>
              </div>
              <Separator />
              <div className="flex items-center gap-3">
                <Calendar className="size-4 text-muted-foreground shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">Member Since</p>
                  <p className="text-sm">{formatDate(customer.createdAt)}</p>
                </div>
              </div>
              <Separator />
              <div className="flex items-center gap-3">
                <Clock className="size-4 text-muted-foreground shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">Last Login</p>
                  <p className="text-sm">Dec 12, 2025, 9:15 AM</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Customer Tags */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Tag className="size-4" />
                Customer Tags
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {customer.tags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="outline"
                    className={
                      tag === "vip"
                        ? "bg-amber-100 text-amber-800 border-amber-200"
                        : tag === "repeat-buyer"
                          ? "bg-blue-100 text-blue-800 border-blue-200"
                          : tag === "interior-designer"
                            ? "bg-purple-100 text-purple-800 border-purple-200"
                            : tag === "new-customer"
                              ? "bg-green-100 text-green-800 border-green-200"
                              : "bg-gray-100 text-gray-800 border-gray-200"
                    }
                  >
                    {tag
                      .split("-")
                      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                      .join(" ")}
                  </Badge>
                ))}
              </div>
              <Button variant="outline" size="sm" className="mt-3 w-full">
                <Plus className="mr-1 size-3.5" />
                Add Tag
              </Button>
            </CardContent>
          </Card>

          {/* Admin Notes */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Admin Notes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add internal notes about this customer..."
                rows={4}
              />
              <Button size="sm" className="w-full">
                Save Notes
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
