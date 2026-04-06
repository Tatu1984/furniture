"use client";

import { useState, useMemo, useEffect } from "react";
import Image from "next/image";
import Script from "next/script";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Package,
  Truck,
  Zap,
  ChevronRight,
  ChevronLeft,
  Check,
  ShoppingBag,
  Lock,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

import { useCartStore } from "@/stores/cart-store";
import { useAuthStore } from "@/stores/auth-store";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Schemas
// ---------------------------------------------------------------------------

const shippingSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  address: z.string().min(1, "Street address is required"),
  apt: z.string().optional(),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  zip: z.string().min(6, "PIN code must be 6 digits").max(6, "PIN code must be 6 digits"),
  country: z.string().min(1, "Country is required"),
});

type ShippingFormValues = z.infer<typeof shippingSchema>;

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const steps = [
  { label: "Shipping", icon: Package },
  { label: "Method", icon: Truck },
  { label: "Review & Pay", icon: Lock },
] as const;

const shippingMethods = [
  {
    id: "standard",
    name: "Standard Shipping",
    price: 0,
    duration: "5-7 business days",
    icon: Package,
  },
  {
    id: "express",
    name: "Express Shipping",
    price: 999,
    duration: "2-3 business days",
    icon: Truck,
  },
  {
    id: "nextday",
    name: "Next Day Delivery",
    price: 1999,
    duration: "1 business day",
    icon: Zap,
  },
] as const;

const INDIAN_STATES = [
  "Andhra Pradesh","Arunachal Pradesh","Assam","Bihar","Chhattisgarh",
  "Goa","Gujarat","Haryana","Himachal Pradesh","Jharkhand",
  "Karnataka","Kerala","Madhya Pradesh","Maharashtra","Manipur",
  "Meghalaya","Mizoram","Nagaland","Odisha","Punjab",
  "Rajasthan","Sikkim","Tamil Nadu","Telangana","Tripura",
  "Uttar Pradesh","Uttarakhand","West Bengal",
  "Andaman and Nicobar Islands","Chandigarh","Dadra and Nagar Haveli and Daman and Diu",
  "Delhi","Jammu and Kashmir","Ladakh","Lakshadweep","Puducherry",
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatPrice(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  }).format(value);
}

// ---------------------------------------------------------------------------
// Stepper Component
// ---------------------------------------------------------------------------

function Stepper({ currentStep }: { currentStep: number }) {
  return (
    <div className="flex items-center justify-center gap-0">
      {steps.map((step, i) => {
        const isActive = i === currentStep;
        const isCompleted = i < currentStep;
        const StepIcon = step.icon;

        return (
          <div key={step.label} className="flex items-center">
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={cn(
                  "flex size-10 items-center justify-center rounded-full border-2 text-sm font-semibold transition-colors",
                  isCompleted &&
                    "border-primary bg-primary text-primary-foreground",
                  isActive &&
                    "border-primary bg-primary/10 text-primary",
                  !isActive &&
                    !isCompleted &&
                    "border-muted-foreground/30 text-muted-foreground"
                )}
              >
                {isCompleted ? (
                  <Check className="size-4" />
                ) : (
                  <StepIcon className="size-4" />
                )}
              </div>
              <span
                className={cn(
                  "text-xs font-medium",
                  isActive && "text-primary",
                  isCompleted && "text-primary",
                  !isActive && !isCompleted && "text-muted-foreground"
                )}
              >
                {step.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div
                className={cn(
                  "mx-2 mb-5 h-0.5 w-8 sm:w-12 md:w-16",
                  i < currentStep ? "bg-primary" : "bg-muted-foreground/20"
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Step 1: Shipping Address
// ---------------------------------------------------------------------------

function ShippingStep({
  form,
}: {
  form: ReturnType<typeof useForm<ShippingFormValues>>;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Shipping Address</h2>
        <p className="text-sm text-muted-foreground">
          Enter the address where you'd like your order delivered.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FormField
          control={form.control}
          name="firstName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>First Name</FormLabel>
              <FormControl>
                <Input placeholder="John" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="lastName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Last Name</FormLabel>
              <FormControl>
                <Input placeholder="Doe" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder="john@example.com"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone</FormLabel>
              <FormControl>
                <Input type="tel" placeholder="+91 98765 43210" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={form.control}
        name="address"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Street Address</FormLabel>
            <FormControl>
              <Input placeholder="123 Main St" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="apt"
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              Apt / Suite / Floor{" "}
              <span className="text-muted-foreground font-normal">
                (optional)
              </span>
            </FormLabel>
            <FormControl>
              <Input placeholder="Flat 4B" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <FormField
          control={form.control}
          name="city"
          render={({ field }) => (
            <FormItem>
              <FormLabel>City</FormLabel>
              <FormControl>
                <Input placeholder="Mumbai" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="state"
          render={({ field }) => (
            <FormItem>
              <FormLabel>State</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {INDIAN_STATES.map((st) => (
                    <SelectItem key={st} value={st}>
                      {st}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="zip"
          render={({ field }) => (
            <FormItem>
              <FormLabel>PIN Code</FormLabel>
              <FormControl>
                <Input placeholder="400001" maxLength={6} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={form.control}
        name="country"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Country</FormLabel>
            <Select onValueChange={field.onChange} value={field.value}>
              <FormControl>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select country" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="IN">India</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Step 2: Shipping Method
// ---------------------------------------------------------------------------

function ShippingMethodStep({
  selected,
  onSelect,
}: {
  selected: string;
  onSelect: (id: string) => void;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Shipping Method</h2>
        <p className="text-sm text-muted-foreground">
          Choose how you'd like your order shipped.
        </p>
      </div>

      <RadioGroup value={selected} onValueChange={onSelect} className="gap-3">
        {shippingMethods.map((method) => {
          const MethodIcon = method.icon;
          return (
            <label
              key={method.id}
              className={cn(
                "flex cursor-pointer items-center gap-4 rounded-lg border p-4 transition-colors hover:bg-accent/50",
                selected === method.id && "border-primary bg-primary/5"
              )}
            >
              <RadioGroupItem value={method.id} />
              <MethodIcon className="size-5 text-muted-foreground" />
              <div className="flex-1">
                <div className="font-medium">{method.name}</div>
                <div className="text-sm text-muted-foreground">
                  {method.duration}
                </div>
              </div>
              <div className="font-semibold">
                {method.price === 0 ? "Free" : formatPrice(method.price)}
              </div>
            </label>
          );
        })}
      </RadioGroup>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Step 3: Review & Pay
// ---------------------------------------------------------------------------

function ReviewStep({
  shippingData,
  shippingMethodId,
  items,
  subtotal,
  shippingCost,
}: {
  shippingData: ShippingFormValues;
  shippingMethodId: string;
  items: ReturnType<typeof useCartStore.getState>["items"];
  subtotal: number;
  shippingCost: number;
}) {
  const method = shippingMethods.find((m) => m.id === shippingMethodId);
  const tax = subtotal * 0.18; // GST 18%
  const total = subtotal + shippingCost + tax;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Review Your Order</h2>
        <p className="text-sm text-muted-foreground">
          Please confirm all details before paying.
        </p>
      </div>

      {/* Shipping Address */}
      <div className="rounded-lg border p-4 space-y-1">
        <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
          Shipping Address
        </h3>
        <p className="font-medium">
          {shippingData.firstName} {shippingData.lastName}
        </p>
        <p className="text-sm text-muted-foreground">
          {shippingData.address}
          {shippingData.apt && `, ${shippingData.apt}`}
        </p>
        <p className="text-sm text-muted-foreground">
          {shippingData.city}, {shippingData.state} {shippingData.zip}
        </p>
        <p className="text-sm text-muted-foreground">{shippingData.email}</p>
      </div>

      {/* Shipping Method */}
      <div className="rounded-lg border p-4 space-y-1">
        <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
          Shipping Method
        </h3>
        <p className="font-medium">{method?.name}</p>
        <p className="text-sm text-muted-foreground">{method?.duration}</p>
      </div>

      {/* Order Items */}
      <div className="rounded-lg border p-4 space-y-3">
        <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
          Items ({items.length})
        </h3>
        {items.map((item) => (
          <div key={item.productId} className="flex items-center gap-3">
            <div className="relative size-12 overflow-hidden rounded-md bg-muted">
              <Image
                src={item.image}
                alt={item.name}
                fill
                className="object-cover"
                sizes="48px"
              />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium line-clamp-1">{item.name}</p>
              <p className="text-xs text-muted-foreground">
                Qty: {item.quantity}
              </p>
            </div>
            <span className="text-sm font-medium">
              {formatPrice(item.price * item.quantity)}
            </span>
          </div>
        ))}
      </div>

      {/* Totals */}
      <div className="space-y-2 rounded-lg bg-muted/50 p-4">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Subtotal</span>
          <span>{formatPrice(subtotal)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Shipping</span>
          <span>{shippingCost === 0 ? "Free" : formatPrice(shippingCost)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">GST (18%)</span>
          <span>{formatPrice(tax)}</span>
        </div>
        <Separator />
        <div className="flex justify-between font-bold text-base">
          <span>Total</span>
          <span>{formatPrice(total)}</span>
        </div>
      </div>

      <div className="flex items-center gap-2 rounded-lg bg-muted/50 p-3 text-sm text-muted-foreground">
        <Lock className="size-4" />
        <span>You will be redirected to Razorpay's secure payment page.</span>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Cart Summary Sidebar
// ---------------------------------------------------------------------------

function CartSummary({
  items,
  subtotal,
  shippingCost,
}: {
  items: ReturnType<typeof useCartStore.getState>["items"];
  subtotal: number;
  shippingCost: number;
}) {
  const [isOpen, setIsOpen] = useState(true);
  const tax = subtotal * 0.18;
  const total = subtotal + shippingCost + tax;

  return (
    <Card>
      <CardHeader className="cursor-pointer lg:cursor-default" onClick={() => setIsOpen(!isOpen)}>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">
            Order Summary ({items.length} {items.length === 1 ? "item" : "items"})
          </CardTitle>
          <ChevronRight
            className={cn(
              "size-4 transition-transform lg:hidden",
              isOpen && "rotate-90"
            )}
          />
        </div>
      </CardHeader>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <CardContent className="space-y-3 pt-0">
              {items.map((item) => (
                <div key={item.productId} className="flex items-center gap-3">
                  <div className="relative size-10 overflow-hidden rounded-md bg-muted">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-cover"
                      sizes="40px"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{item.name}</p>
                    <p className="text-xs text-muted-foreground">
                      Qty: {item.quantity}
                    </p>
                  </div>
                  <span className="text-sm font-medium">
                    {formatPrice(item.price * item.quantity)}
                  </span>
                </div>
              ))}

              <Separator />

              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping</span>
                  <span>
                    {shippingCost === 0 ? "Free" : formatPrice(shippingCost)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">GST (18%)</span>
                  <span>{formatPrice(tax)}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-bold">
                  <span>Total</span>
                  <span>{formatPrice(total)}</span>
                </div>
              </div>
            </CardContent>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Checkout Page
// ---------------------------------------------------------------------------

export default function CheckoutPage() {
  const router = useRouter();
  const items = useCartStore((s) => s.items);
  const subtotal = useCartStore((s) => s.subtotal);
  const clearCart = useCartStore((s) => s.clearCart);
  const { isAuthenticated, isLoading: authLoading, user } = useAuthStore();

  const [currentStep, setCurrentStep] = useState(0);
  const [shippingMethodId, setShippingMethodId] = useState("standard");
  const [isProcessing, setIsProcessing] = useState(false);
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);

  // Auth gate — redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/auth/login?redirect=/checkout");
    }
  }, [authLoading, isAuthenticated, router]);

  // Forms
  const shippingForm = useForm<ShippingFormValues>({
    resolver: zodResolver(shippingSchema),
    defaultValues: {
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      email: user?.email || "",
      phone: "",
      address: "",
      apt: "",
      city: "",
      state: "",
      zip: "",
      country: "IN",
    },
  });

  const shippingCost = useMemo(() => {
    const method = shippingMethods.find((m) => m.id === shippingMethodId);
    return method?.price ?? 0;
  }, [shippingMethodId]);

  // Show loading while checking auth
  if (authLoading) {
    return (
      <div className="container mx-auto max-w-7xl px-4 py-16 flex justify-center">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Don't render if not authenticated (will redirect)
  if (!isAuthenticated) {
    return null;
  }

  // Empty cart
  if (items.length === 0) {
    return (
      <div className="container mx-auto max-w-7xl px-4 py-16">
        <EmptyState
          icon={ShoppingBag}
          title="Your cart is empty"
          description="Add some items to your cart before proceeding to checkout."
          actionLabel="Continue Shopping"
          actionHref="/categories"
        />
      </div>
    );
  }

  // Handle Razorpay payment
  const handlePayNow = async () => {
    if (!razorpayLoaded) {
      toast.error("Payment system is loading. Please try again.");
      return;
    }

    setIsProcessing(true);

    try {
      const shippingData = shippingForm.getValues();

      // Step 1: Create Razorpay order via our API
      const createRes = await fetch("/api/payments/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...shippingData,
          shippingMethod: shippingMethodId,
        }),
      });

      const createData = await createRes.json();

      if (!createRes.ok) {
        toast.error(createData.error || "Failed to create payment order");
        setIsProcessing(false);
        return;
      }

      // Step 2: Open Razorpay checkout popup
      const options: RazorpayOptions = {
        key: createData.keyId,
        amount: createData.amount,
        currency: createData.currency,
        name: "FSOW Furniture",
        description: "Order Payment",
        order_id: createData.razorpayOrderId,
        handler: async (response: RazorpayResponse) => {
          // Step 3: Verify payment and create order
          try {
            const verifyRes = await fetch("/api/payments/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                addressId: createData.addressId,
                shippingMethod: shippingMethodId,
              }),
            });

            const verifyData = await verifyRes.json();

            if (verifyRes.ok) {
              clearCart();
              router.push(
                `/checkout/confirmation?orderNumber=${verifyData.order.orderNumber}`
              );
            } else {
              toast.error(verifyData.error || "Payment verification failed");
            }
          } catch {
            toast.error("Payment verification failed. Please contact support.");
          }
          setIsProcessing(false);
        },
        prefill: {
          name: `${shippingData.firstName} ${shippingData.lastName}`,
          email: shippingData.email,
          contact: shippingData.phone,
        },
        theme: { color: "#000000" },
        modal: {
          ondismiss: () => {
            setIsProcessing(false);
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch {
      toast.error("Something went wrong. Please try again.");
      setIsProcessing(false);
    }
  };

  // Navigation handlers
  const handleNext = async () => {
    if (currentStep === 0) {
      const valid = await shippingForm.trigger();
      if (!valid) return;
    }
    if (currentStep === 2) {
      // Pay Now
      handlePayNow();
      return;
    }
    setCurrentStep((s) => Math.min(s + 1, 2));
  };

  const handleBack = () => {
    setCurrentStep((s) => Math.max(s - 1, 0));
  };

  return (
    <>
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        strategy="lazyOnload"
        onLoad={() => setRazorpayLoaded(true)}
      />
      <div className="container mx-auto max-w-7xl px-4 py-8 lg:py-12">
        {/* Stepper */}
        <div className="mb-10">
          <Stepper currentStep={currentStep} />
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Main content */}
          <div className="lg:col-span-2">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
              >
                {currentStep === 0 && (
                  <Form {...shippingForm}>
                    <form>
                      <ShippingStep form={shippingForm} />
                    </form>
                  </Form>
                )}
                {currentStep === 1 && (
                  <ShippingMethodStep
                    selected={shippingMethodId}
                    onSelect={setShippingMethodId}
                  />
                )}
                {currentStep === 2 && (
                  <ReviewStep
                    shippingData={shippingForm.getValues()}
                    shippingMethodId={shippingMethodId}
                    items={items}
                    subtotal={subtotal()}
                    shippingCost={shippingCost}
                  />
                )}
              </motion.div>
            </AnimatePresence>

            {/* Navigation buttons */}
            <div className="mt-8 flex items-center justify-between">
              <Button
                variant="outline"
                onClick={handleBack}
                disabled={currentStep === 0}
              >
                <ChevronLeft className="mr-1 size-4" />
                Back
              </Button>
              <Button onClick={handleNext} disabled={isProcessing}>
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-1 size-4 animate-spin" />
                    Processing...
                  </>
                ) : currentStep === 2 ? (
                  <>
                    <Lock className="mr-1 size-4" />
                    Pay Now
                  </>
                ) : (
                  <>
                    Continue
                    <ChevronRight className="ml-1 size-4" />
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Sidebar */}
          <div className="order-first lg:order-last lg:sticky lg:top-24 lg:self-start">
            <CartSummary
              items={items}
              subtotal={subtotal()}
              shippingCost={shippingCost}
            />
          </div>
        </div>
      </div>
    </>
  );
}
