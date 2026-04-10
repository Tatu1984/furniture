"use client";

import * as React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import {
  ArrowLeft,
  Printer,
  Mail,
  XCircle,
  CheckCircle2,
  Clock,
  Truck,
  Package,
  CreditCard,
  User,
  Download,
  Copy,
  Send,
  MessageSquare,
  RefreshCw,
  ShieldCheck,
  FileText,
  Phone,
  CircleDot,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { PageHeader } from "@/components/admin/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";

// --- Types ---

type OrderNote = {
  id: string;
  author: string;
  role: "system" | "admin" | "customer";
  timestamp: string;
  text: string;
  customerVisible: boolean;
};

// --- Helpers to map API response to the shape the JSX expects ---

/* eslint-disable @typescript-eslint/no-explicit-any */
function mapOrderApi(o: any) {
  const fmtDate = (d: string | null) =>
    d
      ? new Date(d).toLocaleDateString("en-US", {
          month: "long",
          day: "numeric",
          year: "numeric",
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        })
      : "";

  const customer = o.user ?? {};
  const custName = `${customer.firstName ?? ""} ${customer.lastName ?? ""}`.trim() || o.email;
  const ship = o.shippingAddress ?? {};
  const bill = o.billingAddress ?? ship;

  return {
    id: o.orderNumber ?? o.id,
    createdDate: fmtDate(o.createdAt),
    status: (o.status ?? "PENDING").toLowerCase(),
    paymentStatus: (o.paymentStatus ?? "PENDING").toLowerCase(),
    fulfillmentStatus: (o.fulfillmentStatus ?? "UNFULFILLED").toLowerCase(),
    customer: {
      id: customer.id ?? "",
      name: custName,
      email: o.email ?? customer.email ?? "",
      phone: customer.phone ?? o.phone ?? "",
      totalOrders: 0,
      initials: (custName[0] ?? "?").toUpperCase(),
    },
    shipping: {
      fullName: `${ship.firstName ?? ""} ${ship.lastName ?? ""}`.trim(),
      address: [ship.addressLine1, ship.addressLine2].filter(Boolean).join(", "),
      city: ship.city ?? "",
      state: ship.state ?? "",
      zip: ship.postalCode ?? "",
      country: ship.country ?? "",
      phone: ship.phone ?? "",
      method: o.shippingMethod ?? "Standard",
    },
    billing: {
      fullName: `${bill.firstName ?? ""} ${bill.lastName ?? ""}`.trim(),
      address: [bill.addressLine1, bill.addressLine2].filter(Boolean).join(", "),
      city: bill.city ?? "",
      state: bill.state ?? "",
      zip: bill.postalCode ?? "",
      country: bill.country ?? "",
    },
    payment: {
      method: o.paymentMethod ?? "Online",
      cardBrand: o.paymentGateway ?? "",
      transactionId: o.paymentIntentId ?? o.razorpayPaymentId ?? "",
      status: o.paymentStatus ?? "PENDING",
      amountPaid: Number(o.total ?? 0),
      refundAmount: 0,
    },
    items: (o.items ?? []).map((it: any) => ({
      id: it.id,
      name: it.productName ?? it.product?.name ?? "Item",
      sku: it.sku ?? it.product?.sku ?? "",
      variant: it.variantName ?? "",
      qty: it.quantity ?? 1,
      price: Number(it.price ?? 0),
      image: it.product?.images?.[0]?.url ?? "",
    })),
    totals: {
      subtotal: Number(o.subtotal ?? 0),
      shipping: Number(o.shippingTotal ?? 0),
      tax: Number(o.taxTotal ?? 0),
      discount: -Number(o.discountTotal ?? 0),
      couponCode: o.coupon?.code ?? "",
      total: Number(o.total ?? 0),
    },
    notes: (o.notes ?? []).map((n: any) => ({
      id: n.id,
      author: n.authorName ?? "System",
      role: (n.type ?? "system").toLowerCase() as "system" | "admin" | "customer",
      timestamp: fmtDate(n.createdAt),
      text: n.content ?? n.note ?? "",
      customerVisible: n.isCustomerVisible ?? false,
    })),
    timeline: (o.timeline ?? []).map((t: any, i: number, arr: any[]) => ({
      status: t.title ?? t.status ?? "",
      date: fmtDate(t.createdAt),
      note: t.description ?? "",
      icon: i === 0 ? "clock" : i === arr.length - 1 ? "delivered" : "check",
      completed: true,
    })),
  };
}
/* eslint-enable @typescript-eslint/no-explicit-any */

const timelineIcons: Record<string, React.ReactNode> = {
  clock: <Clock className="size-4" />,
  check: <CheckCircle2 className="size-4" />,
  package: <Package className="size-4" />,
  truck: <Truck className="size-4" />,
  circle: <CircleDot className="size-4" />,
  delivered: <ShieldCheck className="size-4" />,
};

function getRoleBadge(role: string) {
  switch (role) {
    case "system":
      return (
        <Badge variant="outline" className="text-xs bg-gray-100 text-gray-600 border-gray-200">
          System
        </Badge>
      );
    case "admin":
      return (
        <Badge variant="outline" className="text-xs bg-blue-100 text-blue-700 border-blue-200">
          Admin
        </Badge>
      );
    case "customer":
      return (
        <Badge variant="outline" className="text-xs bg-amber-100 text-amber-700 border-amber-200">
          Customer
        </Badge>
      );
    default:
      return null;
  }
}

// --- Component ---

export default function OrderDetailPage() {
  const params = useParams();
  const orderId = params.id as string;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [orderData, setOrderData] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/admin/orders/${orderId}`);
        if (!res.ok) throw new Error("Order not found");
        const json = await res.json();
        setOrderData(mapOrderApi(json.data));
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Failed to load order");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [orderId]);

  const [orderStatus, setOrderStatus] = React.useState("");
  const [paymentStatus, setPaymentStatus] = React.useState("");
  const [fulfillmentStatus, setFulfillmentStatus] = React.useState("");
  const [notes, setNotes] = React.useState<OrderNote[]>([]);
  const [newNote, setNewNote] = React.useState("");
  const [sendToCustomer, setSendToCustomer] = React.useState(false);
  const [showCancelDialog, setShowCancelDialog] = React.useState(false);
  const [showRefundDialog, setShowRefundDialog] = React.useState(false);
  const [copiedAddress, setCopiedAddress] = React.useState<"shipping" | "billing" | null>(null);

  // Sync state when data loads
  React.useEffect(() => {
    if (!orderData) return;
    setOrderStatus(orderData.status);
    setPaymentStatus(orderData.paymentStatus);
    setFulfillmentStatus(orderData.fulfillmentStatus);
    setNotes(orderData.notes);
  }, [orderData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
          <p className="text-sm text-muted-foreground">Loading order...</p>
        </div>
      </div>
    );
  }

  if (!orderData) {
    return (
      <div className="text-center py-24 text-muted-foreground">
        <p>Order not found.</p>
        <Button variant="outline" asChild className="mt-4">
          <Link href="/admin/orders">Back to Orders</Link>
        </Button>
      </div>
    );
  }

  function handleAddNote() {
    if (!newNote.trim()) return;
    const note: OrderNote = {
      id: `note-${Date.now()}`,
      author: "You",
      role: "admin",
      timestamp: new Date().toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      }),
      text: newNote.trim(),
      customerVisible: sendToCustomer,
    };
    setNotes((prev) => [...prev, note]);
    setNewNote("");
    setSendToCustomer(false);
  }

  function handleCopyAddress(type: "shipping" | "billing") {
    const addr = type === "shipping" ? orderData.shipping : orderData.billing;
    const text = `${addr.fullName}\n${addr.address}\n${addr.city}, ${addr.state} ${addr.zip}\n${addr.country}`;
    navigator.clipboard.writeText(text);
    setCopiedAddress(type);
    setTimeout(() => setCopiedAddress(null), 2000);
  }

  function handleCancelOrder() {
    setOrderStatus("cancelled" as typeof orderStatus);
    setShowCancelDialog(false);
    console.log("Order cancelled");
  }

  function handleRefundOrder() {
    setShowRefundDialog(false);
    console.log("Refund initiated");
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="icon" asChild>
            <Link href="/admin/orders">
              <ArrowLeft className="size-4" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight">
                Order #{orderData.id}
              </h1>
              <StatusBadge status={orderStatus} className="text-sm" />
            </div>
            <p className="text-muted-foreground text-sm mt-0.5">
              Created {orderData.createdDate}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Download className="size-4" />
            Download Invoice
          </Button>
          <Button variant="outline" size="sm">
            <Printer className="size-4" />
            Print
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content - 2/3 */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Items */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Package className="size-4 text-muted-foreground" />
                Order Items
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead className="text-center">Qty</TableHead>
                    <TableHead className="text-right">Unit Price</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orderData.items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="size-12 rounded-md bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-800/50 text-xs shrink-0">
                            IMG
                          </div>
                          <div>
                            <p className="font-medium text-sm">{item.name}</p>
                            <p className="text-xs text-muted-foreground">
                              SKU: {item.sku}
                            </p>
                            {item.variant && (
                              <p className="text-xs text-muted-foreground">
                                {item.variant}
                              </p>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">{item.qty}</TableCell>
                      <TableCell className="text-right">
                        ${item.price.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        ${(item.price * item.qty).toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                        })}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Totals */}
              <div className="mt-4 ml-auto w-full sm:w-72">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>
                      ${orderData.totals.subtotal.toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                      })}
                    </span>
                  </div>
                  {orderData.totals.discount !== 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-green-600 flex items-center gap-1">
                        Discount
                        <Badge
                          variant="outline"
                          className="text-xs bg-green-50 text-green-700 border-green-200 px-1.5"
                        >
                          {orderData.totals.couponCode}
                        </Badge>
                      </span>
                      <span className="text-green-600">
                        -$
                        {Math.abs(orderData.totals.discount).toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                        })}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Shipping</span>
                    <span>
                      {orderData.totals.shipping === 0
                        ? "Free"
                        : `$${orderData.totals.shipping.toLocaleString("en-US", {
                            minimumFractionDigits: 2,
                          })}`}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Tax</span>
                    <span>
                      ${orderData.totals.tax.toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                      })}
                    </span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-semibold text-lg">
                    <span>Total</span>
                    <span>
                      ${orderData.totals.total.toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                      })}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Order Notes */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <MessageSquare className="size-4 text-muted-foreground" />
                Order Notes
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Existing Notes */}
              <div className="space-y-3">
                {notes.map((note) => (
                  <div
                    key={note.id}
                    className={`rounded-lg border p-3 ${
                      note.customerVisible
                        ? "bg-blue-50/50 border-blue-200"
                        : "bg-muted/30"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-sm font-medium">{note.author}</span>
                      {getRoleBadge(note.role)}
                      {note.customerVisible && (
                        <Badge
                          variant="outline"
                          className="text-xs bg-blue-100 text-blue-700 border-blue-200"
                        >
                          <Send className="size-2.5 mr-1" />
                          Customer Visible
                        </Badge>
                      )}
                      <span className="text-xs text-muted-foreground ml-auto">
                        {note.timestamp}
                      </span>
                    </div>
                    <p className="text-sm text-foreground/80">{note.text}</p>
                  </div>
                ))}
              </div>

              <Separator />

              {/* Add Note Form */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">Add Note</Label>
                <Textarea
                  placeholder="Write an internal note or a message for the customer..."
                  className="min-h-[5rem] resize-y"
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                />
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="send-to-customer"
                      checked={sendToCustomer}
                      onCheckedChange={(checked) =>
                        setSendToCustomer(checked === true)
                      }
                    />
                    <label
                      htmlFor="send-to-customer"
                      className="text-sm text-muted-foreground cursor-pointer"
                    >
                      Send to customer
                    </label>
                  </div>
                  <Button
                    size="sm"
                    onClick={handleAddNote}
                    disabled={!newNote.trim()}
                  >
                    <Send className="size-3.5" />
                    Add Note
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Order Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Clock className="size-4 text-muted-foreground" />
                Order Timeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative">
                {orderData.timeline.map((event, index) => (
                  <div key={index} className="flex gap-4 pb-6 last:pb-0">
                    {/* Vertical line + icon */}
                    <div className="flex flex-col items-center">
                      <div
                        className={`flex size-8 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
                          event.completed && event.current
                            ? "border-primary bg-primary text-primary-foreground"
                            : event.completed
                            ? "border-green-500 bg-green-50 text-green-600"
                            : "border-muted-foreground/30 bg-muted text-muted-foreground/50"
                        }`}
                      >
                        {event.completed && !event.current ? (
                          <CheckCircle2 className="size-4" />
                        ) : (
                          timelineIcons[event.icon]
                        )}
                      </div>
                      {index < orderData.timeline.length - 1 && (
                        <div
                          className={`w-0.5 flex-1 mt-1 ${
                            event.completed ? "bg-green-300" : "bg-border"
                          }`}
                        />
                      )}
                    </div>
                    {/* Content */}
                    <div className="pb-2 pt-0.5">
                      <p
                        className={`text-sm font-medium ${
                          event.current
                            ? "text-primary"
                            : event.completed
                            ? "text-foreground"
                            : "text-muted-foreground"
                        }`}
                      >
                        {event.status}
                      </p>
                      {event.date && (
                        <p className="text-xs text-muted-foreground">{event.date}</p>
                      )}
                      <p
                        className={`text-sm mt-0.5 ${
                          event.completed
                            ? "text-muted-foreground"
                            : "text-muted-foreground/60 italic"
                        }`}
                      >
                        {event.note}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar - 1/3 */}
        <div className="space-y-6">
          {/* Order Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Order Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Order Status</Label>
                <Select
                  value={orderStatus}
                  onValueChange={(val) => setOrderStatus(val as typeof orderStatus)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="processing">Processing</SelectItem>
                    <SelectItem value="shipped">Shipped</SelectItem>
                    <SelectItem value="out_for_delivery">Out for Delivery</SelectItem>
                    <SelectItem value="delivered">Delivered</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                    <SelectItem value="returned">Returned</SelectItem>
                    <SelectItem value="refunded">Refunded</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Payment Status</Label>
                <Select
                  value={paymentStatus}
                  onValueChange={(val) =>
                    setPaymentStatus(val as typeof paymentStatus)
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="authorized">Authorized</SelectItem>
                    <SelectItem value="captured">Captured</SelectItem>
                    <SelectItem value="partially_refunded">
                      Partially Refunded
                    </SelectItem>
                    <SelectItem value="refunded">Refunded</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                    <SelectItem value="voided">Voided</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">
                  Fulfillment Status
                </Label>
                <Select
                  value={fulfillmentStatus}
                  onValueChange={(val) =>
                    setFulfillmentStatus(val as typeof fulfillmentStatus)
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unfulfilled">Unfulfilled</SelectItem>
                    <SelectItem value="partially_fulfilled">
                      Partially Fulfilled
                    </SelectItem>
                    <SelectItem value="fulfilled">Fulfilled</SelectItem>
                    <SelectItem value="returned">Returned</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button className="w-full" size="sm">
                <RefreshCw className="size-3.5" />
                Update Status
              </Button>
            </CardContent>
          </Card>

          {/* Customer */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <User className="size-4 text-muted-foreground" />
                Customer
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3">
                <Avatar size="lg">
                  <AvatarFallback className="bg-amber-100 text-amber-800 font-medium">
                    {orderData.customer.initials}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <Link
                    href={`/admin/customers/${orderData.customer.id}`}
                    className="text-sm font-medium hover:underline"
                  >
                    {orderData.customer.name}
                  </Link>
                  <p className="text-xs text-muted-foreground">
                    {orderData.customer.totalOrders} orders
                  </p>
                </div>
              </div>
              <Separator />
              <div className="space-y-1.5">
                <a
                  href={`mailto:${orderData.customer.email}`}
                  className="text-sm text-blue-600 hover:underline flex items-center gap-1.5"
                >
                  <Mail className="size-3.5" />
                  {orderData.customer.email}
                </a>
                <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                  <Phone className="size-3.5" />
                  {orderData.customer.phone}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Shipping Address */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Truck className="size-4 text-muted-foreground" />
                Shipping Address
              </CardTitle>
              <Button
                variant="ghost"
                size="icon-xs"
                onClick={() => handleCopyAddress("shipping")}
              >
                {copiedAddress === "shipping" ? (
                  <CheckCircle2 className="size-3.5 text-green-600" />
                ) : (
                  <Copy className="size-3.5" />
                )}
              </Button>
            </CardHeader>
            <CardContent>
              <div className="text-sm space-y-0.5">
                <p className="font-medium">{orderData.shipping.fullName}</p>
                <p className="text-muted-foreground">{orderData.shipping.address}</p>
                <p className="text-muted-foreground">
                  {orderData.shipping.city}, {orderData.shipping.state}{" "}
                  {orderData.shipping.zip}
                </p>
                <p className="text-muted-foreground">{orderData.shipping.country}</p>
                <p className="text-muted-foreground mt-1">{orderData.shipping.phone}</p>
              </div>
            </CardContent>
          </Card>

          {/* Billing Address */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <FileText className="size-4 text-muted-foreground" />
                Billing Address
              </CardTitle>
              <Button
                variant="ghost"
                size="icon-xs"
                onClick={() => handleCopyAddress("billing")}
              >
                {copiedAddress === "billing" ? (
                  <CheckCircle2 className="size-3.5 text-green-600" />
                ) : (
                  <Copy className="size-3.5" />
                )}
              </Button>
            </CardHeader>
            <CardContent>
              <div className="text-sm space-y-0.5">
                <p className="font-medium">{orderData.billing.fullName}</p>
                <p className="text-muted-foreground">{orderData.billing.address}</p>
                <p className="text-muted-foreground">
                  {orderData.billing.city}, {orderData.billing.state}{" "}
                  {orderData.billing.zip}
                </p>
                <p className="text-muted-foreground">{orderData.billing.country}</p>
              </div>
            </CardContent>
          </Card>

          {/* Payment Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <CreditCard className="size-4 text-muted-foreground" />
                Payment Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Method</span>
                  <span className="font-medium">{orderData.payment.cardBrand}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Transaction ID</span>
                  <span className="font-mono text-xs">
                    {orderData.payment.transactionId}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Status</span>
                  <Badge
                    variant="outline"
                    className="bg-green-100 text-green-800 border-green-200"
                  >
                    {orderData.payment.status}
                  </Badge>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Amount Paid</span>
                  <span className="font-semibold">
                    $
                    {orderData.payment.amountPaid.toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                    })}
                  </span>
                </div>
                {orderData.payment.refundAmount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Refunded</span>
                    <span className="text-destructive font-medium">
                      -$
                      {orderData.payment.refundAmount.toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                      })}
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="space-y-2">
            <Button variant="outline" className="w-full" size="sm">
              <Mail className="size-4" />
              Send Email
            </Button>
            <Button
              variant="destructive"
              className="w-full"
              size="sm"
              onClick={() => setShowCancelDialog(true)}
            >
              <XCircle className="size-4" />
              Cancel Order
            </Button>
            <Button
              variant="outline"
              className="w-full text-destructive hover:text-destructive"
              size="sm"
              onClick={() => setShowRefundDialog(true)}
            >
              <RefreshCw className="size-4" />
              Refund
            </Button>
          </div>
        </div>
      </div>

      {/* Cancel Order Dialog */}
      <ConfirmDialog
        open={showCancelDialog}
        onOpenChange={setShowCancelDialog}
        title="Cancel Order"
        description={`Are you sure you want to cancel order #${orderData.id}? This will stop fulfillment and notify the customer. Any captured payments will need to be refunded separately.`}
        confirmLabel="Cancel Order"
        cancelLabel="Keep Order"
        onConfirm={handleCancelOrder}
        variant="destructive"
      />

      {/* Refund Dialog */}
      <ConfirmDialog
        open={showRefundDialog}
        onOpenChange={setShowRefundDialog}
        title="Issue Refund"
        description={`Are you sure you want to issue a refund of $${orderData.payment.amountPaid.toLocaleString(
          "en-US",
          { minimumFractionDigits: 2 }
        )} for order #${orderData.id}? This will refund the original payment method (${orderData.payment.cardBrand}).`}
        confirmLabel="Issue Refund"
        cancelLabel="Cancel"
        onConfirm={handleRefundOrder}
        variant="destructive"
      />
    </div>
  );
}
