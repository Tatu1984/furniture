import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { hash } from "bcryptjs";

async function main() {
  const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL!,
  });
  const prisma = new PrismaClient({ adapter });

  const password = await hash("admin@123", 12);

  const admin = await prisma.user.upsert({
    where: { email: "admin@fsow.in" },
    update: {},
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

  await (prisma as unknown as { $disconnect: () => Promise<void> }).$disconnect();
}

main().catch((e) => {
  console.error("Seed failed:", e);
  process.exit(1);
});
