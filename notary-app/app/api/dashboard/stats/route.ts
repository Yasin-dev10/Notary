import { NextResponse } from "next/server";
import { headers } from "next/headers";
import prisma from "@/lib/prisma";
import { startOfMonth, endOfMonth } from "date-fns";

// GET /api/dashboard/stats
export async function GET() {
    const headersList = await headers();
    const tenantId = headersList.get("x-tenant-id");
    if (!tenantId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const now = new Date();
    const monthStart = startOfMonth(now);
    const monthEnd = endOfMonth(now);

    const [
        totalClients,
        appointmentsThisMonth,
        pendingAppointments,
        completedAppointments,
        pendingDocuments,
        revenue,
        recentClients,
        recentAppointments,
    ] = await Promise.all([
        prisma.client.count({ where: { tenantId, deletedAt: null } }),
        prisma.appointment.count({
            where: {
                tenantId,
                deletedAt: null,
                startTime: { gte: monthStart, lte: monthEnd },
            },
        }),
        prisma.appointment.count({ where: { tenantId, deletedAt: null, status: "PENDING" } }),
        prisma.appointment.count({ where: { tenantId, deletedAt: null, status: "COMPLETED" } }),
        prisma.document.count({
            where: { tenantId, deletedAt: null, status: "PENDING_NOTARIZATION" },
        }),
        prisma.transaction.aggregate({
            where: { tenantId, deletedAt: null, paymentStatus: "PAID" },
            _sum: { amount: true },
        }),
        prisma.client.findMany({
            where: { tenantId, deletedAt: null },
            take: 5,
            orderBy: { createdAt: "desc" },
            select: { id: true, firstName: true, lastName: true, email: true, createdAt: true },
        }),
        prisma.appointment.findMany({
            where: { tenantId, deletedAt: null, startTime: { gte: now } },
            take: 5,
            orderBy: { startTime: "asc" },
            include: {
                client: { select: { firstName: true, lastName: true } },
            },
        }),
    ]);

    return NextResponse.json({
        stats: {
            totalClients,
            appointmentsThisMonth,
            pendingAppointments,
            completedAppointments,
            pendingDocuments,
            totalRevenue: revenue._sum.amount || 0,
        },
        recentClients,
        upcomingAppointments: recentAppointments,
    });
}
