"use client";
import Container from '@/components/ui/container'
import { Separator } from '@/components/ui/separator'
import { SidebarTrigger } from '@/components/ui/sidebar'
import React, { useEffect, useState } from 'react'
import { ModeToggle } from '@/components/ui/theme-toggler'
import { HTMLMotionProps, motion } from 'motion/react'
import { ActivityIcon, ListIcon, UploadIcon, X } from 'lucide-react'
import UploadDialog from '@/components/dialogs/upload/upload-dialog'
import { Button, buttonVariants } from '@/components/ui/button'
import RefreshSpinner from '@/components/ui/refresh-spinner'
import { useFiles } from '@/utils/files-context'
import QueueDialog from '@/components/status-bar/queue-dialog'
import { useStatusBar } from '@/utils/status-bar-context'
import { cn } from '@/lib/utils'
import { Progress } from '@/components/ui/progress'

const Navbar = () => {
    const { fetchFiles, fetching, loading, refetching } = useFiles();
    const { statusBar } = useStatusBar();
    const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
    const [queueDialogOpen, setQueueDialogOpen] = useState(false);
    return (
        <div className="border-b px-6">
            <Container className="flex h-[4.5rem] shrink-0 items-center gap-2 justify-between">
                <div className="flex items-center gap-2 w-full mr-4 max-w-[300px] h-full">
                    <SidebarTrigger />
                    <Separator orientation="vertical" className="mr-2 h-4" />
                    <motion.div className='relative h-full flex items-center justify-center md:hidden' style={{ flexBasis: statusBar.title ? "100%" : "0%" }} animate={{
                        flexGrow: statusBar.title ? 1 : 0,
                        flexBasis: statusBar.title ? "100%" : "0%"
                    }} transition={{ type: "tween", duration: statusBar.title ? 0.5 : 0.3 }}>
                        {statusBar.description && <span className='text-xs text-muted-foreground w-full text-center flex items-center justify-center absolute bottom-0'>{statusBar.description}</span>}
                        <Button variant="outline" onClick={() => setQueueDialogOpen(true)} className={cn('h-8 w-full shrink-0 px-2')}>
                            <div className={cn(statusBar.title ? "animate-pulse" : "w-full flex justify-start")}>
                                {statusBar.title ? statusBar.icon ? <statusBar.icon /> : <ActivityIcon /> : <ListIcon />}
                            </div>
                            {statusBar.title && <Progress value={statusBar.progress} className='h-1' />}
                        </Button>
                    </motion.div>
                </div>
                <div className="flex items-center gap-3">
                    <UploadButton open={uploadDialogOpen} setOpen={setUploadDialogOpen} />
                    <UploadDialog open={uploadDialogOpen} setOpen={setUploadDialogOpen} />
                    <Button suppressHydrationWarning variant="outline" size="icon" onClick={fetchFiles} disabled={fetching} className='w-8 h-8 shrink-0 mr-[1px]'>
                        <RefreshSpinner loading={loading} refetching={refetching} />
                    </Button>
                    <ModeToggle />
                </div>
                <QueueDialog open={queueDialogOpen} setOpen={setQueueDialogOpen} queueItems={statusBar.queue || []} />
            </Container>
        </div>
    )
}

export const MotionButtonWrapper = (props: HTMLMotionProps<"button">) => {
    return (
        <motion.button
            className={buttonVariants({ variant: "secondary", size: "sm", className: "flex items-center gap-2" })}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
            {...props}
        />
    )
}

export const UploadButton = ({ open, setOpen }: { open: boolean, setOpen: React.Dispatch<React.SetStateAction<boolean>> }) => {
    return <>
        <MotionButtonWrapper onClick={() => setOpen(true)}>
            <span className='hidden md:block'>Upload</span>
            <UploadIcon />
        </MotionButtonWrapper>
    </>
}

export default Navbar