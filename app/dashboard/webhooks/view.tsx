"use client"

import React from 'react'
import NewWebhook from './create-webhook';
import Container from '@/components/ui/container'
import PageTitle from '@/components/ui/page-title'
import WebhooksTable from './data-table'
import { Button } from '@/components/ui/button';
import RefreshSpinner from '@/components/ui/refresh-spinner';
import { useWebhooks } from '@/utils/webhooks-context';

const WebhooksView = () => {
    const { loading, fetching, refetching, fetchWebhooks } = useWebhooks();
    return (
        <Container className='overflow-hidden w-full'>
            <div className="flex justify-between items-center">
                <PageTitle title='Webhooks' description='Manage your file part endpoints' />
                <Button variant="outline" size="icon" onClick={fetchWebhooks} disabled={fetching} className='w-8 h-8 shrink-0 mr-[1px]' aria-label='Refetch webhooks'>
                    <RefreshSpinner loading={loading} refetching={refetching} />
                </Button>
            </div>
            <div className="space-y-4">
                <NewWebhook />
                <WebhooksTable />
            </div>
        </Container>
    )
}

export default WebhooksView