import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import prisma from "@/lib/prisma";

// GET /api/documents/[id]/versions
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const headersList = await headers();
        const tenantId = headersList.get("x-tenant-id");

        const document = await prisma.document.findFirst({
            where: { id, tenantId: tenantId || undefined },
            include: {
                versions: {
                    orderBy: { version: "desc" },
                    include: { uploadedBy: true }
                }
            }
        });

        if (!document) return NextResponse.json({ error: "Document not found" }, { status: 404 });

        return NextResponse.json((document as any).versions);
    } catch (error) {
        console.error("GET versions error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

// POST /api/documents/[id]/versions
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const headersList = await headers();
        const tenantId = headersList.get("x-tenant-id");
        const userId = headersList.get("x-user-id");

        if (!tenantId || !userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const body = await request.json();
        const { fileUrl, fileSize, mimeType } = body;

        if (!fileUrl) return NextResponse.json({ error: "fileUrl is required" }, { status: 400 });

        const document = await prisma.document.findUnique({
            where: { id, tenantId },
            include: { versions: true }
        });

        if (!document) return NextResponse.json({ error: "Document not found" }, { status: 404 });

        if (document.status === "NOTARIZED") {
            return NextResponse.json({ error: "Cannot add versions to a notarized document" }, { status: 400 });
        }

        // Determine next version number
        const nextVersion = (document.versions?.length || 0) + 2; // original is v1, first new is v2

        // If no versions exist yet, we save the CURRENT document as v1 (the original)
        if (!document.versions || document.versions.length === 0) {
            await prisma.documentVersion.create({
                data: {
                    version: 1,
                    fileUrl: document.fileUrl,
                    fileSize: document.fileSize,
                    mimeType: document.mimeType,
                    documentData: document.documentData || undefined,
                    documentId: document.id,
                    uploadedById: document.uploadedById,
                }
            });
        }

        // Create the new version record (this acts as the new state)
        // Wait, actually Document keeps the LATEST state. So we overwrite Document and insert a version for the OLD or NEW?
        // Usually, Document table has the LATEST. And we add a new Version record for the new (or old).
        // Let's insert the new version into DocumentVersion, and ALSO update Document.
        
        const newVersionRecord = await prisma.documentVersion.create({
            data: {
                version: nextVersion,
                fileUrl,
                fileSize,
                mimeType,
                documentId: document.id,
                uploadedById: userId,
            }
        });

        const updatedDocument = await prisma.document.update({
            where: { id },
            data: {
                fileUrl,
                fileSize,
                mimeType
            }
        });

        // Audit log
        await prisma.documentAudit.create({
            data: {
                action: "NEW_VERSION_UPLOADED",
                documentId: id,
                changedBy: userId,
                fieldName: "fileUrl",
                oldValue: document.fileUrl,
                newValue: fileUrl
            }
        });

        return NextResponse.json({ success: true, version: newVersionRecord, document: updatedDocument });
    } catch (error) {
        console.error("POST version error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
