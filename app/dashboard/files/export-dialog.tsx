"use client";

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { File } from '@prisma/client';
import ExportView from './export-view';

const ExportDialog = ({ open, setOpen, file }: { open: boolean, setOpen: (open: boolean) => void, file: File }) => {
    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Export &apos;{file.filename}&apos;</DialogTitle>
                    <DialogDescription>
                        Choose your export options. Click export when you&apos;re done.
                    </DialogDescription>
                </DialogHeader>
                <ExportView file={file} setOpen={setOpen} />
            </DialogContent>
        </Dialog>
    )
}

export default ExportDialog