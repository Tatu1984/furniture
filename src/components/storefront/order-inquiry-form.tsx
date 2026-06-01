"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CheckCircle2, Loader2, Minus, Plus } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BreadcrumbNav } from "@/components/shared/breadcrumb-nav";
import { PriceDisplay } from "@/components/shared/price-display";

interface ProductData {
  id: string;
  name: string;
  slug: string;
  sku: string;
  price: number;
  compareAtPrice: number | null;
  currency: string;
  shortDescription: string;
  materials: string[];
  assemblyRequired: boolean;
  assemblyTime: string | null;
  estimatedDeliveryDays: number | null;
  image: string;
  imageAlt: string;
  category: { name: string; slug: string } | null;
  variants: { id: string; name: string; price: number; image: string | null }[];
}

interface FormState {
  quantity: number;
  selectedColor: string;
  selectedSize: string;
  selectedMaterial: string;
  variantId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: string;
  shippingCity: string;
  shippingState: string;
  shippingPostal: string;
  shippingCountry: string;
  preferredDeliveryTimeline: string;
  preferredContact: "EMAIL" | "PHONE" | "WHATSAPP";
  notes: string;
}

const initialState: FormState = {
  quantity: 1,
  selectedColor: "",
  selectedSize: "",
  selectedMaterial: "",
  variantId: "",
  customerName: "",
  customerEmail: "",
  customerPhone: "",
  shippingAddress: "",
  shippingCity: "",
  shippingState: "",
  shippingPostal: "",
  shippingCountry: "IN",
  preferredDeliveryTimeline: "",
  preferredContact: "EMAIL",
  notes: "",
};

export function OrderInquiryForm({ product }: { product: ProductData }) {
  const router = useRouter();
  const [form, setForm] = useState<FormState>({
    ...initialState,
    selectedMaterial: product.materials[0] ?? "",
    variantId: product.variants[0]?.id ?? "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [confirmation, setConfirmation] = useState<{
    inquiryNumber: string;
  } | null>(null);

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((s) => ({ ...s, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: product.id,
          quantity: form.quantity,
          selectedColor: form.selectedColor || undefined,
          selectedSize: form.selectedSize || undefined,
          selectedMaterial: form.selectedMaterial || undefined,
          variantId: form.variantId || undefined,
          customerName: form.customerName,
          customerEmail: form.customerEmail,
          customerPhone: form.customerPhone || undefined,
          shippingAddress: form.shippingAddress || undefined,
          shippingCity: form.shippingCity || undefined,
          shippingState: form.shippingState || undefined,
          shippingPostal: form.shippingPostal || undefined,
          shippingCountry: form.shippingCountry || undefined,
          preferredDeliveryTimeline:
            form.preferredDeliveryTimeline || undefined,
          preferredContact: form.preferredContact,
          notes: form.notes || undefined,
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        const detail = json?.details
          ? Object.values(json.details).flat().join(", ")
          : json?.error;
        toast.error(detail ?? "Failed to submit inquiry");
        return;
      }

      setConfirmation({ inquiryNumber: json.data.inquiryNumber });
    } catch (err) {
      console.error(err);
      toast.error("Could not submit your inquiry. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (confirmation) {
    return (
      <div className="container mx-auto max-w-2xl px-4 py-16">
        <div className="rounded-xl border bg-card p-8 text-center shadow-sm">
          <CheckCircle2 className="mx-auto size-14 text-green-600" />
          <h1 className="mt-6 text-2xl font-bold">Inquiry submitted</h1>
          <p className="mt-2 text-muted-foreground">
            Thanks {form.customerName.split(" ")[0]}! Our team will reach out
            shortly to confirm pricing, availability, and next steps.
          </p>
          <p className="mt-4 text-sm">
            <span className="font-medium">Reference:</span>{" "}
            <span className="font-mono">{confirmation.inquiryNumber}</span>
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            A copy has been sent to {form.customerEmail}.
          </p>
          <div className="mt-8 flex justify-center gap-3">
            <Button asChild variant="outline">
              <Link href="/products">Browse more</Link>
            </Button>
            <Button onClick={() => router.push("/")}>Back to home</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 md:py-10">
      <BreadcrumbNav
        items={[
          ...(product.category
            ? [
                {
                  label: product.category.name,
                  href: `/categories/${product.category.slug}`,
                },
              ]
            : []),
          { label: product.name, href: `/products/${product.slug}` },
          { label: "Order Inquiry" },
        ]}
      />

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-3 lg:gap-12">
        {/* ─── Form ──────────────────────────────────────────────── */}
        <form onSubmit={handleSubmit} className="lg:col-span-2 space-y-8">
          <div>
            <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
              Request an order for {product.name}
            </h1>
            <p className="mt-2 text-muted-foreground">
              Tell us your preferences and our team will email you with pricing,
              availability, and delivery options.
            </p>
          </div>

          {/* ─── Preferences ─────────────────────────────────────── */}
          <section className="space-y-5 rounded-xl border bg-card p-6 shadow-sm">
            <h2 className="text-lg font-semibold">Your preferences</h2>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div>
                <Label htmlFor="quantity">Quantity *</Label>
                <div className="mt-2 flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() =>
                      update("quantity", Math.max(1, form.quantity - 1))
                    }
                    disabled={form.quantity <= 1}
                  >
                    <Minus className="size-4" />
                  </Button>
                  <Input
                    id="quantity"
                    type="number"
                    inputMode="numeric"
                    min={1}
                    max={9999}
                    value={form.quantity}
                    onChange={(e) =>
                      update(
                        "quantity",
                        Math.max(
                          1,
                          Math.min(9999, parseInt(e.target.value) || 1),
                        ),
                      )
                    }
                    className="w-20 text-center"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() =>
                      update("quantity", Math.min(9999, form.quantity + 1))
                    }
                  >
                    <Plus className="size-4" />
                  </Button>
                </div>
              </div>

              {product.variants.length > 0 && (
                <div>
                  <Label htmlFor="variant">Variant</Label>
                  <Select
                    value={form.variantId}
                    onValueChange={(v) => update("variantId", v)}
                  >
                    <SelectTrigger id="variant" className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {product.variants.map((v) => (
                        <SelectItem key={v.id} value={v.id}>
                          {v.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {product.materials.length > 0 && (
                <div>
                  <Label htmlFor="material">Preferred material</Label>
                  <Select
                    value={form.selectedMaterial}
                    onValueChange={(v) => update("selectedMaterial", v)}
                  >
                    <SelectTrigger id="material" className="mt-2">
                      <SelectValue placeholder="Select material" />
                    </SelectTrigger>
                    <SelectContent>
                      {product.materials.map((m) => (
                        <SelectItem key={m} value={m}>
                          {m}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div>
                <Label htmlFor="color">Preferred color / finish</Label>
                <Input
                  id="color"
                  value={form.selectedColor}
                  onChange={(e) => update("selectedColor", e.target.value)}
                  placeholder="e.g. Walnut, Charcoal"
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="size">Preferred size / dimensions</Label>
                <Input
                  id="size"
                  value={form.selectedSize}
                  onChange={(e) => update("selectedSize", e.target.value)}
                  placeholder="e.g. 6-seater, 200x90 cm"
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="timeline">Preferred delivery timeline</Label>
                <Input
                  id="timeline"
                  value={form.preferredDeliveryTimeline}
                  onChange={(e) =>
                    update("preferredDeliveryTimeline", e.target.value)
                  }
                  placeholder="e.g. Within 4 weeks"
                  className="mt-2"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="notes">Special requirements / notes</Label>
              <Textarea
                id="notes"
                value={form.notes}
                onChange={(e) => update("notes", e.target.value)}
                rows={4}
                placeholder="Any custom finishes, delivery instructions, or questions for our team."
                className="mt-2"
              />
            </div>
          </section>

          {/* ─── Contact info ─────────────────────────────────────── */}
          <section className="space-y-5 rounded-xl border bg-card p-6 shadow-sm">
            <h2 className="text-lg font-semibold">Your contact details</h2>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Label htmlFor="name">Full name *</Label>
                <Input
                  id="name"
                  required
                  value={form.customerName}
                  onChange={(e) => update("customerName", e.target.value)}
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  required
                  value={form.customerEmail}
                  onChange={(e) => update("customerEmail", e.target.value)}
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={form.customerPhone}
                  onChange={(e) => update("customerPhone", e.target.value)}
                  className="mt-2"
                />
              </div>

              <div className="sm:col-span-2">
                <Label htmlFor="contact-pref">Preferred contact method</Label>
                <Select
                  value={form.preferredContact}
                  onValueChange={(v) =>
                    update(
                      "preferredContact",
                      v as FormState["preferredContact"],
                    )
                  }
                >
                  <SelectTrigger id="contact-pref" className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="EMAIL">Email</SelectItem>
                    <SelectItem value="PHONE">Phone call</SelectItem>
                    <SelectItem value="WHATSAPP">WhatsApp</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </section>

          {/* ─── Delivery ─────────────────────────────────────────── */}
          <section className="space-y-5 rounded-xl border bg-card p-6 shadow-sm">
            <div>
              <h2 className="text-lg font-semibold">Delivery address</h2>
              <p className="text-xs text-muted-foreground">
                Optional — share if you&apos;d like a delivery quote in the reply.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Label htmlFor="address">Address</Label>
                <Textarea
                  id="address"
                  rows={2}
                  value={form.shippingAddress}
                  onChange={(e) => update("shippingAddress", e.target.value)}
                  className="mt-2"
                />
              </div>
              <div>
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  value={form.shippingCity}
                  onChange={(e) => update("shippingCity", e.target.value)}
                  className="mt-2"
                />
              </div>
              <div>
                <Label htmlFor="state">State</Label>
                <Input
                  id="state"
                  value={form.shippingState}
                  onChange={(e) => update("shippingState", e.target.value)}
                  className="mt-2"
                />
              </div>
              <div>
                <Label htmlFor="postal">Postal code</Label>
                <Input
                  id="postal"
                  value={form.shippingPostal}
                  onChange={(e) => update("shippingPostal", e.target.value)}
                  className="mt-2"
                />
              </div>
              <div>
                <Label htmlFor="country">Country</Label>
                <Input
                  id="country"
                  value={form.shippingCountry}
                  onChange={(e) => update("shippingCountry", e.target.value)}
                  className="mt-2"
                />
              </div>
            </div>
          </section>

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button asChild variant="outline" type="button">
              <Link href={`/products/${product.slug}`}>Back to product</Link>
            </Button>
            <Button type="submit" size="lg" disabled={submitting}>
              {submitting && <Loader2 className="mr-2 size-4 animate-spin" />}
              Submit inquiry
            </Button>
          </div>
        </form>

        {/* ─── Sidebar product summary ──────────────────────────────── */}
        <aside className="lg:sticky lg:top-24 h-fit space-y-4 rounded-xl border bg-card p-6 shadow-sm">
          <div className="relative aspect-square overflow-hidden rounded-lg bg-muted">
            <Image
              src={product.image}
              alt={product.imageAlt}
              fill
              sizes="(max-width: 1024px) 100vw, 33vw"
              className="object-cover"
              unoptimized
            />
          </div>
          <div>
            <h3 className="font-semibold">{product.name}</h3>
            <p className="text-xs text-muted-foreground">SKU: {product.sku}</p>
          </div>
          <PriceDisplay
            price={product.price}
            compareAtPrice={product.compareAtPrice ?? undefined}
          />
          {product.shortDescription && (
            <>
              <Separator />
              <p className="text-sm text-muted-foreground">
                {product.shortDescription}
              </p>
            </>
          )}
          <Separator />
          <div className="text-xs text-muted-foreground space-y-1">
            <p>
              Final pricing depends on configuration, finish, and delivery
              location. Our team will share a confirmed quote by email.
            </p>
            {product.estimatedDeliveryDays && (
              <p>
                Typical delivery: {product.estimatedDeliveryDays} business days.
              </p>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
