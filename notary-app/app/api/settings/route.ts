import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getToken } from "next-auth/jwt";

export async function GET(req: NextRequest) {
    const token = await getToken({ req });

    if (!token || !token.tenantId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const tenant = await prisma.tenant.findUnique({
            where: { id: token.tenantId as string },
        });

        if (!tenant) {
            return NextResponse.json({ error: "Tenant not found" }, { status: 404 });
        }

        return NextResponse.json(tenant);
    } catch (error) {
        console.error("Error fetching settings:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function PATCH(req: NextRequest) {
    const token = await getToken({ req });

    if (!token || !token.tenantId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await req.json();
        const { name, email, phone, address, logoUrl, themeColor, customDomain, subscriptionPlan } = body;

        const updatedTenant = await prisma.tenant.update({
            where: { id: token.tenantId as string },
            data: {
                name,
                email,
                phone,
                address,
                logoUrl,
                themeColor,
                customDomain,
                subscriptionPlan,
            },
        });

        return NextResponse.json(updatedTenant);
    } catch (error) {
        console.error("Error updating settings:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
