"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowLeft, RefreshCw } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { PageHeader } from "@/components/admin/shared/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const couponSchema = z.object({
  code: z.string().min(3, "Code must be at least 3 characters").max(20),
  discountType: z.enum(["percentage", "fixed"]),
  discountValue: z.number().min(0, "Must be 0 or more"),
  minimumOrder: z.number().min(0).optional(),
  usageLimit: z.number().min(0).optional(),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
  status: z.enum(["active", "draft"]),
  categories: z.array(z.string()).optional(),
  products: z.array(z.string()).optional(),
});

type CouponFormValues = z.infer<typeof couponSchema>;

const categoryOptions = [
  { id: "cat-living", label: "Living Room" },
  { id: "cat-bedroom", label: "Bedroom" },
  { id: "cat-dining", label: "Dining" },
  { id: "cat-office", label: "Office" },
  { id: "cat-outdoor", label: "Outdoor" },
  { id: "cat-decor", label: "Decor" },
];

const productOptions = [
  { id: "prod-001", label: "Oakwood Sofa" },
  { id: "prod-002", label: "Walnut Dining Table" },
  { id: "prod-003", label: "Modern Bookshelf" },
  { id: "prod-004", label: "Leather Armchair" },
  { id: "prod-005", label: "Standing Desk" },
  { id: "prod-006", label: "Bed Frame - King" },
];

function generateCode(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export default function CouponNewPage() {
  const form = useForm<CouponFormValues>({
    resolver: zodResolver(couponSchema),
    defaultValues: {
      code: "",
      discountType: "percentage",
      discountValue: 10,
      minimumOrder: 0,
      usageLimit: 0,
      startDate: new Date().toISOString().split("T")[0],
      endDate: "",
      status: "draft",
      categories: [],
      products: [],
    },
  });

  const discountType = form.watch("discountType");

  const onSubmit = (data: CouponFormValues) => {
    // UI only - no API call
    console.log("Coupon data:", data);
  };

  return (
    <div className="space-y-6">
      <Link href="/admin/coupons">
        <Button variant="ghost" size="sm">
          <ArrowLeft className="mr-2 size-4" />
          Back to Coupons
        </Button>
      </Link>

      <PageHeader title="Create Coupon" />

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Basic Info */}
            <Card>
              <CardHeader>
                <CardTitle>Coupon Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Coupon Code</FormLabel>
                      <div className="flex gap-2">
                        <FormControl>
                          <Input {...field} placeholder="SUMMER20" className="font-mono uppercase" />
                        </FormControl>
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => form.setValue("code", generateCode())}
                        >
                          <RefreshCw className="size-4" />
                        </Button>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="discountType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Discount Type</FormLabel>
                      <FormControl>
                        <RadioGroup
                          value={field.value}
                          onValueChange={field.onChange}
                          className="flex gap-6"
                        >
                          <div className="flex items-center gap-2">
                            <RadioGroupItem value="percentage" id="type-pct" />
                            <Label htmlFor="type-pct">Percentage</Label>
                          </div>
                          <div className="flex items-center gap-2">
                            <RadioGroupItem value="fixed" id="type-fixed" />
                            <Label htmlFor="type-fixed">Fixed Amount</Label>
                          </div>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="discountValue"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Discount Value {discountType === "percentage" ? "(%)" : "($)"}
                      </FormLabel>
                      <FormControl>
                        <Input type="number" {...field} min={0} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="minimumOrder"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Minimum Order Amount ($)</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} min={0} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="usageLimit"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Usage Limit (0 = unlimited)</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} min={0} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Dates & Status */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Schedule</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="startDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Start Date</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="endDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>End Date</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status</FormLabel>
                        <FormControl>
                          <RadioGroup
                            value={field.value}
                            onValueChange={field.onChange}
                            className="flex gap-6"
                          >
                            <div className="flex items-center gap-2">
                              <RadioGroupItem value="active" id="status-active" />
                              <Label htmlFor="status-active">Active</Label>
                            </div>
                            <div className="flex items-center gap-2">
                              <RadioGroupItem value="draft" id="status-draft" />
                              <Label htmlFor="status-draft">Draft</Label>
                            </div>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Applicable Categories</CardTitle>
                </CardHeader>
                <CardContent>
                  <FormField
                    control={form.control}
                    name="categories"
                    render={() => (
                      <FormItem>
                        <div className="grid grid-cols-2 gap-3">
                          {categoryOptions.map((cat) => (
                            <FormField
                              key={cat.id}
                              control={form.control}
                              name="categories"
                              render={({ field }) => (
                                <FormItem className="flex items-center gap-2 space-y-0">
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value?.includes(cat.id)}
                                      onCheckedChange={(checked) => {
                                        const current = field.value ?? [];
                                        field.onChange(
                                          checked
                                            ? [...current, cat.id]
                                            : current.filter((v) => v !== cat.id)
                                        );
                                      }}
                                    />
                                  </FormControl>
                                  <Label className="text-sm font-normal">{cat.label}</Label>
                                </FormItem>
                              )}
                            />
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Applicable Products</CardTitle>
                </CardHeader>
                <CardContent>
                  <FormField
                    control={form.control}
                    name="products"
                    render={() => (
                      <FormItem>
                        <div className="grid grid-cols-1 gap-3">
                          {productOptions.map((prod) => (
                            <FormField
                              key={prod.id}
                              control={form.control}
                              name="products"
                              render={({ field }) => (
                                <FormItem className="flex items-center gap-2 space-y-0">
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value?.includes(prod.id)}
                                      onCheckedChange={(checked) => {
                                        const current = field.value ?? [];
                                        field.onChange(
                                          checked
                                            ? [...current, prod.id]
                                            : current.filter((v) => v !== prod.id)
                                        );
                                      }}
                                    />
                                  </FormControl>
                                  <Label className="text-sm font-normal">{prod.label}</Label>
                                </FormItem>
                              )}
                            />
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="flex justify-end">
            <Button type="submit" size="lg">
              Save Coupon
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
