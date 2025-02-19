"use client";

import Container from '@/components/ui/container';
import PageTitle from '@/components/ui/page-title'
import React from 'react'

const SettingsView = () => {
    return (
        <Container>
            <PageTitle title="Settings" description='Your look and feel of Mediah' />
            <div className="space-y-4">
                <h1>Settings View</h1>
            </div>
        </Container>
    )
}

export default SettingsView