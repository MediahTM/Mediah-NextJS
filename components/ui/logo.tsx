import { getSiteLogo } from '@/lib/helpers'
import { cn } from '@/lib/utils'
import React from 'react'

const Logo = ({ className }: { className?: string }) => {
    return (
        <img src={getSiteLogo()} alt="Mediah" className={cn('aspect-square', className)} />
    )
}

export default Logo