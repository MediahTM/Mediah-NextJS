
import { fileManyDeleteSchema, fileManyPatchSchema } from "@/lib/api-schemas";
import db from "@/lib/prisma";
import { withErrorHandling } from "@/utils/api-error-handling";
import { getAuthenticatedSession } from "@/utils/api-session-auth";
import { NextRequest, NextResponse } from "next/server";

export const PATCH = withErrorHandling(async (request: NextRequest) => {
    const session = await getAuthenticatedSession();
    const body = await request.json();
    const { ids, ...json } = fileManyPatchSchema.parse(body);
    const expiresAt = json.isActive === false ? new Date(Number(new Date()) + (30 * 24 * 60 * 60 * 1000)) : undefined
    const files = await db.file.updateMany({
        where: {
            id: {
                in: ids
            },
            userId: session.user.id
        },
        data: {
            ...json,
            expiresAt: expiresAt
        }
    })
    return NextResponse.json({ success: true, message: files.count + " files patched successfully." });
});

export const DELETE = withErrorHandling(async (request: NextRequest) => {
    const session = await getAuthenticatedSession();
    const body = await request.json();
    const json = fileManyDeleteSchema.parse(body);
    const files = await db.file.deleteMany({
        where: {
            id: {
                in: json.ids
            },
            userId: session.user.id
        }
    })
    return NextResponse.json({ success: true, message: files.count + " files deleted successfully." });
});