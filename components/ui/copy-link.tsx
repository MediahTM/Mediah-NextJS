"use client"
import React, { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Copy } from 'lucide-react'
import { Check } from 'lucide-react'

const CopyLink = ({ link }: { link: string }) => {
    const [ checkmark, setCheckmark ] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(link);
        setCheckmark(true);
        setTimeout(() => {
            setCheckmark(false);
        }, 3000);
    }

    return (
        <div className='flex items-center justify-center gap-4'>
            <Input
                value={link}
                readOnly
            />
            <Button
                onClick={handleCopy}
            >
                {checkmark ? <Check className='w-4 h-4'/> : <Copy className='w-4 h-4'/>}
            </Button>
        </div>
    )
}

export default CopyLink