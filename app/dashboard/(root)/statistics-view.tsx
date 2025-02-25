"use client";

import Link from 'next/link';
import PageTitle from '@/components/ui/page-title';
import React, { useEffect, useState } from 'react';
import StatisticsCard from './statistics-card';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { FileIcon, HardDrive } from 'lucide-react';
import { formatBytes } from '@/lib/helpers';
import { Session } from 'next-auth';
import { Skeleton } from '@/components/ui/skeleton';
import type { StatisticsResponse } from '@/types/statistics/statistics-response';
import { toast } from 'sonner';
import { useFiles } from '@/utils/files-context';
import { useStatusBar } from '@/utils/status-bar-context';

const InitialStatistics: StatisticsResponse = {
    totalFiles: 0,
    totalStorage: 0
}

const StatisticsView = ({ session }: { session: Session | null }) => {
    const { setStatusBar } = useStatusBar();

    const { files, setFiles, fetchFiles, loading } = useFiles();

    useEffect(() => {
        fetchFiles();
    }, [])

    const totalFiles = files.length;
    const totalStorage = files.reduce((acc, file) => acc + file.uploadedSize, 0);

    return (
        <div className="grid sm:grid-cols-2 grid-cols-1 gap-6">
            <>
                <StatisticsCard
                    title={"Total Files"}
                    description={"All files in your account"}
                    icon={<FileIcon className='size-5' />}
                    loading={loading}
                    valueCallback={(percent: number) => `${Math.floor(percent * totalFiles / 100)}`}
                />

                <StatisticsCard
                    title={"Total Storage"}
                    description={"The sum of all bytes stored in your account"}
                    icon={<HardDrive className='size-5' />}
                    loading={loading}
                    valueCallback={(percent: number) => loading ? `0` : `${formatBytes(Math.floor(percent * totalStorage / 100))}${session?.user?.isReferral ? '' : ' / 25 GB'}`}
                >
                    {!session?.user?.isReferral && <div className='flex justify-end'>
                        <Link href='/dashboard/referrals' className={cn(buttonVariants({ variant: "link", size: "sm" }), "text-destructive")}>Remove this limit</Link>
                    </div>}
                </StatisticsCard>
            </>
        </div>
    )
}

export default StatisticsView