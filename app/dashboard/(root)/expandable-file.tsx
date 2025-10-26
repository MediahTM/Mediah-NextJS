"use client"

import React from 'react';
import { Calendar, DatabaseIcon, DownloadIcon, Users } from 'lucide-react';
import { formatBytes, formatTime } from '@/lib/helpers';
import { FileIcon, getFileType } from '@/utils/file-types';
import { File } from '@prisma/client';
import { Expandable, ExpandableCard, ExpandableCardContent, ExpandableCardFooter, ExpandableCardHeader, ExpandableContent } from '@/components/ui/expandable-card';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { downloadFiles } from '@/utils/file-store/download';
import { useStatusBar } from '@/utils/status-bar-context';
import { motion } from 'motion/react';
import { useFiles } from '@/utils/files-context';

const ExpandableFile = ({ index, latestFiles }: { index: number, latestFiles: File[] }) => {
    const { setStatusBar } = useStatusBar();
    const { shares } = useFiles();
    const fileShare = shares.find((share) => share.key === latestFiles[index].id) || null;
    return (
        <motion.div key={index} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <Expandable
                expandDirection="vertical"
                expandBehavior="replace"
                initialDelay={0.2}
            >
                {({ setIsExpandedInternal }) => (
                    <ExpandableCard
                        className="w-full relative"
                        collapsedSize={{ height: 300 }}
                        expandedSize={{ height: 300 }}
                        hoverToExpand={false}
                        expandDelay={200}
                        collapseDelay={500}
                        ref={() => {
                            setTimeout(() => setIsExpandedInternal(true), index * 100);
                        }}
                    >
                        <ExpandableCardHeader className='bg-secondary relative p-4'>
                            <div className="flex justify-between items-start w-full">
                                <div className='flex flex-col gap-2 overflow-hidden max-w-fit mr-6'>
                                    <Badge className='max-w-fit captialize truncate overflow-hidden'>
                                        <p className='max-w-fit truncate'>{formatTime(Number(new Date(latestFiles[index].uploadedAt).getTime()))}</p>
                                    </Badge>
                                    <h3 className="font-semibold text-xl text-foreground truncate whitespace-nobreak">
                                        {latestFiles[index].filename}
                                    </h3>
                                </div>
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <FileIcon filename={latestFiles[index].filename} className='shrink-0 size-5 absolute top-4 right-4' />
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p className='capitalize'>{getFileType(latestFiles[index].filename) || 'Other'}</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            </div>
                        </ExpandableCardHeader>

                        <ExpandableCardContent className='bg-secondary'>
                            <div className="flex flex-col items-start justify-between mb-4">
                                <div className="flex items-center text-sm text-muted-foreground overflow-hidden max-w-full">
                                    <Calendar className="h-4 w-4 mr-1" />
                                    <span className='truncate'>{new Intl.DateTimeFormat('en-US', { weekday: 'long', hour: 'numeric', minute: 'numeric', hour12: true }).format(Number(new Date(latestFiles[index].uploadedAt).getTime()))}</span>
                                </div>

                                {fileShare && <ExpandableContent preset="blur-md" className='overflow-hidden max-w-full'>
                                    <div className="flex items-center text-sm text-muted-foreground overflow-hidden max-w-full">
                                        <Users className="h-4 w-4 mr-1" />
                                        <span className='truncate'>{fileShare.endDate ? `Sharing expires ${new Intl.RelativeTimeFormat('en', { numeric: 'auto' }).format(Math.round((Number(new Date(fileShare.endDate).getTime()) - Date.now()) / 86400000), 'day')}` : "Sharing never expires"}</span>
                                    </div>
                                </ExpandableContent>}
                            </div>
                            <ExpandableContent preset="blur-md" stagger staggerChildren={0.2}>
                                <Button onClick={() => downloadFiles(latestFiles.slice(index, index + 1), setStatusBar)} className='z-[99999]'>
                                    <DownloadIcon className="h-4 w-4 mr-2" />
                                    <span>Download</span>
                                </Button>
                            </ExpandableContent>
                        </ExpandableCardContent>
                        <ExpandableContent preset="slide-up" className='bg-secondary'>
                            <ExpandableCardFooter>
                                <div className="flex items-center justify-start gap-1 w-full text-sm text-muted-foreground overflow-hidden max-w-full">
                                    <DatabaseIcon className='size-3.5 shrink-0' />
                                    <span className='truncate'>{formatBytes(latestFiles[index].uploadedSize)}</span>
                                </div>
                            </ExpandableCardFooter>
                        </ExpandableContent>
                    </ExpandableCard>
                )}
            </Expandable>
        </motion.div>
    )
}

export default ExpandableFile