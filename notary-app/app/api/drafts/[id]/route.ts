import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const draft = await prisma.draftDocument.findFirst({
        where: {
            id: params.id,
            tenantId: session.user.tenantId,
            deletedAt: null,
        },
        include: {
            template: true,
            client: true,
        },
    });

    if (!draft) return NextResponse.json({ error: "Not found" }, { status: 404 });

    return NextResponse.json(draft);
}

export async function PATCH(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();

    const draft = await prisma.draftDocument.updateMany({
        where: {
            id: params.id,
            tenantId: session.user.tenantId,
        },
        data: {
            ...body,
            updatedAt: new Date(),
        },
    });

    return NextResponse.json({ success: true });
}

export async function DELETE(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await prisma.draftDocument.updateMany({
        where: { id: params.id, tenantId: session.user.tenantId },
        data: { deletedAt: new Date() },
    });

    return NextResponse.json({ success: true });
}
