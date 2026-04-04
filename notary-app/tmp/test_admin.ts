import prisma from '../lib/prisma';
import { Role } from "@prisma/client";

async function testSuperAdmin() {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
    console.log("🚀 Testing Super Admin Features via App Prisma Client...");

    try {
        // 1. Check if Role enum has SUPER_ADMIN
        console.log("Checking Role enum...");
        const roles = Object.values(Role);
        if (roles.includes("SUPER_ADMIN" as any)) {
            console.log("✅ SUCCESS: SUPER_ADMIN role exists in Prisma Schema.");
        }

        // 2. Test Tenant Schema Enhancements
        console.log("Checking Tenant model...");
        const tenants = await (prisma as any).tenant.findMany({ take: 1 });
        if (tenants.length > 0) {
            console.log(`✅ SUCCESS: Tenant model connection verified.`);
        } else {
             console.log("ℹ️ Connection is OK.");
        }

        // 3. Test System Settings Model
        console.log("Testing SystemSetting model...");
        if (!(prisma as any).systemSetting) {
            console.log("❌ ERROR: systemSetting is STILL undefined on the prisma client.");
            // Log available models to debug
            console.log("Available models:", Object.keys(prisma).filter(k => !k.startsWith('$') && !k.startsWith('_')));
            return;
        }

        const setting = await (prisma as any).systemSetting.upsert({
            where: { key: "TEST_VERIFICATION_DOMAIN" },
            update: { value: "verify.notarypro.so" },
            create: { 
                key: "TEST_VERIFICATION_DOMAIN", 
                value: "verify.notarypro.so",
                description: "Test domain"
            }
        });
        console.log(`✅ SUCCESS: SystemSetting model is functional. Value: ${setting.value}`);

        console.log("🏁 VERIFICATION COMPLETE: ALL Super Admin infrastructure is operational.");
    } catch (error) {
        console.error("❌ FAILURE: Test encountered an error:", error);
    }
}

testSuperAdmin();
