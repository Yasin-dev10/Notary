import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import prisma from "@/lib/prisma";
import crypto from "crypto";

// GET /api/documents
export async function GET(request: NextRequest) {
    try {
        const headersList = await headers();
        const tenantId = headersList.get("x-tenant-id");
        if (!tenantId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { searchParams } = new URL(request.url);
        const status = searchParams.get("status");
        const clientId = searchParams.get("clientId");
        const search = searchParams.get("search");
        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "20");

        const where: any = { tenantId, deletedAt: null };
        if (status) where.status = status;
        if (clientId) where.clientId = clientId;
        if (search) {
            where.name = { contains: search, mode: "insensitive" };
        }

        const [documents, total] = await Promise.all([
            prisma.document.findMany({
                where,
                skip: (page - 1) * limit,
                take: limit,
                orderBy: { createdAt: "desc" },
                include: {
                    client: { select: { id: true, firstName: true, lastName: true } },
                    appointment: { select: { id: true, title: true } },
                    uploadedBy: { select: { id: true, firstName: true, lastName: true } },
                    // If these are failing due to missing DB schema, it will throw caught below
                    signatures: true,
                    attachments: true,
                },
            }),
            prisma.document.count({ where }),
        ]);

        return NextResponse.json({ documents, total });
    } catch (error: any) {
        console.error("Error fetching documents:", error);
        return NextResponse.json({ error: "Internal server error", details: error.message }, { status: 500 });
    }
}

// POST /api/documents  
export async function POST(request: NextRequest) {
    const headersList = await headers();
    const tenantId = headersList.get("x-tenant-id");
    const userId = headersList.get("x-user-id");
    if (!tenantId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        const body = await request.json();
        
        // Generate a random tracking ID if not provided
        const trackingId = body.trackingId || Math.random().toString(36).substring(2, 10).toUpperCase();
        // Generate a secure random verification hash (used inside QR code URL)
        const verificationHash = crypto.randomBytes(16).toString("hex");

        const document = await prisma.document.create({
            data: {
                name: body.name,
                description: body.description,
                fileUrl: body.fileUrl || "#",
                fileSize: body.fileSize,
                mimeType: body.mimeType,
                status: body.status || "DRAFT",
                type: body.type || "UPLOADED",
                documentData: body.documentData || undefined,
                trackingId,
                verificationHash,
                clientId: body.clientId || null,
                appointmentId: body.appointmentId || null,
                uploadedById: userId,
                tenantId,
                signatures: body.signatures && Array.isArray(body.signatures) ? {
                    create: body.signatures.map((s: any) => ({
                        signatureUrl: s.signatureUrl,
                        snapshotUrl: s.snapshotUrl, // Live photo of the person signing
                        signerName: s.signerName,
                        signerRole: s.signerRole || "CLIENT",
                    }))
                } : undefined,
                attachments: body.attachments && Array.isArray(body.attachments) ? {
                    create: body.attachments.map((a: any) => ({
                        fileUrl: a.fileUrl,
                        fileName: a.fileName,
                        type: a.type || "OTHER",
                    }))
                } : undefined,
            },
        });

        // Create audit log
        await prisma.documentAudit.create({
            data: {
                action: "CREATED",
                documentId: document.id,
                changedBy: userId,
            },
        });

        return NextResponse.json(document, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
