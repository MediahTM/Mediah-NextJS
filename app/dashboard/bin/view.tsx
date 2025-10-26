"use client";
import Container from '@/components/ui/container';
import PageTitle from '@/components/ui/page-title';
import React, { useState } from 'react';
import FileTable from '@/components/file-table/table';
import { FileTableNavbar, FileTablePageNavigation, FileTableProvider, useFileTable } from '@/components/file-table';
import { useFiles } from '@/utils/files-context';
import { defaultOptions } from '@/components/file-dropdown/default-dropdown-options';
import { FileDropdownItem } from '@/components/file-dropdown/file-dropdown';
import { FileOutputIcon, FolderOutputIcon, TrashIcon } from 'lucide-react';
import { convertToFileList } from '@/lib/helpers';
import { deleteFiles, patchFiles } from '@/utils/api-actions';
import { createJob } from '@/utils/status-bar-jobs';
import { useStatusBar } from '@/utils/status-bar-context';
import { File } from '@prisma/client';
import DeleteDialog from '@/components/dialogs/delete-file/delete-dialog';

const BinView = () => {
    const { binFiles, setBinFiles, setFiles } = useFiles();
    const { setStatusBar } = useStatusBar();

    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [itemsToDelete, setItemsToDelete] = useState<File[]>([]);

    const fileDropdownOptions: FileDropdownItem[] = [
        ...defaultOptions.filter(option => !("key" in option && ["rename"].includes(option.key))),
        {
            separator: true,
            dependencies: []
        },
        {
            key: "restore",
            label: () => "Restore",
            icon: () => <FileOutputIcon />,
            enabled: () => true,
            onClick: async ({ items }) => {
                const filesToRestore = convertToFileList(items, binFiles);
                const ids = filesToRestore.map(file => file.id);
                await createJob(setStatusBar, `Restore ${ids.length} ${ids.length === 1 ? " file" : " files"}`, FolderOutputIcon, async () => {
                    return new Promise<void>(async (resolve) => {
                        try {
                            setStatusBar(statusBar => ({ ...statusBar, title: `Restoring ${ids.length} ${ids.length === 1 ? " file" : " files"}`, progress: 0 }));
                            const response = await patchFiles(ids, { isActive: true });
                            if (!response.success) resolve();
                            setStatusBar(statusBar => ({ ...statusBar, progress: 100 }));
                            setBinFiles(binFiles => binFiles.filter(file => !ids.includes(file.id)));
                            const newDate = new Date();
                            setFiles(files => [...files, ...filesToRestore.map(file => ({
                                ...file,
                                updatedAt: newDate
                            }))]);
                            resolve();
                        } catch {
                            resolve();
                        }
                    })
                })
            }
        },
        {
            key: "delete",
            label: () => "Delete Forever",
            icon: () => <TrashIcon />,
            enabled: () => true,
            onClick: async ({ items }) => {
                const files = convertToFileList(items, binFiles);
                setItemsToDelete(files);
                setDeleteDialogOpen(true);
            }
        }
    ];

    return (
        <Container className="h-full flex flex-col">
            <PageTitle title="My Bin" description="Binned files are permanently deleted after 30 days" />
            <div className="flex-1 flex flex-col h-full">
                <FileTableProvider customFilesProps={{ files: binFiles, setFiles: setBinFiles }}>
                    <FileTableNavbar />
                    <FileTable fileDropdownOptions={fileDropdownOptions} />
                    <FileTablePageNavigation />
                    <DeleteDialog setBinFiles={setBinFiles} setFiles={() => { }} open={deleteDialogOpen} setOpen={setDeleteDialogOpen} items={itemsToDelete} setStatusBar={setStatusBar} type="forever" />
                </FileTableProvider>
            </div>
        </Container>
    )
}


export default BinView