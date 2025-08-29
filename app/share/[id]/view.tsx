"use client"

import { getSharedItem, getUser } from '@/utils/api-actions';
import React, { useEffect, useState } from 'react'
import { File } from '@prisma/client';
import { UserProps } from '@/app/api/get-user/[id]/route';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { getSiteLogo } from '@/lib/helpers';
import { StatusBarProvider } from '@/utils/status-bar-context';
import StatusBar from '@/components/status-bar/status-bar';
import Navbar from '@/components/ui/navbar';
import { Progress } from '@/components/ui/progress';
import { AnimatePresence, motion, useAnimation } from 'motion/react';
import { FilesProvider } from '@/utils/files-context';
import { SharePageProps } from './page';
import SharedFolder from './shared-folder';
import SharedFile from './shared-file';
import { ArrowRightIcon } from 'lucide-react';
import Link from 'next/link';

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
    const [loadingScreenHidden, setLoadingScreenHidden] = useState(false);
    const loadingPanelControls = useAnimation();

    const { data, isLoading, error } = useQuery({
        queryKey: ["sharedFile", id],
        enabled: !!id,
        queryFn: async () => {
            if (id.length !== 24) return {
                item: null,
                key: null,
                type: null,
                user: null
            };
            const fileResponse = await getSharedItem(id);
            if (!fileResponse) return {
                item: null,
                key: null,
                type: null,
                user: null
            }
            const userResponse = await getUser(fileResponse.userId);
            if (!userResponse.success) throw new Error(userResponse.message);
            return {
                item: fileResponse.data,
                key: fileResponse.key,
                type: fileResponse.type,
                user: userResponse.data
            }
        }
    })

    const { item, user, type, key } = data as { item?: FileWithShareInfo | File[], user?: UserProps, type?: string, key?: string } || {};

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
                {!isLoading && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5, duration: 0.3 }} className='flex flex-col justify-center items-center h-full w-full'>
                    {item && user && (type === "folder" ? <SharedFolder files={item as File[]} user={user} path={key ?? "/"} /> : <SharedFile file={item as FileWithShareInfo} user={user} id={id} />)}
                    {item === null && <div className='flex flex-col justify-center items-center gap-4'>
                        {<img src={getSiteLogo()} alt="Mediah Logo" className='aspect-square w-1/3 animate-pulse' />}
                        <h1 className='font-semibold text-lg'>Sorry! Looks like this link is no longer valid.</h1>
                        <Link href='/' className='border-b flex items-center gap-2'>Home <ArrowRightIcon className='size-4' /></Link>
                    </div>}
                </motion.div>}
            </div>
            <div className="container px-4 pb-4 pt-6 overflow-hidden mx-auto w-full sticky bottom-0 flex min-h-[100px]">
                <div className="relative w-full flex">
                    <StatusBar />
                </div>
            </div>
        </div>
    )
}

export default ShareViewClient