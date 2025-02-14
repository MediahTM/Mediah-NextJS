"use client";

import type { StatisticsResponse } from '@/types/statistics/statistics-response';
import React, { useEffect, useState } from 'react'
import StatisticsCard from './statistics-card';
import { FileIcon, HardDrive } from 'lucide-react';
import { formatBytes } from '@/lib/helpers';
import { Session } from 'next-auth';
import Link from 'next/link';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useStatusBar } from '@/utils/status-bar-context';
import { toast } from 'sonner';
import PageTitle from '@/components/ui/page-title';

const InitialStatistics: StatisticsResponse = {
    totalFiles: 0,
    totalStorage: 0
}

const StatisticsView = ({ session }: { session: Session | null }) => {
    const { setStatusBar } = useStatusBar();
    const [statistics, setStatistics] = useState<StatisticsResponse>(InitialStatistics);

    useEffect(() => {
        fetch(`/api/statistics`, {
            next: { revalidate: 60 },
            method: "GET"
        })
            .then((response) => response.json())
            .then((response) => {
                if (response.success) {
                    setStatistics(response.data)
                }
                else {
                    toast.error("Could not fetch user statistics!")
                }
            })
    }, [])

    return (
        <>
            <div className="grid sm:grid-cols-2 grid-cols-1 gap-6">
                <StatisticsCard
                    title={"Total Files"}
                    description={"All files in your account"}
                    icon={<FileIcon className='size-5' />}
                    valueCallback={(percent: number) => `${Math.floor(percent * statistics?.totalFiles / 100)}`}
                />

                <StatisticsCard
                    title={"Total Storage"}
                    description={"The sum of all bytes stored in your account"}
                    icon={<HardDrive className='size-5' />}
                    valueCallback={(percent: number) => `${formatBytes(Math.floor(percent * statistics?.totalStorage / 100))}${session?.user?.isReferral ? '' : ' / 25 GB'}`}
                >
                    {!session?.user?.isReferral && <div className='flex justify-end'>
                        <Link href='/dashboard/referrals' className={cn(buttonVariants({ variant: "link", size: "sm" }), "text-destructive")}>Remove this limit</Link>
                    </div>}
                </StatisticsCard>
            </div>
            <div className="flex flex-col">
                <PageTitle title='Latest Files' />
                <div className="flex gap-2">
                    
                </div>
            </div>
        </>
    )
}

export default StatisticsView