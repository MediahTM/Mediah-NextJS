"use client"

import { getSharedFile, getUser } from '@/utils/api-actions';
import React, { useEffect, useState } from 'react'
import { File } from '@prisma/client';
import { UserProps } from '@/app/api/get-user/[id]/route';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Dock, DockIcon } from "@/components/magicui/dock";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { CheckIcon, CopyIcon, DatabaseIcon, DownloadIcon, HardDriveDownloadIcon, InfoIcon, UserRoundPlusIcon } from 'lucide-react';
import { TooltipProvider } from '@radix-ui/react-tooltip';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getFileExtension, getFileIcon, getFileName } from '@/utils/file-types';
import { formatBytes, getSiteLogo } from '@/lib/helpers';
import { StatusBarProvider, useStatusBar } from '@/utils/status-bar-context';
import StatusBar from '@/components/status-bar/status-bar';
import { downloadFiles } from '@/utils/file-store/download';
import { Button } from '@/components/ui/button';
import Navbar from '@/components/ui/navbar';
import { cn } from '@/lib/utils';
import { useSession } from 'next-auth/react';
import SaveDialog from '../../../components/dialogs/save/save-dialog';
import { Progress } from '@/components/ui/progress';
import { AnimatePresence, motion, useAnimation } from 'motion/react';
import { FilesProvider } from '@/utils/files-context';
import { SharePageProps } from './page';

export type FileWithShareInfo = Omit<File, "parts" | "channelID"> & {
    neverExpire: boolean,
    shareDate: Date,
    endDate: Date,
    parts: string[],
    channelID: string
}

const ShareViewClient = ({ params }: { params: Promise<SharePageProps> }) => {
    const [id, setId] = useState<string | null>(null);

    useEffect(() => {
        (async () => {
            const { id } = await params;
            setId(id);
        })()
    }, [])

    return (
        <StatusBarProvider>
            <FilesProvider>
                {id && <ShareView id={id} />}
            </FilesProvider>
        </StatusBarProvider>
    )
}

const ShareView = ({ id }: { id: string }) => {
    const [downloading, setDownloading] = useState(false);
    const [copied, setCopied] = useState(false);
    const [openSaveDialog, setOpenSaveDialog] = useState(false);
    
    const [loadingScreenHidden, setLoadingScreenHidden] = useState(false);
    const loadingPanelControls = useAnimation();

    const session = useSession();

    const { statusBar } = useStatusBar();

    const { data, isLoading, error } = useQuery({
        queryKey: ["sharedFile", id],
        enabled: !!id,
        queryFn: async () => {
            const fileResponse = await getSharedFile(id);
            console.log(fileResponse.data.endDate)
            if (!fileResponse.success) throw new Error(fileResponse.message);
            const userResponse = await getUser(fileResponse.data.userId);
            if (!userResponse.success) throw new Error(userResponse.message);
            return {
                file: fileResponse.data,
                user: userResponse.data
            }
        }
    })

    const { file, user } = data as { file?: FileWithShareInfo, user?: UserProps } || {};

    useEffect(() => {
        error && toast.error(error.message);
    }, [error]);

    useEffect(() => {
        if (!isLoading) {
            loadingPanelControls.start({ opacity: 0 });
            setTimeout(() => setLoadingScreenHidden(true), 500);
        }
    }, [isLoading]);

    return (
        <div className='h-screen flex flex-col'>
            <Navbar />
            <div className="flex flex-col justify-center items-center w-screen flex-1">
                <AnimatePresence>
                    {!loadingScreenHidden && <div className='absolute w-full h-full flex flex-col justify-center items-center'>
                        <motion.div className='flex flex-col justify-center items-center gap-2' initial={{ opacity: 0 }} animate={loadingPanelControls} transition={{ delay: 0.2, duration: 0.3 }}>
                            <img src={getSiteLogo()} alt="Mediah Logo" className='aspect-square w-1/3 rounded-[10%] animate-pulse' onLoad={() => isLoading && loadingPanelControls.start({ opacity: 1 })} />
                            <Progress max={100} value={isLoading ? 0 : 100} className='w-1/2' />
                            <h1 className='font-semibold text-lg'>Loading...</h1>
                        </motion.div>
                    </div>}
                </AnimatePresence>
                {file && user && <motion.div className='flex flex-col justify-center items-center flex-1 h-full' initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5, duration: 0.3 }}>
                    <TooltipProvider>
                        <Card className='max-w-sm sm:max-w-md md:max-w-lg xl:max-w-xl'>
                            <CardHeader>
                                <CardTitle className='flex gap-2 items-center'>
                                    <img src={user.image} alt={user.name} crossOrigin="anonymous" className="h-6 w-6 rounded-[10%]" />
                                    <p className='text-muted-foreground'><span className='text-primary'>{user.name}</span> has shared a file with you</p>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className='flex flex-col gap-4'>
                                <div className='flex items-center justify-center w-full text-nowrap overflow-hidden flex-col md:flex-row md:gap-2'>
                                    <div className="flex gap-2">
                                        {getFileIcon(file.filename, {
                                            className: "aspect-square w-6 shrink-0",
                                        })}
                                        <div className="flex max-w-full overflow-hidden">
                                            <span className="truncate">{getFileName(file.filename)}</span>
                                            <span className="shrink-0 max-w-full truncate">.{getFileExtension(file.filename)}</span>
                                        </div>
                                    </div>
                                    <div className='flex gap-2 items-center justify-center md:hidden'>
                                        <DatabaseIcon className='stroke-muted-foreground' size={15}/>
                                        <p className='text-muted-foreground text-sm'>{formatBytes(file.uploadedSize)}</p>
                                    </div>
                                    <DownloadWrapper file={file} downloading={downloading} setDownloading={setDownloading} className='hidden md:inline-flex'>
                                        <div className='ml-2 relative'>
                                            <div className={cn("absolute top-0 left-0 w-full h-full bg-black/50 invisible transition-all", statusBar.processing && statusBar.progress < 90 && "visible")} style={{ left: `${statusBar.progress}%` }} />
                                            <Button className='disabled:opacity-100' disabled={downloading}>
                                                <DownloadIcon />
                                                {formatBytes(file.uploadedSize)}
                                            </Button>
                                        </div>
                                    </DownloadWrapper>
                                </div>
                                <Dock direction="middle" className='mt-2'>
                                    <DockIcon size={50}>
                                        <DownloadWrapper file={file} downloading={downloading} setDownloading={setDownloading} className='flex aspect-square items-center justify-center'>
                                            <Tooltip>
                                                <TooltipTrigger>
                                                    <DownloadIcon className={cn(downloading && "stroke-muted-foreground")} />
                                                </TooltipTrigger>
                                                <TooltipContent className='mb-4'>Download</TooltipContent>
                                            </Tooltip>
                                        </DownloadWrapper>
                                    </DockIcon>
                                    <DockIcon size={50} onClick={() => {
                                        if (session.status !== "authenticated") {
                                            window.location.href = "/login"
                                        } else {
                                            setOpenSaveDialog(true);
                                        }
                                    }}>
                                        <Tooltip>
                                            <TooltipTrigger>
                                                {session.status === "authenticated" ? <HardDriveDownloadIcon /> : <UserRoundPlusIcon />}
                                            </TooltipTrigger>
                                            <TooltipContent className='mb-4'>{session.status === "authenticated" ? "Save to Mediah" : "Login to save to Mediah"}</TooltipContent>
                                        </Tooltip>
                                    </DockIcon>
                                    <DockIcon size={50} onClick={() => {
                                        navigator.clipboard.writeText(window.location.origin + "/share/" + id);
                                        toast.success("Copied link to clipboard");
                                        if (copied) return;
                                        setCopied(true);
                                        setTimeout(() => {
                                            setCopied(false);
                                        }, 2000);
                                    }}>
                                        <Tooltip>
                                            <TooltipTrigger>
                                                {copied ? <CheckIcon /> : <CopyIcon />}
                                            </TooltipTrigger>
                                            <TooltipContent className='mb-4'>Copy Link</TooltipContent>
                                        </Tooltip>
                                    </DockIcon>
                                    <DockIcon size={50}>
                                        <Tooltip>
                                            <TooltipTrigger>
                                                <InfoIcon />
                                            </TooltipTrigger>
                                            <TooltipContent className='mb-4'>Link will {file.neverExpire ? "never expire" : `expire on ${file.endDate.toLocaleDateString()}`}</TooltipContent>
                                        </Tooltip>
                                    </DockIcon>
                                </Dock>
                            </CardContent>
                        </Card>
                        <p className='text-muted-foreground'>File was shared on {file.shareDate.toLocaleDateString()}</p>
                    </TooltipProvider>
                </motion.div>}
                {file && <SaveDialog file={file} openSaveDialog={openSaveDialog} setOpenSaveDialog={setOpenSaveDialog} />}
            </div>
            <div className="container px-4 pb-4 pt-6 overflow-hidden mx-auto w-full sticky bottom-0 flex min-h-[100px]">
                <div className="relative w-full flex">
                    <StatusBar />
                </div>
            </div>
        </div>
    )
}

const DownloadWrapper = ({ file, downloading, setDownloading, children, ...props }: { file: FileWithShareInfo, downloading: boolean, setDownloading: React.Dispatch<React.SetStateAction<boolean>>, children: React.ReactNode } & React.HTMLAttributes<HTMLDivElement>) => {
    const { setStatusBar } = useStatusBar();
    return (
        <div {...props} onClick={() => {
            if (!downloading) {
                setDownloading(true);
                downloadFiles([file as any as File], setStatusBar, {
                    onCancel: () => {
                        setDownloading(false);
                    },
                    onJobComplete: () => {
                        setDownloading(false);
                    }
                });
            }
        }}>
            {children}
        </div>
    )
}

export default ShareViewClient