import { DISCORD_ATTACHMENT_REGEX, DISCORD_ATTACHMENT_RENEW_API, DEFAULT_USER_AGENT } from '@/lib/constants';
import { NextRequest, NextResponse } from 'next/server';
import { getFilePartUrl } from '@/lib/helpers';
import { withErrorHandling } from '@/utils/api-error-handling';
import { renewSchema } from '@/lib/api-schemas';

export const POST = withErrorHandling(async (request: NextRequest) => {
    const data = renewSchema.parse(await request.json());

    try {
        const urls = data.messageIDs.map((id: string) => getFilePartUrl(data.channelID, id, data.encryptedFilename));
    
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
            body: JSON.stringify({ "attachment_urls": urls }),
        });
    
        if (!response.ok) {
            return NextResponse.json({ success: false, message: 'Failed to renew hooks.', hooks: [] });
        }
    
        const renewedUrls = (await response.json()).refreshed_urls.map((url: { refreshed: string }) => url.refreshed);
    
        return NextResponse.json({ success: true, message: 'Hooks renewed successfully.', hooks: renewedUrls });
    } catch (error: any) {
        return NextResponse.json({ success: false, message: error.message || 'An error occurred renewing the hooks.', hooks: [] });
    }
});