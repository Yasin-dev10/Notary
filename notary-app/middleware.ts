import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
    try {
        const { pathname } = request.nextUrl;

        // Public paths that don't require authentication
        const publicPaths = ["/login", "/register", "/api/auth", "/api/seed", "/sign", "/api/sign", "/book", "/api/notary", "/api/appointments/client", "/verify"];
        const isPublicPath = publicPaths.some((p) => pathname.startsWith(p));

        if (isPublicPath) {
            return NextResponse.next();
        }

        const token = await getToken({
            req: request,
            secret: process.env.NEXTAUTH_SECRET || "your-secret-here",
        });

        // Redirect to login if not authenticated
        if (!token) {
            const loginUrl = new URL("/login", request.url);
            loginUrl.searchParams.set("callbackUrl", pathname);
            return NextResponse.redirect(loginUrl);
        }

        // Inject tenant context into request headers so API routes can read it
        const requestHeaders = new Headers(request.headers);
        if (token.tenantId) requestHeaders.set("x-tenant-id", String(token.tenantId));
        if (token.id) requestHeaders.set("x-user-id", String(token.id));
        if (token.role) requestHeaders.set("x-user-role", String(token.role));

        // Super admin route protection
        if (pathname.startsWith("/admin") && token.role !== "SUPER_ADMIN") {
            return NextResponse.redirect(new URL("/dashboard", request.url));
        }

        return NextResponse.next({
            request: {
                headers: requestHeaders,
            },
        });
    } catch (error: any) {
        console.error("Middleware explicitly caught an error:", error);
        const loginUrl = new URL("/login", request.url);
        loginUrl.searchParams.set("error", "middleware_crash");
        return NextResponse.redirect(loginUrl);
    }
}

export const config = {
    matcher: [
        "/((?!_next/static|_next/image|favicon.ico|public).*)",
    ],
};
