"use server";

import { authOptions } from "../auth/[...nextauth]/route";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import db from "@/lib/prisma";

export async function POST(request: NextRequest) {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
        return NextResponse.json({ success: false, message: "User is not authenticated.", data: null });
    }

    try {
        const file = await request.json();

        if (!file || !file.filename || !file.email) {
            return NextResponse.json({ success: false, message: "Missing required file data", data: null });
        }

        const fileExists = await db.file.findFirst({
            where: {
                filename: file.filename,
                userId: session.user.id
            },
        });

        if (fileExists) {
            return NextResponse.json({ success: false, message: "File already exists!", data: fileExists });
        }

        const createdFile = await db.file.create({
            data: {
                filename: file.filename as string,
                userId: session.user.id!,
                uploadedSize: file.uploadedSize || 0,
                uploadedAt: new Date(),
                updatedAt: new Date(),
                isActive: file.isActive ?? true,
                shareDate: file.shareDate ? new Date(file.shareDate) : null,
                endDate: file.endDate ? new Date(file.endDate) : null,
                parts: file.parts || [],
            },
        });

        return NextResponse.json({ success: true, message: "File created successfully!", data: createdFile });
    }
    catch {
        return NextResponse.json({ success: false, message: "An error occurred while processing the file.", data: null });
    }
}

export async function GET(request: NextRequest) {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
        return NextResponse.json({ success: false, message: "User is not authenticated.", data: null });
    }

    const url = new URL(request.url)
    const isActive = url.searchParams.get("isActive") === "true" ? true : false

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
            data: files,
        });

    }
    catch (error) {
        console.error("Error fetching files:", error);
        return NextResponse.json({ success: false, message: "An error occurred while fetching files.", data: null });
    }
}

export async function PUT(request: NextRequest) {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
        return NextResponse.json({ success: false, message: "User is not authenticated.", data: null });
    }

    try {
        const file = await request.json();

        if (!file || !file.filename || !file.email) {
            return NextResponse.json({ success: false, message: "Missing required file data", data: null });
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

        const updatedFile = await db.file.update({
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
        const { fileId } = await request.json();

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
    catch (error) {
        console.error("Error deleting file:", error);
        return NextResponse.json({ success: false, message: "An error occurred while deleting the file.", data: null });
    }
}