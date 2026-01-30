import { editPathSchema } from "@/lib/api-schemas";
import { escapeRegex } from "@/lib/helpers";
import db from "@/lib/prisma";
import { withErrorHandling } from "@/utils/api-error-handling";
import { NextRequest, NextResponse } from "next/server";

export const POST = withErrorHandling(async (request: NextRequest) => {
    const data = editPathSchema.parse(await request.json());
    console.log(data)

    const files = await db.$runCommandRaw({
        update: "File",
        updates: [
            {
                q: { path: { $regex: "^" + escapeRegex(data.old) } },
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
    console.log(files)

    const shares = await db.$runCommandRaw({
        update: "Share",
        updates: [
            {
                q: {
                    type: "folder",
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