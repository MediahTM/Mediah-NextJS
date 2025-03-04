import db from '@/lib/prisma';
import { authOptions } from '@/utils/auth-options';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

export const uploadSchema = z.object({
    filename: z.string({ message: "File name is required!" }).min(1, 'File name is required!').max(255, 'File name is too long!').refine((name) => !name.includes('/'), 'File name cannot contain "/"'),
    uploadedSize: z.number({ message: "File size is required!" }).min(1, 'File size is required!'),
    path: z.string({ message: "File path is required!" }).min(1, 'File path is required!'),
    encryptedFilename: z.string({ message: "Encrypted file name is required!" }).min(1, 'Encrypted file name is required!'),
    parts: z.array(z.string()).min(1, 'At least one part is required!'),
    channelID: z.string(),
    chunkSize: z.number(),
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
        const newFile = await db.file.create({
            data: {
                ...data,
                parts: data.parts.map((part) => BigInt(part)),
                channelID: BigInt(data.channelID),
                chunkSize: data.chunkSize,
                userId: session.user.id,
            }
        });
        return NextResponse.json({ success: true, message: 'File uploaded successfully.', data: {
            ...newFile,
            channelID: String(newFile.channelID).padStart(19, '0'),
            parts: newFile.parts.map((part) => String(part).padStart(19, '0'))
        } });
    } catch (error: any) {
        return NextResponse.json({ success: false, message: error.message || 'An error occurred uploading the file.'});
    }
}