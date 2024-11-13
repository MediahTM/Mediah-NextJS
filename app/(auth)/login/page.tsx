"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { signIn } from 'next-auth/react';

const LoginPage = () => {
    return (
        <Card className="mx-auto max-w-sm w-full">
            <CardHeader>
                <CardTitle className="text-2xl">Login</CardTitle>
                <CardDescription>
                    Chose a provider and login to your Mediah account
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Button
                    onClick={() => signIn("discord", { callbackUrl: process.env.BASEPATH! })}
                    className='w-full'
                    variant={"secondary"}
                >
                    Discord
                </Button>
            </CardContent>
        </Card>
    )
}

export default LoginPage;