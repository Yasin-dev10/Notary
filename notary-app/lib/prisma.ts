import { PrismaClient } from "@prisma/client";
import { withAccelerate } from "@prisma/extension-accelerate";

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
import { PrismaPg } from "@prisma/adapter-pg";

const globalForPrisma = globalThis as unknown as {
    prisma: ReturnType<typeof makePrismaClient> | undefined;
};

function makePrismaClient() {
    // Revert to the correct Prisma v7 configuration
    return new PrismaClient({
        accelerateUrl: process.env.DATABASE_URL as string,
        log:
            process.env.NODE_ENV === "development"
                ? ["error", "warn"]
                : ["error"],
    }).$extends(withAccelerate());
}

const globalForPrismaUpdated = globalThis as unknown as {
    prisma_reloaded: ReturnType<typeof makePrismaClient> | undefined;
};

export const prisma = globalForPrismaUpdated.prisma_reloaded ?? makePrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrismaUpdated.prisma_reloaded = prisma;

export default prisma;
