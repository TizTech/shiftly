import { PrismaClient } from "@prisma/client";
import { configureNetlifyDatabaseUrl, ensureNetlifyDatabaseReady, persistNetlifyDatabase } from "@/lib/netlify-persistence";

configureNetlifyDatabaseUrl();

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };

const baseClient =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = baseClient;
}

const writeActions = new Set([
  "create",
  "createMany",
  "update",
  "updateMany",
  "upsert",
  "delete",
  "deleteMany",
  "executeRaw",
  "queryRaw",
]);

export const db = baseClient.$extends({
  query: {
    async $allOperations({ operation, args, query }) {
      await ensureNetlifyDatabaseReady();
      const result = await query(args);

      if (writeActions.has(operation)) {
        await persistNetlifyDatabase();
      }

      return result;
    },
  },
});
