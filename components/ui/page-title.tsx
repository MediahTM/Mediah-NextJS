import { cn } from '@/lib/utils'
import React from 'react'

const PageTitle = ({ title, description, className }: { title: string, description?: string, className?: string }) => {
    return (
        <div className="space-y-1 2xl:py-6 lg:py-4 py-3">
            <h1 className={cn('font-black text-3xl', className)}>
                {title}
            </h1>
            {description && (
                <p className='text-muted-foreground text-sm font-medium'>{description}</p>
            )}
        </div>
    )
}

export default PageTitle