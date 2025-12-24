"use client";

import RenameForm from './rename-form';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { File } from '@prisma/client';

const RenameDialog = ({ open, setOpen, file, setFiles }: { open: boolean, setOpen: (open: boolean) => void, file?: File, setFiles: React.Dispatch<React.SetStateAction<File[]>> }) => {
    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Rename File</DialogTitle>
                    <DialogDescription className='truncate'>
                        Enter a new name for the file &apos;{file ? file.filename : 'File'}&apos;
                    </DialogDescription>
                </DialogHeader>
                {file && <RenameForm file={file} setOpen={setOpen} setFiles={setFiles} />}
            </DialogContent>
        </Dialog>
    )
}

export default RenameDialog