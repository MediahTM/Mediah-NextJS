import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { getInitials } from '@/lib/helpers'
import db from '@/lib/prisma'
import React from 'react'


const AvatarBlock = ({ account }: { account: Awaited<ReturnType<typeof db.user.findUnique>> }) => {
  return (
    <span className="flex items-center justify-center gap-2 h-full">
        <Avatar className="h-8 w-8 rounded-lg">
            {account?.image ? <AvatarImage src={account?.image} /> : <AvatarFallback className="rounded-lg">{getInitials(account?.name || '')}</AvatarFallback>}
        </Avatar>
        <span className='font-bold text-xl'>{account?.name}</span>
    </span>
  )
}

export default AvatarBlock