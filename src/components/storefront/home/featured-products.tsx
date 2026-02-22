"use client";

import Image from "next/image";
import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "@/components/ui/carousel";
import { SectionHeading } from "@/components/shared/section-heading";
import { PriceDisplay } from "@/components/shared/price-display";
import { RatingStars } from "@/components/shared/rating-stars";
import { useCartStore } from "@/stores/cart-store";

const featuredProducts = [
  {
    id: "fp-1",
    slug: "oslo-sectional-sofa",
    name: "Oslo Sectional Sofa",
    price: 2499,
    rating: 4.8,
    reviewCount: 124,
    image: "https://picsum.photos/seed/oslo-sofa/600/600",
  },
  {
    id: "fp-2",
    slug: "walnut-dining-table",
    name: "Walnut Dining Table",
    price: 1899,
    rating: 4.9,
    reviewCount: 89,
    image: "https://picsum.photos/seed/walnut-table/600/600",
  },
  {
    id: "fp-3",
    slug: "linen-armchair",
    name: "Linen Lounge Armchair",
    price: 849,
    rating: 4.7,
    reviewCount: 67,
    image: "https://picsum.photos/seed/linen-armchair/600/600",
  },
  {
    id: "fp-4",
    slug: "oak-bookshelf",
    name: "Oak Standing Bookshelf",
    price: 1299,
    rating: 4.6,
    reviewCount: 43,
    image: "https://picsum.photos/seed/oak-bookshelf/600/600",
  },
  {
    id: "fp-5",
    slug: "marble-coffee-table",
    name: "Marble Coffee Table",
    price: 999,
    rating: 4.8,
    reviewCount: 156,
    image: "https://picsum.photos/seed/marble-coffee/600/600",
  },
  {
    id: "fp-6",
    slug: "velvet-bed-frame",
    name: "Velvet Upholstered Bed",
    price: 1799,
    rating: 4.5,
    reviewCount: 78,
    image: "https://picsum.photos/seed/velvet-bed/600/600",
  },
  {
    id: "fp-7",
    slug: "rattan-outdoor-set",
    name: "Rattan Outdoor Lounge Set",
    price: 2199,
    rating: 4.7,
    reviewCount: 34,
    image: "https://picsum.photos/seed/rattan-outdoor/600/600",
  },
  {
    id: "fp-8",
    slug: "teak-desk",
    name: "Teak Standing Desk",
    price: 1099,
    rating: 4.9,
    reviewCount: 201,
    image: "https://picsum.photos/seed/teak-desk/600/600",
  },
];

export function FeaturedProducts() {
  const addItem = useCartStore((s) => s.addItem);

  return (
    <section className="container mx-auto px-4 py-20">
      <SectionHeading
        title="Featured Collection"
        subtitle="Handpicked pieces that define modern living."
      />

      <div className="mx-auto max-w-[calc(100%-6rem)]">
        <Carousel
          opts={{
            align: "start",
            loop: true,
          }}
          className="w-full"
        >
          <CarouselContent className="-ml-4">
            {featuredProducts.map((product) => (
              <CarouselItem
                key={product.id}
                className="pl-4 basis-full sm:basis-1/2 lg:basis-1/3 xl:basis-1/4"
              >
                <div className="group rounded-xl border bg-card shadow-sm transition-shadow hover:shadow-md">
                  <Link
                    href={`/products/${product.slug}`}
                    className="relative block aspect-square overflow-hidden rounded-t-xl"
                  >
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </Link>

                  <div className="flex flex-col gap-2 p-4">
                    <Link
                      href={`/products/${product.slug}`}
                      className="line-clamp-1 font-semibold text-foreground transition-colors hover:text-primary"
                    >
                      {product.name}
                    </Link>

                    <RatingStars
                      rating={product.rating}
                      size="sm"
                      showValue
                      reviewCount={product.reviewCount}
                    />

                    <div className="mt-1 flex items-center justify-between">
                      <PriceDisplay price={product.price} />
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          addItem({
                            productId: product.id,
                            name: product.name,
                            slug: product.slug,
                            image: product.image,
                            price: product.price,
                            variant: {},
                          })
                        }
                      >
                        <ShoppingCart className="h-4 w-4" />
                        <span className="sr-only sm:not-sr-only sm:ml-1">
                          Add
                        </span>
                      </Button>
                    </div>
                  </div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
      </div>
    </section>
  );
}
