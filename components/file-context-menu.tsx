import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { createJob } from '@/utils/status-bar-jobs';
import { DeleteIcon, DownloadIcon, InfoIcon, PencilIcon, TableIcon, TrashIcon } from 'lucide-react';
import { downloadFiles } from '@/utils/file-store/download';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from './ui/dropdown-menu';
import { File } from '@prisma/client';
import { StatusBarProps } from './status-bar/status-bar';
import { toast } from 'sonner';

export type FileContextMenuProps = {
    files: File[],
    dialogTriggers: {
        rename: () => void,
        delete: () => void,
        export: () => void
    },
    open?: boolean,
    onOpenChange?: (open: boolean) => void,
    setStatusBar: React.Dispatch<React.SetStateAction<StatusBarProps>>,
    setFiles: React.Dispatch<React.SetStateAction<File[]>>,
    gridRef?: React.RefObject<AgGridReact>,
    children?: React.ReactNode
}

const FileContextMenu = ({ open, onOpenChange, setStatusBar, setFiles, gridRef, children, files, dialogTriggers }: FileContextMenuProps) => {
    return (
        <DropdownMenu open={open ?? undefined} onOpenChange={onOpenChange ?? undefined}>
            <DropdownMenuTrigger asChild={Boolean(children)}>
                {children}
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end' className='w-[150px]'>
                <DropdownMenuItem onClick={async () => {
                    await downloadFiles(files, setStatusBar)
                    gridRef?.current?.api.deselectAll();
                }}>
                    <DownloadIcon />
                    Download
                </DropdownMenuItem>
                {files.length === 1 && <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => {
                       toast.success('Bind me')
                    }}>
                        <InfoIcon />
                        Info
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => {
                        dialogTriggers.export()
                    }}>
                        <TableIcon />
                        Export
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => {
                        dialogTriggers.rename()
                    }}>
                        <PencilIcon />
                        Rename
                    </DropdownMenuItem>
                </>}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={async () => {
                    const filesToDelete = files;
                    await createJob(setStatusBar, "Delete " + filesToDelete.length + " files", DeleteIcon, () => {
                        return new Promise(async (resolve) => {
                            try {
                                setStatusBar(statusBar => ({ ...statusBar, title: `Deleting ${filesToDelete.length} files` }));
                                for (let i = 0; i < filesToDelete.length; i++) {
                                    await axios.put("/api/file", { ...filesToDelete[i], isActive: false })
                                    setStatusBar(statusBar => ({ ...statusBar, progress: (i + 1) / filesToDelete.length * 100 }));
                                }
                                setFiles(allFiles => allFiles.filter(file => !filesToDelete.find(f => f.id === file.id)));
                                resolve();
                            } catch {
                                resolve();
                            }
                        })
                    })
                }}>
                    <TrashIcon />
                    Delete
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}

export default FileContextMenu