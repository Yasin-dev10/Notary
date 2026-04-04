import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const tenantSchema = z.object({
    name: z.string().min(1, "Name is required"),
    slug: z.string().min(1, "Slug is required"),
    email: z.string().email("Invalid organization email").optional().or(z.literal("")),
    subscriptionPlan: z.enum(["FREE", "STARTER", "PROFESSIONAL", "ENTERPRISE"]).default("FREE"),
    admin: z.object({
        firstName: z.string().min(1, "Admin first name is required"),
        lastName: z.string().min(1, "Admin last name is required"),
        email: z.string().email("Invalid admin email"),
        password: z.string().min(8, "Password must be at least 8 characters"),
    }).nullable().optional()
});

// GET /api/admin/tenants
export async function GET(request: Request) {
    const headersList = await headers();
    const userRole = headersList.get("x-user-role");

    if (userRole !== Role.SUPER_ADMIN) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const skip = (page - 1) * limit;

    const where = {
        deletedAt: null,
        ...(search && {
            OR: [
                { name: { contains: search, mode: "insensitive" as const } },
                { slug: { contains: search, mode: "insensitive" as const } },
                { email: { contains: search, mode: "insensitive" as const } },
            ],
        }),
    };

    const [tenants, total] = await Promise.all([
        prisma.tenant.findMany({
            where,
            skip,
            take: limit,
            orderBy: { createdAt: "desc" },
            include: {
                _count: { select: { users: true, documents: true } },
            },
        }),
        prisma.tenant.count({ where }),
    ]);

    return NextResponse.json({ tenants, total, page, limit });
}

// POST /api/admin/tenants
export async function POST(request: Request) {
    const headersList = await headers();
    const userRole = headersList.get("x-user-role");

    if (userRole !== Role.SUPER_ADMIN) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    try {
        const body = await request.json();
        
        // Pre-process body to handle empty strings in optional objects
        const processedBody = { ...body };
        if (processedBody.admin && (!processedBody.admin.email || processedBody.admin.email.trim() === "")) {
            delete processedBody.admin;
        }

        const validated = tenantSchema.parse(processedBody);

        // Check if slug is taken
        const existing = await prisma.tenant.findUnique({
            where: { slug: validated.slug },
        });

        if (existing) {
            return NextResponse.json({ error: "Slug already exists" }, { status: 400 });
        }

        // Check if admin email is taken (if provided)
        if (validated.admin && validated.admin.email) {
            const existingUser = await prisma.user.findUnique({
                where: { email: validated.admin.email },
            });
            if (existingUser) {
                return NextResponse.json({ error: "Admin email already in use" }, { status: 400 });
            }
        }

        const result = await prisma.$transaction(async (tx) => {
            const tenant = await tx.tenant.create({
                data: {
                    name: validated.name,
                    slug: validated.slug,
                    email: validated.email || null,
                    subscriptionPlan: validated.subscriptionPlan,
                },
            });

            let adminUser = null;
            if (validated.admin && validated.admin.email) {
                const hashedPassword = await bcrypt.hash(validated.admin.password, 12);
                adminUser = await tx.user.create({
                    data: {
                        email: validated.admin.email,
                        password: hashedPassword,
                        firstName: validated.admin.firstName,
                        lastName: validated.admin.lastName,
                        role: Role.TENANT_ADMIN,
                        tenantId: tenant.id,
                    },
                });
            }

            return { tenant, adminUser };
        });

        return NextResponse.json(result, { status: 201 });
    } catch (error) {
        if (error instanceof z.ZodError) {
            console.error("Validation error:", error.issues);
            return NextResponse.json({ 
                error: error.issues[0]?.message || "Invalid input",
                details: error.issues 
            }, { status: 400 });
        }
        console.error("Failed to create tenant:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
