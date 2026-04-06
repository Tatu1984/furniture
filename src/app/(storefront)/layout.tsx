import { Header } from "@/components/storefront/header";
import { Footer } from "@/components/storefront/footer";
import { CartSheet } from "@/components/storefront/cart-sheet";
import { AuthHydrator } from "@/components/providers/auth-hydrator";

export default function StorefrontLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthHydrator>
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        <CartSheet />
      </div>
    </AuthHydrator>
  );
}
