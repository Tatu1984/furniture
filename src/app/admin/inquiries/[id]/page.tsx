"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Loader2,
  Mail,
  Phone,
  Save,
  Send,
  User,
} from "lucide-react";
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
import { PageHeader } from "@/components/admin/shared/page-header";
import { InquiryStatusBadge } from "@/components/admin/inquiry-status-badge";

type Inquiry = {
  id: string;
  inquiryNumber: string;
  status: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string | null;
  shippingAddress: string | null;
  shippingCity: string | null;
  shippingState: string | null;
  shippingPostal: string | null;
  shippingCountry: string | null;
  productName: string;
  productSlug: string;
  productSku: string | null;
  productImage: string | null;
  unitPrice: string | null;
  currency: string;
  quantity: number;
  selectedColor: string | null;
  selectedSize: string | null;
  selectedMaterial: string | null;
  variantId: string | null;
  notes: string | null;
  preferredDeliveryTimeline: string | null;
  preferredContact: string | null;
  internalNotes: string | null;
  assignedTo: string | null;
  lastContactedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

const STATUSES = [
  "NEW",
  "CONTACTED",
  "QUOTED",
  "CONFIRMED",
  "CLOSED",
  "CANCELLED",
] as const;

export default function InquiryDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [inquiry, setInquiry] = React.useState<Inquiry | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [sending, setSending] = React.useState(false);

  // Editable fields
  const [status, setStatus] = React.useState<string>("");
  const [internalNotes, setInternalNotes] = React.useState("");
  const [assignedTo, setAssignedTo] = React.useState("");

  // Email reply
  const [replySubject, setReplySubject] = React.useState("");
  const [replyBody, setReplyBody] = React.useState("");

  const fetchInquiry = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/inquiries/${params.id}`);
      if (!res.ok) {
        toast.error("Failed to load inquiry");
        return;
      }
      const json = await res.json();
      const data = json.data as Inquiry;
      setInquiry(data);
      setStatus(data.status);
      setInternalNotes(data.internalNotes ?? "");
      setAssignedTo(data.assignedTo ?? "");
      setReplySubject(`Your inquiry ${data.inquiryNumber} — ${data.productName}`);
      setReplyBody(buildDefaultReply(data));
    } catch {
      toast.error("Failed to load inquiry");
    } finally {
      setLoading(false);
    }
  }, [params.id]);

  React.useEffect(() => {
    fetchInquiry();
  }, [fetchInquiry]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/inquiries/${params.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status,
          internalNotes: internalNotes || undefined,
          assignedTo: assignedTo || undefined,
        }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => null);
        toast.error(j?.error ?? "Failed to save");
        return;
      }
      toast.success("Inquiry updated");
      fetchInquiry();
    } finally {
      setSaving(false);
    }
  };

  const handleSendReply = async () => {
    if (!replySubject.trim() || !replyBody.trim()) {
      toast.error("Subject and message are required");
      return;
    }
    setSending(true);
    try {
      const res = await fetch(`/api/admin/inquiries/${params.id}/reply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: replySubject,
          bodyHtml: replyBody.replace(/\n/g, "<br/>"),
        }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => null);
        toast.error(j?.error ?? "Failed to send email");
        return;
      }
      toast.success("Email sent to customer");
      fetchInquiry();
    } finally {
      setSending(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Delete this inquiry? This cannot be undone.")) return;
    const res = await fetch(`/api/admin/inquiries/${params.id}`, {
      method: "DELETE",
    });
    if (res.ok) {
      toast.success("Inquiry deleted");
      router.push("/admin/inquiries");
    } else {
      toast.error("Failed to delete");
    }
  };

  if (loading || !inquiry) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Inquiry ${inquiry.inquiryNumber}`}
        description={`Received ${new Date(inquiry.createdAt).toLocaleString("en-IN")}`}
      >
        <Button variant="ghost" size="sm" asChild>
          <Link href="/admin/inquiries">
            <ArrowLeft className="size-4" />
            Back
          </Link>
        </Button>
        <InquiryStatusBadge status={inquiry.status} />
      </PageHeader>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* ─── Main column ─────────────────────────────────────── */}
        <div className="space-y-6 lg:col-span-2">
          {/* Product summary */}
          <section className="rounded-xl border bg-card p-6 shadow-sm">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Product requested
            </h2>
            <div className="flex gap-4">
              <div className="relative size-24 shrink-0 overflow-hidden rounded-lg bg-muted">
                {inquiry.productImage && (
                  <Image
                    src={inquiry.productImage}
                    alt={inquiry.productName}
                    fill
                    sizes="96px"
                    className="object-cover"
                    unoptimized
                  />
                )}
              </div>
              <div className="flex-1 space-y-1">
                <Link
                  href={`/products/${inquiry.productSlug}`}
                  target="_blank"
                  className="font-semibold hover:underline"
                >
                  {inquiry.productName}
                </Link>
                {inquiry.productSku && (
                  <p className="text-xs text-muted-foreground">
                    SKU: {inquiry.productSku}
                  </p>
                )}
                <div className="flex flex-wrap gap-x-4 gap-y-1 pt-2 text-sm">
                  <span>
                    <span className="text-muted-foreground">Quantity:</span>{" "}
                    <strong>{inquiry.quantity}</strong>
                  </span>
                  {inquiry.unitPrice && (
                    <span>
                      <span className="text-muted-foreground">List price:</span>{" "}
                      <strong>
                        {inquiry.currency} {inquiry.unitPrice}
                      </strong>
                    </span>
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* Preferences */}
          <section className="rounded-xl border bg-card p-6 shadow-sm">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Preferences
            </h2>
            <dl className="grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2 text-sm">
              <DetailRow label="Color / finish" value={inquiry.selectedColor} />
              <DetailRow label="Size" value={inquiry.selectedSize} />
              <DetailRow label="Material" value={inquiry.selectedMaterial} />
              <DetailRow
                label="Delivery timeline"
                value={inquiry.preferredDeliveryTimeline}
              />
              <DetailRow
                label="Preferred contact"
                value={inquiry.preferredContact}
              />
              {inquiry.variantId && (
                <DetailRow label="Variant ID" value={inquiry.variantId} />
              )}
            </dl>
            {inquiry.notes && (
              <>
                <Separator className="my-4" />
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">
                    Customer notes
                  </p>
                  <p className="mt-2 whitespace-pre-wrap text-sm">
                    {inquiry.notes}
                  </p>
                </div>
              </>
            )}
          </section>

          {/* Email reply */}
          <section className="rounded-xl border bg-card p-6 shadow-sm">
            <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              <Mail className="size-4" /> Reply via email
            </h2>
            <div className="space-y-4">
              <div className="rounded-md bg-muted/40 px-3 py-2 text-sm">
                <span className="text-muted-foreground">To:</span>{" "}
                <strong>{inquiry.customerEmail}</strong>
              </div>
              <div>
                <Label htmlFor="reply-subject">Subject</Label>
                <Input
                  id="reply-subject"
                  value={replySubject}
                  onChange={(e) => setReplySubject(e.target.value)}
                  className="mt-2"
                />
              </div>
              <div>
                <Label htmlFor="reply-body">Message</Label>
                <Textarea
                  id="reply-body"
                  rows={12}
                  value={replyBody}
                  onChange={(e) => setReplyBody(e.target.value)}
                  className="mt-2 font-mono text-sm"
                />
                <p className="mt-1 text-xs text-muted-foreground">
                  Sent as HTML — line breaks become &lt;br&gt;. Status will move
                  to Contacted on first send.
                </p>
              </div>
              <div className="flex justify-end">
                <Button onClick={handleSendReply} disabled={sending}>
                  {sending ? (
                    <Loader2 className="mr-2 size-4 animate-spin" />
                  ) : (
                    <Send className="mr-2 size-4" />
                  )}
                  Send email
                </Button>
              </div>
            </div>
          </section>
        </div>

        {/* ─── Sidebar ─────────────────────────────────────────── */}
        <div className="space-y-6">
          {/* Customer */}
          <section className="rounded-xl border bg-card p-6 shadow-sm">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Customer
            </h2>
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-2">
                <User className="size-4 mt-0.5 text-muted-foreground" />
                <span>{inquiry.customerName}</span>
              </div>
              <div className="flex items-start gap-2">
                <Mail className="size-4 mt-0.5 text-muted-foreground" />
                <a
                  className="text-primary hover:underline"
                  href={`mailto:${inquiry.customerEmail}`}
                >
                  {inquiry.customerEmail}
                </a>
              </div>
              {inquiry.customerPhone && (
                <div className="flex items-start gap-2">
                  <Phone className="size-4 mt-0.5 text-muted-foreground" />
                  <a
                    className="text-primary hover:underline"
                    href={`tel:${inquiry.customerPhone}`}
                  >
                    {inquiry.customerPhone}
                  </a>
                </div>
              )}
            </div>
            {(inquiry.shippingAddress ||
              inquiry.shippingCity ||
              inquiry.shippingPostal) && (
              <>
                <Separator className="my-4" />
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">
                    Shipping
                  </p>
                  <address className="mt-2 not-italic text-sm whitespace-pre-line">
                    {[
                      inquiry.shippingAddress,
                      [inquiry.shippingCity, inquiry.shippingState]
                        .filter(Boolean)
                        .join(", "),
                      [inquiry.shippingPostal, inquiry.shippingCountry]
                        .filter(Boolean)
                        .join(" "),
                    ]
                      .filter(Boolean)
                      .join("\n")}
                  </address>
                </div>
              </>
            )}
          </section>

          {/* Workflow */}
          <section className="rounded-xl border bg-card p-6 shadow-sm">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Workflow
            </h2>
            <div className="space-y-4">
              <div>
                <Label htmlFor="status">Status</Label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger id="status" className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUSES.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s.charAt(0) + s.slice(1).toLowerCase()}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="assigned">Assigned to</Label>
                <Input
                  id="assigned"
                  value={assignedTo}
                  onChange={(e) => setAssignedTo(e.target.value)}
                  placeholder="Team member"
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="internal-notes">Internal notes</Label>
                <Textarea
                  id="internal-notes"
                  rows={5}
                  value={internalNotes}
                  onChange={(e) => setInternalNotes(e.target.value)}
                  placeholder="Notes visible only to admins"
                  className="mt-2"
                />
              </div>

              {inquiry.lastContactedAt && (
                <p className="text-xs text-muted-foreground">
                  Last contacted:{" "}
                  {new Date(inquiry.lastContactedAt).toLocaleString("en-IN")}
                </p>
              )}

              <Button onClick={handleSave} disabled={saving} className="w-full">
                {saving ? (
                  <Loader2 className="mr-2 size-4 animate-spin" />
                ) : (
                  <Save className="mr-2 size-4" />
                )}
                Save changes
              </Button>
            </div>
          </section>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleDelete}
            className="w-full text-destructive hover:text-destructive"
          >
            Delete inquiry
          </Button>
        </div>
      </div>
    </div>
  );
}

function DetailRow({
  label,
  value,
}: {
  label: string;
  value: string | null | undefined;
}) {
  if (!value) return null;
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-muted-foreground">
        {label}
      </dt>
      <dd className="mt-1">{value}</dd>
    </div>
  );
}

function buildDefaultReply(i: Inquiry): string {
  const parts: string[] = [];
  parts.push(`Hi ${i.customerName.split(" ")[0]},`);
  parts.push("");
  parts.push(
    `Thanks for your interest in ${i.productName}. Here's the quote based on your preferences:`,
  );
  parts.push("");
  parts.push(`Quantity: ${i.quantity}`);
  if (i.selectedColor) parts.push(`Color/Finish: ${i.selectedColor}`);
  if (i.selectedMaterial) parts.push(`Material: ${i.selectedMaterial}`);
  if (i.selectedSize) parts.push(`Size: ${i.selectedSize}`);
  if (i.preferredDeliveryTimeline)
    parts.push(`Delivery timeline: ${i.preferredDeliveryTimeline}`);
  parts.push("");
  parts.push("Estimated price: ");
  parts.push("Estimated delivery: ");
  parts.push("");
  parts.push(
    "Let us know if you'd like to confirm or adjust anything. Happy to hop on a call too.",
  );
  parts.push("");
  parts.push("Best,");
  parts.push("FSOW Team");
  return parts.join("\n");
}
