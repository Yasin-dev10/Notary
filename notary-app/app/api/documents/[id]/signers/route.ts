import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import prisma from "@/lib/prisma";

// GET /api/documents/[id]/signers
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const headersList = await headers();
        const tenantId = headersList.get("x-tenant-id");
        if (!tenantId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { id } = await params;

        const signers = await prisma.documentSigner.findMany({
            where: { documentId: id },
            include: { signature: true },
            orderBy: { order: "asc" },
        });

        return NextResponse.json({ signers });
    } catch (error: any) {
        console.error("Error fetching signers:", error);
        return NextResponse.json({ error: "Internal server error", details: error.message }, { status: 500 });
    }
}

// POST /api/documents/[id]/signers  — add a signer to the document
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const headersList = await headers();
        const tenantId = headersList.get("x-tenant-id");
        if (!tenantId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { id } = await params;
        const body = await request.json();

        // Validate the document belongs to this tenant
        const document = await prisma.document.findFirst({
            where: { id, tenantId, deletedAt: null },
        });
        if (!document) return NextResponse.json({ error: "Document not found" }, { status: 404 });

        // Determine next order
        const existingCount = await prisma.documentSigner.count({ where: { documentId: id } });

        const signer = await prisma.documentSigner.create({
            data: {
                documentId: id,
                name: body.name,
                email: body.email || null,
                phone: body.phone || null,
                role: body.role || "CLIENT",
                order: body.order ?? existingCount + 1,
            },
        });

        return NextResponse.json(signer, { status: 201 });
    } catch (error: any) {
        console.error("Error adding signer:", error);
        return NextResponse.json({ error: "Internal server error", details: error.message }, { status: 500 });
    }
}

// DELETE /api/documents/[id]/signers?signerId=xxx
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const headersList = await headers();
        const tenantId = headersList.get("x-tenant-id");
        if (!tenantId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { id } = await params;
        const { searchParams } = new URL(request.url);
        const signerId = searchParams.get("signerId");
        if (!signerId) return NextResponse.json({ error: "signerId required" }, { status: 400 });

        // Confirm doc belongs to tenant
        const document = await prisma.document.findFirst({ where: { id, tenantId, deletedAt: null } });
        if (!document) return NextResponse.json({ error: "Document not found" }, { status: 404 });

        await prisma.documentSigner.delete({ where: { id: signerId } });

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("Error deleting signer:", error);
        return NextResponse.json({ error: "Internal server error", details: error.message }, { status: 500 });
    }
}
