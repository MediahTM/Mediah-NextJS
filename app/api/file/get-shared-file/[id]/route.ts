import { serializeBigInt } from "@/lib/helpers";
import db from "@/lib/prisma";
import { withErrorHandling } from "@/utils/api-error-handling";
import { NextResponse, NextRequest } from "next/server";

export const GET = withErrorHandling(async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
    const { id } = await params;

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

    console.log(shareObject.shareDate?.getFullYear());
    
    return NextResponse.json({
        message: null,
        success: true,
        data: serializeBigInt({ ...file, shareDate: shareObject.shareDate || null, endDate: shareObject.endDate || null, neverExpire: shareObject.neverExpire }),
    });
});