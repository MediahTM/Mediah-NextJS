"use server"
import React from "react";
import Container from "@/components/ui/container";
import db from "@/lib/prisma";
import { redirect } from "next/navigation";
import AvatarBlock from "./avatar-block";
import { getServerSession } from "next-auth";
import { authOptions } from "@/utils/auth-options";
import MagicCardWrapped from "@/components/ui/magic-card-wrapped";
import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Logo from "@/components/ui/logo";
import LoginButton from "./login-button";

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
        <Container className="flex flex-col items-center justify-center text-center min-h-screen gap-2">
            <MagicCardWrapped>
                <CardHeader>
                    <CardTitle className="text-3xl flex gap-2 items-center justify-center">Join <Logo className="w-8" /> Mediah</CardTitle>
                    <CardDescription>Fast, disposable storage. No subscriptions. No ads.</CardDescription>
                </CardHeader>
                <CardContent>
                    <LoginButton accountId={accountId} discordId={discordId} />
                </CardContent>
            </MagicCardWrapped>
            <p className="text-muted-foreground text-sm font-medium flex gap-2.5 items-center justify-center">
                You&apos;ve been invited by <AvatarBlock account={account} />
            </p>
        </Container>

    )
}

export default ReferralView