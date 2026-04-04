import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { sendNotification, NotificationCategory } from "@/lib/notifications";
import { addDays, startOfDay, endOfDay } from "date-fns";

export async function GET(request: NextRequest) {
  // This should be protected by a CRON_SECRET or check if it's running in a cron environment
  const authHeader = request.headers.get("authorization");
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const today = startOfDay(new Date());
    
    // Check for documents expiring in 30 days, 7 days, and 1 day
    const thresholds = [30, 7, 1];
    let totalNotified = 0;

    for (const days of thresholds) {
      const targetDate = addDays(today, days);
      const startOfTarget = startOfDay(targetDate);
      const endOfTarget = endOfDay(targetDate);

      const documents = await prisma.document.findMany({
        where: {
          expiryDate: {
            gte: startOfTarget,
            lte: endOfTarget,
          },
          status: "NOTARIZED",
          deletedAt: null,
        },
        include: {
          client: true,
          tenant: true,
        },
      }) as any[];

      for (const doc of documents) {
        if (!doc.client) continue;

        const clientName = `${doc.client.firstName} ${doc.client.lastName}`;
        const recipientEmail = doc.client.email || undefined;
        const recipientPhone = doc.client.phone || undefined;
        const tenantEmail = doc.tenant.email || undefined;

        // Notify Client
        await sendNotification(NotificationCategory.DOCUMENT_EXPIRING, {
          documentId: doc.id,
          tenantId: doc.tenantId,
          recipientEmail,
          recipientPhone,
          clientName,
          documentName: doc.name,
          message: `Hello ${clientName}, your document "${doc.name}" will expire in ${days} days on ${doc.expiryDate?.toLocaleDateString()}. Please renew if needed.`
        });

        // Notify Notary (Tenant)
        if (tenantEmail) {
            await sendNotification(NotificationCategory.DOCUMENT_EXPIRING, {
                documentId: doc.id,
                tenantId: doc.tenantId,
                recipientEmail: tenantEmail,
                clientName: "Notary Admin",
                documentName: doc.name,
                message: `Alert: Document "${doc.name}" for client ${clientName} will expire in ${days} days.`
            });
        }

        totalNotified++;
      }
    }

    return NextResponse.json({ 
      success: true, 
      processed: totalNotified,
      message: `Checked for expirations. Sent ${totalNotified} notifications.` 
    });
  } catch (error: any) {
    console.error("Cron Error:", error);
    return NextResponse.json({ error: "Internal server error", details: error.message }, { status: 500 });
  }
}
