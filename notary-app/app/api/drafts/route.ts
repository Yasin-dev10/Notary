import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const skip = (page - 1) * limit;

    const [drafts, total] = await Promise.all([
        prisma.draftDocument.findMany({
            where: { tenantId: session.user.tenantId, deletedAt: null },
            include: {
                template: { select: { id: true, name: true, category: true } },
                client: { select: { id: true, firstName: true, lastName: true } },
            },
            orderBy: { createdAt: "desc" },
            skip,
            take: limit,
        }),
        prisma.draftDocument.count({
            where: { tenantId: session.user.tenantId, deletedAt: null },
        }),
    ]);

    return NextResponse.json({ drafts, total, page, limit });
}

export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { title, templateId, fieldValues, clientId, notes } = body;

    if (!title || !templateId || !fieldValues) {
        return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Verify template exists
    const template = await prisma.documentTemplate.findFirst({
        where: {
            id: templateId,
            OR: [{ tenantId: session.user.tenantId }, { tenantId: null }],
            deletedAt: null,
        },
    });

    if (!template) {
        return NextResponse.json({ error: "Template not found" }, { status: 404 });
    }

    const draft = await prisma.draftDocument.create({
        data: {
            title,
            templateId,
            fieldValues,
            tenantId: session.user.tenantId,
            clientId: clientId || null,
            createdById: session.user.id,
            notes: notes || null,
            status: "DRAFT",
        },
        include: {
            template: true,
            client: true,
        },
    });

    return NextResponse.json(draft, { status: 201 });
}
