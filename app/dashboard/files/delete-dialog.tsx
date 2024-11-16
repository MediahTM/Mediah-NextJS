"use client";

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { File } from '@prisma/client';
import { Button } from '@/components/ui/button';
import { Loader2Icon } from 'lucide-react';
import { useState } from 'react';
import { toast } from '@/hooks/use-toast';

const DeleteDialog = ({ open, setOpen, file, reload, setReload }: { open: boolean, setOpen: (open: boolean) => void, file: File, reload: boolean, setReload: (open: boolean) => void }) => {
    const [loading, setLoading] = useState<boolean>(false);

    const handleDelete = () => {
        fetch(`/api/file`, {
            method: "PUT",
            body: JSON.stringify({
                ...file,
                isActive: false
            })
        })
            .then((response) => response.json())
            .then((response) => {
                if (response.success) {
                    setReload(!reload);
                    setOpen(false);
                }
                else {
                    toast({
                        title: "Delete Error",
                        description: response.message || "Could not delete the file!"
                    })
                }
                setLoading(false);
            })
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