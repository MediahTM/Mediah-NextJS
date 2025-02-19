"use client";

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import ShareForm from './share-form';
import { File } from '@prisma/client';

const ShareDialog = ({ open, setOpen, file, setFiles }: { open: boolean, setOpen: React.Dispatch<React.SetStateAction<boolean>>, file: File, setFiles: React.Dispatch<React.SetStateAction<File[]>> }) => {
    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Share &apos;{file.filename}&apos;</DialogTitle>
                    <DialogDescription>
                        Select the duration to share your file for and copy a public link to access it
                    </DialogDescription>
                </DialogHeader>
                <ShareForm
                    file={file}
                    open={open}
                    setOpen={setOpen} 
                    setFiles={setFiles}
                />
            </DialogContent>
        </Dialog>
    )
}

export default ShareDialog