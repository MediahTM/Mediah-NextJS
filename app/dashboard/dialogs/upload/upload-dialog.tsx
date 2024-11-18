import { buttonVariants } from '@/components/ui/button'
import { Dialog, DialogHeader, DialogTrigger, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { motion } from 'framer-motion'
import { UploadIcon } from 'lucide-react'
import React, { useState } from 'react'
import UploadDialogTabs from './upload-tabs'

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
            <DialogContent className='max-w-xl'>
                <DialogHeader>
                    <DialogTitle>Upload Files</DialogTitle>
                    <DialogDescription>Add files, edit and upload to Mediah</DialogDescription>
                </DialogHeader>
                <UploadDialogTabs open={open} />
            </DialogContent>
        </Dialog>
    )
}

export default UploadDialog