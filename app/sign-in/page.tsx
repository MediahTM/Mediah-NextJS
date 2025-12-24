"use client"
import { signIn } from 'next-auth/react'
import { useEffect } from 'react'

const SignIn = () => {
    useEffect(() => {
        const callbackUrl = (new URL(window.location.href).searchParams.get("callbackUrl") ?? process.env.BASEPATH!);
        signIn("discord", { callbackUrl: callbackUrl })
    }, [])
    return null;
}

export default SignIn