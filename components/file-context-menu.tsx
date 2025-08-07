import React from 'react';
import { AgGridReact } from 'ag-grid-react';
import { createJob } from '@/utils/status-bar-jobs';
import { DeleteIcon, DownloadIcon, InfoIcon, PencilIcon, TableIcon, TrashIcon } from 'lucide-react';
import { downloadFiles } from '@/utils/file-store/download';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from './ui/dropdown-menu';
import { File } from '@prisma/client';
import { StatusBarProps } from './status-bar/status-bar';
import { toast } from 'sonner';
import { patchFile } from '@/utils/api-actions';
import { Folder } from '@/types/folder';

export type FileContextMenuProps = {
    items: (File | Folder)[],
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

const FileContextMenu = ({ open, onOpenChange, setStatusBar, setFiles, gridRef, children, items, dialogTriggers }: FileContextMenuProps) => {
    const containsFolders = items.some(f => "isFolder" in f);
    return (
        <DropdownMenu open={open ?? undefined} onOpenChange={onOpenChange ?? undefined}>
            <DropdownMenuTrigger asChild={Boolean(children)}>
                {children}
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end' className='w-[150px]'>
                {!containsFolders && <DropdownMenuItem onClick={async () => {
                    await downloadFiles(items as File[], setStatusBar)
                    gridRef?.current?.api.deselectAll();
                }}>
                    <DownloadIcon />
                    Download
                </DropdownMenuItem>}
                {items.length === 1 && <>
                    {!containsFolders && <DropdownMenuSeparator />}
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
                    const filesToDelete = items;
                    await createJob(setStatusBar, "Delete " + filesToDelete.length + " files", DeleteIcon, () => {
                        return new Promise(async (resolve) => {
                            try {
                                setStatusBar(statusBar => ({ ...statusBar, title: `Deleting ${filesToDelete.length} files` }));
                                for (let i = 0; i < filesToDelete.length; i++) {
                                    await patchFile(filesToDelete[i].id, { isActive: false });
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