import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { AppointmentStatus } from "@prisma/client";
import crypto from "crypto";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const {
            tenantId,
            firstName,
            lastName,
            email,
            phone,
            title,
            description,
            startTime,
            endTime,
            location,
            documents // Array of { name, fileUrl, fileSize, mimeType }
        } = body;

        if (!tenantId || !firstName || !lastName || !email || !startTime || !endTime) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        // 1. Transaction to ensure client, appointment and documents are created together
        const result = await prisma.$transaction(async (tx) => {
            // Find or create client for this tenant
            let client = await tx.client.findFirst({
                where: { email, tenantId }
            });

            if (!client) {
                client = await tx.client.create({
                    data: {
                        firstName,
                        lastName,
                        email,
                        phone,
                        tenantId
                    }
                });
            }

            // Create appointment
            const appointment = await tx.appointment.create({
                data: {
                    title: title || "Appointment Booking",
                    description,
                    startTime: new Date(startTime),
                    endTime: new Date(endTime),
                    location,
                    status: AppointmentStatus.PENDING,
                    tenantId,
                    clientId: client.id
                }
            });

            // Create documents if any
            if (documents && Array.isArray(documents)) {
                for (const doc of documents) {
                    await tx.document.create({
                        data: {
                            name: doc.name,
                            fileUrl: doc.fileUrl,
                            fileSize: doc.fileSize,
                            mimeType: doc.mimeType,
                            tenantId,
                            clientId: client.id,
                            appointmentId: appointment.id,
                            status: "PENDING_NOTARIZATION",
                            type: "UPLOADED",
                            trackingId: Math.random().toString(36).substring(2, 10).toUpperCase(),
                            verificationHash: crypto.randomBytes(16).toString("hex"),
                        }
                    });
                }
            }

            return appointment;
        });

        // Log activity (optional, but good for security)
        await prisma.activityLog.create({
            data: {
                action: "CREATE",
                entity: "Appointment",
                entityId: result.id,
                details: `New booking from ${firstName} ${lastName}`,
                tenantId: tenantId,
            }
        });

        return NextResponse.json({ success: true, appointmentId: result.id });
    } catch (error: any) {
        console.error("Booking Error:", error);
        return NextResponse.json({ error: "Booking failed. Please try again. " + error.message }, { status: 500 });
    }
}
