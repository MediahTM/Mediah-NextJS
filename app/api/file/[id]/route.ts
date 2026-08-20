"use server";
import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/prisma";
import { serializeBigInt } from "@/lib/helpers";
import { withErrorHandling } from "@/utils/api-error-handling";
import { getAuthenticatedSession } from "@/utils/api-session-auth";
import { filePatchSchema, mongoIdSchema } from "@/lib/api-schemas";
import { fileExists } from "@/utils/server-file-conflicts";

export const PATCH = withErrorHandling(async (request: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
    const session = await getAuthenticatedSession();
    const id = mongoIdSchema.parse((await params).id);

    if (!id) {
        return NextResponse.json({ success: false, message: "File ID is required.", data: null });
    }

    const body = await request.json();
    const json = filePatchSchema.parse(body);
    if (Object.keys(json).length <= 0) {
        return NextResponse.json({ success: false, message: "No fields provided to update.", data: null });
    } else {
        const existingFile = await db.file.findFirst({ where: { id: id, userId: session.user.id } });
        if (existingFile === null) {
            return NextResponse.json({ success: false, message: "File not found.", data: null });
        }
        const exists = await fileExists(session.user.id, [json.filename ?? existingFile.filename], json.path ?? existingFile.path, "isActive" in json && typeof json.isActive === "boolean" ? json.isActive! : existingFile.isActive);
        if (exists) {
            return NextResponse.json({ success: false, message: "File with the same path and name already exists.", data: null });
        }
        const updatedFile = await db.file.update({
            where: { id: id, userId: session.user.id }, data: {
                ...json,
                expiresAt: json.isActive === false ? new Date(Number(new Date()) + (1 * 60 * 1000)) : undefined
            }
        });
        return NextResponse.json({ success: true, message: "File updated successfully.", data: serializeBigInt(updatedFile) });
    }
});

export const DELETE = withErrorHandling(async (request: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
    const id = mongoIdSchema.parse((await params).id);
    const session = await getAuthenticatedSession();

    if (!id) {
        return NextResponse.json({ success: false, message: "File ID is required.", data: null });
    }

    const deletedFile = await db.file.delete({ where: { id: id, userId: session.user.id } });
    return NextResponse.json({ success: true, message: "File deleted successfully.", data: serializeBigInt(deletedFile) });
});

export const GET = withErrorHandling(async (request: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
    const id = mongoIdSchema.parse((await params).id);
    const session = await getAuthenticatedSession();

    if (!id) {
        return NextResponse.json({ success: false, message: "File ID is required.", data: null });
    }

    const file = await db.file.findFirst({ where: { id: id, userId: session.user.id } });
    return NextResponse.json({ success: true, message: "File fetched successfully.", data: serializeBigInt(file) });
});