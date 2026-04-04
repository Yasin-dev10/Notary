import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { z } from "zod";
import prisma from "@/lib/prisma";

const appointmentSchema = z.object({
    title: z.string().min(1),
    description: z.string().optional(),
    clientId: z.string().uuid(),
    notaryId: z.string().uuid().optional(),
    startTime: z.string(),
    endTime: z.string(),
    location: z.string().optional(),
    status: z.enum(["PENDING", "CONFIRMED", "COMPLETED", "CANCELLED"]).optional(),
    notes: z.string().optional(),
});

// GET /api/appointments
export async function GET(request: Request) {
    const headersList = await headers();
    const tenantId = headersList.get("x-tenant-id");
    if (!tenantId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");

    const where: any = { tenantId, deletedAt: null };
    if (status) where.status = status;
    if (startDate || endDate) {
        where.startTime = {};
        if (startDate) where.startTime.gte = new Date(startDate);
        if (endDate) where.startTime.lte = new Date(endDate);
    }

    const [appointments, total] = await Promise.all([
        prisma.appointment.findMany({
            where,
            skip: (page - 1) * limit,
            take: limit,
            orderBy: { startTime: "asc" },
            include: {
                client: { select: { id: true, firstName: true, lastName: true, email: true } },
                notary: { select: { id: true, firstName: true, lastName: true } },
                _count: { select: { documents: true } },
            },
        }),
        prisma.appointment.count({ where }),
    ]);

    return NextResponse.json({ appointments, total });
}

// POST /api/appointments
export async function POST(request: Request) {
    const headersList = await headers();
    const tenantId = headersList.get("x-tenant-id");
    if (!tenantId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        const body = await request.json();
        const validated = appointmentSchema.parse(body);

        const appointment = await prisma.appointment.create({
            data: {
                ...validated,
                startTime: new Date(validated.startTime),
                endTime: new Date(validated.endTime),
                tenantId,
            },
            include: {
                client: { select: { id: true, firstName: true, lastName: true } },
                notary: { select: { id: true, firstName: true, lastName: true } },
            },
        });

        return NextResponse.json(appointment, { status: 201 });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: error.issues[0].message }, { status: 400 });
        }
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
