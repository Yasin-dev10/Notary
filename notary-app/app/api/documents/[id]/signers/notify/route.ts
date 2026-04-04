import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// POST /api/documents/[id]/signers/notify
// Sends notification (Email/SMS) to the NEXT pending signer
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        // Get all signers ordered by their signing order
        const signers = await prisma.documentSigner.findMany({
            where: { documentId: id },
            orderBy: { order: "asc" },
        });

        if (signers.length === 0) {
            return NextResponse.json({ error: "No signers defined for this document" }, { status: 400 });
        }

        // Find the first PENDING signer (next one to be notified)
        const nextSigner = signers.find((s) => s.status === "PENDING");

        if (!nextSigner) {
            return NextResponse.json({ message: "All signers have already completed signing" });
        }

        // Build the unique signing link using the signer's token
        const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
        const signingUrl = `${baseUrl}/sign/${nextSigner.token}`;

        // --- SMS Notification ---
        if (nextSigner.phone) {
            // Send SMS via your existing SMS utility (if configured)
            try {
                const smsBody = {
                    to: nextSigner.phone,
                    message: `Hello ${nextSigner.name}, please sign the document by visiting: ${signingUrl}`,
                };
                // Fire-and-forget: doesn't block if SMS service is unavailable
                fetch(`${baseUrl}/api/notify/sms`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(smsBody),
                }).catch(() => {});
            } catch (_) {}
        }

        // --- Email Notification ---
        if (nextSigner.email) {
            try {
                const emailBody = {
                    to: nextSigner.email,
                    subject: "Action Required: Please Sign Document",
                    message: `Hello ${nextSigner.name},\n\nYou have been requested to sign a document. Please click the link below to review and sign:\n\n${signingUrl}\n\nThis link is unique to you. Please do not share it.`,
                };
                fetch(`${baseUrl}/api/notify/email`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(emailBody),
                }).catch(() => {});
            } catch (_) {}
        }

        // Mark signer as NOTIFIED
        const updatedSigner = await prisma.documentSigner.update({
            where: { id: nextSigner.id },
            data: { status: "NOTIFIED" },
        });

        return NextResponse.json({
            success: true,
            notifiedSigner: updatedSigner,
            signingUrl, // returned so UI can display/copy it
        });
    } catch (error: any) {
        console.error("Error notifying signer:", error);
        return NextResponse.json({ error: "Internal server error", details: error.message }, { status: 500 });
    }
}
