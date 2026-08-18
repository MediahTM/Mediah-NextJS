import { uploadSchema } from '@/lib/api-schemas';
import db from '@/lib/prisma';
import { withErrorHandling } from '@/utils/api-error-handling';
import { getAuthenticatedSession } from '@/utils/api-session-auth';
import { NextRequest, NextResponse } from 'next/server';

export const POST = withErrorHandling(async (request: NextRequest) => {
    const session = await getAuthenticatedSession();

    const data = uploadSchema.parse(await request.json());

    const existingFile = await db.file.findFirst({
        where: {
            filename: data.filename,
            path: data.path,
            userId: session.user.id
        }
    });
    if (existingFile) {
        return NextResponse.json({
            success: false, message: 'File with the same path and name already exists.', data: null
        });
    }

    const user = await db.user.findFirst({ where: { id: session.user.id } });
    if (!user) {
        return NextResponse.json({ success: false, message: 'User not found.', data: null });
    }

    const usedBytes = (await db.file.aggregate({
        _sum: {
            uploadedSize: true
        },
        where: {
            userId: session.user.id
        }
    }))._sum.uploadedSize || 0;

    const usedFiles = (await db.file.count({
        where: {
            userId: session.user.id
        }
    }));

    if (data.uploadedSize + usedBytes > user.maxBytes) {
        return NextResponse.json({ success: false, message: 'User storage limit exceeded.', data: null });
    }

    if (usedFiles >= user.maxFiles) {
        return NextResponse.json({ success: false, message: 'User file limit exceeded.', data: null });
    }

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