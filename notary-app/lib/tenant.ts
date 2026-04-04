import { getServerSession } from "next-auth";
import { authOptions } from "./auth";
import { redirect } from "next/navigation";

/**
 * Get the current user's tenant context from the server session.
 * Redirects to login if unauthenticated.
 */
export async function getTenantContext() {
    const session = await getServerSession(authOptions);

    if (!session?.user?.tenantId) {
        redirect("/login");
    }

    return {
        tenantId: session.user.tenantId,
        tenantSlug: session.user.tenantSlug,
        tenantName: session.user.tenantName,
        userId: session.user.id,
        role: session.user.role,
    };
}

/**
 * Enforce that any Prisma query is scoped to the tenant.
 * Use this wrapper for all database queries.
 */
export function withTenantFilter<T extends object>(
    tenantId: string,
    filter?: T
): T & { tenantId: string } {
    return {
        ...filter,
        tenantId,
    } as T & { tenantId: string };
}

/**
 * Role hierarchy constants
 */
export const ROLE_HIERARCHY = {
    SUPER_ADMIN: 4,
    TENANT_ADMIN: 3,
    NOTARY: 2,
    STAFF: 1,
} as const;

export type UserRole = keyof typeof ROLE_HIERARCHY;

/**
 * Check if a role has at least the required permission level.
 */
export function hasPermission(
    userRole: UserRole,
    requiredRole: UserRole
): boolean {
    return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole];
}
