import Image from "next/image";
import Link from "next/link";
import {
  CheckCircle2,
  Circle,
  Clock,
  HelpCircle,
  MapPin,
  Package,
  Truck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BreadcrumbNav } from "@/components/shared/breadcrumb-nav";
import { StatusBadge } from "@/components/shared/status-badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// ---------------------------------------------------------------------------
// Mock data
// ---------------------------------------------------------------------------

const orderData = {
  id: "ORD-2024-003",
  status: "processing" as const,
  date: "Feb 20, 2024",
  timeline: [
    {
      status: "Order Placed",
      date: "Feb 20, 2024, 2:30 PM",
      note: "Your order has been confirmed and is being prepared.",
      icon: CheckCircle2,
      completed: true,
    },
    {
      status: "Processing",
      date: "Feb 21, 2024, 9:15 AM",
      note: "Items are being crafted and quality-checked.",
      icon: Clock,
      completed: true,
    },
    {
      status: "Shipped",
      date: "Expected Mar 1, 2024",
      note: "Estimated shipping with White Glove delivery.",
      icon: Truck,
      completed: false,
    },
    {
      status: "Delivered",
      date: "Expected Mar 5, 2024",
      note: "Includes in-home assembly service.",
      icon: Package,
      completed: false,
    },
  ],
  items: [
    {
      id: "item-1",
      name: "Elara Sectional Sofa",
      variant: "Sand Linen / Left-facing",
      qty: 1,
      price: 1299.0,
      image: "https://picsum.photos/seed/elara-sofa/120/120",
    },
    {
      id: "item-2",
      name: "Noma Coffee Table",
      variant: "Walnut / Large",
      qty: 1,
      price: 346.0,
      image: "https://picsum.photos/seed/noma-table/120/120",
    },
  ],
  subtotal: 1645.0,
  shipping: 0.0,
  tax: 135.71,
  total: 1780.71,
  shippingAddress: {
    name: "Sarah Mitchell",
    street: "742 Evergreen Terrace",
    city: "Springfield",
    state: "IL",
    zip: "62704",
    phone: "(555) 123-4567",
  },
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div className="space-y-8">
      {/* Breadcrumb */}
      <BreadcrumbNav
        items={[
          { label: "Account", href: "/account/profile" },
          { label: "Orders", href: "/account/orders" },
          { label: id },
        ]}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold tracking-tight">{id}</h2>
          <p className="text-muted-foreground text-sm">
            Placed on {orderData.date}
          </p>
        </div>
        <StatusBadge
          status={orderData.status}
          className="text-sm px-3 py-1"
        />
      </div>

      {/* Timeline */}
      <Card>
        <CardHeader>
          <CardTitle>Order Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            {orderData.timeline.map((step, index) => {
              const Icon = step.icon;
              const isLast = index === orderData.timeline.length - 1;

              return (
                <div key={step.status} className="flex gap-4 pb-8 last:pb-0">
                  {/* Line + icon */}
                  <div className="flex flex-col items-center">
                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-full border-2 ${
                        step.completed
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-muted-foreground/30 bg-background text-muted-foreground"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                    {!isLast && (
                      <div
                        className={`w-0.5 flex-1 mt-1 ${
                          step.completed
                            ? "bg-primary"
                            : "bg-muted-foreground/20"
                        }`}
                      />
                    )}
                  </div>

                  {/* Text */}
                  <div className="pb-2">
                    <p
                      className={`font-medium ${
                        step.completed
                          ? "text-foreground"
                          : "text-muted-foreground"
                      }`}
                    >
                      {step.status}
                    </p>
                    <p className="text-sm text-muted-foreground">{step.date}</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {step.note}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Items */}
      <Card>
        <CardHeader>
          <CardTitle>Items Ordered</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Desktop table */}
          <div className="hidden sm:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Variant</TableHead>
                  <TableHead className="text-center">Qty</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orderData.items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="relative h-12 w-12 overflow-hidden rounded-lg border">
                          <Image
                            src={item.image}
                            alt={item.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <span className="font-medium">{item.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {item.variant}
                    </TableCell>
                    <TableCell className="text-center">{item.qty}</TableCell>
                    <TableCell className="text-right font-medium">
                      ${item.price.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Mobile list */}
          <div className="flex flex-col gap-4 sm:hidden">
            {orderData.items.map((item) => (
              <div key={item.id} className="flex gap-3">
                <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border">
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{item.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {item.variant}
                  </p>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-xs text-muted-foreground">
                      Qty: {item.qty}
                    </span>
                    <span className="font-medium text-sm">
                      ${item.price.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Order summary */}
        <Card>
          <CardHeader>
            <CardTitle>Order Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span>
                  ${orderData.subtotal.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Shipping</span>
                <span>
                  {orderData.shipping === 0
                    ? "Free"
                    : `$${orderData.shipping.toLocaleString("en-US", { minimumFractionDigits: 2 })}`}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Tax</span>
                <span>
                  ${orderData.tax.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                </span>
              </div>
              <Separator />
              <div className="flex items-center justify-between font-semibold">
                <span>Total</span>
                <span>
                  ${orderData.total.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Shipping address */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Shipping Address
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm space-y-1">
              <p className="font-medium">{orderData.shippingAddress.name}</p>
              <p className="text-muted-foreground">
                {orderData.shippingAddress.street}
              </p>
              <p className="text-muted-foreground">
                {orderData.shippingAddress.city},{" "}
                {orderData.shippingAddress.state}{" "}
                {orderData.shippingAddress.zip}
              </p>
              <p className="text-muted-foreground">
                {orderData.shippingAddress.phone}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Button>
          <Truck className="mr-2 h-4 w-4" />
          Track Order
        </Button>
        <Button variant="outline">
          <HelpCircle className="mr-2 h-4 w-4" />
          Need Help?
        </Button>
      </div>
    </div>
  );
}
