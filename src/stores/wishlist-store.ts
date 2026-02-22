"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type WishlistItem = {
  productId: string;
  name: string;
  slug: string;
  image: string;
  price: number;
  addedAt: string; // ISO 8601
};

type WishlistState = {
  items: WishlistItem[];
};

type WishlistActions = {
  addItem: (item: Omit<WishlistItem, "addedAt">) => void;
  removeItem: (productId: string) => void;
  toggleItem: (item: Omit<WishlistItem, "addedAt">) => void;
  isInWishlist: (productId: string) => boolean;
  clearWishlist: () => void;
};

export type WishlistStore = WishlistState & WishlistActions;

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

export const useWishlistStore = create<WishlistStore>()(
  persist(
    (set, get) => ({
      // -- state ---------------------------------------------------------------
      items: [],

      // -- actions -------------------------------------------------------------
      addItem: (item) => {
        const exists = get().items.some(
          (i) => i.productId === item.productId,
        );
        if (exists) return;

        set((state) => ({
          items: [
            ...state.items,
            { ...item, addedAt: new Date().toISOString() },
          ],
        }));
      },

      removeItem: (productId) => {
        set((state) => ({
          items: state.items.filter((i) => i.productId !== productId),
        }));
      },

      toggleItem: (item) => {
        const exists = get().items.some(
          (i) => i.productId === item.productId,
        );
        if (exists) {
          get().removeItem(item.productId);
        } else {
          get().addItem(item);
        }
      },

      isInWishlist: (productId) =>
        get().items.some((i) => i.productId === productId),

      clearWishlist: () => set({ items: [] }),
    }),
    {
      name: "fsow-wishlist",
    },
  ),
);
