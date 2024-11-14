"use client";

import Navbar from '@/components/ui/navbar'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import React from 'react'

const AuthLayout = ({ children }: { children: React.ReactNode }) => {
    const router = useRouter();
    const { data: session } = useSession();

    useEffect(() => {
        if (session) {
            router.push("/dashboard");
            return;
        }
    }, [session, router]);


    return (
        <div className="min-h-screen h-full w-full flex flex-col">
            <Navbar />
            <div className="h-full w-full flex flex-1 items-center justify-center">
                {children}
            </div>
        </div>
    )
}

export default AuthLayout