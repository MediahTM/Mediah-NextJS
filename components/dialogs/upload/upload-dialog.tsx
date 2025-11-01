import React from 'react';
import UploadDialogTabs from './upload-tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';

const UploadDialog = ({ open, setOpen }: { open: boolean, setOpen: React.Dispatch<React.SetStateAction<boolean>> }) => {
    return (
        <Dialog onOpenChange={setOpen} open={open}>
            <DialogContent className='max-w-xl md:w-full w-[95vw]'>
                <DialogHeader>
                    <DialogTitle>Upload Files</DialogTitle>
                    <DialogDescription>Add files, edit and upload to Mediah</DialogDescription>
                </DialogHeader>
                <div className='max-w-xl overflow-hidden'>
                    <UploadDialogTabs open={open} setOpen={setOpen} />
                </div>
            </DialogContent>
        </Dialog>
    )
}

export default UploadDialog