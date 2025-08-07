import React from 'react'
import ShareViewClient from './view';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: "Shared File",
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