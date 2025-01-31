"use server"
import React from "react";
import PageTitle from "@/components/ui/page-title";
import Container from "@/components/ui/container";
import db from "@/lib/prisma";
import { redirect } from "next/navigation";
import AvatarBlock from "./avatar-block";
import LoginCard from "@/components/login-card";
import { getServerSession } from "next-auth";
import { authOptions } from "@/utils/auth-options";


type Params = {
    accountId: string
    discordId: string
}

const ReferralView = async ({ params }: { params: Promise<Params> }) => {
    const session = await getServerSession(authOptions);
    
    if (session?.user) redirect("/dashboard");

    const { accountId, discordId } = await params;

    let account: Awaited<ReturnType<typeof db.user.findUnique>> | null = null;

    try {
        account = (await db.user.findUnique({
            where: { id: atob(accountId) },
        }));
    } catch { }

    if (!account || account.discordId !== discordId) redirect("/")

    return (
        <Container className="flex flex-col items-center justify-center text-center min-h-screen">
            <PageTitle title={`You've been invited to join Mediah`} description="Store unlimited files for free!" />
            <p className="text-muted-foreground text-sm font-medium flex gap-2.5 items-center justify-center">
                You&apos;ve been invited by <AvatarBlock account={account} />
            </p>
            <div className="flex items-center justify-center flex-1 w-full">
                {!(session?.user) && <LoginCard callback={`/r/callback/${discordId}/${accountId}`} title="Join Mediah" description="Select the method to create your account" />}
            </div>
        </Container>

    )
}

export default ReferralView