import Container from '@/components/ui/container'
import { Separator } from '@/components/ui/separator'
import { SidebarTrigger } from '@/components/ui/sidebar'
import React, { useState } from 'react'
import { ModeToggle } from '@/components/ui/theme-toggler'
import { motion } from 'motion/react'
import { UploadIcon } from 'lucide-react'
import UploadDialog from '@/components/dialogs/upload/upload-dialog'
import { Button, buttonVariants } from '@/components/ui/button'
import RefreshSpinner from '@/components/ui/refresh-spinner'
import { useFiles } from '@/utils/files-context'

const Navbar = () => {
    const { fetchFiles, fetching } = useFiles()
    const [uploadDialogOpen, setUploadDialogOpen] = useState(false)
    return (
        <div className="border-b px-6">
            <Container className="flex h-16 shrink-0 items-center gap-2 justify-between">
                <div className="flex items-center gap-2">
                    <SidebarTrigger />
                    <Separator orientation="vertical" className="mr-2 h-4" />
                </div>
                <div className="flex items-center gap-3">
                    <motion.button
                        className={buttonVariants({ variant: "secondary", size: "sm", className: "flex items-center gap-2" })}
                        whileTap={{ scale: 0.95 }}
                        transition={{ type: "spring", stiffness: 400, damping: 10 }}
                        onClick={() => setUploadDialogOpen(true)}
                    >
                        Upload
                        <UploadIcon />
                    </motion.button>
                    <UploadDialog open={uploadDialogOpen} setOpen={setUploadDialogOpen} />
                    <Button variant="outline" size="icon" onClick={fetchFiles} disabled={fetching} className='w-8 h-8 shrink-0 mr-[1px]'>
                        <RefreshSpinner />
                    </Button>
                    <ModeToggle />
                </div>
            </Container>
        </div>
    )
}

export default Navbar