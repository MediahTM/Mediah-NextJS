"use server";

import { authOptions } from "@/utils/authOptions";
import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";
import db from "@/lib/prisma";

export async function GET() {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
        return NextResponse.json({ success: false, message: "User is not authenticated.", data: null });
    }

    const files = await db.file.findMany({
        where: {
            userId: session.user.id
        }
    })

    const totalFiles = files.length;
    const totalStorage = files.reduce((sum, file) => sum + (file.uploadedSize || 0), 0);

    return NextResponse.json({
        success: true, message: null, data: {
            totalFiles: totalFiles,
            totalStorage: totalStorage
        }
    });
}