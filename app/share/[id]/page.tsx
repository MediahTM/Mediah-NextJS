import React from 'react'
import ShareViewClient from './view';
import { Metadata } from 'next';
import db from '@/lib/prisma';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
    const { id } = await params;
    if (id.length === 24) {
            const share = await db.share.findFirst({
                where: {
                    id: String(id)
                }
            })
            return {
                title: share ? `Shared ${share.type.charAt(0).toUpperCase() + share.type.slice(1)}` : 'Unknown Share',
            }
    }
    return {
        title: 'Unknown Share',
    }
}

export type SharePageProps = {
    id: string
}

const SharePage = ({ params }: { params: Promise<SharePageProps> }) => {
    return (
        <ShareViewClient params={params} />
    )
}

export default SharePage