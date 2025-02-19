import db from "@/lib/prisma";
import { authOptions } from "@/utils/auth-options";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { z } from 'zod';

const uploadSchema = z.object({
    filename: z.string({ message: "File name is required!" }).min(1, 'File name is required!').max(255, 'File name is too long!').refine((name) => !name.includes('/'), 'File name cannot contain "/"'),
    uploadedSize: z.number({ message: "File size is required!" }).min(1, 'File size is required!'),
    path: z.string({ message: "File path is required!" }).min(1, 'File path is required!'),
    parts: z.array(z.object({
        url: z.string({ message: "Part URL is required!" }).min(1, 'Part URL is required!'),
        size: z.number({ message: "Part size is required!" }).min(1, 'Part size is required!'),
    })).min(1, 'At least one part is required!')
})

export async function POST(request: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
        return NextResponse.json({ success: false, message: 'User is not authenticated.', hooks: [] });
    }
    let data;
    try {
        data = uploadSchema.parse(await request.json());
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.errors || 'An error occurred parsing the request.' });
    }
    try {
        await db.file.create({
            data: {
                userId: session.user.id,
                ...data
            }
        });
        return NextResponse.json({ success: true, message: 'File uploaded successfully.', data });
    } catch {
        return NextResponse.json({ success: false, message: 'An error occurred uploading the file.' });
    }
}