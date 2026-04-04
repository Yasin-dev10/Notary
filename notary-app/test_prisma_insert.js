const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        console.log("Testing DocumentTemplate create...");
        const res = await prisma.documentTemplate.create({
            data: {
                id: "test-system-1",
                name: "Test",
                category: "general",
                content: "Testing {{date}}",
                fields: [{ name: "date", label: "Date", type: "date", required: true }],
                isDefault: true,
                tenantId: null,
            }
        });
        console.log("Success! Created:", res.id);
    } catch (error) {
        console.error("Prisma Error:", error.message);
    } finally {
        await prisma.$disconnect();
    }
}

main();
