import React, { useState } from 'react';
import UploadDialogTabs from './upload-tabs';
import { buttonVariants } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { motion } from 'framer-motion';
import { UploadIcon } from 'lucide-react';

const UploadDialog = () => {
    const [open, setOpen] = useState<boolean>(false);

    return (
        <Dialog onOpenChange={setOpen} open={open}>
            <DialogTrigger asChild>
                <motion.button
                    className={buttonVariants({ variant: "secondary", size: "sm", className: "flex items-center gap-2" })}
                    whileTap={{ scale: 0.95 }}
                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                    Upload
                    <UploadIcon />
                </motion.button>
            </DialogTrigger>
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