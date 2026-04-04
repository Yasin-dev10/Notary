import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { z } from "zod";
import prisma from "@/lib/prisma";

const transactionSchema = z.object({
    description: z.string().min(1),
    amount: z.number().positive(),
    currency: z.string().optional(),
    paymentStatus: z.enum(["UNPAID", "PAID", "REFUNDED", "PARTIALLY_PAID"]).optional(),
    paymentMethod: z.string().optional(),
    clientId: z.string().uuid().optional(),
    appointmentId: z.string().uuid().optional(),
    notes: z.string().optional(),
});

// GET /api/transactions
export async function GET(request: Request) {
    const headersList = await headers();
    const tenantId = headersList.get("x-tenant-id");
    if (!tenantId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    const where: any = { tenantId, deletedAt: null };
    if (status) where.paymentStatus = status;

    const [transactions, total, revenue, outstanding] = await Promise.all([
        prisma.transaction.findMany({
            where,
            skip: (page - 1) * limit,
            take: limit,
            orderBy: { createdAt: "desc" },
            include: {
                client: { select: { id: true, firstName: true, lastName: true } },
                appointment: { select: { id: true, title: true } },
                processedBy: { select: { id: true, firstName: true, lastName: true } },
            },
        }),
        prisma.transaction.count({ where }),
        prisma.transaction.aggregate({
            where: { ...where, paymentStatus: "PAID" },
            _sum: { amount: true },
        }),
        prisma.transaction.aggregate({
            where: { ...where, paymentStatus: "UNPAID" },
            _sum: { amount: true },
        }),
    ]);

    return NextResponse.json({ 
        transactions, 
        total, 
        revenue: revenue._sum.amount || 0,
        outstanding: outstanding._sum.amount || 0
    });
}

// POST /api/transactions
export async function POST(request: Request) {
    const headersList = await headers();
    const tenantId = headersList.get("x-tenant-id");
    const userId = headersList.get("x-user-id");
    if (!tenantId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        const body = await request.json();
        const validated = transactionSchema.parse(body);

        const transaction = await prisma.transaction.create({
            data: {
                ...validated,
                tenantId,
                processedById: userId,
            },
        });

        return NextResponse.json(transaction, { status: 201 });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: error.issues[0].message }, { status: 400 });
        }
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
