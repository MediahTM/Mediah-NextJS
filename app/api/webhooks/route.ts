"use server";

import { authOptions } from "@/utils/auth-options";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import db from "@/lib/prisma";

export async function POST(request: NextRequest) {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
        return NextResponse.json({ success: false, message: "User is not authenticated.", data: null });
    }

    try {
        const webhook = await request.json();

        if (!webhook || !webhook.name || !webhook.url) {
            return NextResponse.json({ success: false, message: "Missing required webhook data", data: null });
        }

        const existingWebhook = await db.webhook.findFirst({
            where: {
                url: webhook.url,
                userId: session.user.id,
            },
        });

        if (existingWebhook) {
            return NextResponse.json({
                success: false,
                message: "Webhook already exists!",
                data: existingWebhook,
            });
        }

        const createdWebhook = await db.webhook.create({
            data: {
                name: webhook.name,
                url: webhook.url,
                userId: session.user.id,
            },
        });

        return NextResponse.json({
            success: true,
            message: "Webhook created successfully!",
            data: createdWebhook,
        });
    }
    catch (error) {
        console.error("Error creating webhook:", error);
        return NextResponse.json({
            success: false,
            message: "An error occurred while creating the webhook.",
            data: null,
        });
    }
}

export async function GET() {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
        return NextResponse.json({ success: false, message: "User is not authenticated.", data: null });
    }

    try {
        const webhooks = await db.webhook.findMany({
            where: {
                userId: session.user.id,
            },
            orderBy: [
                {
                    updatedAt: "desc"
                }
            ]
        });

        return NextResponse.json({
            success: true,
            message: "Webhooks fetched successfully.",
            data: webhooks,
        });
    } catch (error) {
        console.error("Error fetching webhooks:", error);
        return NextResponse.json({ success: false, message: "An error occurred while fetching webhooks.", data: null });
    }
}

export async function PUT(request: NextRequest) {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
        return NextResponse.json({ success: false, message: "User is not authenticated.", data: null });
    }

    try {
        const { id, name, url } = await request.json();

        if (!id || !name || !url) {
            return NextResponse.json({ success: false, message: "Missing required webhook data", data: null });
        }

        const existingWebhook = await db.webhook.findUnique({
            where: {
                id,
            },
        });

        if (!existingWebhook || existingWebhook.userId !== session.user.id) {
            return NextResponse.json({
                success: false,
                message: "Webhook not found or access denied",
                data: null,
            });
        }

        const updatedWebhook = await db.webhook.update({
            where: {
                id,
            },
            data: {
                name,
                url,
            },
        });

        return NextResponse.json({
            success: true,
            message: "Webhook updated successfully!",
            data: updatedWebhook,
        });
    }
    catch (error) {
        console.error("Error updating webhook:", error);
        return NextResponse.json({
            success: false,
            message: "An error occurred while updating the webhook.",
            data: null,
        });
    }
}

export async function DELETE(request: NextRequest) {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
        return NextResponse.json({ success: false, message: "User is not authenticated.", data: null });
    }

    try {
        const { searchParams } = new URL(request.url);
        const webhookId = searchParams.get("id");

        if (!webhookId) {
            return NextResponse.json({ success: false, message: "Webhook ID is required.", data: null });
        }

        const deletedFile = await db.webhook.delete({
            where: {
                id: webhookId,
                userId: session.user.id
            },
        });

        return NextResponse.json({
            success: true,
            message: "Webhook deleted successfully.",
            data: deletedFile,
        });
    }
    catch (error: any) {
        return NextResponse.json({ success: false, message: error.message || "An error occurred while deleting the webhook.", data: null });
    }
}