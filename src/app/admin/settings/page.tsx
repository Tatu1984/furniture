"use client";

import * as React from "react";
import {
  CreditCard,
  Globe,
  Truck,
  Receipt,
  Plus,
  Settings2,
  Mail,
  Bell,
  Trash2,
  Pencil,
  Image,
} from "lucide-react";

import { PageHeader } from "@/components/admin/shared/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { StatusBadge } from "@/components/shared/status-badge";

// ============================================================
// Tab 1 — General Settings
// ============================================================

function GeneralTab() {
  const [storeName, setStoreName] = React.useState("FSOW Furniture");
  const [storeDescription, setStoreDescription] = React.useState(
    "Premium handcrafted furniture for the modern home. We source sustainable materials and partner with skilled artisans to bring you timeless pieces that combine comfort, durability, and beauty."
  );
  const [storeEmail, setStoreEmail] = React.useState("hello@fsow.com");
  const [phone, setPhone] = React.useState("(415) 555-0100");
  const [address, setAddress] = React.useState(
    "123 Market Street\nSuite 450\nSan Francisco, CA 94102\nUnited States"
  );
  const [logoUrl, setLogoUrl] = React.useState("/logo.svg");
  const [currency, setCurrency] = React.useState("USD");
  const [timezone, setTimezone] = React.useState("America/Los_Angeles");

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Globe className="size-5" />
          General Settings
        </CardTitle>
        <CardDescription>
          Configure your store&apos;s basic information and branding
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="storeName">Store Name</Label>
            <Input
              id="storeName"
              value={storeName}
              onChange={(e) => setStoreName(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="storeEmail">Store Email</Label>
            <Input
              id="storeEmail"
              type="email"
              value={storeEmail}
              onChange={(e) => setStoreEmail(e.target.value)}
            />
          </div>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="storeDescription">Store Description</Label>
          <Textarea
            id="storeDescription"
            value={storeDescription}
            onChange={(e) => setStoreDescription(e.target.value)}
            rows={3}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="phone">Store Phone</Label>
            <Input
              id="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="logoUrl">Logo URL</Label>
            <div className="flex gap-2">
              <Input
                id="logoUrl"
                value={logoUrl}
                onChange={(e) => setLogoUrl(e.target.value)}
                className="flex-1"
              />
              {logoUrl && (
                <div className="flex size-9 items-center justify-center rounded-md border bg-muted">
                  <Image className="size-4 text-muted-foreground" />
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="address">Store Address</Label>
          <Textarea
            id="address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            rows={3}
          />
        </div>

        <Separator />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label>Currency</Label>
            <Select value={currency} onValueChange={setCurrency}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="USD">USD - US Dollar ($)</SelectItem>
                <SelectItem value="EUR">EUR - Euro</SelectItem>
                <SelectItem value="GBP">GBP - British Pound</SelectItem>
                <SelectItem value="INR">INR - Indian Rupee</SelectItem>
                <SelectItem value="AUD">AUD - Australian Dollar</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label>Timezone</Label>
            <Select value={timezone} onValueChange={setTimezone}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="America/New_York">
                  Eastern Time (ET)
                </SelectItem>
                <SelectItem value="America/Chicago">
                  Central Time (CT)
                </SelectItem>
                <SelectItem value="America/Denver">
                  Mountain Time (MT)
                </SelectItem>
                <SelectItem value="America/Los_Angeles">
                  Pacific Time (PT)
                </SelectItem>
                <SelectItem value="UTC">UTC</SelectItem>
                <SelectItem value="Europe/London">
                  London (GMT/BST)
                </SelectItem>
                <SelectItem value="Europe/Paris">
                  Central European Time (CET)
                </SelectItem>
                <SelectItem value="Asia/Kolkata">
                  India Standard Time (IST)
                </SelectItem>
                <SelectItem value="Asia/Tokyo">
                  Japan Standard Time (JST)
                </SelectItem>
                <SelectItem value="Australia/Sydney">
                  Australian Eastern Time (AET)
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex justify-end">
          <Button>Save Changes</Button>
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================================
// Tab 2 — Shipping Settings
// ============================================================

interface ShippingZone {
  id: string;
  name: string;
  countries: string;
  rate: string;
  rateType: "flat" | "free" | "weight";
}

function ShippingTab() {
  const [freeShippingThreshold, setFreeShippingThreshold] =
    React.useState("500");
  const [defaultShippingRate, setDefaultShippingRate] = React.useState("9.99");
  const [handlingTime, setHandlingTime] = React.useState("2");

  const [zones, setZones] = React.useState<ShippingZone[]>([
    {
      id: "z1",
      name: "Domestic - Standard",
      countries: "United States",
      rate: "$9.99",
      rateType: "flat",
    },
    {
      id: "z2",
      name: "Domestic - Express",
      countries: "United States",
      rate: "$24.99",
      rateType: "flat",
    },
    {
      id: "z3",
      name: "Free Shipping",
      countries: "United States",
      rate: "Free (orders > $500)",
      rateType: "free",
    },
    {
      id: "z4",
      name: "Canada",
      countries: "Canada",
      rate: "$29.99",
      rateType: "flat",
    },
    {
      id: "z5",
      name: "Heavy Items",
      countries: "United States, Canada",
      rate: "$2.50/lb",
      rateType: "weight",
    },
  ]);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [newZone, setNewZone] = React.useState<{
    name: string;
    countries: string;
    rate: string;
    rateType: "flat" | "free" | "weight";
  }>({ name: "", countries: "", rate: "", rateType: "flat" });

  const addZone = () => {
    setZones([...zones, { ...newZone, id: `z${zones.length + 1}` }]);
    setNewZone({ name: "", countries: "", rate: "", rateType: "flat" });
    setDialogOpen(false);
  };

  const deleteZone = (id: string) => {
    setZones(zones.filter((z) => z.id !== id));
  };

  return (
    <div className="space-y-6">
      {/* Shipping Defaults */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Truck className="size-5" />
            Shipping Defaults
          </CardTitle>
          <CardDescription>
            Configure default shipping rates and thresholds
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="freeThreshold">Free Shipping Threshold ($)</Label>
              <Input
                id="freeThreshold"
                type="number"
                value={freeShippingThreshold}
                onChange={(e) => setFreeShippingThreshold(e.target.value)}
                min={0}
                step={0.01}
              />
              <p className="text-xs text-muted-foreground">
                Orders above this amount qualify for free shipping
              </p>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="defaultRate">Default Shipping Rate ($)</Label>
              <Input
                id="defaultRate"
                type="number"
                value={defaultShippingRate}
                onChange={(e) => setDefaultShippingRate(e.target.value)}
                min={0}
                step={0.01}
              />
              <p className="text-xs text-muted-foreground">
                Flat rate applied when no zone matches
              </p>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="handlingTime">Handling Time (days)</Label>
              <Input
                id="handlingTime"
                type="number"
                value={handlingTime}
                onChange={(e) => setHandlingTime(e.target.value)}
                min={0}
              />
              <p className="text-xs text-muted-foreground">
                Business days before shipment
              </p>
            </div>
          </div>
          <div className="flex justify-end mt-4">
            <Button>Save Defaults</Button>
          </div>
        </CardContent>
      </Card>

      {/* Shipping Zones */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Shipping Zones</CardTitle>
              <CardDescription>
                Manage shipping zones and their rates
              </CardDescription>
            </div>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="mr-1 size-4" />
                  Add Zone
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Shipping Zone</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="grid gap-2">
                    <Label>Zone Name</Label>
                    <Input
                      value={newZone.name}
                      onChange={(e) =>
                        setNewZone({ ...newZone, name: e.target.value })
                      }
                      placeholder="e.g. International"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>Countries</Label>
                    <Input
                      value={newZone.countries}
                      onChange={(e) =>
                        setNewZone({ ...newZone, countries: e.target.value })
                      }
                      placeholder="e.g. United Kingdom, France"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>Rate Type</Label>
                    <RadioGroup
                      value={newZone.rateType}
                      onValueChange={(v) =>
                        setNewZone({
                          ...newZone,
                          rateType: v as "flat" | "free" | "weight",
                        })
                      }
                      className="flex gap-4"
                    >
                      <div className="flex items-center gap-2">
                        <RadioGroupItem value="flat" id="rt-flat" />
                        <Label htmlFor="rt-flat">Flat Rate</Label>
                      </div>
                      <div className="flex items-center gap-2">
                        <RadioGroupItem value="free" id="rt-free" />
                        <Label htmlFor="rt-free">Free Shipping</Label>
                      </div>
                      <div className="flex items-center gap-2">
                        <RadioGroupItem value="weight" id="rt-weight" />
                        <Label htmlFor="rt-weight">Weight-Based</Label>
                      </div>
                    </RadioGroup>
                  </div>
                  <div className="grid gap-2">
                    <Label>Rate</Label>
                    <Input
                      value={newZone.rate}
                      onChange={(e) =>
                        setNewZone({ ...newZone, rate: e.target.value })
                      }
                      placeholder="e.g. $14.99"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button onClick={addZone}>Add Zone</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Zone Name</TableHead>
                <TableHead>Countries</TableHead>
                <TableHead>Rate</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {zones.map((zone) => (
                <TableRow key={zone.id}>
                  <TableCell className="font-medium">{zone.name}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {zone.countries}
                  </TableCell>
                  <TableCell>{zone.rate}</TableCell>
                  <TableCell className="capitalize">
                    {zone.rateType === "weight"
                      ? "Weight-Based"
                      : zone.rateType === "free"
                        ? "Free"
                        : "Flat Rate"}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="sm" className="size-8 p-0">
                        <Pencil className="size-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="size-8 p-0 text-red-600 hover:text-red-700"
                        onClick={() => deleteZone(zone.id)}
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

// ============================================================
// Tab 3 — Tax Settings (kept from existing)
// ============================================================

interface TaxRule {
  id: string;
  region: string;
  rate: number;
  enabled: boolean;
}

function TaxTab() {
  const [rules, setRules] = React.useState<TaxRule[]>([
    { id: "tx1", region: "California", rate: 7.25, enabled: true },
    { id: "tx2", region: "New York", rate: 8.0, enabled: true },
    { id: "tx3", region: "Texas", rate: 6.25, enabled: true },
    { id: "tx4", region: "Florida", rate: 6.0, enabled: true },
    { id: "tx5", region: "Illinois", rate: 6.25, enabled: false },
    { id: "tx6", region: "Washington", rate: 6.5, enabled: true },
    { id: "tx7", region: "Oregon", rate: 0, enabled: false },
  ]);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [newRule, setNewRule] = React.useState({ region: "", rate: 0 });

  const toggleRule = (id: string) => {
    setRules(
      rules.map((r) => (r.id === id ? { ...r, enabled: !r.enabled } : r))
    );
  };

  const addRule = () => {
    setRules([
      ...rules,
      { ...newRule, id: `tx${rules.length + 1}`, enabled: true },
    ]);
    setNewRule({ region: "", rate: 0 });
    setDialogOpen(false);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Receipt className="size-5" />
              Tax Settings
            </CardTitle>
            <CardDescription>Manage tax rules by region</CardDescription>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="mr-1 size-4" />
                Add Rule
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Tax Rule</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="grid gap-2">
                  <Label>Region</Label>
                  <Input
                    value={newRule.region}
                    onChange={(e) =>
                      setNewRule({ ...newRule, region: e.target.value })
                    }
                    placeholder="e.g. Pennsylvania"
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Tax Rate (%)</Label>
                  <Input
                    type="number"
                    value={newRule.rate}
                    onChange={(e) =>
                      setNewRule({
                        ...newRule,
                        rate: parseFloat(e.target.value) || 0,
                      })
                    }
                    step={0.01}
                    min={0}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button onClick={addRule}>Add Rule</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Region</TableHead>
              <TableHead>Rate (%)</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Enabled</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rules.map((rule) => (
              <TableRow key={rule.id}>
                <TableCell className="font-medium">{rule.region}</TableCell>
                <TableCell>{rule.rate}%</TableCell>
                <TableCell>
                  <StatusBadge status={rule.enabled ? "active" : "draft"} />
                </TableCell>
                <TableCell>
                  <Switch
                    checked={rule.enabled}
                    onCheckedChange={() => toggleRule(rule.id)}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

// ============================================================
// Tab 4 — Payments Settings (enhanced)
// ============================================================

function PaymentsTab() {
  const [stripeEnabled, setStripeEnabled] = React.useState(true);
  const [paypalEnabled, setPaypalEnabled] = React.useState(true);
  const [bankEnabled, setBankEnabled] = React.useState(false);
  const [codEnabled, setCodEnabled] = React.useState(false);

  const [stripeKey, setStripeKey] = React.useState("sk_live_****************************");
  const [paypalKey, setPaypalKey] = React.useState("AYSq3RDGsmBLJE-otTkBtM-jBRnteLEj6zfESGPAbfocw");

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <CreditCard className="size-5" />
          Payment Gateways
        </h3>
        <p className="text-sm text-muted-foreground mt-1">
          Configure payment methods for your store
        </p>
      </div>

      {/* Stripe */}
      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex size-12 items-center justify-center rounded-lg bg-[#635BFF]/10">
                <CreditCard className="size-6 text-[#635BFF]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-semibold">Stripe</h4>
                  <StatusBadge status="active" />
                </div>
                <p className="text-sm text-muted-foreground">
                  Accept credit cards, Apple Pay, Google Pay and more
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Switch
                checked={stripeEnabled}
                onCheckedChange={setStripeEnabled}
              />
              <Button variant="outline" size="sm">
                <Settings2 className="mr-1 size-4" />
                Configure
              </Button>
            </div>
          </div>
          {stripeEnabled && (
            <div className="grid gap-2 pl-16">
              <Label htmlFor="stripeKey">API Key</Label>
              <Input
                id="stripeKey"
                type="password"
                value={stripeKey}
                onChange={(e) => setStripeKey(e.target.value)}
                className="max-w-md font-mono text-sm"
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* PayPal */}
      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex size-12 items-center justify-center rounded-lg bg-[#003087]/10">
                <CreditCard className="size-6 text-[#003087]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-semibold">PayPal</h4>
                  <StatusBadge status="active" />
                </div>
                <p className="text-sm text-muted-foreground">
                  Accept PayPal payments and Pay Later options
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Switch
                checked={paypalEnabled}
                onCheckedChange={setPaypalEnabled}
              />
              <Button variant="outline" size="sm">
                <Settings2 className="mr-1 size-4" />
                Configure
              </Button>
            </div>
          </div>
          {paypalEnabled && (
            <div className="grid gap-2 pl-16">
              <Label htmlFor="paypalKey">Client ID</Label>
              <Input
                id="paypalKey"
                type="password"
                value={paypalKey}
                onChange={(e) => setPaypalKey(e.target.value)}
                className="max-w-md font-mono text-sm"
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Bank Transfer */}
      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex size-12 items-center justify-center rounded-lg bg-muted">
                <CreditCard className="size-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-semibold">Bank Transfer</h4>
                  <StatusBadge status="draft" />
                </div>
                <p className="text-sm text-muted-foreground">
                  Accept direct bank transfers (manual verification required)
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Switch
                checked={bankEnabled}
                onCheckedChange={setBankEnabled}
              />
              <Button variant="outline" size="sm">
                <Settings2 className="mr-1 size-4" />
                Configure
              </Button>
            </div>
          </div>
          {bankEnabled && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-16">
              <div className="grid gap-2">
                <Label>Bank Name</Label>
                <Input placeholder="e.g. Chase Bank" />
              </div>
              <div className="grid gap-2">
                <Label>Account Holder Name</Label>
                <Input placeholder="e.g. FSOW Furniture LLC" />
              </div>
              <div className="grid gap-2">
                <Label>Account Number</Label>
                <Input type="password" placeholder="Account number" />
              </div>
              <div className="grid gap-2">
                <Label>Routing Number</Label>
                <Input placeholder="Routing number" />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Cash on Delivery */}
      <Card>
        <CardContent className="flex items-center justify-between pt-6">
          <div className="flex items-center gap-4">
            <div className="flex size-12 items-center justify-center rounded-lg bg-muted">
              <CreditCard className="size-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-semibold">Cash on Delivery</h4>
                {codEnabled ? (
                  <StatusBadge status="active" />
                ) : (
                  <StatusBadge status="draft" />
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                Collect payment when the order is delivered to the customer
              </p>
            </div>
          </div>
          <Switch checked={codEnabled} onCheckedChange={setCodEnabled} />
        </CardContent>
      </Card>
    </div>
  );
}

// ============================================================
// Tab 5 — Email Settings (NEW)
// ============================================================

function EmailTab() {
  const [fromName, setFromName] = React.useState("FSOW Furniture");
  const [fromEmail, setFromEmail] = React.useState("noreply@fsow.com");
  const [adminEmail, setAdminEmail] = React.useState("admin@fsow.com");
  const [smtpHost, setSmtpHost] = React.useState("smtp.sendgrid.net");
  const [smtpPort, setSmtpPort] = React.useState("587");
  const [smtpUser, setSmtpUser] = React.useState("apikey");
  const [smtpPass, setSmtpPass] = React.useState("SG.****************************");
  const [testStatus, setTestStatus] = React.useState<
    "idle" | "testing" | "success" | "error"
  >("idle");

  const handleTestConnection = () => {
    setTestStatus("testing");
    setTimeout(() => setTestStatus("success"), 1500);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="size-5" />
          Email Settings
        </CardTitle>
        <CardDescription>
          Configure your outgoing email settings and SMTP server
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="fromName">From Name</Label>
            <Input
              id="fromName"
              value={fromName}
              onChange={(e) => setFromName(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Sender name shown in customer emails
            </p>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="fromEmail">From Email</Label>
            <Input
              id="fromEmail"
              type="email"
              value={fromEmail}
              onChange={(e) => setFromEmail(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Sender email address for outgoing emails
            </p>
          </div>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="adminEmail">Admin Notification Email</Label>
          <Input
            id="adminEmail"
            type="email"
            value={adminEmail}
            onChange={(e) => setAdminEmail(e.target.value)}
            className="max-w-md"
          />
          <p className="text-xs text-muted-foreground">
            Email address to receive admin notifications
          </p>
        </div>

        <Separator />

        <h4 className="font-semibold">SMTP Configuration</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="smtpHost">SMTP Host</Label>
            <Input
              id="smtpHost"
              value={smtpHost}
              onChange={(e) => setSmtpHost(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="smtpPort">SMTP Port</Label>
            <Input
              id="smtpPort"
              value={smtpPort}
              onChange={(e) => setSmtpPort(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="smtpUser">SMTP Username</Label>
            <Input
              id="smtpUser"
              value={smtpUser}
              onChange={(e) => setSmtpUser(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="smtpPass">SMTP Password</Label>
            <Input
              id="smtpPass"
              type="password"
              value={smtpPass}
              onChange={(e) => setSmtpPass(e.target.value)}
            />
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={handleTestConnection}>
            {testStatus === "testing" ? "Testing..." : "Test Connection"}
          </Button>
          {testStatus === "success" && (
            <span className="text-sm text-green-600 font-medium">
              Connection successful!
            </span>
          )}
          {testStatus === "error" && (
            <span className="text-sm text-red-600 font-medium">
              Connection failed. Check your settings.
            </span>
          )}
        </div>

        <Separator />

        <div className="flex justify-end">
          <Button>Save Email Settings</Button>
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================================
// Tab 6 — Notifications Settings (NEW)
// ============================================================

interface NotificationPref {
  id: string;
  label: string;
  description: string;
  enabled: boolean;
}

function NotificationsTab() {
  const [prefs, setPrefs] = React.useState<NotificationPref[]>([
    {
      id: "new-order",
      label: "Email on new order",
      description: "Receive email when a new order is placed",
      enabled: true,
    },
    {
      id: "low-stock",
      label: "Email on low stock",
      description: "Receive email when product stock falls below threshold",
      enabled: true,
    },
    {
      id: "new-customer",
      label: "Email on new customer",
      description: "Receive email when a new customer registers",
      enabled: false,
    },
    {
      id: "new-review",
      label: "Email on review",
      description: "Receive email when a customer leaves a review",
      enabled: false,
    },
    {
      id: "daily-summary",
      label: "Daily sales summary",
      description: "Receive daily summary of sales and orders",
      enabled: true,
    },
    {
      id: "weekly-report",
      label: "Weekly analytics report",
      description: "Receive weekly analytics report via email",
      enabled: true,
    },
  ]);

  const togglePref = (id: string) => {
    setPrefs(
      prefs.map((p) => (p.id === id ? { ...p, enabled: !p.enabled } : p))
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="size-5" />
          Notification Preferences
        </CardTitle>
        <CardDescription>
          Choose which notifications you want to receive
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          {prefs.map((pref) => (
            <div
              key={pref.id}
              className="flex items-start gap-3 rounded-lg border p-4"
            >
              <Checkbox
                id={pref.id}
                checked={pref.enabled}
                onCheckedChange={() => togglePref(pref.id)}
                className="mt-0.5"
              />
              <div className="flex-1">
                <Label
                  htmlFor={pref.id}
                  className="text-sm font-medium cursor-pointer"
                >
                  {pref.label}
                </Label>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {pref.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-end">
          <Button>Save Notification Preferences</Button>
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================================
// Main Page
// ============================================================

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Settings" description="Manage your store configuration" />

      <Tabs defaultValue="general">
        <TabsList className="flex-wrap h-auto gap-1">
          <TabsTrigger value="general">
            <Globe className="mr-1.5 size-3.5" />
            General
          </TabsTrigger>
          <TabsTrigger value="shipping">
            <Truck className="mr-1.5 size-3.5" />
            Shipping
          </TabsTrigger>
          <TabsTrigger value="tax">
            <Receipt className="mr-1.5 size-3.5" />
            Tax
          </TabsTrigger>
          <TabsTrigger value="payments">
            <CreditCard className="mr-1.5 size-3.5" />
            Payments
          </TabsTrigger>
          <TabsTrigger value="email">
            <Mail className="mr-1.5 size-3.5" />
            Email
          </TabsTrigger>
          <TabsTrigger value="notifications">
            <Bell className="mr-1.5 size-3.5" />
            Notifications
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="mt-4">
          <GeneralTab />
        </TabsContent>

        <TabsContent value="shipping" className="mt-4">
          <ShippingTab />
        </TabsContent>

        <TabsContent value="tax" className="mt-4">
          <TaxTab />
        </TabsContent>

        <TabsContent value="payments" className="mt-4">
          <PaymentsTab />
        </TabsContent>

        <TabsContent value="email" className="mt-4">
          <EmailTab />
        </TabsContent>

        <TabsContent value="notifications" className="mt-4">
          <NotificationsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
