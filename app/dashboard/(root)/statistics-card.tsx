"use client"
import React, { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const StatisticsCard = ({ title, description, icon, valueCallback, duration = 1, loading = false, children }: { title: string, description: string, icon: React.ReactNode, valueCallback: (percent: number) => string, duration?: number, loading?: boolean, children?: React.ReactNode }) => {
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

    return (
        <Card araria-labelledby={title}>
            <CardHeader>
                <CardTitle id={title}>
                    <div className="flex items-center gap-2">
                        {icon}
                        {title || ''}
                    </div>
                </CardTitle>
                <CardDescription>{description}</CardDescription>
            </CardHeader>
            <CardContent className='flex items-center justify-between'>
                <h1 className='text-2xl font-bold tracking-wide'>{value}</h1>
                {children}
            </CardContent>
        </Card>
    )
}

export default StatisticsCard