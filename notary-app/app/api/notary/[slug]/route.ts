import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ slug: string }> }
) {
    try {
        const { slug } = await params;

        const tenant = await prisma.tenant.findUnique({
            where: { slug },
            select: {
                id: true,
                name: true,
                logoUrl: true,
                themeColor: true,
                phone: true,
                email: true,
                address: true,
            },
        });

        if (!tenant) {
            return NextResponse.json({ error: "Notary not found" }, { status: 404 });
        }

        return NextResponse.json(tenant);
    } catch (error) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
