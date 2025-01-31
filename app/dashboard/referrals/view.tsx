"use client";

import React from 'react';
import Container from '@/components/ui/container';
import PageTitle from '@/components/ui/page-title';
import ReferralLink from './referral-link';
import { Session } from 'next-auth';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';

const ReferralsView = ({ session }: { session: Session | null }) => {
    const referralCards = [
        {
            title: "Grow the community",
            description: "Sharing your referral link is the best way to get our name out there!",
        },
        {
            title: "Only one referral",
            description: "Once you have referred one person, you will keep your rewards forever!",
        },
        {
            title: "Unlock unlimited storage",
            description: "Permanently remove the 25GB limit on file storage!",
        },
        {
            title: "Store your files forever",
            description: "Store your files without worrying about renewing subscriptions!",
        },
    ];

    return (
        <Container>
            <PageTitle
                title="Referrals"
                description="Invite your friends to Mediah to unlock completely unlimited storage"
            />
            <div className="space-y-8 flex-1 flex flex-col pb-6">
                <ReferralLink session={session} />
            </div>
            <div className="flex flex-col justify-center text-left">
                <PageTitle
                    title="Unlock unlimited storage forever"
                    description="Check out the benefits of sharing your referral link below"
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pb-4 break-words">
                    {referralCards.map((card, index) => (
                        <Card key={index}>
                            <CardHeader>
                                <CardTitle>{card.title}</CardTitle>
                                <CardDescription>{card.description}</CardDescription>
                            </CardHeader>
                        </Card>
                    ))}
                </div>
            </div>
            <div className="flex items-center justify-start">
                <Link
                    href="/dashboard/faq"
                    className="text-center text-muted-foreground hover:underline"
                >
                    Learn more about referrals on our FAQ
                </Link>
            </div>
        </Container>
    );
};

export default ReferralsView;