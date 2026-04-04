import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import prisma from "./prisma";

export const authOptions: NextAuthOptions = {
    session: {
        strategy: "jwt",
        maxAge: 7 * 24 * 60 * 60, // 7 days
    },
    pages: {
        signIn: "/login",
        error: "/login",
    },
    providers: [
        CredentialsProvider({
            name: "credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    throw new Error("Email and password are required");
                }

                const user = await prisma.user.findUnique({
                    where: { email: credentials.email },
                    include: { tenant: true },
                });

                if (!user || !user.isActive) {
                    throw new Error("Invalid credentials");
                }

                const isPasswordValid = await bcrypt.compare(
                    credentials.password,
                    user.password
                );

                if (!isPasswordValid) {
                    throw new Error("Invalid credentials");
                }

                // Update last login
                await prisma.user.update({
                    where: { id: user.id },
                    data: { lastLoginAt: new Date() },
                });

                return {
                    id: user.id,
                    email: user.email,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    role: user.role,
                    tenantId: user.tenantId,
                    tenantSlug: user.tenant.slug,
                    tenantName: user.tenant.name,
                    tenantLogoUrl: user.tenant.logoUrl,
                    subscriptionPlan: user.tenant.subscriptionPlan,
                    avatarUrl: user.avatarUrl,
                };
            },
        }),
    ],
    callbacks: {
        async jwt({ token, user, trigger, session }) {
            if (user) {
                token.id = user.id;
                token.role = (user as any).role;
                token.tenantId = (user as any).tenantId;
                token.tenantSlug = (user as any).tenantSlug;
                token.tenantName = (user as any).tenantName;
                token.tenantLogoUrl = (user as any).tenantLogoUrl;
                token.subscriptionPlan = (user as any).subscriptionPlan;
                token.firstName = (user as any).firstName;
                token.lastName = (user as any).lastName;
                token.avatarUrl = (user as any).avatarUrl;
            }
            // Handle session updates (e.g. from updateSession call in settings)
            if (trigger === "update" && session) {
                token.tenantName = session.user.tenantName;
                token.tenantLogoUrl = session.user.tenantLogoUrl;
                token.subscriptionPlan = session.user.subscriptionPlan;
            }
            return token;
        },
        async session({ session, token }) {
            if (token) {
                session.user.id = token.id as string;
                session.user.role = token.role as string;
                session.user.tenantId = token.tenantId as string;
                session.user.tenantSlug = token.tenantSlug as string;
                session.user.tenantName = token.tenantName as string;
                session.user.tenantLogoUrl = token.tenantLogoUrl as string;
                session.user.subscriptionPlan = token.subscriptionPlan as string;
                session.user.firstName = token.firstName as string;
                session.user.lastName = token.lastName as string;
                session.user.avatarUrl = token.avatarUrl as string;
            }
            return session;
        },
    },
};
