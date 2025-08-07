"use server";
import { z } from "zod";
import { NextRequest, NextResponse } from "next/server";
import { uploadSchema } from "../../upload/route";
import db from "@/lib/prisma";
import { serializeBigInt } from "@/lib/helpers";
import { withErrorHandling } from "@/utils/api-error-handling";
import { getAuthenticatedSession } from "@/utils/api-session-auth";

const filePatchSchema = uploadSchema.extend({
    isActive: z.boolean(),
    shareDate: z.preprocess((value) => {
        if (!value) return null;
        const date = new Date(value as string)
        return isNaN(date.getTime()) ? null : date
    }, z.date()).nullable(),
    endDate: z.preprocess((value) => {
        if (!value) return null;
        const date = new Date(value as string)
        return isNaN(date.getTime()) ? null : date
    }, z.date()).nullable(),
    neverExpire: z.boolean(),
    parts: z.array(z.preprocess((val) => val ? BigInt(val as string) : null, z.bigint())),
    channelID: z.preprocess((val) => val ? BigInt(val as string) : null, z.bigint())
}).partial();

export const PATCH = withErrorHandling(async (request: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
    const { id } = await params;

    if (!id) {
        return NextResponse.json({ success: false, message: "File ID is required.", data: null });
    }

    const body = await request.json();
    const json = filePatchSchema.parse(body);
    if (Object.keys(json).length <= 0) {
        return NextResponse.json({ success: false, message: "No fields provided to update.", data: null });
    } else {
        const updatedFile = await db.file.update({ where: { id: id }, data: json });
        return NextResponse.json({ success: true, message: "File updated successfully.", data: serializeBigInt(updatedFile) });
    }
});

export const DELETE = withErrorHandling(async (request: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
    const { id } = await params;
    const session = await getAuthenticatedSession();

    if (!id) {
        return NextResponse.json({ success: false, message: "File ID is required.", data: null });
    }

    const deletedFile = await db.file.delete({ where: { id: id, userId: session.user.id } });
    return NextResponse.json({ success: true, message: "File deleted successfully.", data: deletedFile });
});

export const GET = withErrorHandling(async (request: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
    const { id } = await params;
    const session = await getAuthenticatedSession();

    if (!id) {
        return NextResponse.json({ success: false, message: "File ID is required.", data: null });
    }

    const file = await db.file.findFirst({ where: { id: id, userId: session.user.id } });
    return NextResponse.json({ success: true, message: "File fetched successfully.", data: serializeBigInt(file) });
});