const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        console.log("Testing DocumentTemplate findMany...");
        const templates = await prisma.documentTemplate.findMany();
        console.log("Success! Templates:", templates.length);
    } catch (error) {
        console.error("Prisma Error:", error.message);
    } finally {
        await prisma.$disconnect();
    }
}

main();
