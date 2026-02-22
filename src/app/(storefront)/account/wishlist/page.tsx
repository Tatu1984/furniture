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

export default function AccountWishlistPage() {
  const items = useWishlistStore((s) => s.items);
  const removeItem = useWishlistStore((s) => s.removeItem);
  const addToCart = useCartStore((s) => s.addItem);

  function handleMoveToCart(item: (typeof items)[0]) {
    addToCart({
      productId: item.productId,
      name: item.name,
      slug: item.slug,
      image: item.image,
      price: item.price,
      variant: {},
    });
    removeItem(item.productId);
    toast.success(`${item.name} moved to cart`);
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">My Wishlist</h2>
        <p className="text-muted-foreground mt-1">
          {items.length > 0
            ? `You have ${items.length} ${items.length === 1 ? "item" : "items"} saved.`
            : "Items you love will appear here."}
        </p>
      </div>

      {items.length === 0 ? (
        <EmptyState
          icon={Heart}
          title="Your wishlist is empty"
          description="Browse our collection and save the pieces you love."
          actionLabel="Start Browsing"
          actionHref="/"
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {items.map((item) => (
              <motion.div
                key={item.productId}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2 }}
                className="group relative flex flex-col overflow-hidden rounded-xl border bg-card shadow-sm"
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
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                </Link>

                {/* Info */}
                <div className="flex flex-1 flex-col gap-3 p-4">
                  <Link
                    href={`/products/${item.slug}`}
                    className="font-semibold text-foreground line-clamp-1 hover:text-primary transition-colors"
                  >
                    {item.name}
                  </Link>

                  <PriceDisplay price={item.price} />

                  <div className="flex gap-2 mt-auto pt-2">
                    <Button
                      size="sm"
                      className="flex-1"
                      onClick={() => handleMoveToCart(item)}
                    >
                      <ShoppingCart className="mr-1.5 h-4 w-4" />
                      Move to Cart
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        removeItem(item.productId);
                        toast.success(`${item.name} removed from wishlist`);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Remove</span>
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
