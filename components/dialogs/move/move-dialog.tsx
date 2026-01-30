import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import React, { useEffect, useState } from 'react'
import { File } from '@prisma/client'
import { Folder } from '@/types/folder'
import { isFolder } from '@/lib/helpers'
import { useFiles } from '@/utils/files-context'
import MoveForm from './move-form'

const MoveDialog = ({ open, setOpen, items }: { open: boolean, setOpen: React.Dispatch<React.SetStateAction<boolean>>, items?: (File | Folder)[] }) => {
    const { files } = useFiles();
    const [totalFiles, setTotalFiles] = useState(0);
    useEffect(() => {
        if (!items) return;
        setTotalFiles(items.reduce((acc, item) => acc + (isFolder(item) ? files.filter(f => f.path.startsWith((item as Folder).path)).length : 1), 0));
    }, [items])
    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Move {totalFiles} {totalFiles > 1 ? 'files' : 'file'}</DialogTitle>
                    <DialogDescription className='truncate'>
                        Move {totalFiles} {totalFiles > 1 ? 'files' : 'file'} to another folder
                    </DialogDescription>
                </DialogHeader>
                <MoveForm items={items ?? []} setOpen={setOpen} />
            </DialogContent>
        </Dialog>
    )
}

export default MoveDialog