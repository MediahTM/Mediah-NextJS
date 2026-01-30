import { Ratelimit } from "@upstash/ratelimit"
import { NextRequestWithAuth, withAuth } from "next-auth/middleware"
import { NextFetchEvent, NextResponse } from "next/server"
import { getPathMatch } from 'next/dist/shared/lib/router/utils/path-match';
import { Redis } from "@upstash/redis";
import { getClientIp } from "request-ip";

const noAuthApiRoutes = [
    "/api/file/get-shared-item",
    "/api/get-user",
    "/api/renew"
]

type RatelimitPolicy = { matcher: string, requests: number, window: `${number} ${"s" | "m" | "h"}`, prefix: string }

const ratelimits: RatelimitPolicy[] = [
    { matcher: "/api/auth/login", requests: 5, window: "1 m", prefix: "login" },
    { matcher: "/api/file", requests: 200, window: "1 m", prefix: "general" },
    { matcher: "/api/file/share", requests: 200, window: "1 m", prefix: "general" },
    { matcher: "/api/file/get-shared-item", requests: 200, window: "1 m", prefix: "general" },
    { matcher: "/api/file/many", requests: 10, window: "1 m", prefix: "files-many" },
    { matcher: "/api/file/:id*", requests: 200, window: "1 m", prefix: "general" },
    { matcher: "/api/get-user/:id*", requests: 200, window: "1 m", prefix: "general" },
    { matcher: "/api/upload", requests: 200, window: "1 m", prefix: "general" },
    { matcher: "/api/renew", requests: 30, window: "1 m", prefix: "renew" },
    { matcher: "/api/webhooks", requests: 200, window: "1 m", prefix: "general" },
    { matcher: "/api/edit-path", requests: 10, window: "1 m", prefix: "edit-path" },
]

const redis = Redis.fromEnv();
const limiters = ratelimits.map(policy => ({
    ...policy,
    matcherFn: getPathMatch(policy.matcher),
    limiter: new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(policy.requests, policy.window),
        prefix: policy.prefix,
    }),
}));

export default async function middleware(req: NextRequestWithAuth, event: NextFetchEvent) {
    const { pathname } = req.nextUrl;
    const headers = Object.fromEntries(req.headers.entries());
    const ip = getClientIp({ headers }) ?? "unknown";

    for (const rule of limiters) {
        if (rule.matcherFn(pathname)) {
            const { success } = await rule.limiter.limit(ip);

            if (!success) {
                return new NextResponse(JSON.stringify({ error: "Too many requests" }), { status: 429 });
            }
            break;
        }
    }

    if (noAuthApiRoutes.includes(pathname)) {
        // Authentication is not required for these endpoints.
        return NextResponse.next()
    }

    return withAuth(req, event);
}

export const config = {
    matcher: ["/dashboard/:path*", "/api/:path*"]
}