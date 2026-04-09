import { Header } from "@/components/storefront/header";
import { Footer } from "@/components/storefront/footer";
import { CartSheet } from "@/components/storefront/cart-sheet";
import { AuthHydrator } from "@/components/providers/auth-hydrator";
import prisma from "@/lib/db";

// Always re-render the layout so newly published menus / categories show
// without needing a manual cache bust.
export const revalidate = 0;

type NavLink = { id: string; label: string; href: string };

async function loadNavLinks(
  location: "HEADER" | "FOOTER",
  fallbackLimit: number,
): Promise<NavLink[]> {
  // Prefer an admin-curated menu for this location
  const menu = await prisma.menu.findFirst({
    where: { location },
    orderBy: { updatedAt: "desc" },
    include: {
      items: {
        where: { parentId: null, isActive: true },
        orderBy: { sortOrder: "asc" },
      },
    },
  });

  if (menu && menu.items.length > 0) {
    return menu.items.map((item) => ({
      id: item.id,
      label: item.title,
      href: item.url ?? "#",
    }));
  }

  // Fallback: top categories
  const dbCategories = await prisma.category.findMany({
    where: { isActive: true, parentId: null },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    take: fallbackLimit,
    select: { id: true, name: true, slug: true },
  });
  return dbCategories.map((c) => ({
    id: c.id,
    label: c.name,
    href: `/categories/${c.slug}`,
  }));
}

export default async function StorefrontLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [headerLinks, footerLinks] = await Promise.all([
    loadNavLinks("HEADER", 6),
    loadNavLinks("FOOTER", 6),
  ]);

  return (
    <AuthHydrator>
      <div className="flex min-h-screen flex-col">
        <Header navLinks={headerLinks} />
        <main className="flex-1">{children}</main>
        <Footer shopLinks={footerLinks} />
        <CartSheet />
      </div>
    </AuthHydrator>
  );
}
