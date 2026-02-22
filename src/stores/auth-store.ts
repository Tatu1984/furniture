"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type MockUser = {
  id: string;
  name: string;
  email: string;
  avatar: string;
};

type AuthState = {
  user: MockUser | null;
  isAuthenticated: boolean;
};

type AuthActions = {
  login: (email: string) => void;
  logout: () => void;
  updateProfile: (updates: Partial<Pick<MockUser, "name" | "avatar">>) => void;
};

export type AuthStore = AuthState & AuthActions;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Generate a deterministic mock user from an email address.
 * This keeps the demo self-contained without a real auth backend.
 */
function createMockUser(email: string): MockUser {
  const name = email
    .split("@")[0]
    .replace(/[._-]/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());

  return {
    id: `user_${btoa(email).replace(/[^a-zA-Z0-9]/g, "").slice(0, 12)}`,
    name,
    email,
    avatar: `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(name)}`,
  };
}

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      // -- state ---------------------------------------------------------------
      user: null,
      isAuthenticated: false,

      // -- actions -------------------------------------------------------------
      login: (email) => {
        const user = createMockUser(email);
        set({ user, isAuthenticated: true });
      },

      logout: () => {
        set({ user: null, isAuthenticated: false });
      },

      updateProfile: (updates) => {
        const current = get().user;
        if (!current) return;

        set({
          user: { ...current, ...updates },
        });
      },
    }),
    {
      name: "fsow-auth",
    },
  ),
);
