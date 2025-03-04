import { DISCORD_ATTACHMENT_REGEX, DISCORD_ATTACHMENT_RENEW_API, DEFAULT_USER_AGENT } from '@/lib/constants';
import { NextRequest, NextResponse } from 'next/server';
import { authOptions } from '@/utils/auth-options';
import { getServerSession } from 'next-auth';
import z from "zod";
import { getFilePartUrl } from '@/lib/helpers';

const renewSchema = z.object({
    encryptedFilename: z.string({ message: "Encrypted file name is required!" }).min(1, 'Encrypted file name is required!'),
    messageIDs: z.array(z.string()).min(1, 'At least one message ID is required!'),
    channelID: z.string()
})

export async function POST(request: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
        return NextResponse.json({ success: false, message: 'User is not authenticated.', hooks: [] });
    }

    let data;

    try {
        data = renewSchema.parse(await request.json());
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.errors || 'An error occurred parsing the request.' });
    }

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
}