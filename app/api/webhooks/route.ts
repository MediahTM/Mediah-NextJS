"use server";

import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/prisma";
import { withErrorHandling } from "@/utils/api-error-handling";
import { getAuthenticatedSession } from "@/utils/api-session-auth";

export const POST = withErrorHandling(async (request: NextRequest) => {
    const session = await getAuthenticatedSession();

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
});

export const GET = withErrorHandling(async () => {
    const session = await getAuthenticatedSession();

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
});

export const PUT = withErrorHandling(async (request: NextRequest) => {
    const session = await getAuthenticatedSession();
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
});

export const DELETE = withErrorHandling(async (request: NextRequest) => {
    const session = await getAuthenticatedSession();

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
});