"use client"

import { Avatar, AvatarFallback, AvatarImage } from './avatar';
import { ChevronsUpDown, LogOutIcon, SettingsIcon } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from './dropdown-menu';
import { getInitials } from '@/lib/helpers';
import { Session } from 'next-auth';
import { SidebarMenuButton } from './sidebar';
import { signOut, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

const AvatarDropdown = () => {
    const router = useRouter();
    const { data: session } = useSession();

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                    size="lg"
                    className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                >
                    <DetailsView session={session} />
                    <ChevronsUpDown className="ml-auto size-4" />
                </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent
                className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                side="bottom"
                align="end"
                sideOffset={4}
            >
                <DropdownMenuLabel className="p-0 font-normal">
                    <div className="flex items-center gap-2 p-2">
                        <DetailsView session={session} />
                    </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                    <DropdownMenuItem
                        onClick={() => signOut({ redirect: true })}
                        className='flex items-center gap-2'
                    >
                        <LogOutIcon className='size-4' />
                        Logout
                    </DropdownMenuItem>
                </DropdownMenuGroup>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}

export default AvatarDropdown

const DetailsView = ({ session }: { session: Session | null }) => {
    return (
        <>
            <Avatar className="h-8 w-8 rounded-lg">
                {session?.user?.image ? <AvatarImage src={session?.user?.image} /> : <AvatarFallback className="rounded-lg">{getInitials(session?.user?.name || '')}</AvatarFallback>}
            </Avatar>
            <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold capitalize">
                    {session?.user?.name}
                </span>
                <span className="truncate text-xs text-muted-foreground">
                    {session?.user?.email}
                </span>
            </div>
        </>
    )
}