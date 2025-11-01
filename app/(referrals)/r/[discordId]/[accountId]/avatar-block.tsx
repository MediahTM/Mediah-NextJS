import { UserProps } from '@/app/api/get-user/[id]/route'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { getInitials } from '@/lib/helpers'
import db from '@/lib/prisma'
import { cn } from '@/lib/utils'
import React from 'react'

const AvatarBlock = ({ account, className }: { account: Awaited<ReturnType<typeof db.user.findUnique>> | UserProps, className?: string }) => {
  return (
    <span className={cn("flex items-center justify-center gap-2 h-full", className)}>
      <Avatar className="h-8 w-8 rounded-[3px]">
        {account?.image ? <AvatarImage src={account?.image} /> : <AvatarFallback className="rounded-lg">{getInitials(account?.name || '')}</AvatarFallback>}
      </Avatar>
      <span className='font-bold text-xl'>{account?.name}</span>
    </span>
  )
}

export default AvatarBlock