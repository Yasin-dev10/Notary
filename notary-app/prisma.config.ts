import "dotenv/config";
import path from "node:path";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
    schema: path.join("prisma", "schema.prisma"),

    migrations: {
        path: path.join("prisma", "migrations"),
    },

    // For Prisma Migrate (dev/deploy), we must use the DIRECT connection URL
    // (real postgresql:// from Supabase), NOT the Accelerate proxy URL.
    // The Accelerate URL (DATABASE_URL) is used at runtime in lib/prisma.ts.
    datasource: {
        url: env("DIRECT_DATABASE_URL"),
    },
});

