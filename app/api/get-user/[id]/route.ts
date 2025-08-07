import db from "@/lib/prisma";
import { withErrorHandling } from "@/utils/api-error-handling";
import { NextRequest, NextResponse } from "next/server";

export type UserProps = {
    id: string;
    name: string;
    image: string;
} 

export const GET = withErrorHandling(async (req: NextRequest,  { params }: { params: Promise<{ id: string }> }) => {
    const { id } = await params;
    if (!id) {
        return NextResponse.json({ success: false, message: "User ID is required.", data: null });
    }
    const user = await db.user.findFirst({ where: { id: id } });
    if (!user) {
        return NextResponse.json({ success: false, message: "User not found.", data: null });
    }
    return NextResponse.json({ success: true, message: "User details fetched successfully.", data: {
        id: user.id,
        name: user.name,
        image: user.image
    } });
});