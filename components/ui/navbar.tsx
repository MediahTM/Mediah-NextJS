"use client";

import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/ui/theme-toggler";
import { signIn, useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { FaDiscord } from "react-icons/fa";
import { redirect } from "next/navigation";

export default function Navbar() {
    const session = useSession();
    return (
        <div className="border-b bg-muted/10 h-14 lg:h-[60px] sticky flex w-full shrink-0 top-0 backdrop-blur-md z-[10]">
            <div className="flex px-4 items-center justify-between flex-1 w-full">
                <Link href={`/`}>
                    <Image alt={"Mediah Logo"} src={process.env.LOGO!} width={30} height={30} className="rounded-md" />
                </Link>
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                        {session.status === "unauthenticated" && <Button size="sm" onClick={() => signIn("discord", { callbackUrl: process.env.BASEPATH! })}>
                            <FaDiscord />
                            Login with Discord
                        </Button>}
                        {session.status === "authenticated" && <Button size="sm" onClick={() => redirect(process.env.BASEPATH!)}>
                            Dashboard
                        </Button>}
                    </div>
                    <ModeToggle />
                </div>
            </div>
        </div>
    )
}