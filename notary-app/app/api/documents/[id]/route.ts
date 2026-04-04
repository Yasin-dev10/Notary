import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import prisma from "@/lib/prisma";
import { triggerNotarizationNotification } from "@/lib/notifications";

// GET /api/documents/[id]
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const headersList = await headers();
        const tenantId = headersList.get("x-tenant-id");

        const document = await prisma.document.findUnique({
            where: { id, tenantId: tenantId || undefined },
            include: {
                client: true,
                signatures: true,
                attachments: true,
            },
        });

        if (!document) return NextResponse.json({ error: "Document not found" }, { status: 404 });

        return NextResponse.json(document);
    } catch (error) {
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

// PATCH /api/documents/[id]
export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const headersList = await headers();
        const tenantId = headersList.get("x-tenant-id");
        const userId = headersList.get("x-user-id");
        
        if (!tenantId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const body = await request.json();
        
        const oldDoc = await prisma.document.findUnique({
            where: { id, tenantId },
        });

        if (!oldDoc) return NextResponse.json({ error: "Document not found" }, { status: 404 });

        const updatedDoc = await prisma.document.update({
            where: { id },
            data: {
                ...body,
                status: body.status || undefined,
                expiryDate: body.expiryDate ? new Date(body.expiryDate) : undefined,
                notarizationDate: body.status === "NOTARIZED" ? new Date() : undefined,
            },
        });

        // Trigger notification if status changed to NOTARIZED
        if (body.status === "NOTARIZED" && oldDoc.status !== "NOTARIZED") {
            await triggerNotarizationNotification(id);
        }

        // Create audit log
        await prisma.documentAudit.create({
            data: {
                action: "UPDATED",
                documentId: id,
                changedBy: userId,
                fieldName: "status/etc",
                oldValue: oldDoc.status,
                newValue: updatedDoc.status,
            },
        });

        return NextResponse.json(updatedDoc);
    } catch (error) {
        console.error("PATCH error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

// DELETE /api/documents/[id]
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const headersList = await headers();
        const tenantId = headersList.get("x-tenant-id");

        if (!tenantId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        await prisma.document.update({
            where: { id, tenantId },
            data: { deletedAt: new Date() },
        });

        return NextResponse.json({ message: "Document deleted" });
    } catch (error) {
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
