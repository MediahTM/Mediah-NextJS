"use client";

import type { StatisticsResponse } from '@/types/statistics/statistics-response';
import React, { useEffect, useState } from 'react'
import StatisticsCard from './statistics-card';
import { CopyCheck, FileIcon, HardDrive } from 'lucide-react';
import { formatBytes } from '@/lib/helpers';
import { Session } from 'next-auth';
import Link from 'next/link';
import { Button, buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useStatusBar } from '@/utils/status-bar-context';
import { createJob } from '@/utils/status-bar-jobs';
import { toast } from 'sonner';

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
            <Button onClick={async () => {
                await createJob(setStatusBar, "This is a test", CopyCheck, async () => {
                    return new Promise(async (resolve) => {
                        let cancelState = false;
                        setStatusBar(prev => ({
                            ...prev, title: "I am an item in the queue", onCancel: () => {
                                cancelState = true;
                            }
                        }))
                        for (let i = 0; i < 200; i++) {
                            setStatusBar(prev => ({ ...prev, progress: prev.progress + 0.5 }))
                            if (cancelState) break;
                            if (i === 50) {
                                setStatusBar(prev => ({ ...prev, description: "This is a description" }))
                            }
                            if (i === 100) {
                                setStatusBar(prev => ({ ...prev, description: "" }))
                            }
                            await new Promise((resolve) => setTimeout(resolve, 50));
                        }
                        resolve();
                    })
                })
            }}>Add a thing to the queue</Button>
        </div>
    )
}

export default StatisticsView