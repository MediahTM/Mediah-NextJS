import React from 'react'
import { MagicCard } from '../magicui/magic-card'
import { cn } from '@/lib/utils'

const MagicCardWrapped = ({ children, className }: { children?: React.ReactNode, className?: string }) => {
    return (
        <MagicCard araria-labelledby={'card'} className={cn('rounded-md', className)} gradientColor='hsl(var(--secondary) / 0.5)' gradientFrom='hsl(var(--primary))' gradientTo='hsl(var(--accent))'>
            {children}
        </MagicCard>
    )
}

export default MagicCardWrapped