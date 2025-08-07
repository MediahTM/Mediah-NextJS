"use client"
import React, { useEffect, useRef, useState } from 'react';
import { CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MagicCard } from "@/components/magicui/magic-card";
import { Progress } from '@/components/ui/progress';
import MagicCardWrapped from '@/components/ui/magic-card-wrapped';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

const StatisticsCard = ({ title, description, icon, valueCallback, duration = 1, loading = false, progress, loadingClassName = 'h-9' }: { title: string, description?: string, icon: React.ReactNode, valueCallback: (percent: number) => string, duration?: number, loading?: boolean, progress?: number, loadingClassName?: string }) => {
    const [value, setValue] = useState(valueCallback(0));
    const current = useRef(0);

    useEffect(() => {
        if (current.current >= 1) return;
        const stepTime = 16;
        const steps = duration * 1000 / stepTime;

        const interval = setInterval(() => {
            if (loading) return;
            current.current += 1 / steps;
            if (current.current >= 1) current.current = 1;

            const easedProgress = current.current * (2 - current.current);
            setValue(valueCallback(easedProgress * 100));

            if (current.current >= 1) {
                clearInterval(interval);
            }
        }, stepTime);

        return () => clearInterval(interval);
    }, [duration, valueCallback]);

    const [renderedProgress, setRenderedProgress] = useState(0);

    useEffect(() => {
        if (progress && !loading) setTimeout(() => setRenderedProgress(progress), 100);
    }, [progress, loading]);

    return (
        <MagicCardWrapped>
            <CardHeader>
                <CardTitle id={title}>
                    <div className="flex items-center gap-2">
                        {icon}
                        {title || ''}
                    </div>
                </CardTitle>
                {description && <CardDescription>{description}</CardDescription>}
            </CardHeader>
            <CardContent className='flex justify-center'>
                {!loading ? (
                    <div className='flex flex-col gap-2 w-full'>
                        <h1 className='text-2xl font-bold tracking-wide'>{value}</h1>
                        {typeof progress !== "undefined" && <Progress className='w-full' value={renderedProgress} />}
                    </div>
                ) : (
                    <Skeleton className={cn('w-full', loadingClassName)} />
                )}
            </CardContent>
        </MagicCardWrapped>
    )
}

export default StatisticsCard