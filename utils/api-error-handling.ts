import { NextRequest, NextResponse } from "next/server";

// Error handling for all API routes

export function withErrorHandling<P extends Record<string, any>>(
    handler: (req: NextRequest, context: { params: P }) => Promise<NextResponse>
): (req: NextRequest, context: { params: P }) => Promise<NextResponse> {
    return async (req: NextRequest, context: { params: P }) => {
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
