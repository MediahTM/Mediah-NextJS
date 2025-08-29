import { NextRequestWithAuth, withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default function middleware(req: NextRequestWithAuth) {
    const { pathname } = req.nextUrl

    if (pathname.includes("/api/file/get-shared-item") || pathname.includes("/api/get-user") || pathname.includes("/api/renew")) {
        // Authentication is not required for these endpoints.
        return NextResponse.next()
    }

    return withAuth(req)
}

export const config = {
    matcher: ["/dashboard/:path*", "/api/:path*"]
}