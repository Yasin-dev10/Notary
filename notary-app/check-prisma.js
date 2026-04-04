const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Model Tenant fields:');
  // This is a bit internal, but we can check the dmmf or just try a query
  try {
    const tenant = await prisma.tenant.findFirst();
    console.log('Tenant found:', tenant ? Object.keys(tenant) : 'No tenant found');
  } catch (e) {
    console.error('Error fetching tenant:', e.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
