import prisma from "./prisma";

export enum NotificationType {
  EMAIL = "EMAIL",
  SMS = "SMS",
  BOTH = "BOTH",
}

export enum NotificationCategory {
  NOTARIZATION_COMPLETE = "NOTARIZATION_COMPLETE",
  DOCUMENT_EXPIRING = "DOCUMENT_EXPIRING",
  APPOINTMENT_REMINDER = "APPOINTMENT_REMINDER",
}

interface SendOptions {
  documentId?: string;
  tenantId: string;
  recipientEmail?: string;
  recipientPhone?: string;
  clientName: string;
  documentName?: string;
  downloadUrl?: string;
  message?: string;
}

export async function sendNotification(
  category: NotificationCategory,
  options: SendOptions
) {
  const { 
    documentId, 
    tenantId, 
    recipientEmail, 
    recipientPhone, 
    clientName, 
    documentName, 
    downloadUrl,
    message
  } = options;

  console.log(`[Notification] Sending ${category} to ${clientName}`);

  // 1. Email Notification
  if (recipientEmail) {
    try {
      const emailContent = message || `Hello ${clientName}, your document "${documentName}" has been notarized. Download link: ${downloadUrl}`;
      // Mock sending email
      console.log(`[Email] To: ${recipientEmail}, Subject: Notice regarding ${documentName}`);
      
      await (prisma as any).notificationLog.create({
        data: {
          type: "EMAIL",
          category,
          recipient: recipientEmail,
          status: "SENT",
          message: emailContent,
          documentId,
          tenantId,
        },
      });
    } catch (error: any) {
      console.error("[Email Error]", error);
    }
  }

  // 2. SMS Notification
  if (recipientPhone) {
    try {
      const smsContent = message || `Ogeysiin: Dukumentigaaga ${documentName} waa la ansixiyey. Link: ${downloadUrl}`;
      // Mock sending SMS
      console.log(`[SMS] To: ${recipientPhone}, Message: ${smsContent}`);
      
      await (prisma as any).notificationLog.create({
        data: {
          type: "SMS",
          category,
          recipient: recipientPhone,
          status: "SENT",
          message: smsContent,
          documentId,
          tenantId,
        },
      });
    } catch (error: any) {
      console.error("[SMS Error]", error);
    }
  }
}

export async function triggerNotarizationNotification(documentId: string) {
  const doc = await prisma.document.findUnique({
    where: { id: documentId },
    include: {
      client: true,
      tenant: true,
    },
  });

  if (!doc || !doc.client) return;

  const downloadUrl = `http://localhost:3000/verify/${doc.trackingId}`; // Or a real download link

  await sendNotification(NotificationCategory.NOTARIZATION_COMPLETE, {
    documentId: doc.id,
    tenantId: doc.tenantId,
    recipientEmail: doc.client.email || undefined,
    recipientPhone: doc.client.phone || undefined,
    clientName: `${doc.client.firstName} ${doc.client.lastName}`,
    documentName: doc.name,
    downloadUrl,
  });

  // Update document as notified
  await prisma.document.update({
    where: { id: documentId },
    data: { notifiedAt: new Date() } as any,
  });
}
