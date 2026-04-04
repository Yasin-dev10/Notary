import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET /api/sign/[token]  — Fetch signer + document info by token
export async function GET(
    _request: NextRequest,
    { params }: { params: Promise<{ token: string }> }
) {
    try {
        const { token } = await params;

        const signer = await prisma.documentSigner.findUnique({
            where: { token },
            include: {
                document: {
                    select: {
                        id: true,
                        name: true,
                        description: true,
                        fileUrl: true,
                        status: true,
                        signers: {
                            orderBy: { order: "asc" },
                            select: { id: true, name: true, role: true, status: true, order: true },
                        },
                    },
                },
                signature: true,
            },
        });

        if (!signer) {
            return NextResponse.json({ error: "Invalid or expired signing link" }, { status: 404 });
        }

        // Check if this specific signer has already signed
        if (signer.status === "COMPLETED") {
            return NextResponse.json({ error: "You have already signed this document", alreadySigned: true }, { status: 400 });
        }

        // Enforce sequential order — check that all previous signers have completed
        const prevSigners = signer.document.signers.filter((s) => s.order < signer.order);
        const allPrevCompleted = prevSigners.every((s) => s.status === "COMPLETED");

        if (!allPrevCompleted) {
            return NextResponse.json({
                error: "It is not yet your turn to sign. Please wait for the previous signers to complete.",
                notYourTurn: true,
            }, { status: 400 });
        }

        return NextResponse.json({ signer, document: signer.document });
    } catch (error: any) {
        console.error("Error fetching signing info:", error);
        return NextResponse.json({ error: "Internal server error", details: error.message }, { status: 500 });
    }
}

// POST /api/sign/[token]  — Submit signature
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ token: string }> }
) {
    try {
        const { token } = await params;
        const body = await request.json();
        const { signatureUrl, snapshotUrl } = body;

        if (!signatureUrl) {
            return NextResponse.json({ error: "signatureUrl is required" }, { status: 400 });
        }

        const signer = await prisma.documentSigner.findUnique({
            where: { token },
            include: {
                document: {
                    include: {
                        signers: { orderBy: { order: "asc" } },
                    },
                },
            },
        });

        if (!signer) {
            return NextResponse.json({ error: "Invalid or expired signing link" }, { status: 404 });
        }

        if (signer.status === "COMPLETED") {
            return NextResponse.json({ error: "You have already signed this document" }, { status: 400 });
        }

        // Enforce sequential order
        const prevSigners = signer.document.signers.filter((s) => s.order < signer.order);
        const allPrevCompleted = prevSigners.every((s) => s.status === "COMPLETED");
        if (!allPrevCompleted) {
            return NextResponse.json({ error: "It is not yet your turn to sign" }, { status: 400 });
        }

        // Get client IP
        const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || undefined;

        // Create the Signature record
        const signature = await prisma.signature.create({
            data: {
                signatureUrl,
                snapshotUrl: snapshotUrl || null,
                signerName: signer.name,
                signerRole: signer.role,
                ipAddress: ip,
                documentId: signer.documentId,
            },
        });

        // Mark this signer as COMPLETED and link the signature
        await prisma.documentSigner.update({
            where: { id: signer.id },
            data: { status: "COMPLETED", signatureId: signature.id },
        });

        // Check if ALL signers have completed — if so, change document status to PENDING_NOTARIZATION
        const allSigners = signer.document.signers;
        const remainingSigners = allSigners.filter(
            (s) => s.id !== signer.id && s.status !== "COMPLETED"
        );

        if (remainingSigners.length === 0) {
            await prisma.document.update({
                where: { id: signer.documentId },
                data: { status: "PENDING_NOTARIZATION" },
            });
        } else {
            // Auto-notify the next signer in line
            const nextSigner = remainingSigners.sort((a, b) => a.order - b.order)[0];
            const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
            const nextSigningUrl = `${baseUrl}/sign/${nextSigner.id}`;

            // We need the token, so fetch the full record
            const nextSignerFull = await prisma.documentSigner.findUnique({ where: { id: nextSigner.id } });
            if (nextSignerFull) {
                const nextUrl = `${baseUrl}/sign/${nextSignerFull.token}`;
                if (nextSignerFull.phone) {
                    fetch(`${baseUrl}/api/notify/sms`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            to: nextSignerFull.phone,
                            message: `Hello ${nextSignerFull.name}, it's your turn to sign the document: ${nextUrl}`,
                        }),
                    }).catch(() => {});
                }
                if (nextSignerFull.email) {
                    fetch(`${baseUrl}/api/notify/email`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            to: nextSignerFull.email,
                            subject: "Action Required: It's Your Turn to Sign",
                            message: `Hello ${nextSignerFull.name},\n\nThe previous signer has completed. It is now your turn to sign the document.\n\nSigning link: ${nextUrl}`,
                        }),
                    }).catch(() => {});
                }
                await prisma.documentSigner.update({
                    where: { id: nextSignerFull.id },
                    data: { status: "NOTIFIED" },
                });
            }
        }

        return NextResponse.json({ success: true, signature });
    } catch (error: any) {
        console.error("Error submitting signature:", error);
        return NextResponse.json({ error: "Internal server error", details: error.message }, { status: 500 });
    }
}
