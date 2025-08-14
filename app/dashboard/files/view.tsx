"use client";
import Container from '@/components/ui/container';
import PageTitle from '@/components/ui/page-title';
import React, { useState } from 'react';
import FileTable from '@/components/file-table/table';
import { FileTableNavbar, FileTablePageNavigation, FileTableProvider, useFileTable } from '@/components/file-table';
import { defaultOptions } from '@/components/file-dropdown/default-dropdown-options';
import { TrashIcon } from 'lucide-react';
import { FileDropdownItem } from '@/components/file-dropdown/file-dropdown';
import { useFiles } from '@/utils/files-context';
import { File } from '@prisma/client';
import DeleteDialog from '@/components/dialogs/delete-file/delete-dialog';
import { useStatusBar } from '@/utils/status-bar-context';

const FilesView = () => {
    const { setBinFiles } = useFiles();
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

    const fileDropdownOptions: FileDropdownItem[] = [
        ...defaultOptions,
        {
            separator: true,
            dependencies: ["Move to Bin"]
        },
        {
            label: () => "Move to Bin",
            icon: () => <TrashIcon />,
            enabled: ({ items }) => !items.some(f => "isFolder" in f && f.isFolder),
            onClick: async ({ items, setStatusBar, setFiles }) => {
                const filesToDelete: File[] = items as File[];
                setDeleteDialogOpen(true);
                // await createJob(setStatusBar, `Move ${filesToDelete.length} ${filesToDelete.length === 1 ? " file" : " files"} to Bin`, DeleteIcon, () => {
                //     return new Promise(async (resolve) => {
                //         try {
                //             setStatusBar(statusBar => ({ ...statusBar, title: `Moving ${filesToDelete.length} ${filesToDelete.length === 1 ? " file" : " files"} to Bin` }));
                //             for (let i = 0; i < filesToDelete.length; i++) {
                //                 await patchFile(filesToDelete[i].id, { isActive: false });
                //                 setStatusBar(statusBar => ({ ...statusBar, progress: (i + 1) / filesToDelete.length * 100 }));
                //             }
                //             setFiles(allFiles => allFiles.filter(file => !filesToDelete.find(f => f.id === file.id)));
                //             setBinFiles(binFiles => [...binFiles, ...filesToDelete.map(file => ({ ...file, updatedAt: new Date() }))]);
                //             resolve();
                //         } catch {
                //             resolve();
                //         }
                //     })
                // })
            }
        }
    ]

    return (
        <Container className="h-full flex flex-col">
            <PageTitle title="My Files" />
            <div className="flex-1 flex flex-col h-full">
                <FileTableProvider>
                    <FileTableNavbar />
                    <FileTable fileDropdownOptions={fileDropdownOptions} />
                    <FileTablePageNavigation />
                    <DeleteDialogWrapper open={deleteDialogOpen} setOpen={setDeleteDialogOpen} />
                </FileTableProvider>
            </div>
        </Container>
    )
}

const DeleteDialogWrapper = ({ open, setOpen }: { open: boolean, setOpen: React.Dispatch<React.SetStateAction<boolean>> }) => {
    const { tableInfo, setFiles } = useFileTable();
    const { setBinFiles } = useFiles();
    const { setStatusBar } = useStatusBar();
    
    return <DeleteDialog setFiles={setFiles} items={tableInfo.dropdown.items as File[]} open={open} setOpen={setOpen} setBinFiles={setBinFiles} setStatusBar={setStatusBar} />
}

export default FilesView