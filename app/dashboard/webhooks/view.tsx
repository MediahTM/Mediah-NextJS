"use client"

import React, { useState } from 'react'
import NewWebhook from './create-dialog';
import Container from '@/components/ui/container'
import PageTitle from '@/components/ui/page-title'
import WebhooksTable from './data-table'

const WebhooksView = () => {
    const [reload, setReload] = useState<boolean>(false);

    return (
        <Container>
            <PageTitle title='Webhooks' description='Manage your file part endpoints' />
            <div className="space-y-4">
                <NewWebhook reload={reload} setReload={setReload} />
                <WebhooksTable reload={reload} setReload={setReload} />
            </div>
        </Container>
    )
}

export default WebhooksView