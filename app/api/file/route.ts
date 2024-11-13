"use server";

import { authOptions } from "../auth/[...nextauth]/route";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import db from "@/lib/prisma";

export async function POST(request: NextRequest) {
    const session = await getServerSession(authOptions);

    if (!session) {
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
                email: file.email,
            },
        });

        if (fileExists) {
            return NextResponse.json({ success: false, message: "File already exists!", data: fileExists });
        }

        const createdFile = await db.file.create({
            data: {
                filename: file.filename,
                email: file.email,
                uploadedSize: file.uploadedSize || 0,
                uploadedAt: new Date(),
                updatedAt: new Date(),
                isActive: file.isActive ?? true,
                shareDate: file.shareDate ? new Date(file.shareDate) : null,
                endDate: file.endDate ? new Date(file.endDate) : null,
                parts: file.parts || []
            },
        });

        return NextResponse.json({ success: true, message: "File created successfully!", data: createdFile });
    }
    catch {
        return NextResponse.json({ success: false, message: "An error occurred while processing the file.", data: null });
    }
}

export async function GET() {
    const session = await getServerSession(authOptions);

    if (!session) {
        return NextResponse.json({ success: false, message: "User is not authenticated.", data: null });
    }

    try {
        const email = session.user?.email

        if (!email) {
            return NextResponse.json({
                success: false,
                message: "Email query parameter is required.",
                data: null
            });
        }

        const files = await db.file.findMany({
            where: {
                email: email,
            },
        });

        return NextResponse.json({
            success: true,
            message: "Files fetched successfully.",
            data: files,
        });
    } catch (error) {
        console.error("Error fetching files:", error);
        return NextResponse.json({ success: false, message: "An error occurred while fetching files.", data: null });
    }
}