"use client";

import * as React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
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

// Hardcoded content page data
const pageData: Record<string, { title: string; slug: string; status: "published" | "draft"; sections: Section[] }> = {
  "page-001": {
    title: "Home",
    slug: "/",
    status: "published",
    sections: [
      {
        id: "s1",
        type: "hero",
        data: {
          heading: "Furniture that Speaks to You",
          subheading: "Handcrafted pieces for every room in your home",
          bgImage: "https://picsum.photos/seed/hero-home/1920/800",
          ctaText: "Shop Collection",
          ctaLink: "/shop",
        },
      },
      {
        id: "s2",
        type: "features",
        data: {
          features: [
            { icon: "Truck", title: "Free Shipping", description: "On orders over $500" },
            { icon: "Shield", title: "5-Year Warranty", description: "On all furniture" },
            { icon: "Leaf", title: "Sustainable", description: "Eco-friendly materials" },
            { icon: "Headphones", title: "24/7 Support", description: "Always here to help" },
          ],
        },
      },
      {
        id: "s3",
        type: "cta",
        data: {
          heading: "Design Your Dream Space",
          description: "Book a free consultation with our interior design experts.",
          buttonText: "Book Consultation",
          buttonLink: "/contact",
          bgColor: "#1B4332",
        },
      },
    ],
  },
  "page-002": {
    title: "About Us",
    slug: "/about",
    status: "published",
    sections: [
      {
        id: "s1",
        type: "hero",
        data: {
          heading: "Our Story",
          subheading: "Crafting quality furniture since 2010",
          bgImage: "https://picsum.photos/seed/hero-about/1920/800",
          ctaText: "Learn More",
          ctaLink: "#story",
        },
      },
      {
        id: "s2",
        type: "image-text",
        data: {
          imageUrl: "https://picsum.photos/seed/about-workshop/800/600",
          heading: "Handcrafted with Care",
          text: "Every piece of furniture in our collection is crafted by skilled artisans who bring decades of experience to their craft. We source only the finest materials and use time-tested techniques to create furniture that lasts generations.",
          imagePosition: "left",
        },
      },
      {
        id: "s3",
        type: "text",
        data: {
          content: "At FSOW, we believe that furniture is more than just functional - it tells a story. Our mission is to create beautiful, durable pieces that transform houses into homes. Founded in San Francisco, we've grown from a small workshop to a beloved brand serving customers across the nation.",
        },
      },
    ],
  },
  "page-004": {
    title: "FAQ",
    slug: "/faq",
    status: "published",
    sections: [
      {
        id: "s1",
        type: "hero",
        data: {
          heading: "Frequently Asked Questions",
          subheading: "Find answers to common questions about our products and services",
          bgImage: "https://picsum.photos/seed/hero-faq/1920/800",
          ctaText: "",
          ctaLink: "",
        },
      },
      {
        id: "s2",
        type: "faq",
        data: {
          faqs: [
            { question: "What is your return policy?", answer: "We offer a 30-day return policy on all furniture items. The items must be in their original condition and packaging." },
            { question: "Do you offer assembly services?", answer: "Yes, we offer professional assembly services for an additional fee. Our team will set up your furniture in the room of your choice." },
            { question: "How long does shipping take?", answer: "Standard shipping takes 5-10 business days. Express shipping is available for 2-3 business day delivery on most items." },
            { question: "Do you ship internationally?", answer: "Currently, we only ship within the United States. We plan to expand to international shipping in the near future." },
          ],
        },
      },
    ],
  },
};

function generateId() {
  return `section-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

// Section field components
function HeroFields({ data, onChange }: { data: Record<string, unknown>; onChange: (d: Record<string, unknown>) => void }) {
  return (
    <div className="grid gap-4">
      <div className="grid gap-2"><Label>Heading</Label><Input value={(data.heading as string) ?? ""} onChange={(e) => onChange({ ...data, heading: e.target.value })} /></div>
      <div className="grid gap-2"><Label>Subheading</Label><Input value={(data.subheading as string) ?? ""} onChange={(e) => onChange({ ...data, subheading: e.target.value })} /></div>
      <div className="grid gap-2"><Label>Background Image URL</Label><Input value={(data.bgImage as string) ?? ""} onChange={(e) => onChange({ ...data, bgImage: e.target.value })} /></div>
      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2"><Label>CTA Text</Label><Input value={(data.ctaText as string) ?? ""} onChange={(e) => onChange({ ...data, ctaText: e.target.value })} /></div>
        <div className="grid gap-2"><Label>CTA Link</Label><Input value={(data.ctaLink as string) ?? ""} onChange={(e) => onChange({ ...data, ctaLink: e.target.value })} /></div>
      </div>
    </div>
  );
}

function TextFields({ data, onChange }: { data: Record<string, unknown>; onChange: (d: Record<string, unknown>) => void }) {
  return <div className="grid gap-2"><Label>Content</Label><Textarea value={(data.content as string) ?? ""} onChange={(e) => onChange({ ...data, content: e.target.value })} rows={6} /></div>;
}

function ImageTextFields({ data, onChange }: { data: Record<string, unknown>; onChange: (d: Record<string, unknown>) => void }) {
  return (
    <div className="grid gap-4">
      <div className="grid gap-2"><Label>Image URL</Label><Input value={(data.imageUrl as string) ?? ""} onChange={(e) => onChange({ ...data, imageUrl: e.target.value })} /></div>
      <div className="grid gap-2"><Label>Heading</Label><Input value={(data.heading as string) ?? ""} onChange={(e) => onChange({ ...data, heading: e.target.value })} /></div>
      <div className="grid gap-2"><Label>Text</Label><Textarea value={(data.text as string) ?? ""} onChange={(e) => onChange({ ...data, text: e.target.value })} rows={3} /></div>
      <div className="grid gap-2">
        <Label>Image Position</Label>
        <RadioGroup value={(data.imagePosition as string) ?? "left"} onValueChange={(v) => onChange({ ...data, imagePosition: v })} className="flex gap-4">
          <div className="flex items-center gap-2"><RadioGroupItem value="left" id="edit-img-left" /><Label htmlFor="edit-img-left">Left</Label></div>
          <div className="flex items-center gap-2"><RadioGroupItem value="right" id="edit-img-right" /><Label htmlFor="edit-img-right">Right</Label></div>
        </RadioGroup>
      </div>
    </div>
  );
}

function FeaturesFields({ data, onChange }: { data: Record<string, unknown>; onChange: (d: Record<string, unknown>) => void }) {
  const features = (data.features as { icon: string; title: string; description: string }[]) ?? [{ icon: "", title: "", description: "" }, { icon: "", title: "", description: "" }, { icon: "", title: "", description: "" }, { icon: "", title: "", description: "" }];
  const update = (i: number, f: string, v: string) => { const u = [...features]; u[i] = { ...u[i], [f]: v }; onChange({ ...data, features: u }); };
  return (
    <div className="grid gap-4">
      {features.map((f, i) => (
        <div key={i} className="grid grid-cols-3 gap-3 p-3 border rounded-md">
          <div className="grid gap-1"><Label className="text-xs">Icon</Label><Input value={f.icon} onChange={(e) => update(i, "icon", e.target.value)} /></div>
          <div className="grid gap-1"><Label className="text-xs">Title</Label><Input value={f.title} onChange={(e) => update(i, "title", e.target.value)} /></div>
          <div className="grid gap-1"><Label className="text-xs">Description</Label><Input value={f.description} onChange={(e) => update(i, "description", e.target.value)} /></div>
        </div>
      ))}
    </div>
  );
}

function CTAFields({ data, onChange }: { data: Record<string, unknown>; onChange: (d: Record<string, unknown>) => void }) {
  return (
    <div className="grid gap-4">
      <div className="grid gap-2"><Label>Heading</Label><Input value={(data.heading as string) ?? ""} onChange={(e) => onChange({ ...data, heading: e.target.value })} /></div>
      <div className="grid gap-2"><Label>Description</Label><Textarea value={(data.description as string) ?? ""} onChange={(e) => onChange({ ...data, description: e.target.value })} rows={3} /></div>
      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2"><Label>Button Text</Label><Input value={(data.buttonText as string) ?? ""} onChange={(e) => onChange({ ...data, buttonText: e.target.value })} /></div>
        <div className="grid gap-2"><Label>Button Link</Label><Input value={(data.buttonLink as string) ?? ""} onChange={(e) => onChange({ ...data, buttonLink: e.target.value })} /></div>
      </div>
      <div className="grid gap-2"><Label>Background Color</Label><Input value={(data.bgColor as string) ?? "#1B4332"} onChange={(e) => onChange({ ...data, bgColor: e.target.value })} /></div>
    </div>
  );
}

function FAQFields({ data, onChange }: { data: Record<string, unknown>; onChange: (d: Record<string, unknown>) => void }) {
  const faqs = (data.faqs as { question: string; answer: string }[]) ?? [{ question: "", answer: "" }];
  const update = (i: number, f: string, v: string) => { const u = [...faqs]; u[i] = { ...u[i], [f]: v }; onChange({ ...data, faqs: u }); };
  const addFaq = () => onChange({ ...data, faqs: [...faqs, { question: "", answer: "" }] });
  return (
    <div className="grid gap-4">
      {faqs.map((faq, i) => (
        <div key={i} className="grid gap-2 p-3 border rounded-md">
          <div className="grid gap-1"><Label className="text-xs">Question {i + 1}</Label><Input value={faq.question} onChange={(e) => update(i, "question", e.target.value)} /></div>
          <div className="grid gap-1"><Label className="text-xs">Answer</Label><Textarea value={faq.answer} onChange={(e) => update(i, "answer", e.target.value)} rows={2} /></div>
        </div>
      ))}
      <Button type="button" variant="outline" size="sm" onClick={addFaq}><Plus className="mr-1 size-4" />Add FAQ Pair</Button>
    </div>
  );
}

function SectionFields({ section, onChange }: { section: Section; onChange: (d: Record<string, unknown>) => void }) {
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

export default function ContentEditPage() {
  const params = useParams();
  const id = params.id as string;
  const initial = pageData[id];

  const [title, setTitle] = React.useState(initial?.title ?? "Untitled Page");
  const [slug, setSlug] = React.useState(initial?.slug ?? "/untitled");
  const [status, setStatus] = React.useState<"published" | "draft">(initial?.status ?? "draft");
  const [sections, setSections] = React.useState<Section[]>(initial?.sections ?? []);

  const addSection = (type: SectionType) => {
    setSections([...sections, { id: generateId(), type, data: {} }]);
  };

  const removeSection = (sId: string) => {
    setSections(sections.filter((s) => s.id !== sId));
  };

  const updateSectionData = (sId: string, data: Record<string, unknown>) => {
    setSections(sections.map((s) => (s.id === sId ? { ...s, data } : s)));
  };

  return (
    <div className="space-y-6">
      <Link href="/admin/content">
        <Button variant="ghost" size="sm">
          <ArrowLeft className="mr-2 size-4" />
          Back to Content
        </Button>
      </Link>

      <PageHeader title="Edit Page" />

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6">
        {/* Main Content */}
        <div className="space-y-6">
          <Card>
            <CardContent className="pt-6 space-y-4">
              <div className="grid gap-2">
                <Label>Title</Label>
                <Input value={title} onChange={(e) => setTitle(e.target.value)} />
              </div>
              <div className="grid gap-2">
                <Label>Slug</Label>
                <Input value={slug} onChange={(e) => setSlug(e.target.value)} />
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
                  <p>No sections yet. Click &quot;Add Section&quot; to start building.</p>
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
                        <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={() => removeSection(section.id)}>
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                      <Separator className="mb-4" />
                      <SectionFields section={section} onChange={(data) => updateSectionData(section.id, data)} />
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
                  <SelectTrigger><SelectValue /></SelectTrigger>
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
