import { mongoIdSchema } from "@/lib/api-schemas";
import { escapeRegex, serializeBigInt } from "@/lib/helpers";
import db from "@/lib/prisma";
import { withErrorHandling } from "@/utils/api-error-handling";
import { NextResponse, NextRequest } from "next/server";

export const GET = withErrorHandling(async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
    const id = mongoIdSchema.parse((await params).id);

    const shareObject = await db.share.findFirst({
        where: {
            id: String(id)
        }
    })

    if (!shareObject) {
        return NextResponse.json({
            message: 'Could not find the shared details',
            success: false,
            data: null,
        });
    }

    if (shareObject.type === 'folder') {
        const files = await db.file.findMany({
            where: {
                path: {
                    startsWith: escapeRegex(shareObject.key)
                }
            }
        })
        if (!files) {
            return NextResponse.json({
                message: 'Could not find the shared folder',
                success: false,
                data: null,
            });
        }

        return NextResponse.json({
            message: null,
            success: true,
            type: shareObject.type,
            userId: shareObject.userId,
            key: shareObject.key,
            data: files.map((file) => serializeBigInt({ ...file, shareDate: shareObject.shareDate || null, endDate: shareObject.endDate || null, neverExpire: shareObject.neverExpire })),
        });
    }
    const file = await db.file.findFirst({
        where: {
            id: shareObject?.key,
            userId: shareObject?.userId
        }
    })

    if (!file) {
        return NextResponse.json({
            message: 'Could not find the shared file',
            success: false,
            data: null,
        });
    }

    return NextResponse.json({
        message: null,
        success: true,
        type: shareObject.type,
        userId: shareObject.userId,
        key: shareObject.key,
        data: serializeBigInt({ ...file, shareDate: shareObject.shareDate || null, endDate: shareObject.endDate || null, neverExpire: shareObject.neverExpire }),
    });
});