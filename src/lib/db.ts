import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const globalForPrisma = globalThis as unknown as {
  prisma: InstanceType<typeof PrismaClient> | undefined;
};

function getClient(): InstanceType<typeof PrismaClient> {
  if (!globalForPrisma.prisma) {
    const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
    const client = new PrismaClient({ adapter });
    if (process.env.NODE_ENV !== "production") {
      globalForPrisma.prisma = client;
    }
    return client;
  }
  return globalForPrisma.prisma;
}

// Lazy proxy — PrismaClient only initializes when actually used at runtime,
// not at module import time (which happens during Next.js build).
export const prisma = new Proxy({} as InstanceType<typeof PrismaClient>, {
  get(_target, prop) {
    return Reflect.get(getClient(), prop);
  },
});

export default prisma;
