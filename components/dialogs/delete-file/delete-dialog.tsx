"use client";

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { File } from '@prisma/client';
import { Button } from '@/components/ui/button';
import { DeleteIcon } from 'lucide-react';
import { deleteFiles, patchFiles } from '@/utils/api-actions';
import { GeneralProps } from '@/types/general-props';
import { createJob } from '@/utils/status-bar-jobs';

const DeleteDialog = ({ open, setOpen, items = [], setFiles, setStatusBar, setBinFiles, type }: Pick<GeneralProps, "setFiles" | "setStatusBar" | "setBinFiles"> & { open: boolean, setOpen: (open: boolean) => void, items: File[], type: "bin" | "forever" }) => {
    const handleDelete = async () => {
        setOpen(false);
        if (type === "bin") {
            await createJob(setStatusBar, `Move ${items.length} ${items.length === 1 ? " file" : " files"} to Bin`, DeleteIcon, () => {
                return new Promise(async (resolve) => {
                    try {
                        setStatusBar(statusBar => ({ ...statusBar, title: `Moving ${items.length} ${items.length === 1 ? " file" : " files"} to Bin`, progress: 0 }));
                        const response = await patchFiles(items.map(file => file.id), { isActive: false });
                        if (!response.success) resolve();
                        setFiles(allFiles => allFiles.filter(file => !items.find(f => f.id === file.id)));
                        const newDate = new Date();
                        setBinFiles(binFiles => [...binFiles, ...items.map(file => ({
                            ...file,
                            updatedAt: newDate
                        }))]);
                        resolve();
                    } catch {
                        resolve();
                    }
                })
            })
        } else {
            await createJob(setStatusBar, `Delete ${items.length} ${items.length === 1 ? " file" : " files"}`, DeleteIcon, () => {
                return new Promise(async (resolve) => {
                    try {
                        setStatusBar(statusBar => ({ ...statusBar, title: `Deleting ${items.length} ${items.length === 1 ? " file" : " files"}`, progress: 0 }));
                        const response = await deleteFiles(items.map(file => file.id));
                        if (!response.success) resolve();
                        setFiles(allFiles => allFiles.filter(file => !items.find(f => f.id === file.id)));
                        setBinFiles(binFiles => binFiles.filter(file => !items.find(f => f.id === file.id)));
                        resolve();
                    } catch {
                        resolve();
                    }
                })
            })
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>
                        {type === "bin" ?
                            `Move ${items.length === 1 ? "'" + items[0].filename + "'" : items.length + ' files'} to the bin?` :
                            `Permanently delete ${items.length === 1 ? "'" + items[0].filename + "'" : items.length + ' files'}?`
                        }
                    </DialogTitle>
                    <DialogDescription>
                        {type === "bin" ?
                            `Are you sure you want to move ${items.length === 1 ? "this file" : "these files"} to the bin?` :
                            `Are you sure you want to permanently delete ${items.length === 1 ? "this file" : "these files"}?`
                        }
                    </DialogDescription>
                </DialogHeader>
                {items.length > 0 && <div className="flex items-center justify-end gap-2">
                    <Button type="submit" onClick={handleDelete} variant={"destructive"}>
                        {type === "bin" ? "Move to Bin" : "Delete"}
                    </Button>
                    <Button
                        variant="secondary"
                        onClick={(event) => {
                            event.preventDefault();
                            setOpen(false);
                        }}
                    >
                        Cancel
                    </Button>
                </div>}
            </DialogContent>
        </Dialog>
    )
}

export default DeleteDialog