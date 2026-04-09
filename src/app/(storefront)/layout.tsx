import { Header } from "@/components/storefront/header";
import { Footer } from "@/components/storefront/footer";
import { CartSheet } from "@/components/storefront/cart-sheet";
import { AuthHydrator } from "@/components/providers/auth-hydrator";
import prisma from "@/lib/db";

export default async function StorefrontLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const dbCategories = await prisma.category.findMany({
    where: { isActive: true, parentId: null },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    take: 8,
    select: { id: true, name: true, slug: true },
  });

  const navCategories = dbCategories.map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
  }));

  return (
    <AuthHydrator>
      <div className="flex min-h-screen flex-col">
        <Header categories={navCategories} />
        <main className="flex-1">{children}</main>
        <Footer categories={navCategories} />
        <CartSheet />
      </div>
    </AuthHydrator>
  );
}
