import { cn } from '@/lib/utils'
import React from 'react'

const Container = ({ children, className }: { children: React.ReactNode, className?: string }) => {
    return (
        <div className={cn('container mx-auto w-full h-full overflow-hidden max-h-full flex-1', className)}>
            {children}
        </div>
    )
}

export default Container