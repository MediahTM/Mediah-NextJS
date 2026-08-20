import React, { useState } from 'react'
import { FileWithShareInfo } from './view';
import { UserProps } from '@/app/api/get-user/[id]/route';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckIcon, CopyIcon, DatabaseIcon, DownloadIcon, InfoIcon, SaveIcon, UserRoundPlusIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FileIcon, getFileExtension, getFileName } from '@/utils/file-types';
import { useSession } from 'next-auth/react';
import { useStatusBar } from '@/utils/status-bar-context';
import { formatBytes } from '@/lib/helpers';
import { cn } from '@/lib/utils';
import SaveDialog from '@/components/dialogs/save/save-files-dialog';
import { saveFile } from '@/utils/file-store/download';
import { File } from '@prisma/client';
import { toast } from 'sonner';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Dock, DockIcon } from '@/components/magicui/dock';
import { useRouter } from 'next/navigation';
import AvatarBlock from '@/components/avatar-block'

const SharedFile = ({ file, user, id }: { file: FileWithShareInfo, user: UserProps, id: string }) => {
    const router = useRouter();
    const [downloading, setDownloading] = useState(false);
    const [copied, setCopied] = useState(false);
    const [openSaveDialog, setOpenSaveDialog] = useState(false);
    const session = useSession();
    const { statusBar } = useStatusBar();
    return <>
        {file && user && <motion.div className='flex flex-col justify-center items-center flex-1 h-full' initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5, duration: 0.3 }}>
            <TooltipProvider>
                <Card className='max-w-sm sm:max-w-md md:max-w-lg xl:max-w-xl'>
                    <CardHeader>
                        <CardTitle className='flex gap-1 items-center text-muted-foreground'>
                            <AvatarBlock account={user} textClassName='text-primary text-base' />
                            has shared a file with you
                        </CardTitle>
                    </CardHeader>
                    <CardContent className='flex flex-col gap-4'>
                        <div className='flex items-center justify-center w-full text-nowrap overflow-hidden flex-col md:flex-row md:gap-2'>
                            <div className="flex gap-2 overflow-hidden max-w-full">
                                <FileIcon filename={file.filename} className='aspect-square w-6 shrink-0' />
                                <div className="flex max-w-full overflow-hidden">
                                    <span className="flex-1 max-w-full truncate">{getFileName(file.filename)}</span>
                                    <span className="shrink-0 max-w-full truncate">.{getFileExtension(file.filename)}</span>
                                </div>
                            </div>
                            <div className='flex gap-2 items-center justify-center md:hidden'>
                                <DatabaseIcon className='stroke-muted-foreground' size={15} />
                                <p className='text-muted-foreground text-sm'>{formatBytes(file.uploadedSize)}</p>
                            </div>
                            <DownloadWrapper file={file} downloading={downloading} setDownloading={setDownloading} className='hidden md:inline-flex overflow-hidden shrink-0'>
                                <div className='ml-2 relative'>
                                    <div className={cn("absolute top-0 left-0 w-full h-full bg-background/50 invisible transition-all", statusBar.processing && statusBar.progress < 90 && "visible")} style={{ left: `${statusBar.progress}%` }} />
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
                                    router.push("/");
                                } else {
                                    setOpenSaveDialog(true);
                                }
                            }}>
                                <Tooltip>
                                    <TooltipTrigger>
                                        {session.status === "authenticated" ? <SaveIcon /> : <UserRoundPlusIcon />}
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
        {file && <SaveDialog filesToSave={[file]} open={openSaveDialog} setOpen={setOpenSaveDialog} />}
    </>
}

const DownloadWrapper = ({ file, downloading, setDownloading, children, ...props }: { file: FileWithShareInfo, downloading: boolean, setDownloading: React.Dispatch<React.SetStateAction<boolean>>, children: React.ReactNode } & React.HTMLAttributes<HTMLDivElement>) => {
    const { setStatusBar } = useStatusBar();
    return (
        <div {...props} onClick={() => {
            if (!downloading) {
                setDownloading(true);
                saveFile(file as any as File, setStatusBar, {
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

export default SharedFile