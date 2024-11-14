"use client";

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { File } from '@prisma/client';
import RenameForm from './rename-form';

const RenameDialog = ({ open, setOpen, file, reload, setReload }: { open: boolean, setOpen: (open: boolean) => void, file: File, setReload: (open: boolean) => void, reload: boolean }) => {
    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Rename File</DialogTitle>
                    <DialogDescription>
                        Enter a new name for the file &apos;{file.filename}&apos;
                    </DialogDescription>
                </DialogHeader>
                <RenameForm file={file} setOpen={setOpen} setReload={setReload} reload={reload} />
            </DialogContent>
        </Dialog>
    )
}

export default RenameDialog