import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import React from 'react'

const StatisticsCard = ({ title, description, icon, value }: { title: string, description: string, icon: React.ReactNode, value: string | undefined }) => {
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
            <CardContent>
                <h1 className='text-2xl font-bold tracking-wide'>{value}</h1>
            </CardContent>
        </Card>
    )
}

export default StatisticsCard