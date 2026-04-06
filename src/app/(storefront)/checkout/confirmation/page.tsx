"use client";

import { Suspense, useMemo } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { motion } from "motion/react";
import { Check, Package, ArrowRight, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function CheckoutConfirmationPage() {
  return (
    <Suspense fallback={<div className="flex justify-center py-16"><Loader2 className="size-8 animate-spin text-muted-foreground" /></div>}>
      <ConfirmationContent />
    </Suspense>
  );
}

function ConfirmationContent() {
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get("orderNumber") || "FSOW-000000";

  const estimatedDelivery = useMemo(() => {
    const date = new Date();
    date.setDate(date.getDate() + 7);
    return date.toLocaleDateString("en-IN", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  }, []);

  return (
    <div className="container mx-auto max-w-2xl px-4 py-16">
      <div className="flex flex-col items-center text-center">
        {/* Animated checkmark */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{
            type: "spring",
            stiffness: 260,
            damping: 20,
            delay: 0.1,
          }}
          className="mb-6"
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="relative flex size-24 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30"
          >
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 15,
                delay: 0.5,
              }}
            >
              <Check className="size-12 text-green-600 dark:text-green-400" strokeWidth={3} />
            </motion.div>
            {/* Ripple rings */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0.5 }}
              animate={{ scale: 1.5, opacity: 0 }}
              transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
              className="absolute inset-0 rounded-full border-2 border-green-400"
            />
            <motion.div
              initial={{ scale: 0.8, opacity: 0.3 }}
              animate={{ scale: 1.8, opacity: 0 }}
              transition={{ duration: 1.2, delay: 0.6, ease: "easeOut" }}
              className="absolute inset-0 rounded-full border-2 border-green-300"
            />
          </motion.div>
        </motion.div>

        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <h1 className="text-3xl font-bold tracking-tight">
            Order Confirmed!
          </h1>
          <p className="mt-2 text-muted-foreground">
            Thank you for your purchase. We're preparing your order.
          </p>
        </motion.div>

        {/* Order details card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mt-8 w-full"
        >
          <Card>
            <CardContent className="space-y-4 pt-6">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Order Number
                </span>
                <span className="font-mono font-semibold">{orderNumber}</span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Estimated Delivery
                </span>
                <span className="text-sm font-medium">{estimatedDelivery}</span>
              </div>
              <Separator />
              <div className="flex items-center gap-3 rounded-lg bg-muted/50 p-3">
                <Package className="size-5 text-muted-foreground" />
                <div className="text-left">
                  <p className="text-sm font-medium">Shipping Confirmation</p>
                  <p className="text-xs text-muted-foreground">
                    You'll receive a confirmation email with tracking details
                    once your order ships.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Email notice */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-6 text-sm text-muted-foreground"
        >
          You'll receive a confirmation email at the address you provided.
        </motion.p>

        {/* Action buttons */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1 }}
          className="mt-8 flex flex-col gap-3 sm:flex-row"
        >
          <Button asChild size="lg">
            <Link href="/categories">
              Continue Shopping
              <ArrowRight className="ml-2 size-4" />
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/account/orders">View Orders</Link>
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
