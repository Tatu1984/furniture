"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Calendar, Clock, User } from "lucide-react";
import { motion } from "motion/react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { SectionHeading } from "@/components/shared/section-heading";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

// ---------------------------------------------------------------------------
// Mock data
// ---------------------------------------------------------------------------

const categories = [
  "All",
  "Interior Design",
  "Buying Guide",
  "Trends",
  "Tips",
];

const blogPosts = [
  {
    id: "bp-1",
    slug: "how-to-choose-sofa",
    title: "How to Choose the Perfect Sofa for Your Living Room",
    excerpt:
      "Finding the right sofa is about more than just style. Learn how to balance comfort, durability, and design to find your perfect match.",
    image: "https://picsum.photos/seed/blog-sofa/800/450",
    category: "Buying Guide",
    date: "Jan 15, 2024",
    readTime: 8,
    author: {
      name: "Emily Chen",
      avatar: "https://picsum.photos/seed/avatar-emily/100/100",
    },
    isFeatured: true,
  },
  {
    id: "bp-2",
    slug: "bedroom-design-trends",
    title: "2024 Bedroom Design Trends You Need to Know",
    excerpt:
      "From earthy tones to minimalist frames, discover the top bedroom trends shaping the year ahead.",
    image: "https://picsum.photos/seed/blog-bedroom/800/450",
    category: "Trends",
    date: "Feb 2, 2024",
    readTime: 6,
    author: {
      name: "Marcus Rivera",
      avatar: "https://picsum.photos/seed/avatar-marcus/100/100",
    },
    isFeatured: false,
  },
  {
    id: "bp-3",
    slug: "dining-room-styling",
    title: "Styling Your Dining Room for Every Occasion",
    excerpt:
      "Transform your dining space from everyday meals to elegant dinner parties with these practical styling tips.",
    image: "https://picsum.photos/seed/blog-dining/800/450",
    category: "Interior Design",
    date: "Feb 18, 2024",
    readTime: 5,
    author: {
      name: "Sophia Park",
      avatar: "https://picsum.photos/seed/avatar-sophia/100/100",
    },
    isFeatured: false,
  },
  {
    id: "bp-4",
    slug: "home-office-setup",
    title: "The Ultimate Home Office Setup Guide",
    excerpt:
      "Create a productive and ergonomic workspace at home with our comprehensive guide to furniture selection and layout.",
    image: "https://picsum.photos/seed/blog-office/800/450",
    category: "Tips",
    date: "Mar 5, 2024",
    readTime: 10,
    author: {
      name: "James Wright",
      avatar: "https://picsum.photos/seed/avatar-james/100/100",
    },
    isFeatured: false,
  },
  {
    id: "bp-5",
    slug: "outdoor-living-guide",
    title: "Creating Your Perfect Outdoor Living Space",
    excerpt:
      "Turn your patio or deck into an extension of your home with weather-resistant furniture and clever design solutions.",
    image: "https://picsum.photos/seed/blog-outdoor/800/450",
    category: "Interior Design",
    date: "Mar 20, 2024",
    readTime: 7,
    author: {
      name: "Emily Chen",
      avatar: "https://picsum.photos/seed/avatar-emily/100/100",
    },
    isFeatured: false,
  },
  {
    id: "bp-6",
    slug: "sustainable-furniture",
    title: "Why Sustainable Furniture Matters More Than Ever",
    excerpt:
      "Explore how eco-friendly materials and ethical manufacturing are reshaping the furniture industry for the better.",
    image: "https://picsum.photos/seed/blog-sustainable/800/450",
    category: "Trends",
    date: "Apr 1, 2024",
    readTime: 6,
    author: {
      name: "Marcus Rivera",
      avatar: "https://picsum.photos/seed/avatar-marcus/100/100",
    },
    isFeatured: false,
  },
  {
    id: "bp-7",
    slug: "small-space-solutions",
    title: "Big Ideas for Small Spaces: Furniture That Fits",
    excerpt:
      "Maximize every square foot with multi-functional furniture and smart storage solutions for compact living.",
    image: "https://picsum.photos/seed/blog-smallspace/800/450",
    category: "Tips",
    date: "Apr 15, 2024",
    readTime: 5,
    author: {
      name: "Sophia Park",
      avatar: "https://picsum.photos/seed/avatar-sophia/100/100",
    },
    isFeatured: false,
  },
  {
    id: "bp-8",
    slug: "color-theory-interiors",
    title: "Color Theory for Interior Design: A Beginner's Guide",
    excerpt:
      "Understanding color relationships can transform your space. Learn the basics of color theory applied to home decor.",
    image: "https://picsum.photos/seed/blog-color/800/450",
    category: "Interior Design",
    date: "May 2, 2024",
    readTime: 9,
    author: {
      name: "James Wright",
      avatar: "https://picsum.photos/seed/avatar-james/100/100",
    },
    isFeatured: false,
  },
  {
    id: "bp-9",
    slug: "furniture-care-guide",
    title: "The Complete Guide to Furniture Care and Maintenance",
    excerpt:
      "Keep your investment looking beautiful for years with these expert tips on cleaning, protecting, and maintaining your furniture.",
    image: "https://picsum.photos/seed/blog-care/800/450",
    category: "Buying Guide",
    date: "May 18, 2024",
    readTime: 8,
    author: {
      name: "Emily Chen",
      avatar: "https://picsum.photos/seed/avatar-emily/100/100",
    },
    isFeatured: false,
  },
  {
    id: "bp-10",
    slug: "mixing-vintage-modern",
    title: "How to Mix Vintage and Modern Furniture Like a Pro",
    excerpt:
      "Blending old and new creates a unique, layered look. Here are the rules (and when to break them) for mixing styles.",
    image: "https://picsum.photos/seed/blog-vintage/800/450",
    category: "Tips",
    date: "Jun 3, 2024",
    readTime: 7,
    author: {
      name: "Marcus Rivera",
      avatar: "https://picsum.photos/seed/avatar-marcus/100/100",
    },
    isFeatured: false,
  },
];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function BlogListingPage() {
  const [activeCategory, setActiveCategory] = useState("All");

  const featuredPost = blogPosts.find((p) => p.isFeatured);
  const filteredPosts = blogPosts.filter((post) => {
    if (activeCategory === "All") return !post.isFeatured;
    return post.category === activeCategory && !post.isFeatured;
  });

  return (
    <div className="container mx-auto px-4 py-12">
      <SectionHeading
        title="Design Journal"
        subtitle="Inspiration, guides, and tips for creating your perfect space."
      />

      {/* Featured post */}
      {featuredPost && activeCategory === "All" && (
        <Link href={`/blog/${featuredPost.slug}`} className="group block mb-12">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="relative overflow-hidden rounded-2xl border bg-card shadow-sm"
          >
            <div className="grid grid-cols-1 md:grid-cols-2">
              <div className="relative aspect-[16/9] md:aspect-auto md:min-h-[360px] overflow-hidden">
                <Image
                  src={featuredPost.image}
                  alt={featuredPost.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <div className="flex flex-col justify-center p-6 md:p-10">
                <Badge variant="secondary" className="w-fit mb-3">
                  {featuredPost.category}
                </Badge>
                <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-3 group-hover:text-primary transition-colors">
                  {featuredPost.title}
                </h2>
                <p className="text-muted-foreground mb-6 line-clamp-3">
                  {featuredPost.excerpt}
                </p>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarImage
                        src={featuredPost.author.avatar}
                        alt={featuredPost.author.name}
                      />
                      <AvatarFallback>
                        {featuredPost.author.name[0]}
                      </AvatarFallback>
                    </Avatar>
                    <span>{featuredPost.author.name}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>{featuredPost.date}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" />
                    <span>{featuredPost.readTime} min read</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </Link>
      )}

      {/* Category tabs */}
      <div className="flex gap-2 mb-8 overflow-x-auto pb-2 -mx-4 px-4">
        {categories.map((cat) => (
          <Button
            key={cat}
            variant={activeCategory === cat ? "default" : "outline"}
            size="sm"
            className="shrink-0"
            onClick={() => setActiveCategory(cat)}
          >
            {cat}
          </Button>
        ))}
      </div>

      {/* Blog grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPosts.map((post, index) => (
          <motion.div
            key={post.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
          >
            <Link
              href={`/blog/${post.slug}`}
              className="group flex flex-col overflow-hidden rounded-xl border bg-card shadow-sm transition-shadow hover:shadow-lg h-full"
            >
              {/* Image */}
              <div className="relative aspect-[16/9] overflow-hidden">
                <Image
                  src={post.image}
                  alt={post.title}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <Badge className="absolute top-3 left-3 bg-background/80 text-foreground backdrop-blur-sm">
                  {post.category}
                </Badge>
              </div>

              {/* Content */}
              <div className="flex flex-1 flex-col p-5">
                <h3 className="font-semibold text-lg mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                  {post.title}
                </h3>
                <p className="text-muted-foreground text-sm line-clamp-2 mb-4">
                  {post.excerpt}
                </p>

                <div className="mt-auto flex items-center justify-between text-xs text-muted-foreground pt-3 border-t">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-5 w-5">
                      <AvatarImage
                        src={post.author.avatar}
                        alt={post.author.name}
                      />
                      <AvatarFallback>{post.author.name[0]}</AvatarFallback>
                    </Avatar>
                    <span>{post.author.name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span>{post.date}</span>
                    <span>{post.readTime} min</span>
                  </div>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Pagination */}
      <div className="mt-12">
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious href="#" />
            </PaginationItem>
            <PaginationItem>
              <PaginationLink href="#" isActive>
                1
              </PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationLink href="#">2</PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationLink href="#">3</PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationNext href="#" />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  );
}
