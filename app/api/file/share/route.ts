import db from "@/lib/prisma";
import { withErrorHandling } from "@/utils/api-error-handling";
import { getAuthenticatedSession } from "@/utils/api-session-auth";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const baseShareSchema = z.object({
    key: z.string(),
    type: z.enum(["file", "folder"])
})

const shareSchema = baseShareSchema.extend({
    key: z.string(),
    type: z.enum(["file", "folder"]),
    endDate: z.preprocess((value) => {
        if (!value) return undefined;
        const date = new Date(value as string);
        return isNaN(date.getTime()) ? undefined : date;
    }, z.date()).optional().nullable(),
    neverExpire: z.boolean().optional(),
}).refine((data) => {
    return [data.endDate, data.neverExpire].filter((val) => val !== undefined).length === 1;
}, {
    message: 'Exactly one of "endDate" or "neverExpire" must be provided',
    path: ['endDate', 'neverExpire']
});

export const POST = withErrorHandling(async (request: NextRequest) => {
    const session = await getAuthenticatedSession();

    const body = await request.json();
    const json = shareSchema.parse(body);
    if (json.type === "file") {
        const file = await db.file.findFirst({
            where: {
                id: json.key, // json.key acts as the file ID
                userId: session.user.id
            }
        })
        if (!file) {
            return NextResponse.json({ success: false, message: "File not found.", data: null });
        }
    } else {
        const file = await db.file.findFirst({
            where: {
                path: {
                    startsWith: json.key // json.key acts as the folder name
                }
            }
        })
        if (!file) {
            return NextResponse.json({ success: false, message: "Folder not found.", data: null });
        }
    }
    const shareObject = await db.share.findFirst({
        where: {
            key: json.key,
            type: json.type,
            userId: session.user.id
        }
    })
    if (shareObject) {
        const newObject = await db.share.update({
            where: {
                id: shareObject.id
            },
            data: {
                shareDate: new Date(new Date().getTime() - 1 * 1000),
                ...(json.endDate ? { endDate: json.endDate, neverExpire: false } : {}),
                ...(json.neverExpire ? { neverExpire: json.neverExpire, endDate: null, shareDate: null } : {})
            }
        })
        return NextResponse.json({ success: true, message: `${json.type.charAt(0).toUpperCase() + json.type.slice(1)} share updated successfully.`, data: newObject });
    }
    const newObject = await db.share.create({
        data: {
            userId: session.user.id,
            key: json.key,
            type: json.type,
            shareDate: new Date(new Date().getTime() - 1 * 1000),
            ...(json.endDate ? { endDate: json.endDate } : {}),
            ...(json.neverExpire ? { neverExpire: json.neverExpire } : {})
        }
    })
    return NextResponse.json({ success: true, message: `${json.type.charAt(0).toUpperCase() + json.type.slice(1)} shared successfully.`, data: newObject });
});

export const GET = withErrorHandling(async () => {
    const session = await getAuthenticatedSession();
    const shareList = await db.share.findMany({
        where: {
            userId: session.user.id
        }
    })

    return NextResponse.json({ success: true, message: "File share list fetched successfully.", data: shareList });
});

export const DELETE = withErrorHandling(async (req: NextRequest) => {
    const session = await getAuthenticatedSession();

    const body = await req.json();
    const json = baseShareSchema.parse(body);
    const deletedShare = await db.share.delete({
        where: {
            userId_key_type: {
                userId: session.user.id,
                key: json.key,
                type: json.type
            }
        }
    });

    return NextResponse.json({ success: true, message: `${json.type.charAt(0).toUpperCase() + json.type.slice(1)} share deleted successfully.`, data: deletedShare });
});