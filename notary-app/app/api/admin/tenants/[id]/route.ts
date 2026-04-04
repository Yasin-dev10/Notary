import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { Role } from "@prisma/client";

const updateSchema = z.object({
    isActive: z.boolean().optional(),
    subscriptionPlan: z.enum(["FREE", "STARTER", "PROFESSIONAL", "ENTERPRISE"]).optional(),
    commissionRate: z.number().min(0).max(100).optional(),
});

// GET /api/admin/tenants/[id]
export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const headersList = await headers();
    const userRole = headersList.get("x-user-role");
    const { id } = await params;

    if (userRole !== Role.SUPER_ADMIN) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const tenant = await prisma.tenant.findUnique({
        where: { id },
        include: {
            _count: { select: { users: true, documents: true, transactions: true, appointments: true } },
        },
    });

    if (!tenant) {
        return NextResponse.json({ error: "Tenant not found" }, { status: 404 });
    }

    return NextResponse.json(tenant);
}

// PATCH /api/admin/tenants/[id]
export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const headersList = await headers();
    const userRole = headersList.get("x-user-role");
    const { id } = await params;

    if (userRole !== Role.SUPER_ADMIN) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    try {
        const body = await request.json();
        const validated = updateSchema.parse(body);

        const tenant = await prisma.tenant.update({
            where: { id },
            data: {
                ...validated,
            },
        });

        return NextResponse.json(tenant);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: error.issues[0]?.message || "Invalid input" }, { status: 400 });
        }
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

// DELETE /api/admin/tenants/[id]
export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const headersList = await headers();
    const userRole = headersList.get("x-user-role");
    const { id } = await params;

    if (userRole !== Role.SUPER_ADMIN) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    try {
        await prisma.tenant.update({
            where: { id },
            data: {
                deletedAt: new Date(),
                isActive: false,
            },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
