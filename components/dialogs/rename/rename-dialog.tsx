"use client";

import RenameForm from './rename-form';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { isFolder } from '@/lib/helpers';
import { Folder } from '@/types/folder';
import { File } from '@prisma/client';

const RenameDialog = ({ open, setOpen, item }: { open: boolean, setOpen: (open: boolean) => void, item?: File | Folder }) => {
    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Rename {item && isFolder(item) ? 'Folder' : 'File'}</DialogTitle>
                    <DialogDescription className='truncate'>
                        Enter a new name for the {item && isFolder(item) ? 'folder' : 'file'} &apos;{item ? isFolder(item) ? (item as Folder).name : (item as File).filename : 'File'}&apos;
                    </DialogDescription>
                </DialogHeader>
                {item && <RenameForm item={item} setOpen={setOpen} />}
            </DialogContent>
        </Dialog>
    )
}

export default RenameDialog