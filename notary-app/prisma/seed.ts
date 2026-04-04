/**
 * Database seed script — creates sample data for development.
 * Run with: npm run db:seed
 */

import "dotenv/config";
import { prisma } from "../lib/prisma";
import bcrypt from "bcryptjs";

async function main() {
    console.log("🌱 Seeding database...");

    // Clean existing data
    await prisma.activityLog.deleteMany();
    await prisma.documentAudit.deleteMany();
    await prisma.transaction.deleteMany();
    await prisma.document.deleteMany();
    await prisma.appointment.deleteMany();
    await prisma.client.deleteMany();
    await prisma.invite.deleteMany();
    await prisma.user.deleteMany();
    await prisma.tenant.deleteMany();

    // Create tenant 1
    const tenant1 = await prisma.tenant.create({
        data: {
            name: "Yasin Notary Services",
            slug: "yasin-notary",
            email: "superadmin@gmail.com",
            phone: "+252 612 555 100",
            themeColor: "#6366f1",
            subscriptionPlan: "PROFESSIONAL",
        },
    });

    // Create tenant 2 (to demo tenant isolation)
    const tenant2 = await prisma.tenant.create({
        data: {
            name: "Smith Legal Notary",
            slug: "smith-legal",
            email: "contact@smithlegal.com",
            themeColor: "#10b981",
            subscriptionPlan: "STARTER",
        },
    });

    const password = await bcrypt.hash("password123", 12);

    // Tenant 1 users
    const admin1 = await prisma.user.create({
        data: {
            email: "superadmin@gmail.com",
            password,
            firstName: "Yasin",
            lastName: "Dev",
            role: "SUPER_ADMIN",
            tenantId: tenant1.id,
        },
    });

    const notary1 = await prisma.user.create({
        data: {
            email: "notary@yasinnotary.com",
            password,
            firstName: "Notary",
            lastName: "Dev",
            role: "NOTARY",
            tenantId: tenant1.id,
        },
    });

    // Tenant 2 admin
    await prisma.user.create({
        data: {
            email: "admin@smithlegal.com",
            password,
            firstName: "Robert",
            lastName: "Smith",
            role: "TENANT_ADMIN",
            tenantId: tenant2.id,
        },
    });

    // Create clients for tenant 1
    const clients = await Promise.all([
        prisma.client.create({
            data: {
                firstName: "Emily",
                lastName: "Johnson",
                email: "emily.johnson@email.com",
                phone: "+1 (555) 231-4400",
                address: "123 Oak Street",
                city: "New York",
                state: "NY",
                zipCode: "10001",
                idType: "Driver's License",
                idNumber: "NY-DL-123456",
                tenantId: tenant1.id,
            },
        }),
        prisma.client.create({
            data: {
                firstName: "James",
                lastName: "Martinez",
                email: "james.martinez@email.com",
                phone: "+1 (555) 422-8800",
                address: "456 Elm Ave",
                city: "Brooklyn",
                state: "NY",
                zipCode: "11201",
                idType: "Passport",
                idNumber: "US-PP-987654",
                tenantId: tenant1.id,
            },
        }),
        prisma.client.create({
            data: {
                firstName: "Sarah",
                lastName: "Thompson",
                email: "sarah.t@email.com",
                phone: "+1 (555) 634-7700",
                city: "Manhattan",
                state: "NY",
                tenantId: tenant1.id,
            },
        }),
        prisma.client.create({
            data: {
                firstName: "David",
                lastName: "Wilson",
                email: "david.w@email.com",
                phone: "+1 (555) 812-3300",
                city: "Queens",
                state: "NY",
                tenantId: tenant1.id,
            },
        }),
    ]);

    // Appointments for tenant 1
    const now = new Date();
    const apt1 = await prisma.appointment.create({
        data: {
            title: "Deed Notarization",
            description: "Notarize property deed transfer documents",
            startTime: new Date(now.getTime() + 86400000), // tomorrow
            endTime: new Date(now.getTime() + 86400000 + 3600000),
            location: "Office - Room 3",
            status: "CONFIRMED",
            clientId: clients[0].id,
            notaryId: notary1.id,
            tenantId: tenant1.id,
        },
    });

    const apt2 = await prisma.appointment.create({
        data: {
            title: "Power of Attorney",
            description: "Execute POA documents for estate planning",
            startTime: new Date(now.getTime() + 2 * 86400000),
            endTime: new Date(now.getTime() + 2 * 86400000 + 7200000),
            location: "Via Zoom",
            status: "PENDING",
            clientId: clients[1].id,
            tenantId: tenant1.id,
        },
    });

    const apt3 = await prisma.appointment.create({
        data: {
            title: "Affidavit Signing",
            startTime: new Date(now.getTime() - 86400000), // yesterday (completed)
            endTime: new Date(now.getTime() - 86400000 + 3600000),
            status: "COMPLETED",
            clientId: clients[2].id,
            notaryId: notary1.id,
            tenantId: tenant1.id,
        },
    });

    // Documents
    await Promise.all([
        prisma.document.create({
            data: {
                name: "Property Deed - Johnson.pdf",
                description: "Warranty deed for 123 Oak Street",
                fileUrl: "#",
                fileSize: 245678,
                mimeType: "application/pdf",
                status: "PENDING_NOTARIZATION",
                clientId: clients[0].id,
                appointmentId: apt1.id,
                uploadedById: admin1.id,
                tenantId: tenant1.id,
            },
        }),
        prisma.document.create({
            data: {
                name: "Power_of_Attorney_Martinez.pdf",
                fileUrl: "#",
                fileSize: 128000,
                mimeType: "application/pdf",
                status: "DRAFT",
                clientId: clients[1].id,
                appointmentId: apt2.id,
                uploadedById: admin1.id,
                tenantId: tenant1.id,
            },
        }),
        prisma.document.create({
            data: {
                name: "Affidavit_Thompson_Notarized.pdf",
                fileUrl: "#",
                fileSize: 98500,
                mimeType: "application/pdf",
                status: "NOTARIZED",
                notarizationDate: new Date(now.getTime() - 86400000),
                clientId: clients[2].id,
                appointmentId: apt3.id,
                uploadedById: notary1.id,
                tenantId: tenant1.id,
            },
        }),
    ]);

    // Transactions
    await Promise.all([
        prisma.transaction.create({
            data: {
                description: "Affidavit Notarization Fee",
                amount: 75.00,
                paymentStatus: "PAID",
                paymentMethod: "Cash",
                clientId: clients[2].id,
                appointmentId: apt3.id,
                processedById: admin1.id,
                tenantId: tenant1.id,
            },
        }),
        prisma.transaction.create({
            data: {
                description: "Deed Notarization Service",
                amount: 150.00,
                paymentStatus: "UNPAID",
                paymentMethod: "Credit Card",
                clientId: clients[0].id,
                appointmentId: apt1.id,
                tenantId: tenant1.id,
            },
        }),
        prisma.transaction.create({
            data: {
                description: "POA Document Preparation + Notarization",
                amount: 200.00,
                paymentStatus: "PARTIALLY_PAID",
                paymentMethod: "Bank Transfer",
                clientId: clients[1].id,
                appointmentId: apt2.id,
                tenantId: tenant1.id,
            },
        }),
        prisma.transaction.create({
            data: {
                description: "Notarization Fee - Wilson",
                amount: 85.00,
                paymentStatus: "PAID",
                paymentMethod: "Zelle",
                clientId: clients[3].id,
                processedById: notary1.id,
                tenantId: tenant1.id,
            },
        }),
    ]);

    console.log("✅ Seed complete!\n");
    console.log("📧 Login credentials:");
    console.log("  Tenant 1 Admin:  superadmin@gmail.com  / password123");
    console.log("  Tenant 1 Notary: notary@yasinnotary.com / password123");
    console.log("  Tenant 2 Admin:  admin@smithlegal.com  / password123\n");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
