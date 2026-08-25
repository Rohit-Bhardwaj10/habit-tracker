import dotenv from "dotenv";
dotenv.config({ override: true });

import { defineConfig, env } from "prisma/config";

/**
 * Prisma 7 configuration.
 * The `datasource.url` here is used by the Prisma CLI for migrations.
 * For Neon, use the direct (non-pooled) URL for migrations so Prisma
 * can open a proper migration session.
 *
 * The application runtime uses the pooled URL via the PrismaPg adapter
 * in src/config/db.ts.
 */
export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // Use DIRECT_URL for migrations (non-pooled Neon connection)
    url: env("DIRECT_URL"),
  },
});
