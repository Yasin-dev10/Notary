import { NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import type { PrismaClient } from "@prisma/client";

const registerSchema = z.object({
    organizationName: z.string().min(2, "Organization name must be at least 2 characters"),
    slug: z
        .string()
        .min(2)
        .max(50)
        .regex(/^[a-z0-9-]+$/, "Slug can only contain lowercase letters, numbers and hyphens"),
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
});

export async function POST(request: Request) {
    try {
        const body = await request.json();

        const parsed = registerSchema.safeParse(body);
        if (!parsed.success) {
            const firstIssue = parsed.error.issues[0];
            return NextResponse.json({ error: firstIssue?.message || "Validation failed" }, { status: 400 });
        }
        const validated = parsed.data;

        // Check slug uniqueness
        const existingTenant = await prisma.tenant.findUnique({
            where: { slug: validated.slug },
        });
        if (existingTenant) {
            return NextResponse.json(
                { error: "Organization slug is already taken" },
                { status: 409 }
            );
        }

        // Check email uniqueness
        const existingUser = await prisma.user.findUnique({
            where: { email: validated.email },
        });
        if (existingUser) {
            return NextResponse.json(
                { error: "Email is already registered" },
                { status: 409 }
            );
        }

        const hashedPassword = await bcrypt.hash(validated.password, 12);

        // Create tenant and admin user in a transaction
        const txResult: any = await prisma.$transaction(async (tx: any) => {
            const tenant = await tx.tenant.create({
                data: {
                    name: validated.organizationName,
                    slug: validated.slug,
                },
            });

            const user = await tx.user.create({
                data: {
                    email: validated.email,
                    password: hashedPassword,
                    firstName: validated.firstName,
                    lastName: validated.lastName,
                    role: "TENANT_ADMIN",
                    tenantId: tenant.id,
                },
            });

            return { tenant, user };
        });

        return NextResponse.json(
            {
                message: "Organization registered successfully",
                tenantId: txResult.tenant.id,
                userId: txResult.user.id,
            },
            { status: 201 }
        );
    } catch (error) {
        console.error("[REGISTER]", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
