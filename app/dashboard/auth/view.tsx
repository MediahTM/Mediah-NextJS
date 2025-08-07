"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Container from '@/components/ui/container'
import { Separator } from '@/components/ui/separator'
import { useIsMobile } from '@/hooks/use-mobile'
import { getSiteLogo } from '@/lib/helpers'
import React from 'react'
import { FaLinux, FaWindows, FaApple } from "react-icons/fa";
import { IconType } from 'react-icons/lib'


type Platform = {
    name: string,
    logo: IconType
}

const platformMap: Platform[] = [
    {
        name: "Windows",
        logo: FaWindows
    },
    {
        name: "MacOS",
        logo: FaApple
    },
    {
        name: "Linux",
        logo: FaLinux
    }
]

const AuthView = () => {
    const isMobile = useIsMobile();

    return (
        <Container>
            <div className="my-6 h-full">
                {!isMobile ? <Card>
                    <CardHeader>
                        <CardTitle>Authorization</CardTitle>
                        <CardDescription>Auth page for desktop app integration</CardDescription>
                    </CardHeader>
                    <Separator />
                    <CardContent className='pt-6'>
                        COOL STUFF
                    </CardContent>
                </Card> :
                    <div className='flex flex-col items-center justify-center h-full'>
                        <img src={getSiteLogo()} alt="Mediah Logo" className='aspect-square w-1/3' />
                        <h1 className="font-semibold">Mediah App is not available on mobile.</h1>
                        <div>

                        </div>
                    </div>}
            </div>
        </Container>
    )
}

export default AuthView