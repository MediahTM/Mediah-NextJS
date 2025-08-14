"use client";

import React, { Suspense, useEffect, useState } from 'react';
import StatisticsCard from './statistics-card';
import { FileIcon, FileQuestionIcon, HardDrive, ImageIcon, MusicIcon, VideoIcon } from 'lucide-react';
import { formatBytes } from '@/lib/helpers';
import { Session } from 'next-auth';
import { useFiles } from '@/utils/files-context';
import { getFileType } from '@/utils/file-types';
import { File } from '@prisma/client';
import dynamic from 'next/dynamic';
import { defaultDropdown, Dropdown } from '@/types/dropdown';
import FileDropdown from '@/components/file-dropdown/file-dropdown';
import { useStatusBar } from '@/utils/status-bar-context';
import DropdownDialogs from '@/components/file-dropdown/dropdown-dialogs';

const ExpandableCardClient = dynamic(() => import('./expandable-file'), {
    ssr: false,
    loading: () => <div className='h-[300px]' />
});

const StatisticsView = ({ session }: { session: Session | null }) => {
    const { setStatusBar } = useStatusBar();
    const { files, loading, setFiles, setShares, shares } = useFiles();

    const totalFiles = files.length;
    const totalStorage = files.reduce((acc, file) => acc + file.uploadedSize, 0);

    const fileTypeStatistics = [
        { title: 'Total Videos', icon: VideoIcon, sorter: ((file: File) => getFileType(file.filename) === 'video') },
        { title: 'Total Audio', icon: MusicIcon, sorter: ((file: File) => getFileType(file.filename) === 'audio') },
        { title: 'Total Images', icon: ImageIcon, sorter: ((file: File) => getFileType(file.filename) === 'image') },
        { title: 'Total Other', icon: FileQuestionIcon, sorter: ((file: File) => !['video', 'audio', 'image'].includes(getFileType(file.filename) || '')) },
    ]

    const [latestFiles, setLatestFiles] = useState(files.toSorted((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()));

    useEffect(() => {
        const handleResize = () => setLatestFiles(files.toSorted((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()).slice(
            0,
            window.innerWidth > 1280 ? 4 :
                window.innerWidth > 640 ? 2 : 1
        ));
        window.addEventListener('resize', handleResize);
        handleResize();
        return () => window.removeEventListener('resize', handleResize);
    }, [files]);

    const [dropdown, setDropdown] = useState<Dropdown>(defaultDropdown);

    return (
        <div className='flex flex-col gap-6 overflow-hidden'>
            <div className="grid sm:grid-cols-2 grid-cols-1 gap-6">
                <StatisticsCard
                    title={"Total Files"}
                    description={"All files in your account"}
                    icon={<FileIcon className='size-5' />}
                    loading={loading}
                    valueCallback={(percent: number) => `${Math.floor(percent * totalFiles / 100)}`}
                />

                <StatisticsCard
                    title={"Total Storage"}
                    description={"The sum of all bytes stored in your account"}
                    icon={<HardDrive className='size-5' />}
                    progress={session?.user?.isReferral ? undefined : ((totalStorage / (25 * 1024 * 1024 * 1024)) * 100)}
                    loading={loading}
                    valueCallback={(percent: number) => loading ? `0` : `${formatBytes(Math.floor(percent * totalStorage / 100))}${session?.user?.isReferral ? '' : ' / 25 GB'}`}
                />
            </div>
            <div className='sm:grid xl:grid-cols-4 grid-cols-2 hidden gap-6'>
                {fileTypeStatistics.map((statistic, index) => (
                    <StatisticsCard
                        key={index}
                        title={statistic.title}
                        icon={<statistic.icon className='size-5' />}
                        loading={loading}
                        progress={files.filter(file => statistic.sorter(file)).reduce((acc, file) => acc + file.uploadedSize, 0) / totalStorage * 100}
                        valueCallback={(percent: number) => loading ? `0` : `${formatBytes(Math.floor(percent * files.filter(file => statistic.sorter(file)).reduce((acc, file) => acc + file.uploadedSize, 0) / 100))}`}
                        loadingClassName='h-[48px]'
                    />
                ))}
            </div>
            <h1 className='text-3xl font-black sm:block hidden'>Latest Files</h1>
            <h1 className='text-3xl font-black sm:hidden'>Latest File</h1>
            <Suspense>
                <div className='grid gap-6 xl:grid-cols-4 sm:grid-cols-2 grid-cols-1'>
                    {latestFiles.length > 0 && latestFiles.length <= 4 && latestFiles.map((_, index) => <div key={index} onContextMenu={(e) => {
                        e.preventDefault();
                        setDropdown(prev => ({ ...prev, open: true, position: { x: e.clientX, y: e.clientY }, items: [latestFiles[index]] }))
                    }}>
                        <ExpandableCardClient latestFiles={latestFiles} index={index} />
                    </div>)}
                </div>
            </Suspense>
            <DropdownDialogs dropdown={dropdown} setDropdown={setDropdown} setFiles={setFiles} setShares={setShares} shares={shares} />
            {dropdown.open && <div className='flex items-center z-[-1] justify-center fixed' style={{ top: dropdown.position.y, left: dropdown.position.x }}>
                <FileDropdown
                    open={dropdown.open}
                    onOpenChange={() => setDropdown(menu => ({ ...menu, open: false }))}
                    setStatusBar={setStatusBar}
                    setFiles={setFiles}
                    shares={shares}
                    setShares={setShares}
                    items={dropdown.items}
                    dropdown={dropdown}
                    setDropdown={setDropdown}
                />
            </div>}
        </div>
    )
}

export default StatisticsView;