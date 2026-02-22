"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart, ShoppingCart, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";
import { PriceDisplay } from "@/components/shared/price-display";
import { useWishlistStore } from "@/stores/wishlist-store";
import { useCartStore } from "@/stores/cart-store";

export default function WishlistPage() {
  const items = useWishlistStore((s) => s.items);
  const removeItem = useWishlistStore((s) => s.removeItem);
  const addToCart = useCartStore((s) => s.addItem);

  function handleAddToCart(item: (typeof items)[0]) {
    addToCart({
      productId: item.productId,
      name: item.name,
      slug: item.slug,
      image: item.image,
      price: item.price,
      variant: {},
    });
    toast.success(`${item.name} added to cart`);
  }

  return (
    <div className="container mx-auto px-4 py-12">
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <Heart className="h-7 w-7 text-primary" />
        <h1 className="text-3xl font-bold tracking-tight">My Wishlist</h1>
      </div>
      <p className="text-muted-foreground mb-8">
        {items.length > 0
          ? `${items.length} ${items.length === 1 ? "item" : "items"} saved to your wishlist.`
          : "Save your favorite pieces to revisit later."}
      </p>

      {items.length === 0 ? (
        <EmptyState
          icon={Heart}
          title="Your wishlist is empty"
          description="Start browsing our collection and save the pieces that catch your eye."
          actionLabel="Start Browsing"
          actionHref="/"
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <AnimatePresence mode="popLayout">
            {items.map((item) => (
              <motion.div
                key={item.productId}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2 }}
                className="group relative flex flex-col overflow-hidden rounded-xl border bg-card shadow-sm transition-shadow hover:shadow-lg"
              >
                {/* Image */}
                <Link
                  href={`/products/${item.slug}`}
                  className="relative aspect-[4/3] overflow-hidden"
                >
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                </Link>

                {/* Remove button */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-3 right-3 z-10 size-8 rounded-full bg-background/80 backdrop-blur-sm hover:bg-background"
                  onClick={() => {
                    removeItem(item.productId);
                    toast.success(`${item.name} removed from wishlist`);
                  }}
                >
                  <Trash2 className="size-4 text-muted-foreground hover:text-destructive" />
                  <span className="sr-only">Remove from wishlist</span>
                </Button>

                {/* Info */}
                <div className="flex flex-1 flex-col gap-3 p-4">
                  <Link
                    href={`/products/${item.slug}`}
                    className="font-semibold text-foreground line-clamp-1 hover:text-primary transition-colors"
                  >
                    {item.name}
                  </Link>

                  <PriceDisplay price={item.price} />

                  <div className="mt-auto pt-2">
                    <Button
                      size="sm"
                      className="w-full"
                      onClick={() => handleAddToCart(item)}
                    >
                      <ShoppingCart className="mr-2 h-4 w-4" />
                      Add to Cart
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
