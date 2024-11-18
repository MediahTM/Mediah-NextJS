"use client";

import { Sidebar, SidebarContent, SidebarFooter, SidebarProvider, SidebarGroup, SidebarHeader, SidebarInset, SidebarMenu, SidebarMenuItem, SidebarGroupLabel, SidebarGroupContent, SidebarMenuButton, SidebarTrigger } from "@/components/ui/sidebar"
import { ModeToggle } from "@/components/ui/theme-toggler";
import { Separator } from "@/components/ui/separator";
import Container from "@/components/ui/container";
import { usePathname } from "next/navigation";
import { GalleryVerticalEnd } from "lucide-react";
import { SidebarLinks } from "@/lib/menu";
import Link from "next/link";
import { useSession } from "next-auth/react";
import AvatarDropdown from "@/components/ui/avatar-dropdown";
import UploadDialog from "./dialogs/upload/upload-dialog";

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
    const pathname = usePathname();

    const { data: session } = useSession();
    
    return (
        <SidebarProvider>
            <Sidebar >
                <SidebarHeader>
                    <SidebarMenu>
                        <SidebarMenuItem>
                            <Link href={"/dashboard"} className="flex items-center gap-3 p-2 hover:bg-sidebar-accent rounded-md">
                                <div className="flex aspect-square size-8 items-center justify-center rounded-lg dark:bg-background bg-accent dark:text-sidebar-primary-foreground">
                                    <GalleryVerticalEnd className="size-4" />
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
                                            <SidebarMenuButton asChild isActive={process.env.BASEPATH! + item.url === pathname}>
                                                <Link href={process.env.BASEPATH + item.url}>
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
                    <AvatarDropdown session={session} />
                </SidebarFooter>
            </Sidebar>
            <SidebarInset>
                <div className="border-b px-6">
                    <Container className="flex h-16 shrink-0 items-center gap-2 justify-between">
                        <div className="flex items-center gap-2">
                            <SidebarTrigger />
                            <Separator orientation="vertical" className="mr-2 h-4" />
                        </div>
                        <div className="flex items-center gap-3">
                            <UploadDialog />
                            <ModeToggle />
                        </div>
                    </Container>
                </div>
                <main className="px-6 pb-12">
                    {children}
                </main>
            </SidebarInset>
        </SidebarProvider>
    );
}

export default DashboardLayout