import { PrismaClient } from "@prisma/client";
import { withAccelerate } from "@prisma/extension-accelerate";

// Disable TLS reject for development if needed
if (process.env.NODE_ENV === "development") {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
}

// Ensure Prisma has a dummy accelerate URL at build time if env variable is missing
if (!process.env.DATABASE_URL) {
    process.env.DATABASE_URL = "prisma://accelerate.prisma-data.net/?api_key=dummy";
}

// Delay instantiation until first use to prevent build-time evaluation crashing in Next.js
const prismaClientSingleton = () => {
    return new PrismaClient({
        log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
        // @ts-ignore
        accelerateUrl: process.env.DATABASE_URL,
    }).$extends(withAccelerate());
};

type PrismaClientWithExtensions = ReturnType<typeof prismaClientSingleton>;

const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClientWithExtensions | undefined;
};

export const prisma = globalForPrisma.prisma ?? prismaClientSingleton();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export default prisma;
