import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { hash } from "bcryptjs";
import { categories as mockCategories } from "../src/lib/mock-data/categories";

async function main() {
  const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL!,
  });
  const prisma = new PrismaClient({ adapter });

  const password = await hash("admin@123", 12);

  const admin = await prisma.user.upsert({
    where: { email: "admin@fsow.in" },
    update: {
      password,
      role: "ADMIN",
      status: "ACTIVE",
      isActive: true,
      emailVerified: true,
    },
    create: {
      email: "admin@fsow.in",
      password,
      firstName: "Super",
      lastName: "Admin",
      role: "ADMIN",
      status: "ACTIVE",
      isActive: true,
      emailVerified: true,
    },
  });

  console.log(`Super admin created: ${admin.email} (${admin.id})`);

  // ── Categories (root + subcategories) ─────────────────────────────────
  let catCount = 0;
  for (let i = 0; i < mockCategories.length; i++) {
    const cat = mockCategories[i];
    const root = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {
        name: cat.name,
        description: cat.description,
        image: cat.image,
        icon: cat.icon,
        level: 0,
        sortOrder: i,
        isActive: true,
      },
      create: {
        name: cat.name,
        slug: cat.slug,
        description: cat.description,
        image: cat.image,
        icon: cat.icon,
        level: 0,
        sortOrder: i,
        isActive: true,
      },
    });
    catCount++;

    for (let j = 0; j < cat.subcategories.length; j++) {
      const sub = cat.subcategories[j];
      await prisma.category.upsert({
        where: { slug: sub.slug },
        update: {
          name: sub.name,
          description: sub.description,
          image: sub.image,
          parentId: root.id,
          level: 1,
          sortOrder: j,
          isActive: true,
        },
        create: {
          name: sub.name,
          slug: sub.slug,
          description: sub.description,
          image: sub.image,
          parentId: root.id,
          level: 1,
          sortOrder: j,
          isActive: true,
        },
      });
      catCount++;
    }
  }
  console.log(`Categories upserted: ${catCount}`);

  // ── Main Navigation menu (HEADER) ─────────────────────────────────────
  const mainMenu = await prisma.menu.upsert({
    where: { slug: "main-navigation" },
    update: { name: "Main Navigation", location: "HEADER" },
    create: {
      name: "Main Navigation",
      slug: "main-navigation",
      location: "HEADER",
    },
  });

  // Replace items each run so the menu stays in sync with current categories
  await prisma.menuItem.deleteMany({ where: { menuId: mainMenu.id } });

  const rootCategories = await prisma.category.findMany({
    where: { parentId: null, isActive: true },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    take: 6,
  });

  for (let i = 0; i < rootCategories.length; i++) {
    const c = rootCategories[i];
    await prisma.menuItem.create({
      data: {
        menuId: mainMenu.id,
        title: c.name,
        url: `/categories/${c.slug}`,
        type: "CATEGORY",
        targetId: c.id,
        sortOrder: i,
        isActive: true,
      },
    });
  }

  // Static "Projects" link at the end
  await prisma.menuItem.create({
    data: {
      menuId: mainMenu.id,
      title: "Projects",
      url: "/projects",
      type: "CUSTOM",
      sortOrder: rootCategories.length,
      isActive: true,
    },
  });

  console.log(
    `Main Navigation menu seeded with ${rootCategories.length + 1} items`,
  );

  await (prisma as unknown as { $disconnect: () => Promise<void> }).$disconnect();
}

main().catch((e) => {
  console.error("Seed failed:", e);
  process.exit(1);
});
