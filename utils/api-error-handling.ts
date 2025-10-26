import { NextRequest, NextResponse } from "next/server";

// Error handling for all API routes

export function withErrorHandling(
    handler: (req: NextRequest, context?: any) => Promise<NextResponse>
) {
    return async (req: NextRequest, context?: any) => {
        try {
            return await handler(req, context);
        } catch (error: any) {
            console.error('Route error:', error);
            return new NextResponse(
                JSON.stringify({
                    success: false,
                    message: error?.message || 'Internal Server Error',
                    data: null,
                }),
                {
                    status: 500,
                    headers: { 'Content-Type': 'application/json' },
                }
            );
        }
    };
}