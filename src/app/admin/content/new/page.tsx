"use client";

import * as React from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Plus,
  GripVertical,
  Trash2,
  Image as ImageIcon,
  Type,
  Layout,
  Grid3X3,
  MousePointer,
  HelpCircle,
} from "lucide-react";

import { PageHeader } from "@/components/admin/shared/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { StatusBadge } from "@/components/shared/status-badge";

type SectionType = "hero" | "text" | "image-text" | "features" | "cta" | "faq";

interface Section {
  id: string;
  type: SectionType;
  data: Record<string, unknown>;
}

const sectionTypeLabels: Record<SectionType, string> = {
  hero: "Hero",
  text: "Text Block",
  "image-text": "Image + Text",
  features: "Features Grid",
  cta: "CTA",
  faq: "FAQ",
};

const sectionTypeIcons: Record<SectionType, React.ReactNode> = {
  hero: <Layout className="size-4" />,
  text: <Type className="size-4" />,
  "image-text": <ImageIcon className="size-4" />,
  features: <Grid3X3 className="size-4" />,
  cta: <MousePointer className="size-4" />,
  faq: <HelpCircle className="size-4" />,
};

function generateId() {
  return `section-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function HeroFields({ data, onChange }: { data: Record<string, unknown>; onChange: (data: Record<string, unknown>) => void }) {
  return (
    <div className="grid gap-4">
      <div className="grid gap-2">
        <Label>Heading</Label>
        <Input value={(data.heading as string) ?? ""} onChange={(e) => onChange({ ...data, heading: e.target.value })} placeholder="Hero heading" />
      </div>
      <div className="grid gap-2">
        <Label>Subheading</Label>
        <Input value={(data.subheading as string) ?? ""} onChange={(e) => onChange({ ...data, subheading: e.target.value })} placeholder="Hero subheading" />
      </div>
      <div className="grid gap-2">
        <Label>Background Image URL</Label>
        <Input value={(data.bgImage as string) ?? ""} onChange={(e) => onChange({ ...data, bgImage: e.target.value })} placeholder="https://..." />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label>CTA Text</Label>
          <Input value={(data.ctaText as string) ?? ""} onChange={(e) => onChange({ ...data, ctaText: e.target.value })} placeholder="Shop Now" />
        </div>
        <div className="grid gap-2">
          <Label>CTA Link</Label>
          <Input value={(data.ctaLink as string) ?? ""} onChange={(e) => onChange({ ...data, ctaLink: e.target.value })} placeholder="/shop" />
        </div>
      </div>
    </div>
  );
}

function TextFields({ data, onChange }: { data: Record<string, unknown>; onChange: (data: Record<string, unknown>) => void }) {
  return (
    <div className="grid gap-2">
      <Label>Content</Label>
      <Textarea
        value={(data.content as string) ?? ""}
        onChange={(e) => onChange({ ...data, content: e.target.value })}
        placeholder="Enter text content..."
        rows={6}
      />
    </div>
  );
}

function ImageTextFields({ data, onChange }: { data: Record<string, unknown>; onChange: (data: Record<string, unknown>) => void }) {
  return (
    <div className="grid gap-4">
      <div className="grid gap-2">
        <Label>Image URL</Label>
        <Input value={(data.imageUrl as string) ?? ""} onChange={(e) => onChange({ ...data, imageUrl: e.target.value })} placeholder="https://..." />
      </div>
      <div className="grid gap-2">
        <Label>Heading</Label>
        <Input value={(data.heading as string) ?? ""} onChange={(e) => onChange({ ...data, heading: e.target.value })} placeholder="Section heading" />
      </div>
      <div className="grid gap-2">
        <Label>Text</Label>
        <Textarea value={(data.text as string) ?? ""} onChange={(e) => onChange({ ...data, text: e.target.value })} placeholder="Section text" rows={3} />
      </div>
      <div className="grid gap-2">
        <Label>Image Position</Label>
        <RadioGroup
          value={(data.imagePosition as string) ?? "left"}
          onValueChange={(val) => onChange({ ...data, imagePosition: val })}
          className="flex gap-4"
        >
          <div className="flex items-center gap-2">
            <RadioGroupItem value="left" id="img-left" />
            <Label htmlFor="img-left">Left</Label>
          </div>
          <div className="flex items-center gap-2">
            <RadioGroupItem value="right" id="img-right" />
            <Label htmlFor="img-right">Right</Label>
          </div>
        </RadioGroup>
      </div>
    </div>
  );
}

function FeaturesFields({ data, onChange }: { data: Record<string, unknown>; onChange: (data: Record<string, unknown>) => void }) {
  const features = (data.features as { icon: string; title: string; description: string }[]) ?? [
    { icon: "", title: "", description: "" },
    { icon: "", title: "", description: "" },
    { icon: "", title: "", description: "" },
    { icon: "", title: "", description: "" },
  ];

  const updateFeature = (index: number, field: string, value: string) => {
    const updated = [...features];
    updated[index] = { ...updated[index], [field]: value };
    onChange({ ...data, features: updated });
  };

  return (
    <div className="grid gap-4">
      {features.map((feature, i) => (
        <div key={i} className="grid grid-cols-3 gap-3 p-3 border rounded-md">
          <div className="grid gap-1">
            <Label className="text-xs">Icon</Label>
            <Input value={feature.icon} onChange={(e) => updateFeature(i, "icon", e.target.value)} placeholder="icon name" />
          </div>
          <div className="grid gap-1">
            <Label className="text-xs">Title</Label>
            <Input value={feature.title} onChange={(e) => updateFeature(i, "title", e.target.value)} placeholder="Feature title" />
          </div>
          <div className="grid gap-1">
            <Label className="text-xs">Description</Label>
            <Input value={feature.description} onChange={(e) => updateFeature(i, "description", e.target.value)} placeholder="Short description" />
          </div>
        </div>
      ))}
    </div>
  );
}

function CTAFields({ data, onChange }: { data: Record<string, unknown>; onChange: (data: Record<string, unknown>) => void }) {
  return (
    <div className="grid gap-4">
      <div className="grid gap-2">
        <Label>Heading</Label>
        <Input value={(data.heading as string) ?? ""} onChange={(e) => onChange({ ...data, heading: e.target.value })} placeholder="CTA heading" />
      </div>
      <div className="grid gap-2">
        <Label>Description</Label>
        <Textarea value={(data.description as string) ?? ""} onChange={(e) => onChange({ ...data, description: e.target.value })} placeholder="CTA description" rows={3} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label>Button Text</Label>
          <Input value={(data.buttonText as string) ?? ""} onChange={(e) => onChange({ ...data, buttonText: e.target.value })} placeholder="Get Started" />
        </div>
        <div className="grid gap-2">
          <Label>Button Link</Label>
          <Input value={(data.buttonLink as string) ?? ""} onChange={(e) => onChange({ ...data, buttonLink: e.target.value })} placeholder="/signup" />
        </div>
      </div>
      <div className="grid gap-2">
        <Label>Background Color</Label>
        <Input value={(data.bgColor as string) ?? "#1B4332"} onChange={(e) => onChange({ ...data, bgColor: e.target.value })} placeholder="#1B4332" />
      </div>
    </div>
  );
}

function FAQFields({ data, onChange }: { data: Record<string, unknown>; onChange: (data: Record<string, unknown>) => void }) {
  const faqs = (data.faqs as { question: string; answer: string }[]) ?? [
    { question: "", answer: "" },
    { question: "", answer: "" },
    { question: "", answer: "" },
  ];

  const updateFaq = (index: number, field: string, value: string) => {
    const updated = [...faqs];
    updated[index] = { ...updated[index], [field]: value };
    onChange({ ...data, faqs: updated });
  };

  const addFaq = () => {
    onChange({ ...data, faqs: [...faqs, { question: "", answer: "" }] });
  };

  return (
    <div className="grid gap-4">
      {faqs.map((faq, i) => (
        <div key={i} className="grid gap-2 p-3 border rounded-md">
          <div className="grid gap-1">
            <Label className="text-xs">Question {i + 1}</Label>
            <Input value={faq.question} onChange={(e) => updateFaq(i, "question", e.target.value)} placeholder="Enter question" />
          </div>
          <div className="grid gap-1">
            <Label className="text-xs">Answer</Label>
            <Textarea value={faq.answer} onChange={(e) => updateFaq(i, "answer", e.target.value)} placeholder="Enter answer" rows={2} />
          </div>
        </div>
      ))}
      <Button type="button" variant="outline" size="sm" onClick={addFaq}>
        <Plus className="mr-1 size-4" />
        Add FAQ Pair
      </Button>
    </div>
  );
}

function SectionFields({ section, onChange }: { section: Section; onChange: (data: Record<string, unknown>) => void }) {
  switch (section.type) {
    case "hero": return <HeroFields data={section.data} onChange={onChange} />;
    case "text": return <TextFields data={section.data} onChange={onChange} />;
    case "image-text": return <ImageTextFields data={section.data} onChange={onChange} />;
    case "features": return <FeaturesFields data={section.data} onChange={onChange} />;
    case "cta": return <CTAFields data={section.data} onChange={onChange} />;
    case "faq": return <FAQFields data={section.data} onChange={onChange} />;
    default: return null;
  }
}

export default function ContentNewPage() {
  const [title, setTitle] = React.useState("");
  const [slug, setSlug] = React.useState("");
  const [autoSlug, setAutoSlug] = React.useState(true);
  const [status, setStatus] = React.useState<"published" | "draft">("draft");
  const [sections, setSections] = React.useState<Section[]>([]);

  React.useEffect(() => {
    if (autoSlug) {
      setSlug(`/${slugify(title)}`);
    }
  }, [title, autoSlug]);

  const addSection = (type: SectionType) => {
    setSections([...sections, { id: generateId(), type, data: {} }]);
  };

  const removeSection = (id: string) => {
    setSections(sections.filter((s) => s.id !== id));
  };

  const updateSectionData = (id: string, data: Record<string, unknown>) => {
    setSections(sections.map((s) => (s.id === id ? { ...s, data } : s)));
  };

  return (
    <div className="space-y-6">
      <Link href="/admin/content">
        <Button variant="ghost" size="sm">
          <ArrowLeft className="mr-2 size-4" />
          Back to Content
        </Button>
      </Link>

      <PageHeader title="Create Page" />

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6">
        {/* Main Content */}
        <div className="space-y-6">
          <Card>
            <CardContent className="pt-6 space-y-4">
              <div className="grid gap-2">
                <Label>Title</Label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Page title"
                />
              </div>
              <div className="grid gap-2">
                <Label>Slug</Label>
                <Input
                  value={slug}
                  onChange={(e) => {
                    setAutoSlug(false);
                    setSlug(e.target.value);
                  }}
                  placeholder="/page-slug"
                />
              </div>
            </CardContent>
          </Card>

          {/* Section Builder */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Content Sections</CardTitle>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button size="sm">
                      <Plus className="mr-1 size-4" />
                      Add Section
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {(Object.keys(sectionTypeLabels) as SectionType[]).map((type) => (
                      <DropdownMenuItem key={type} onClick={() => addSection(type)}>
                        {sectionTypeIcons[type]}
                        <span className="ml-2">{sectionTypeLabels[type]}</span>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent>
              {sections.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <p>No sections added yet.</p>
                  <p className="text-sm">Click &quot;Add Section&quot; to start building your page.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {sections.map((section) => (
                    <div key={section.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <GripVertical className="size-4 text-muted-foreground cursor-grab" />
                          {sectionTypeIcons[section.type]}
                          <span className="font-medium text-sm">{sectionTypeLabels[section.type]}</span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive"
                          onClick={() => removeSection(section.id)}
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                      <Separator className="mb-4" />
                      <SectionFields
                        section={section}
                        onChange={(data) => updateSectionData(section.id, data)}
                      />
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Publish</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label>Status</Label>
                <Select value={status} onValueChange={(v) => setStatus(v as "published" | "draft")}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2">
                <StatusBadge status={status} />
              </div>
              <Separator />
              <div className="flex gap-2">
                <Button className="flex-1">Save</Button>
                <Button variant="outline">Preview</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
