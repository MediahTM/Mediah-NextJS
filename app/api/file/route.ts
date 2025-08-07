"use server";

import db from '@/lib/prisma';
import { withErrorHandling } from '@/utils/api-error-handling';
import { getAuthenticatedSession } from '@/utils/api-session-auth';
import { NextRequest, NextResponse } from 'next/server';

export const GET = withErrorHandling(async (req: NextRequest) => {
    const session = await getAuthenticatedSession();

    const { searchParams } = new URL(req.url)
    const isActive = searchParams.get("isActive") === "true" ? true : false

    const files = await db.file.findMany({
        where: {
            userId: session.user.id || '',
            isActive: isActive
        },
    });

    return NextResponse.json({
        success: true,
        message: "Files fetched successfully.",
        data: files.map((file) => {
            return {
                ...file,
                channelID: String(file.channelID).padStart(19, '0'),
                parts: file.parts.map((part) => String(part).padStart(19, '0'))
            }
        }),
    });
});