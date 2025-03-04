"use client";

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { File } from '@prisma/client';
import { Button } from '@/components/ui/button';
import { Loader2Icon } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import axios from 'axios';

const DeleteDialog = ({ open, setOpen, file, setFiles }: { open: boolean, setOpen: (open: boolean) => void, file: File, setFiles: React.Dispatch<React.SetStateAction<File[]>> }) => {
    const [loading, setLoading] = useState<boolean>(false);

    const handleDelete = async () => {
        const response = await axios.put(`/api/file`, {
            ...file,
            isActive: false
        })
        if (response.data.success) {
            setFiles(prev => prev.filter((file) => file.id !== response.data.data.id));
            setOpen(false);
        }
        else {
            toast.success("Could not update the file!")
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Move &apos;{file.filename}&apos; to the bin?</DialogTitle>
                    <DialogDescription>
                        Are you sure you want to move this file to the bin?
                    </DialogDescription>
                </DialogHeader>
                <div className="flex items-center justify-end gap-2">
                    <Button type="submit" onClick={handleDelete} variant={"destructive"}>
                        {!loading ? (
                            <>
                                Delete
                            </>
                        ) : (
                            <Loader2Icon className="animate-spin relative size-6" />
                        )}
                    </Button>
                    <Button
                        variant="secondary"
                        onClick={(event) => {
                            event.preventDefault();
                            setOpen(false);
                        }}
                    >
                        Cancel
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}

export default DeleteDialog