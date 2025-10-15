import { auth } from "@/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
    const isLoggedIn = !!req.auth;
    const { pathname } = req.nextUrl;

    // Routes publiques
    const isPublicRoute = [
        "/login",
        "/register",
        "/",
        "/distributeur"
    ].includes(pathname)

    // Routes protégées
    const isProtectedRoute = pathname.startsWith("/dashboard") ||
        pathname.startsWith("/profile") ||
        pathname.startsWith("/settings");

    // Si l'utilisateur est connecté et tente d'accéder à login/register
    if (isLoggedIn && isPublicRoute) {
        return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    // Si l'utilisateur n'est pas connecté et tente d'accéder à une route protégée
    if (!isLoggedIn && isProtectedRoute) {
        const callbackUrl = encodeURIComponent(pathname);
        return NextResponse.redirect(new URL(`/login?callbackUrl=${callbackUrl}`, req.url));
    }

    return NextResponse.next();
});

export const config = {
    matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};