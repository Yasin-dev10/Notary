import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { z } from "zod";
import prisma from "@/lib/prisma";

const clientSchema = z.object({
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    email: z.string().email().optional().or(z.literal("")),
    phone: z.string().optional(),
    address: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    zipCode: z.string().optional(),
    country: z.string().optional(),
    dateOfBirth: z.string().optional(),
    idType: z.string().optional(),
    idNumber: z.string().optional(),
    idImageUrl: z.string().optional(),
    notes: z.string().optional(),
});

// GET /api/clients
export async function GET(request: Request) {
    const headersList = await headers();
    const tenantId = headersList.get("x-tenant-id");
    if (!tenantId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const skip = (page - 1) * limit;

    const where = {
        tenantId,
        deletedAt: null,
        ...(search && {
            OR: [
                { firstName: { contains: search, mode: "insensitive" as const } },
                { lastName: { contains: search, mode: "insensitive" as const } },
                { email: { contains: search, mode: "insensitive" as const } },
                { phone: { contains: search, mode: "insensitive" as const } },
            ],
        }),
    };

    const [clients, total] = await Promise.all([
        prisma.client.findMany({
            where,
            skip,
            take: limit,
            orderBy: { createdAt: "desc" },
            include: {
                _count: { select: { appointments: true, documents: true, transactions: true } },
            },
        }),
        prisma.client.count({ where }),
    ]);

    return NextResponse.json({ clients, total, page, limit });
}

// POST /api/clients
export async function POST(request: Request) {
    const headersList = await headers();
    const tenantId = headersList.get("x-tenant-id");
    if (!tenantId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        const body = await request.json();
        const parsed = clientSchema.safeParse(body);
        if (!parsed.success) {
            return NextResponse.json({ error: parsed.error.issues[0]?.message || "Validation failed" }, { status: 400 });
        }
        const validated = parsed.data;

        const client = await prisma.client.create({
            data: {
                ...validated,
                email: validated.email || null,
                dateOfBirth: validated.dateOfBirth ? new Date(validated.dateOfBirth) : null,
                idImageUrl: validated.idImageUrl,
                tenantId,
            },
        });

        return NextResponse.json(client, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
