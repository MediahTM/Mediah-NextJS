"use client";

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { File } from '@prisma/client';
import { Button } from '@/components/ui/button';
import { DeleteIcon, Loader2Icon } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { patchFile } from '@/utils/api-actions';
import { GeneralProps } from '@/types/general-props';
import { createJob } from '@/utils/status-bar-jobs';

const DeleteDialog = ({ open, setOpen, items = [], setFiles, setStatusBar, setBinFiles }: Pick<GeneralProps, "setFiles" | "setStatusBar" | "setBinFiles"> & { open: boolean, setOpen: (open: boolean) => void, items: File[] }) => {
    const handleDelete = async () => {
        setOpen(false);
        await createJob(setStatusBar, `Move ${items.length} ${items.length === 1 ? " file" : " files"} to Bin`, DeleteIcon, () => {
            return new Promise(async (resolve) => {
                try {
                    setStatusBar(statusBar => ({ ...statusBar, title: `Moving ${items.length} ${items.length === 1 ? " file" : " files"} to Bin` }));
                    for (let i = 0; i < items.length; i++) {
                        await patchFile(items[i].id, { isActive: false });
                        setStatusBar(statusBar => ({ ...statusBar, progress: (i + 1) / items.length * 100 }));
                    }
                    setFiles(allFiles => allFiles.filter(file => !items.find(f => f.id === file.id)));
                    setBinFiles(binFiles => [...binFiles, ...items.map(file => ({ ...file, updatedAt: new Date() }))]);
                    resolve();
                } catch {
                    resolve();
                }
            })
        })
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Move {items.length === 1 ? "'" + items[0].filename + "'" : items.length + ' files'} to the bin?</DialogTitle>
                    <DialogDescription>
                        Are you sure you want to move {items.length === 1 ? "this file" : "these files"} to the bin?
                    </DialogDescription>
                </DialogHeader>
                {items.length > 0 && <div className="flex items-center justify-end gap-2">
                    <Button type="submit" onClick={handleDelete} variant={"destructive"}>
                        Delete
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