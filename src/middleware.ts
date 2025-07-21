import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

const roleAccess: Record<string, string[]> = {
    "/admin/products": ["user", "admin", "superadmin"],
    "/admin/orders": ["user", "admin", "superadmin"],
    "/admin/user": ["superadmin"],
    "/admin/ip_whitelist": ["superadmin"],
    "/admin/sesstionsPoint": ["admin", "superadmin"],
    "/admin/templateMessages": ["admin", "superadmin"],
    "/admin/reviews": ["admin", "superadmin"],
    "/admin/customer": ["admin", "superadmin"],
    "/admin/settingWeb": ["admin", "superadmin"],
};

export function middleware(request: NextRequest) {
    const token = request.cookies.get("token")?.value;
    const { pathname } = request.nextUrl;

    const publicPaths = ["/login", "/register", "/api", "/favicon.ico", "/_next", "/static"];
    const isPublic = publicPaths.some((path) => pathname.startsWith(path));

    if (!token && !isPublic) {
        return NextResponse.redirect(new URL("/login", request.url));
    }

    if (token) {
        try {

            const decoded = jwt.decode(token) as { role?: string } | null;
            const userRole = decoded?.role || "user";

            if (pathname === "/login") {
                return NextResponse.redirect(new URL("/", request.url));
            }

            if (pathname.startsWith("/admin")) {
                const allowedRoles = Object.entries(roleAccess).find(([route]) => pathname.startsWith(route))?.[1];

                if (allowedRoles && !allowedRoles.includes(userRole)) {
                    return NextResponse.redirect(new URL("/403", request.url));
                }
            }
        } catch {
            return NextResponse.redirect(new URL("/login", request.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        "/((?!_next/static|_next/image|favicon.ico|login|register|api).*)",
    ],
};
