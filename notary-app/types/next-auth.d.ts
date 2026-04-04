import NextAuth from "next-auth";

declare module "next-auth" {
    interface Session {
        user: {
            id: string;
            email: string;
            firstName: string;
            lastName: string;
            role: string;
            tenantId: string;
            tenantSlug: string;
            tenantName: string;
            tenantLogoUrl: string | null;
            subscriptionPlan: string;
            avatarUrl: string | null;
        };
    }

    interface User {
        id: string;
        email: string;
        firstName: string;
        lastName: string;
        role: string;
        tenantId: string;
        tenantSlug: string;
        tenantName: string;
        tenantLogoUrl: string | null;
        subscriptionPlan: string;
        avatarUrl: string | null;
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        id: string;
        role: string;
        tenantId: string;
        tenantSlug: string;
        tenantName: string;
        tenantLogoUrl: string | null;
        subscriptionPlan: string;
        firstName: string;
        lastName: string;
        avatarUrl: string | null;
    }
}
