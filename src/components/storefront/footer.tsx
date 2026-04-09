import Link from "next/link";
import { Facebook, Instagram, Twitter, Youtube } from "lucide-react";
import { Separator } from "@/components/ui/separator";

type NavCategory = { id: string; name: string; slug: string };

const supportLinks = [
  { label: "Contact Us", href: "/contact" },
  { label: "FAQs", href: "/faq" },
  { label: "Shipping & Returns", href: "/shipping" },
  { label: "Assembly Guide", href: "/assembly" },
  { label: "Warranty", href: "/warranty" },
];

const companyLinks = [
  { label: "About Us", href: "/about" },
  { label: "Blog", href: "/blog" },
  { label: "Showrooms", href: "/showrooms" },
  { label: "Careers", href: "/careers" },
  { label: "Press", href: "/press" },
];

export function Footer({ categories = [] }: { categories?: NavCategory[] }) {
  const shopLinks = categories.slice(0, 6).map((c) => ({
    label: c.name,
    href: `/categories/${c.slug}`,
  }));

  return (
    <footer className="bg-card border-t">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <Link href="/" className="text-2xl font-bold text-primary">
              FSOW
            </Link>
            <p className="mt-3 text-sm text-muted-foreground max-w-xs">
              Handcrafted furniture designed for modern living. Quality materials,
              timeless design, built to last.
            </p>
            <div className="flex items-center gap-3 mt-4">
              <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Facebook className="h-5 w-5" />
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Instagram className="h-5 w-5" />
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Twitter className="h-5 w-5" />
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Youtube className="h-5 w-5" />
              </Link>
            </div>
          </div>

          {/* Shop */}
          <div>
            <h3 className="font-semibold mb-4">Shop</h3>
            <ul className="space-y-2">
              {shopLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-semibold mb-4">Support</h3>
            <ul className="space-y-2">
              {supportLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="font-semibold mb-4">Company</h3>
            <ul className="space-y-2">
              {companyLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <Separator className="my-8" />

        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <p>&copy; 2026 FSOW. All rights reserved by <a href="https://infinititechpartners.com" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors underline">Infinititech Partners</a></p>
          <div className="flex items-center gap-4">
            <Link href="/privacy" className="hover:text-primary transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-primary transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
