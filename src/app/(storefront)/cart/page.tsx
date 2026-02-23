"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  Truck,
  ShieldCheck,
  RotateCcw,
  Tag,
  Wrench,
} from "lucide-react";

import { useCartStore } from "@/stores/cart-store";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatPrice(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  }).format(value);
}

function variantLabel(variant: { color?: string; size?: string; material?: string }) {
  return [variant.color, variant.size, variant.material].filter(Boolean).join(" / ");
}

// ---------------------------------------------------------------------------
// Trust Badges
// ---------------------------------------------------------------------------

const trustBadges = [
  { icon: Truck, label: "Free Shipping", desc: "On orders over \u20B9500" },
  { icon: ShieldCheck, label: "Secure Payment", desc: "256-bit SSL encryption" },
  { icon: RotateCcw, label: "Easy Returns", desc: "30-day return policy" },
];

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function CartPage() {
  const items = useCartStore((s) => s.items);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);
  const subtotal = useCartStore((s) => s.subtotal);
  const totalItems = useCartStore((s) => s.totalItems);

  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [assemblyService, setAssemblyService] = useState(false);

  const discount = appliedCoupon ? subtotal() * 0.1 : 0;
  const assemblyFee = assemblyService ? 99 : 0;
  const tax = (subtotal() - discount) * 0.08;
  const total = subtotal() - discount + assemblyFee + tax;

  const handleApplyCoupon = () => {
    if (couponCode.trim().length > 0) {
      setAppliedCoupon(couponCode.trim().toUpperCase());
      setCouponCode("");
    }
  };

  // -- Empty state -----------------------------------------------------------

  if (items.length === 0) {
    return (
      <div className="container mx-auto max-w-7xl px-4 py-16">
        <EmptyState
          icon={ShoppingBag}
          title="Your cart is empty"
          description="Looks like you haven't added anything to your cart yet. Browse our collections and find something you love."
          actionLabel="Continue Shopping"
          actionHref="/categories"
        />
      </div>
    );
  }

  // -- Cart with items -------------------------------------------------------

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8 lg:py-12">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Shopping Cart</h1>
        <p className="mt-1 text-muted-foreground">
          {totalItems()} {totalItems() === 1 ? "item" : "items"} in your cart
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* ----------------------------------------------------------------- */}
        {/* Left Column - Cart Items                                          */}
        {/* ----------------------------------------------------------------- */}
        <div className="lg:col-span-2">
          <div className="space-y-1">
            {/* Table header (desktop) */}
            <div className="hidden items-center border-b pb-3 text-sm font-medium text-muted-foreground md:grid md:grid-cols-[1fr_120px_140px_40px]">
              <span>Product</span>
              <span className="text-center">Quantity</span>
              <span className="text-right">Total</span>
              <span />
            </div>

            <AnimatePresence mode="popLayout">
              {items.map((item) => {
                const lineTotal = item.price * item.quantity;
                const vLabel = variantLabel(item.variant);

                return (
                  <motion.div
                    key={`${item.productId}-${vLabel}`}
                    layout
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -40 }}
                    transition={{ duration: 0.25 }}
                    className="grid grid-cols-[80px_1fr] gap-4 border-b py-5 md:grid-cols-[1fr_120px_140px_40px]"
                  >
                    {/* Product info */}
                    <div className="col-span-2 flex gap-4 md:col-span-1">
                      <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-muted">
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          className="object-cover"
                          sizes="80px"
                        />
                      </div>
                      <div className="flex flex-col justify-center gap-1">
                        <Link
                          href={`/products/${item.slug}`}
                          className="font-medium hover:underline line-clamp-1"
                        >
                          {item.name}
                        </Link>
                        {vLabel && (
                          <span className="text-sm text-muted-foreground">
                            {vLabel}
                          </span>
                        )}
                        <span className="text-sm font-medium md:hidden">
                          {formatPrice(item.price)}
                        </span>
                      </div>
                    </div>

                    {/* Quantity selector */}
                    <div className="flex items-center justify-start md:justify-center">
                      <div className="flex items-center rounded-lg border">
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() =>
                            updateQuantity(
                              item.productId,
                              item.quantity - 1,
                              item.variant
                            )
                          }
                          aria-label="Decrease quantity"
                        >
                          <Minus className="size-3.5" />
                        </Button>
                        <span className="w-10 text-center text-sm font-medium">
                          {item.quantity}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() =>
                            updateQuantity(
                              item.productId,
                              item.quantity + 1,
                              item.variant
                            )
                          }
                          aria-label="Increase quantity"
                        >
                          <Plus className="size-3.5" />
                        </Button>
                      </div>
                    </div>

                    {/* Line total */}
                    <div className="hidden items-center justify-end md:flex">
                      <span className="font-semibold">{formatPrice(lineTotal)}</span>
                    </div>

                    {/* Remove */}
                    <div className="flex items-center justify-end">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => removeItem(item.productId, item.variant)}
                        aria-label={`Remove ${item.name}`}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          {/* Continue shopping */}
          <div className="mt-6">
            <Button variant="ghost" asChild>
              <Link href="/categories">
                <ShoppingBag className="mr-2 size-4" />
                Continue Shopping
              </Link>
            </Button>
          </div>
        </div>

        {/* ----------------------------------------------------------------- */}
        {/* Right Column - Order Summary                                      */}
        {/* ----------------------------------------------------------------- */}
        <div className="lg:sticky lg:top-24 lg:self-start">
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Subtotal */}
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-medium">{formatPrice(subtotal())}</span>
              </div>

              {/* Coupon */}
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Tag className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Coupon code"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    className="pl-9"
                    onKeyDown={(e) => e.key === "Enter" && handleApplyCoupon()}
                  />
                </div>
                <Button variant="outline" size="default" onClick={handleApplyCoupon}>
                  Apply
                </Button>
              </div>

              {/* Discount line */}
              {appliedCoupon && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="flex items-center justify-between text-sm"
                >
                  <span className="text-green-600">
                    Discount ({appliedCoupon})
                  </span>
                  <span className="font-medium text-green-600">
                    -{formatPrice(discount)}
                  </span>
                </motion.div>
              )}

              {/* Shipping */}
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Shipping</span>
                <span className="text-muted-foreground">Calculated at checkout</span>
              </div>

              {/* Tax */}
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Estimated Tax</span>
                <span className="font-medium">{formatPrice(tax)}</span>
              </div>

              <Separator />

              {/* Assembly service upsell */}
              <div className="flex items-start gap-3 rounded-lg border border-dashed p-3">
                <Checkbox
                  id="assembly"
                  checked={assemblyService}
                  onCheckedChange={(checked) =>
                    setAssemblyService(checked === true)
                  }
                />
                <div className="grid gap-0.5 leading-none">
                  <Label
                    htmlFor="assembly"
                    className="cursor-pointer text-sm font-medium"
                  >
                    <Wrench className="mr-1.5 inline-block size-3.5" />
                    Add Assembly Service
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Professional assembly for all items (+&#8377;99)
                  </p>
                </div>
              </div>

              <Separator />

              {/* Total */}
              <div className="flex items-center justify-between">
                <span className="text-base font-bold">Total</span>
                <span className="text-xl font-bold">{formatPrice(total)}</span>
              </div>

              {/* Checkout button */}
              <Button asChild size="lg" className="w-full">
                <Link href="/checkout">Proceed to Checkout</Link>
              </Button>
            </CardContent>
          </Card>

          {/* Trust badges */}
          <div className="mt-4 grid grid-cols-3 gap-2">
            {trustBadges.map((badge) => (
              <div
                key={badge.label}
                className="flex flex-col items-center gap-1.5 rounded-lg border p-3 text-center"
              >
                <badge.icon className="size-5 text-muted-foreground" />
                <span className="text-xs font-medium leading-tight">
                  {badge.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
