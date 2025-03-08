import React, { useEffect, useRef, useState } from 'react'
import { ChevronUp, ChevronDown, List as QueueIcon, LucideIcon, X } from 'lucide-react'
import { motion, useAnimation } from "motion/react"
import { AnimatePresence } from 'motion/react'
import { Button } from '../ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card'
import { Progress } from '../ui/progress'
import QueueDialog from './queue-dialog'
import { useStatusBar } from '@/utils/status-bar-context'

export type QueueProps = {
    title: string,
    icon?: LucideIcon | null,
    UUID: string,
    remove?: () => void
}

export type StatusBarProps = {
    open: boolean,
    openPreference: boolean,
    title: string,
    description: string,
    progress: number,
    processing: boolean
    queue?: QueueProps[],
    onCancel?: () => void,
}

const StatusBar = () => {
    const { statusBar, setStatusBar } = useStatusBar();

    const statusBarRef = useRef<HTMLDivElement>(null);

    const [queueOpen, setQueueOpen] = useState<boolean>(false);

    const statusBarControls = useAnimation();
    const minimizeControls = useAnimation();

    useEffect(() => {
        if (statusBar.open) {
            statusBarControls.start({ y: 0, opacity: 1 });
            minimizeControls.start({ y: 100, opacity: 0 });
        } else {
            statusBarControls.start({ y: 100, opacity: 0 })
            minimizeControls.start({ y: 0, opacity: 1 });
        };
    }, [statusBar.open, statusBarControls, minimizeControls]);

    const [statusBarHeight, setStatusBarHeight] = useState<number>(0);

    useEffect(() => {
        if (statusBarRef.current) {
            setStatusBarHeight(statusBarRef.current.offsetHeight);
        }
    }, []);

    return (
        <>
            <AnimatePresence>
                <div className='w-full flex flex-col-reverse' style={{ height: statusBarHeight + 20 + "px" }}>
                    <motion.div
                        key="progress"
                        className='w-full z-[100]'
                        initial={{ y: 100, opacity: 0 }}
                        animate={statusBarControls}
                        transition={{ type: "spring" }}
                    >
                        <Card ref={statusBarRef}>
                            <CardHeader className='flex items-center flex-row justify-between transition-[height] pt-4 overflow-hidden pb-2'>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    tabIndex={-1}
                                    onClick={() => setQueueOpen(true)}
                                    className="size-6"
                                    disabled={statusBar.queue ? statusBar.queue.length === 0 : true}
                                >
                                    <QueueIcon className='w-4 h-4' />
                                </Button>
                                <div className="flex flex-col justify-center text-center items-center">
                                    <CardTitle>{statusBar.title || "No items in the queue"}</CardTitle>
                                    <AnimatePresence>
                                        {statusBar.description &&
                                            <motion.div
                                                initial={{ opacity: 0, y: -10, maxHeight: 0 }}
                                                animate={{ opacity: 1, y: 0, maxHeight: 100 }}
                                                exit={{ opacity: 0, y: 10, maxHeight: 0 }}>
                                                <CardDescription className='max-h-[20px] text-nowrap'>{statusBar.description}</CardDescription>
                                            </motion.div>}
                                    </AnimatePresence>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    tabIndex={-1}
                                    onClick={() => setStatusBar({ ...statusBar, open: false, openPreference: !statusBar.processing })}
                                    className="size-6"
                                >
                                    <ChevronDown className="w-4 h-4" />
                                </Button>
                            </CardHeader>
                            <CardContent className='flex items-center justify-center gap-2'>
                                <Progress value={statusBar.progress} />
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="size-6"
                                    tabIndex={-1}
                                    disabled={!statusBar.processing}
                                    onClick={statusBar.onCancel}
                                >
                                    <X className="w- h-4" />
                                </Button>
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>
            </AnimatePresence>
            <motion.div
                key="open"
                className="w-full z-[100] flex items-center justify-center absolute bottom-2"
                initial={{ y: 100, opacity: 0 }}
                animate={minimizeControls}
                transition={{ type: 'spring', stiffness: 260, damping: 20 }}
            >
                <Button
                    variant="outline"
                    size="sm"
                    tabIndex={-1}
                    onClick={() => setStatusBar({ ...statusBar, open: true, openPreference: true })}
                    className="sm:w-[20%] w-[80%] flex items-center justify-center flex-col py-4 gap-1 h-auto pointer-events-auto"
                >
                    <ChevronUp className="size-4" />
                </Button>
            </motion.div>

            <QueueDialog
                open={queueOpen}
                setOpen={setQueueOpen}
                queueItems={statusBar.queue || []}
            />
        </>
    )
}

export default StatusBar