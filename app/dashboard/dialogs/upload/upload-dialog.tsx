import { buttonVariants } from '@/components/ui/button'
import { Dialog, DialogHeader, DialogTrigger, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { motion } from 'framer-motion'
import { UploadIcon } from 'lucide-react'
import React from 'react'
import UploadDialogTabs from './upload-tabs'

const UploadDialog = () => {
    return (
        <Dialog>
            <DialogTrigger asChild>
                <motion.button
                    className={buttonVariants({ variant: "secondary", size: "sm", className: "flex items-center gap-2" })}
                    whileTap={{ scale: 0.9 }}
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
                <UploadDialogTabs />
            </DialogContent>
        </Dialog>
    )
}

export default UploadDialog