"use client";

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { File } from '@prisma/client';
import RenameForm from './rename-form';

const RenameDialog = ({ open, setOpen, file, setFiles }: { open: boolean, setOpen: React.Dispatch<React.SetStateAction<boolean>>, file: File, setFiles: React.Dispatch<React.SetStateAction<File[]>> }) => {
    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Rename File</DialogTitle>
                    <DialogDescription>
                        Enter a new name for the file &apos;{file.filename}&apos;
                    </DialogDescription>
                </DialogHeader>
                <RenameForm file={file} setOpen={setOpen} setFiles={setFiles} />
            </DialogContent>
        </Dialog>
    )
}

export default RenameDialog