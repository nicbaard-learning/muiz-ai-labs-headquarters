import { PrismaClient } from "@prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient(): PrismaClient {
  const url = process.env.DATABASE_URL;

  // If DATABASE_URL is a Turso/libSQL URL, use the adapter
  if (url?.startsWith("libsql://")) {
    const adapter = new PrismaLibSql({
      url,
      authToken: process.env.TURSO_AUTH_TOKEN,
    });
    return new PrismaClient({ adapter });
  }

  // Otherwise use the default SQLite client (local development)
  return new PrismaClient();
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

// ─── Runtime migration: ensure Todo table has subtasks column ──────────────
// Prisma CLI's db push doesn't support libsql:// URLs, and Turso databases
// won't have the column from deploy-time migrations. We apply it at startup.
runSubtasksMigration().catch(console.error);

async function runSubtasksMigration() {
  try {
    // Check if the subtasks column already exists
    const rows = await prisma.$queryRawUnsafe<{ cnt: number }[]>(
      `SELECT COUNT(*) as cnt FROM pragma_table_info('Todo') WHERE name='subtasks'`
    );
    if (rows[0]?.cnt === 0) {
      await prisma.$executeRawUnsafe(
        `ALTER TABLE "Todo" ADD COLUMN "subtasks" TEXT NOT NULL DEFAULT '[]'`
      );
      console.log("✅ Runtime migration: added subtasks column to Todo table");
    }
  } catch (e) {
    // Table might not exist yet, which is fine
    console.debug("Runtime migration (subtasks):", (e as Error)?.message || e);
  }
}
