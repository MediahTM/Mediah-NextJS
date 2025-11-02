"use client"
import { UserProps } from '@/app/api/get-user/[id]/route'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { getInitials } from '@/lib/helpers'
import db from '@/lib/prisma'
import { cn } from '@/lib/utils'
import axios from 'axios'
import React, { useEffect, useState } from 'react'

const AvatarBlock = ({ account, className, textClassName }: { account: Awaited<ReturnType<typeof db.user.findUnique>> | UserProps, className?: string, textClassName?: string }) => {
  const [blobURL, setBlobURL] = useState<string | undefined>(undefined);
  useEffect(() => {
    if (account && account.image) {
      (async () => {
        try {
          const request = await axios.get(account.image!, { responseType: 'blob' });
          const blob = request.data;
          const objectURL = URL.createObjectURL(blob);
          setBlobURL(objectURL);
        } catch { }
      })();
    }
  }, []);
  return (
    <span className={cn("flex items-center justify-center gap-2 h-full", className)}>
      <Avatar className="h-8 w-8 rounded-[3px]">
        {blobURL ? <AvatarImage src={blobURL} /> : <AvatarFallback className="rounded-lg">{getInitials(account?.name || '')}</AvatarFallback>}
      </Avatar>
      <span className={cn('font-bold text-xl', textClassName)}>{account?.name}</span>
    </span>
  )
}

export default AvatarBlock