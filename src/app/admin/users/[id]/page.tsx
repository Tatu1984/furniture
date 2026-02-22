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
  Pencil,
  Save,
  X,
  MapPin,
  Clock,
} from "lucide-react";

import { PageHeader } from "@/components/admin/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// --- Types ---

type UserRole = "admin" | "manager" | "staff" | "customer";
type UserStatus = "pending" | "active" | "suspended";

// --- Role Badge Colors ---

const roleBadgeConfig: Record<UserRole, string> = {
  admin: "bg-purple-100 text-purple-800 border-purple-200",
  manager: "bg-blue-100 text-blue-800 border-blue-200",
  staff: "bg-cyan-100 text-cyan-800 border-cyan-200",
  customer: "bg-gray-100 text-gray-800 border-gray-200",
};

// --- Mock Data for User ID "1" ---

const mockUser = {
  id: "1",
  firstName: "Sarah",
  lastName: "Johnson",
  email: "sarah.johnson@email.com",
  phone: "+1 (555) 234-5678",
  role: "admin" as UserRole,
  status: "active" as UserStatus,
  joinDate: "2023-01-15",
  lastLogin: "2025-12-20T14:30:00Z",
  totalOrders: 24,
  totalSpent: 12450,
  avgOrderValue: 518.75,
  reviewsCount: 8,
};

const userOrders = [
  { id: "ORD-2024-042", date: "2025-12-05T14:30:00Z", amount: 2499, status: "delivered" as const },
  { id: "ORD-2024-038", date: "2025-11-18T09:15:00Z", amount: 1899, status: "shipped" as const },
  { id: "ORD-2024-029", date: "2025-10-22T11:00:00Z", amount: 3450, status: "delivered" as const },
  { id: "ORD-2024-015", date: "2025-08-14T16:30:00Z", amount: 1250, status: "delivered" as const },
  { id: "ORD-2024-008", date: "2025-06-02T10:00:00Z", amount: 899, status: "delivered" as const },
  { id: "ORD-2023-994", date: "2025-03-20T14:00:00Z", amount: 1799, status: "delivered" as const },
  { id: "ORD-2023-982", date: "2025-01-10T12:00:00Z", amount: 654, status: "cancelled" as const },
];

const userReviews = [
  { id: "rev-1", product: "Scandinavian Oak Dining Table", rating: 5, comment: "Absolutely stunning craftsmanship. The oak finish is beautiful and the table is incredibly sturdy. We receive compliments from every guest.", date: "2025-11-20" },
  { id: "rev-2", product: "Walnut Credenza", rating: 4, comment: "Beautiful piece. The walnut grain is gorgeous. Docked one star because delivery took slightly longer than expected.", date: "2025-10-15" },
  { id: "rev-3", product: "Leather Accent Chair", rating: 5, comment: "The most comfortable chair I have ever owned. The leather is buttery soft and the design is timeless.", date: "2025-09-01" },
  { id: "rev-4", product: "Marble Side Table", rating: 3, comment: "Nice design but the marble had a small chip on arrival. Customer service was helpful with a partial refund though.", date: "2025-07-22" },
  { id: "rev-5", product: "Linen Sofa Set", rating: 5, comment: "Transformed our living room completely. The fabric quality is exceptional and the cushions are perfectly firm.", date: "2025-05-10" },
];

const userAddresses = [
  {
    id: "addr-1",
    type: "shipping" as const,
    isDefault: true,
    name: "Sarah Johnson",
    street: "742 Evergreen Terrace",
    city: "San Francisco",
    state: "CA",
    zip: "94102",
    country: "US",
  },
  {
    id: "addr-2",
    type: "billing" as const,
    isDefault: false,
    name: "Sarah Johnson",
    street: "1 Market Street, Suite 400",
    city: "San Francisco",
    state: "CA",
    zip: "94105",
    country: "US",
  },
  {
    id: "addr-3",
    type: "shipping" as const,
    isDefault: false,
    name: "Sarah Johnson",
    street: "88 Lighthouse Ave",
    city: "Carmel-by-the-Sea",
    state: "CA",
    zip: "93921",
    country: "US",
  },
];

const userActivity = [
  { id: "act-1", action: "Logged in", timestamp: "2025-12-20T14:30:00Z", detail: "IP: 192.168.1.42" },
  { id: "act-2", action: "Placed order", timestamp: "2025-12-05T14:30:00Z", detail: "Order #ORD-2024-042 ($2,499.00)" },
  { id: "act-3", action: "Updated address", timestamp: "2025-12-01T10:15:00Z", detail: "Changed shipping address" },
  { id: "act-4", action: "Left review", timestamp: "2025-11-20T16:00:00Z", detail: "Scandinavian Oak Dining Table - 5 stars" },
  { id: "act-5", action: "Placed order", timestamp: "2025-11-18T09:15:00Z", detail: "Order #ORD-2024-038 ($1,899.00)" },
  { id: "act-6", action: "Logged in", timestamp: "2025-11-18T09:10:00Z", detail: "IP: 192.168.1.42" },
  { id: "act-7", action: "Left review", timestamp: "2025-10-15T11:00:00Z", detail: "Walnut Credenza - 4 stars" },
  { id: "act-8", action: "Placed order", timestamp: "2025-10-22T11:00:00Z", detail: "Order #ORD-2024-029 ($3,450.00)" },
  { id: "act-9", action: "Password changed", timestamp: "2025-10-10T08:30:00Z", detail: "Password updated successfully" },
  { id: "act-10", action: "Logged in", timestamp: "2025-10-10T08:25:00Z", detail: "IP: 10.0.0.5" },
];

// --- Helpers ---

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
    hour: "2-digit",
    minute: "2-digit",
  });
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          className={`size-4 ${
            i < rating
              ? "fill-yellow-400 text-yellow-400"
              : "text-gray-300"
          }`}
        />
      ))}
    </div>
  );
}

// --- Component ---

export default function UserDetailPage() {
  const params = useParams();
  const [isEditing, setIsEditing] = React.useState(false);

  // Editable fields
  const [firstName, setFirstName] = React.useState(mockUser.firstName);
  const [lastName, setLastName] = React.useState(mockUser.lastName);
  const [email, setEmail] = React.useState(mockUser.email);
  const [phone, setPhone] = React.useState(mockUser.phone);
  const [role, setRole] = React.useState<UserRole>(mockUser.role);
  const [status, setStatus] = React.useState<UserStatus>(mockUser.status);

  function handleCancelEdit() {
    setFirstName(mockUser.firstName);
    setLastName(mockUser.lastName);
    setEmail(mockUser.email);
    setPhone(mockUser.phone);
    setRole(mockUser.role);
    setStatus(mockUser.status);
    setIsEditing(false);
  }

  function handleSave() {
    console.log("Save user:", { firstName, lastName, email, phone, role, status });
    setIsEditing(false);
  }

  // For any ID other than "1", show not found
  if (params.id !== "1") {
    return (
      <div className="space-y-6">
        <Link href="/admin/users">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 size-4" />
            Back to Users
          </Button>
        </Link>
        <div className="text-center py-12">
          <p className="text-muted-foreground">User not found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Link href="/admin/users">
        <Button variant="ghost" size="sm">
          <ArrowLeft className="mr-2 size-4" />
          Back to Users
        </Button>
      </Link>

      {/* User Header Card */}
      <Card>
        <CardContent className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pt-6">
          <div className="flex items-center gap-4">
            <Avatar className="size-16">
              <AvatarFallback className="text-xl">
                {firstName[0]}{lastName[0]}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              {isEditing ? (
                <div className="flex items-center gap-2">
                  <Input
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-32"
                    placeholder="First name"
                  />
                  <Input
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-32"
                    placeholder="Last name"
                  />
                </div>
              ) : (
                <h2 className="text-2xl font-bold">
                  {firstName} {lastName}
                </h2>
              )}
              {isEditing ? (
                <Input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-64"
                  placeholder="Email"
                  type="email"
                />
              ) : (
                <p className="text-muted-foreground">{email}</p>
              )}
              {isEditing ? (
                <Input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-48"
                  placeholder="Phone"
                />
              ) : (
                <p className="text-muted-foreground text-sm">{phone}</p>
              )}
              <div className="flex items-center gap-2 pt-1">
                {isEditing ? (
                  <>
                    <Select value={role} onValueChange={(v) => setRole(v as UserRole)}>
                      <SelectTrigger className="w-28 h-7 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="customer">Customer</SelectItem>
                        <SelectItem value="staff">Staff</SelectItem>
                        <SelectItem value="manager">Manager</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={status} onValueChange={(v) => setStatus(v as UserStatus)}>
                      <SelectTrigger className="w-28 h-7 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="suspended">Suspended</SelectItem>
                      </SelectContent>
                    </Select>
                  </>
                ) : (
                  <>
                    <Badge
                      variant="outline"
                      className={`font-medium capitalize ${roleBadgeConfig[role]}`}
                    >
                      {role}
                    </Badge>
                    <StatusBadge status={status} />
                  </>
                )}
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            {isEditing ? (
              <>
                <Button size="sm" onClick={handleSave}>
                  <Save className="size-4" />
                  Save
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCancelEdit}
                >
                  <X className="size-4" />
                  Cancel
                </Button>
              </>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(true)}
              >
                <Pencil className="size-4" />
                Edit
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="flex size-10 items-center justify-center rounded-lg bg-blue-100 text-blue-700">
              <Package className="size-5" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Orders</p>
              <p className="text-2xl font-bold">{mockUser.totalOrders}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="flex size-10 items-center justify-center rounded-lg bg-green-100 text-green-700">
              <DollarSign className="size-5" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Spent</p>
              <p className="text-2xl font-bold">{formatCurrency(mockUser.totalSpent)}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="flex size-10 items-center justify-center rounded-lg bg-amber-100 text-amber-700">
              <ShoppingCart className="size-5" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Avg Order Value</p>
              <p className="text-2xl font-bold">{formatCurrency(mockUser.avgOrderValue)}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="flex size-10 items-center justify-center rounded-lg bg-purple-100 text-purple-700">
              <Star className="size-5" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Reviews</p>
              <p className="text-2xl font-bold">{mockUser.reviewsCount}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="orders">
        <TabsList>
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="reviews">Reviews</TabsTrigger>
          <TabsTrigger value="addresses">Addresses</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        {/* Orders Tab */}
        <TabsContent value="orders" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Order History</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order #</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {userOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell>
                        <Link
                          href={`/admin/orders/${order.id}`}
                          className="font-medium hover:underline"
                        >
                          {order.id}
                        </Link>
                      </TableCell>
                      <TableCell>{formatDate(order.date)}</TableCell>
                      <TableCell className="font-medium">
                        {formatCurrency(order.amount)}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={order.status} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Reviews Tab */}
        <TabsContent value="reviews" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Product Reviews</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {userReviews.map((review) => (
                <div
                  key={review.id}
                  className="flex flex-col gap-2 rounded-lg border p-4"
                >
                  <div className="flex items-center justify-between">
                    <p className="font-medium">{review.product}</p>
                    <span className="text-sm text-muted-foreground">
                      {formatDate(review.date)}
                    </span>
                  </div>
                  <StarRating rating={review.rating} />
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {review.comment}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Addresses Tab */}
        <TabsContent value="addresses" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {userAddresses.map((addr) => (
              <Card key={addr.id}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <MapPin className="size-4 text-muted-foreground" />
                      <CardTitle className="text-base capitalize">
                        {addr.type}
                      </CardTitle>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className={
                          addr.type === "shipping"
                            ? "bg-blue-100 text-blue-800 border-blue-200"
                            : "bg-amber-100 text-amber-800 border-amber-200"
                        }
                      >
                        {addr.type === "shipping" ? "Shipping" : "Billing"}
                      </Badge>
                      {addr.isDefault && (
                        <Badge
                          variant="outline"
                          className="bg-green-100 text-green-800 border-green-200"
                        >
                          Default
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm font-medium">{addr.name}</p>
                  <p className="text-sm text-muted-foreground">{addr.street}</p>
                  <p className="text-sm text-muted-foreground">
                    {addr.city}, {addr.state} {addr.zip}
                  </p>
                  <p className="text-sm text-muted-foreground">{addr.country}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Activity Tab */}
        <TabsContent value="activity" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {userActivity.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-start gap-3 border-b pb-3 last:border-0 last:pb-0"
                  >
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted">
                      <Clock className="size-4 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{item.action}</p>
                      <p className="text-sm text-muted-foreground truncate">
                        {item.detail}
                      </p>
                    </div>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {formatDateTime(item.timestamp)}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
