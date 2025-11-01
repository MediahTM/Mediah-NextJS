"use client";

import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/ui/theme-toggler";
import { signIn } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { FaDiscord } from "react-icons/fa";

export default function Navbar() {
    return (
        <div className="border-b bg-muted/10 h-14 lg:h-[60px] sticky flex w-full shrink-0 top-0 backdrop-blur-md z-[10]">
            <div className="flex px-4 items-center justify-between flex-1 w-full">
                <Link href={`/`}>
                    <Image alt={"Mediah Logo"} src={process.env.LOGO!} width={30} height={30} className="rounded-md" />
                </Link>
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                        <Button size="sm" onClick={() => signIn("discord", { callbackUrl: process.env.BASEPATH! })}>
                            <FaDiscord />
                            Login with Discord
                        </Button>
                    </div>
                    <ModeToggle />
                </div>
            </div>
        </div>
    )
}