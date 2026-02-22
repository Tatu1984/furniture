"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { MapPin, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

// ---------------------------------------------------------------------------
// Schema
// ---------------------------------------------------------------------------

const addressSchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  street: z.string().min(1, "Street address is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  zip: z.string().min(5, "ZIP code must be at least 5 characters"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
});

type AddressFormValues = z.infer<typeof addressSchema>;

// ---------------------------------------------------------------------------
// Mock data
// ---------------------------------------------------------------------------

type Address = AddressFormValues & {
  id: string;
  isDefault: boolean;
};

const initialAddresses: Address[] = [
  {
    id: "addr-1",
    fullName: "Sarah Mitchell",
    street: "742 Evergreen Terrace",
    city: "Springfield",
    state: "IL",
    zip: "62704",
    phone: "(555) 123-4567",
    isDefault: true,
  },
  {
    id: "addr-2",
    fullName: "Sarah Mitchell",
    street: "1600 Pennsylvania Avenue NW",
    city: "Washington",
    state: "DC",
    zip: "20500",
    phone: "(555) 987-6543",
    isDefault: false,
  },
  {
    id: "addr-3",
    fullName: "Sarah Mitchell (Office)",
    street: "350 Fifth Avenue, Suite 4200",
    city: "New York",
    state: "NY",
    zip: "10118",
    phone: "(555) 456-7890",
    isDefault: false,
  },
];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function AccountAddressesPage() {
  const [addresses, setAddresses] = useState<Address[]>(initialAddresses);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const form = useForm<AddressFormValues>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      fullName: "",
      street: "",
      city: "",
      state: "",
      zip: "",
      phone: "",
    },
  });

  function openAddDialog() {
    setEditingId(null);
    form.reset({
      fullName: "",
      street: "",
      city: "",
      state: "",
      zip: "",
      phone: "",
    });
    setDialogOpen(true);
  }

  function openEditDialog(address: Address) {
    setEditingId(address.id);
    form.reset({
      fullName: address.fullName,
      street: address.street,
      city: address.city,
      state: address.state,
      zip: address.zip,
      phone: address.phone,
    });
    setDialogOpen(true);
  }

  function onSubmit(data: AddressFormValues) {
    if (editingId) {
      setAddresses((prev) =>
        prev.map((addr) =>
          addr.id === editingId ? { ...addr, ...data } : addr
        )
      );
      toast.success("Address updated successfully!");
    } else {
      const newAddress: Address = {
        ...data,
        id: `addr-${Date.now()}`,
        isDefault: addresses.length === 0,
      };
      setAddresses((prev) => [...prev, newAddress]);
      toast.success("Address added successfully!");
    }
    setDialogOpen(false);
  }

  function handleDelete(id: string) {
    setAddresses((prev) => prev.filter((addr) => addr.id !== id));
    toast.success("Address deleted.");
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">My Addresses</h2>
          <p className="text-muted-foreground mt-1">
            Manage your shipping and billing addresses.
          </p>
        </div>
        <Button onClick={openAddDialog}>
          <Plus className="mr-2 h-4 w-4" />
          Add New Address
        </Button>
      </div>

      {/* Address cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
        {addresses.map((address) => (
          <Card key={address.id}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-base">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  {address.fullName}
                </CardTitle>
                {address.isDefault && (
                  <Badge variant="secondary" className="text-xs">
                    Default
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-1">
              <p>{address.street}</p>
              <p>
                {address.city}, {address.state} {address.zip}
              </p>
              <p>{address.phone}</p>
            </CardContent>
            <CardFooter className="gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => openEditDialog(address)}
              >
                <Pencil className="mr-1.5 h-3.5 w-3.5" />
                Edit
              </Button>
              {!address.isDefault && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-destructive hover:text-destructive"
                  onClick={() => handleDelete(address.id)}
                >
                  <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                  Delete
                </Button>
              )}
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* Add/Edit dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingId ? "Edit Address" : "Add New Address"}
            </DialogTitle>
            <DialogDescription>
              {editingId
                ? "Update the details for this address."
                : "Enter the details for a new shipping address."}
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-4"
            >
              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="John Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="street"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Street Address</FormLabel>
                    <FormControl>
                      <Input placeholder="123 Main St, Apt 4" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>City</FormLabel>
                      <FormControl>
                        <Input placeholder="New York" {...field} />
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
                      <FormControl>
                        <Input placeholder="NY" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="zip"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>ZIP Code</FormLabel>
                      <FormControl>
                        <Input placeholder="10001" {...field} />
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
                        <Input
                          type="tel"
                          placeholder="(555) 000-0000"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  {editingId ? "Update Address" : "Save Address"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
