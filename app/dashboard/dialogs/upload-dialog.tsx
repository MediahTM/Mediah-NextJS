import { buttonVariants } from '@/components/ui/button'
import { Dialog, DialogHeader, DialogTrigger, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { motion } from 'framer-motion'
import { UploadIcon } from 'lucide-react'
import React from 'react'

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
                    <DialogTitle>Upload a File</DialogTitle>
                </DialogHeader>
                <Tabs orientation='vertical' className='w-full flex gap-4'>
                    <TabsList defaultValue={'files'} className='w-2/6' aria-orientation='vertical'>
                        <TabsTrigger value='files' className='w-full'>Files</TabsTrigger>
                        <TabsTrigger value='sharing' className='w-full'>Sharing</TabsTrigger>
                    </TabsList>
                    <TabsContent value='files' className='w-4/6'>
                        <h1>hi</h1>
                    </TabsContent>
                </Tabs>
            </DialogContent>
        </Dialog>
    )
}

export default UploadDialog