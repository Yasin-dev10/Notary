import prisma from "./prisma";

export async function logActivity({
    action,
    entity,
    entityId,
    details,
    userId,
    tenantId,
    ipAddress,
    userAgent
}: {
    action: string,
    entity: string,
    entityId?: string,
    details?: string,
    userId?: string,
    tenantId: string,
    ipAddress?: string,
    userAgent?: string
}) {
    try {
        await prisma.activityLog.create({
            data: {
                action: action as any,
                entity,
                entityId,
                details,
                userId,
                tenantId,
                ipAddress,
                userAgent
            }
        });
    } catch (error) {
        console.error("Failed to log activity:", error);
    }
}
