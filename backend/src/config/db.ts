import "dotenv/config";
import { PrismaClient } from "../generated/prisma/client.js";
import { PrismaPg } from "@prisma/adapter-pg";

/**
 * Prisma 7 client singleton.
 *
 * Prisma 7 requires an explicit driver adapter — the Rust-based query engine
 * is gone. For PostgreSQL (including Neon) we use `@prisma/adapter-pg` which
 * wraps the `pg` (node-postgres) driver.
 *
 * SSL note: Neon requires SSL. The `pg` driver respects the `sslmode` param
 * in the connection string, so no extra ssl config is needed here as long as
 * the DATABASE_URL contains `sslmode=require`.
 *
 * The globalThis guard prevents multiple client instances in development hot-
 * reload scenarios (tsx watch re-imports modules on change).
 */

declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
}

import pg from "pg";
const { Pool } = pg;

function createPrismaClient(): PrismaClient {
  const connectionString = process.env["DATABASE_URL"];
  if (!connectionString) {
    throw new Error("DATABASE_URL environment variable is not set");
  }

  // Limit pool size to avoid hitting Neon free tier limits during tests
  const pool = new Pool({ connectionString, max: 5 });
  const adapter = new PrismaPg(pool as any); // Type cast to avoid any @types/pg mismatch
  return new PrismaClient({ adapter });
}

export const prisma: PrismaClient =
  globalThis.__prisma ?? createPrismaClient();

if (process.env["NODE_ENV"] !== "production") {
  globalThis.__prisma = prisma;
}
