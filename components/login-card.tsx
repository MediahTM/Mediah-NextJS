import React from 'react'
import { Card, CardTitle, CardDescription, CardContent, CardHeader } from './ui/card'
import SignUpButton from './status-bar/signup-button'
import { FaDiscord } from "react-icons/fa";
import MagicCardWrapped from './ui/magic-card-wrapped';

const LoginCard = ({ callback = process.env.BASEPATH!, title = "Login", description = "Chose a provider and login to your Mediah account" }: { callback: string, title?: string, description?: string }) => {
    return (
        <MagicCardWrapped className="mx-auto max-w-sm w-full">
            <CardHeader>
                <CardTitle className="text-2xl">{title}</CardTitle>
                <CardDescription>
                    {description}
                </CardDescription>
            </CardHeader>
            <CardContent>
                <SignUpButton providerName="Discord" callback={callback} icon={<FaDiscord />} />
            </CardContent>
        </MagicCardWrapped>
    )
}

export default LoginCard