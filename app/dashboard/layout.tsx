"use client";

import AvatarDropdown from '@/components/ui/avatar-dropdown';
import Link from 'next/link';
import StatusBar from '@/components/status-bar/status-bar';
import { cn } from '@/lib/utils';
import { FilesProvider } from '@/utils/files-context';
import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarHeader, SidebarInset, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { SidebarLinks } from '@/lib/menu';
import { StatusBarProvider } from '@/utils/status-bar-context';
import { usePathname } from 'next/navigation';
import Navbar from './(root)/navbar';
import { WebhooksProvider } from '@/utils/webhooks-context';
import Logo from '@/components/ui/logo';

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
    const pathname = usePathname();
    return (
        <FilesProvider>
            <WebhooksProvider>
                <StatusBarProvider>
                    <SidebarProvider>
                        <Sidebar>
                            <SidebarHeader>
                                <SidebarMenu>
                                    <SidebarMenuItem>
                                        <Link href={"/dashboard"} className="flex items-center gap-3 p-2 hover:bg-sidebar-accent rounded-md">
                                            <div className="flex aspect-square size-8 items-center justify-center rounded-lg dark:bg-background bg-accent dark:text-sidebar-primary-foreground">
                                                <Logo className='w-full h-full' />
                                            </div>
                                            <span className="font-semibold">Mediah</span>
                                        </Link>
                                    </SidebarMenuItem>
                                </SidebarMenu>
                            </SidebarHeader>
                            <SidebarContent className="gap-0">
                                {SidebarLinks.map((item) => (
                                    <SidebarGroup key={item.title}>
                                        <SidebarGroupLabel>{item.title}</SidebarGroupLabel>
                                        <SidebarGroupContent>
                                            <SidebarMenu>
                                                {item.items.map((item) => (
                                                    <SidebarMenuItem key={item.title}>
                                                        <SidebarMenuButton
                                                            asChild
                                                            className={cn(
                                                                (process.env.BASEPATH! + item.url) === pathname ? '!bg-secondary' : 'hover:!bg-secondary/50',
                                                            )}
                                                            isActive={(process.env.BASEPATH! + item.url) === pathname}
                                                        >
                                                            <Link
                                                                href={process.env.BASEPATH + item.url}
                                                            >
                                                                <item.icon />
                                                                {item.title}
                                                            </Link>
                                                        </SidebarMenuButton>
                                                    </SidebarMenuItem>
                                                ))}
                                            </SidebarMenu>
                                        </SidebarGroupContent>
                                    </SidebarGroup>
                                ))}
                            </SidebarContent>
                            <SidebarFooter>
                                <AvatarDropdown />
                            </SidebarFooter>
                        </Sidebar>
                        <SidebarInset className="flex-1 flex">
                            <Navbar />
                            <main className="px-6 relative h-full flex-1 overflow-y-auto">
                                {children}
                            </main>
                            <div className="container px-4 pb-3 pt-4 overflow-hidden mx-auto w-full sticky bottom-0 hidden md:flex min-h-[100px]">
                                <div className="relative w-full flex">
                                    <StatusBar />
                                </div>
                            </div>
                        </SidebarInset>
                    </SidebarProvider>
                </StatusBarProvider>
            </WebhooksProvider>
        </FilesProvider>
    );
}

export default DashboardLayout