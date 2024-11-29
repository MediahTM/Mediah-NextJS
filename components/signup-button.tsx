"use client";
import React from 'react'
import { Button } from './ui/button';
import { signIn } from 'next-auth/react';

const SignUpButton = ({ callback = process.env.BASEPATH!, providerName, icon }: { callback: string, providerName: string, icon?: React.JSX.Element }) => {
    return (
        <Button
            onClick={() => signIn("discord", { callbackUrl: callback! })}
            className='w-full'
            variant={"secondary"}
        >
            {icon}
            {providerName}
        </Button>
    )
}

export default SignUpButton