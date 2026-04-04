import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import prisma from "@/lib/prisma";

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const headersList = await headers();
        const tenantId = headersList.get("x-tenant-id");
        
        if (!tenantId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const appointment = await prisma.appointment.findUnique({
            where: { id, tenantId },
            include: {
                client: true,
                notary: true,
                documents: {
                    orderBy: { createdAt: "desc" }
                },
                transactions: true,
            },
        });

        if (!appointment) {
            return NextResponse.json({ error: "Appointment not found" }, { status: 404 });
        }

        return NextResponse.json(appointment);
    } catch (error) {
        console.error("GET Appointment Detail Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const headersList = await headers();
        const tenantId = headersList.get("x-tenant-id");
        
        if (!tenantId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const appointment = await prisma.appointment.update({
            where: { id, tenantId },
            data: body,
        });

        return NextResponse.json(appointment);
    } catch (error) {
        console.error("PATCH Appointment Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
