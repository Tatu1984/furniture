"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type CartItemVariant = {
  color?: string;
  size?: string;
  material?: string;
};

export type CartItem = {
  productId: string;
  name: string;
  slug: string;
  image: string;
  price: number;
  variant: CartItemVariant;
  quantity: number;
};

type CartState = {
  items: CartItem[];
  isOpen: boolean;
};

type CartActions = {
  addItem: (item: Omit<CartItem, "quantity"> & { quantity?: number }) => void;
  removeItem: (productId: string, variant?: CartItemVariant) => void;
  updateQuantity: (
    productId: string,
    quantity: number,
    variant?: CartItemVariant,
  ) => void;
  clearCart: () => void;
  toggleCart: () => void;
};

type CartDerived = {
  totalItems: () => number;
  subtotal: () => number;
};

export type CartStore = CartState & CartActions & CartDerived;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Two cart items match when they share the same productId AND variant. */
function itemsMatch(
  a: { productId: string; variant?: CartItemVariant },
  b: { productId: string; variant?: CartItemVariant },
): boolean {
  if (a.productId !== b.productId) return false;

  const av = a.variant ?? {};
  const bv = b.variant ?? {};

  return (
    (av.color ?? "") === (bv.color ?? "") &&
    (av.size ?? "") === (bv.size ?? "") &&
    (av.material ?? "") === (bv.material ?? "")
  );
}

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      // -- state ---------------------------------------------------------------
      items: [],
      isOpen: false,

      // -- actions -------------------------------------------------------------
      addItem: (incoming) => {
        const quantity = incoming.quantity ?? 1;

        set((state) => {
          const existingIndex = state.items.findIndex((item) =>
            itemsMatch(item, incoming),
          );

          if (existingIndex !== -1) {
            const updated = [...state.items];
            updated[existingIndex] = {
              ...updated[existingIndex],
              quantity: updated[existingIndex].quantity + quantity,
            };
            return { items: updated };
          }

          return {
            items: [...state.items, { ...incoming, quantity }],
          };
        });
      },

      removeItem: (productId, variant) => {
        set((state) => ({
          items: state.items.filter(
            (item) => !itemsMatch(item, { productId, variant }),
          ),
        }));
      },

      updateQuantity: (productId, quantity, variant) => {
        if (quantity <= 0) {
          get().removeItem(productId, variant);
          return;
        }

        set((state) => ({
          items: state.items.map((item) =>
            itemsMatch(item, { productId, variant })
              ? { ...item, quantity }
              : item,
          ),
        }));
      },

      clearCart: () => set({ items: [] }),

      toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),

      // -- derived -------------------------------------------------------------
      totalItems: () =>
        get().items.reduce((sum, item) => sum + item.quantity, 0),

      subtotal: () =>
        get().items.reduce(
          (sum, item) => sum + item.price * item.quantity,
          0,
        ),
    }),
    {
      name: "fsow-cart",
      // Only persist items, not the sheet open/close state.
      partialize: (state) => ({ items: state.items }),
    },
  ),
);
