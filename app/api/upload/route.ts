import db from '@/lib/prisma';
import { withErrorHandling } from '@/utils/api-error-handling';
import { getAuthenticatedSession } from '@/utils/api-session-auth';
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

export const POST = withErrorHandling(async (request: NextRequest) => {
    const session = await getAuthenticatedSession();

    const data = uploadSchema.parse(await request.json());

    const newFile = await db.file.create({
        data: {
            ...data,
            parts: data.parts.map((part) => BigInt(part)),
            channelID: BigInt(data.channelID),
            chunkSize: data.chunkSize,
            userId: session.user.id,
        }
    });
    return NextResponse.json({
        success: true, message: 'File uploaded successfully.', data: {
            ...newFile,
            channelID: String(newFile.channelID).padStart(19, '0'),
            parts: newFile.parts.map((part) => String(part).padStart(19, '0'))
        }
    });
});