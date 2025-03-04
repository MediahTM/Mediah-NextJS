"use server";

import db from '@/lib/prisma';
import { authOptions } from '@/utils/auth-options';
import { getServerSession } from 'next-auth/next';
import { NextRequest, NextResponse } from 'next/server';
import { uploadSchema } from '../upload/route';
import { z } from 'zod';

export async function GET(request: NextRequest) {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
        return NextResponse.json({ success: false, message: "User is not authenticated.", data: null });
    }

    const { searchParams } = new URL(request.url)
    const isActive = searchParams.get("isActive") === "true" ? true : false

    try {
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

    }
    catch (error: any) {
        return NextResponse.json({ success: false, message: error.message || "An error occurred while fetching files.", data: null });
    }
}

export async function PUT(request: NextRequest) {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
        return NextResponse.json({ success: false, message: "User is not authenticated.", data: null });
    }

    try {
        let file;
        try {
            const json = await request.json();
            json.parts = json.parts.map((part: string) => BigInt(part));
            json.channelID = BigInt(json.channelID);
            file = uploadSchema.extend({
                id: z.string(),
                isActive: z.boolean(),
                shareDate: z.preprocess((value) => new Date(value as string), z.date()).nullable(), 
                endDate: z.preprocess((value) => new Date(value as string), z.date()).nullable(),
                neverExpire: z.boolean(), 
                parts: z.array(z.bigint()),
                channelID: z.bigint()
            }).parse(json);
        } catch (error: any) {
            return NextResponse.json({ success: false, error: error.errors || 'An error occurred parsing the request.' });
        }

        const fileExists = await db.file.findFirst({
            where: {
                id: file.id,
                userId: session.user.id
            },
        });

        if (!fileExists) {
            return NextResponse.json({ success: false, message: "File does not exist!", data: null });
        }

        let updatedFile: any = await db.file.update({
            where: {
                id: fileExists.id,
            },
            data: {
                filename: file.filename,
                userId: session.user.id,
                uploadedSize: file.uploadedSize || fileExists.uploadedSize,
                updatedAt: new Date(),
                isActive: file.isActive ?? fileExists.isActive,
                shareDate: file.shareDate ? new Date(file.shareDate) : null,
                endDate: file.endDate ? new Date(file.endDate) : null,
                neverExpire: file.neverExpire ? true : false,
                parts: file.parts || fileExists.parts,
            },
        });
        updatedFile.parts = updatedFile.parts.map((part: BigInt) => String(part).padStart(19, '0'));
        updatedFile.channelID = String(updatedFile.channelID).padStart(19, '0');
        return NextResponse.json({ success: true, message: "File updated successfully!", data: updatedFile });
    }
    catch {
        return NextResponse.json({ success: false, message: "An error occurred while processing the file.", data: null });
    }
}

export async function DELETE(request: NextRequest) {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
        return NextResponse.json({ success: false, message: "User is not authenticated.", data: null });
    }

    try {
        const { searchParams } = new URL(request.url);
        const fileId = searchParams.get("id");

        if (!fileId) {
            return NextResponse.json({ success: false, message: "File ID is required.", data: null });
        }

        const deletedFile = await db.file.delete({
            where: {
                id: fileId,
                userId: session.user.id
            },
        });

        return NextResponse.json({
            success: true,
            message: "File deleted successfully.",
            data: deletedFile,
        });
    }
    catch (error: any) {
        return NextResponse.json({ success: false, message: error.message || "An error occurred while deleting the file.", data: null });
    }
}