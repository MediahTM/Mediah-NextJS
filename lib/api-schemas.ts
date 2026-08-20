import z from "zod";
import { containsIllegalCharacters, parsePath, replaceIllegalCharacters } from "./helpers";
import { MAX_FILE_PATH } from "./constants";

export const pathSchema = z.preprocess(
    (val) => typeof val === 'string' ? val : parsePath(val as string),
    z.string().min(1, 'File path is required.').refine((val) => !containsIllegalCharacters(val, "path"), 'File path contains illegal characters.').max(MAX_FILE_PATH, 'File path is too long.')
)

export const mongoIdSchema = z.string().length(24, 'Invalid ID. ID must be 24 characters long.');

export const uploadSchema = z.object({
    filename: z.preprocess(
        (val) => typeof val === 'string' ? val : replaceIllegalCharacters(val ? val as string : "", "filename"),
        z.string({ message: "File name is required." }).min(1, 'File name is required.').max(255, 'File name is too long.')
    ),
    uploadedSize: z.number({ message: "File size is required." }).min(0, 'File size must be at least 0 bytes.'),
    path: pathSchema,
    encryptedFilename: z.string({ message: "Encrypted file name is required." }).min(1, 'Encrypted file name is required.'),
    parts: z.array(z.string()).min(1, 'At least one part is required.'),
    channelID: z.string(),
    chunkSize: z.number(),
});

export const baseShareSchema = z.object({
    key: z.string(),
    type: z.enum(["file", "folder"])
})

export const shareSchema = baseShareSchema.extend({
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

export const renewSchema = z.object({
    encryptedFilename: z.string({ message: "Encrypted file name is required!" }).min(1, 'Encrypted file name is required!'),
    messageIDs: z.array(z.string()).min(1, 'At least one message ID is required!'),
    channelID: z.string()
});

export const filePatchSchema = uploadSchema.extend({
    isActive: z.boolean(),
    shareDate: z.preprocess((value) => {
        if (!value) return null;
        const date = new Date(value as string)
        return isNaN(date.getTime()) ? null : date
    }, z.date()).nullable(),
    endDate: z.preprocess((value) => {
        if (!value) return null;
        const date = new Date(value as string)
        return isNaN(date.getTime()) ? null : date
    }, z.date()).nullable(),
    neverExpire: z.boolean(),
    parts: z.array(z.preprocess((val) => val ? BigInt(val as string) : null, z.bigint())),
    channelID: z.preprocess((val) => val ? BigInt(val as string) : null, z.bigint())
}).partial();

export const fileManyDeleteSchema = z.object({
    ids: z.array(mongoIdSchema).min(1, 'At least one file ID is required!'),
})

export const fileManyPatchSchema = filePatchSchema.extend({
    ids: z.array(mongoIdSchema).min(1, 'At least one file ID is required!'),
});

export const editPathSchema = z.object({
    old: pathSchema,
    new: pathSchema
})

export const importFileSchema = z.object({
    filename: z.string(),
    uploadedSize: z.preprocess(
        (value) => {
            if (typeof value === 'string' && value.trim() !== '') {
                return Number(value);
            }

            return value;
        },
        z.number()
    ),
    parts: z.array(z.string()),
    encryptedFilename: z.string(),
    channelID: z.string(),
    chunkSize: z.preprocess(
        (value) => {
            if (typeof value === 'string' && value.trim() !== '') {
                return Number(value);
            }

            return value;
        },
        z.number()
    ),
    uploadedAt: z.string(),
    updatedAt: z.string(),
});