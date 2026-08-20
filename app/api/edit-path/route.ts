import { editPathSchema } from "@/lib/api-schemas";
import { escapeRegex } from "@/lib/helpers";
import db from "@/lib/prisma";
import { withErrorHandling } from "@/utils/api-error-handling";
import { getAuthenticatedSession } from "@/utils/api-session-auth";
import { fileExists } from "@/utils/server-file-conflicts";
import { NextRequest, NextResponse } from "next/server";

export const POST = withErrorHandling(async (request: NextRequest) => {
    const session = await getAuthenticatedSession();
    const data = editPathSchema.parse(await request.json());

    // find all names of files to be moved, then check if they already exist at the new path
    const filenamesResult = await db.$runCommandRaw({
        find: "File",
        filter: {
            path: { $regex: "^" + escapeRegex(data.old) },
            userId: {
                $oid: session.user.id,
            },
            isActive: true,
        },
        projection: {
            _id: 0,
            filename: 1,
        },
    });

    // @ts-ignore
    const filenames = filenamesResult.cursor.firstBatch.map(
        (file: any) => file.filename
    );

    if (await fileExists(session.user.id, filenames, data.new, true)) {
        return NextResponse.json({
            success: false, message: 'File with the same path and name already exists.', data: null
        });
    }

    const files = await db.$runCommandRaw({
        update: "File",
        updates: [
            {
                q: {
                    path: { $regex: "^" + escapeRegex(data.old) },
                    userId: {
                        $oid: session.user.id
                    },
                    isActive: true
                },
                u: [
                    {
                        $set: {
                            path: {
                                $replaceOne: {
                                    input: "$path",
                                    find: data.old,
                                    replacement: data.new
                                }
                            }
                        }
                    }
                ],
                multi: true
            }
        ]
    })

    const shares = await db.$runCommandRaw({
        update: "Share",
        updates: [
            {
                q: {
                    type: "folder",
                    userId: {
                        $oid: session.user.id
                    },
                    key: { $regex: "^" + escapeRegex(data.old) }
                },
                u: [
                    {
                        $set: {
                            key: {
                                $replaceOne: {
                                    input: "$key",
                                    find: data.old,
                                    replacement: data.new
                                }
                            }
                        }
                    }
                ],
                multi: true
            }
        ]
    })

    return NextResponse.json({ success: true, message: `Updated the path of ${files.nModified} files and ${shares.nModified} shares successfully.`, data: null });
});