"use client";

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import ShareForm from './share-form';
import { File } from '@prisma/client';

const ShareDialog = ({ open, setOpen, file, update, setReload, reload }: { open: boolean, setOpen: (open: boolean) => void, file: File, update?: boolean, reload: boolean, setReload: (open: boolean) => void }) => {
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
                    update={update} 
                    open={open}
                    setOpen={setOpen} 
                    reload={reload}
                    setReload={setReload} 
                />
            </DialogContent>
        </Dialog>
    )
}

export default ShareDialog