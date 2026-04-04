import { NextResponse } from "next/server";
import { headers } from "next/headers";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
    const headersList = await headers();
    const tenantId = headersList.get("x-tenant-id");
    const role = headersList.get("x-user-role");
    
    // Only Admin and Auditor can see activity logs
    if (role !== "SUPER_ADMIN" && role !== "TENANT_ADMIN" && role !== "AUDITOR") {
        return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    if (!tenantId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");

    try {
        const [logs, total] = await Promise.all([
            prisma.activityLog.findMany({
                where: { tenantId },
                skip: (page - 1) * limit,
                take: limit,
                orderBy: { createdAt: "desc" },
                include: {
                    user: { select: { firstName: true, lastName: true, role: true } },
                },
            }),
            prisma.activityLog.count({ where: { tenantId } }),
        ]);

        return NextResponse.json({ logs, total, page, limit });
    } catch (error) {
        console.error("Fetch ActivityLog error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
