"use client"
import { Button } from '@/components/ui/button'
import { signIn } from 'next-auth/react'
import React from 'react'
import { FaDiscord } from 'react-icons/fa'

const LoginButton = ({ accountId, discordId }: { accountId: string, discordId: string }) => {
    return (
        <Button onClick={() => signIn("discord", { callbackUrl: `/r/callback/${discordId}/${accountId}` })}>
            <FaDiscord /> Login with Discord
        </Button>
    )
}

export default LoginButton