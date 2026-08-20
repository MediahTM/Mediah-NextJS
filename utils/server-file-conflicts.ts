"use server";
import db from '@/lib/prisma';

export const fileExists = async (userId: string, filenames: string[], path: string, isActive: boolean): Promise<boolean> => {
    const existingFile = await db.file.findFirst({
        where: {
            filename: {
                in: filenames
            },
            path: path,
            userId: userId,
            isActive: isActive
        }
    });
    return existingFile ? true : false
}