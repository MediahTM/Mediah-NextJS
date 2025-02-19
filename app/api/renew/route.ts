import { DISCORD_ATTACHMENT_REGEX, DISCORD_ATTACHMENT_RENEW_API, DEFAULT_USER_AGENT } from '@/lib/constants';
import { NextRequest, NextResponse } from 'next/server';
import { authOptions } from '@/utils/auth-options';
import { getServerSession } from 'next-auth';

export async function POST(request: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
        return NextResponse.json({ success: false, message: 'User is not authenticated.', hooks: [] });
    }

    const { urls } = await request.json() as { urls: string[] }

    if (urls.length > 50) {
        return NextResponse.json({ success: false, message: 'Too many attachments.', hooks: [] });
    }

    urls.map((url) => {
        if (!DISCORD_ATTACHMENT_REGEX.test(url)) {
            return NextResponse.json({ success: false, message: 'Invalid Discord attachment URL.', hooks: [] });
        }
    })
    
    const token = JSON.parse(process.env.DISCORD_TOKENS!)[Math.floor(Math.random() * JSON.parse(process.env.DISCORD_TOKENS!).length)]

    const response = await fetch(DISCORD_ATTACHMENT_RENEW_API, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            "Authorization": token,
            "User-Agent": DEFAULT_USER_AGENT
        },
        body: JSON.stringify({ "attachment_urls" : urls }),
    });

    if (!response.ok) {
        return NextResponse.json({ success: false, message: 'Failed to renew hooks.', hooks: [] });
    }

    const renewedUrls = (await response.json()).refreshed_urls.map((url: { refreshed: string }) => url.refreshed);

    return NextResponse.json({ success: true, message: 'Hooks renewed successfully.', hooks: renewedUrls });
}