"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import CopyLink from '@/components/ui/copy-link'
import { CheckIcon } from 'lucide-react';
import { Session } from 'next-auth'
import React from 'react'

const ReferralLink = ({ session }: { session: Session | null }) => {
    const referralLink = `${process.env.NEXT_PUBLIC_BASE_URL}/r/${session?.user?.discordId as string}/${btoa(session?.user?.id as string)}`
    return (
        <Card>
            <CardHeader>
                <CardTitle>Referral Link</CardTitle>
                <CardDescription>Generate and share your referral link</CardDescription>
            </CardHeader>
            <CardContent>
                <CopyLink link={referralLink} />
                {session?.user?.isReferral && <div className="space-y-1 mt-4">
                    <p className="text-sm text-green-500 flex items-center gap-2">
                        <CheckIcon className="min-w-4 min-h-4 max-w-4 max-h-4" />
                        <span className='text-xs sm:text-sm'>You&apos;ve already successfully referred someone. You have unlocked unlimited storage!</span>
                    </p>
                </div>}
            </CardContent>
        </Card>
    )
}

export default ReferralLink