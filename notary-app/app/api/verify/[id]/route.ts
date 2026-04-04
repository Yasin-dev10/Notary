import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        // The `h` query param contains the verificationHash
        const hash = request.nextUrl.searchParams.get("h");

        // Look up by trackingId first
        const document = await prisma.document.findUnique({
            where: { trackingId: id.toUpperCase() },
            include: {
                client: { select: { firstName: true, lastName: true } },
                signatures: { select: { signerName: true, signedAt: true, signerRole: true } },
                tenant: { select: { name: true } },
            },
        });

        if (!document) {
            return NextResponse.json({ error: "Document not found or invalid QR code" }, { status: 404 });
        }

        // If a verificationHash is stored on the document, it MUST match the `h` param
        if (document.verificationHash) {
            if (!hash || hash !== document.verificationHash) {
                return NextResponse.json(
                    { error: "Invalid verification link. The QR code may have been tampered with." },
                    { status: 403 }
                );
            }
        }

        return NextResponse.json({
            valid: true,
            document: {
                id: document.id,
                name: document.name,
                status: document.status,
                notarizationDate: document.notarizationDate,
                trackingId: document.trackingId,
                clientName: document.client ? `${document.client.firstName} ${document.client.lastName}` : "N/A",
                signatures: document.signatures,
                institution: document.tenant.name,
                createdAt: document.createdAt,
            }
        });
    } catch (error) {
        console.error("Verification error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
