"use client";

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Webhook } from '@prisma/client';
import { Button } from '@/components/ui/button';
import { Loader2Icon } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

const DeleteDialog = ({ open, setOpen, webhook, reload, setReload }: { open: boolean, setOpen: (open: boolean) => void, webhook: Webhook, reload: boolean, setReload: (open: boolean) => void }) => {
    const [loading, setLoading] = useState<boolean>(false);

    const handleDelete = () => {
        fetch(`/api/webhooks?id=${webhook.id}`, {
            method: "DELETE",
            body: JSON.stringify({
                webhookId: webhook.id
            })
        })
            .then((response) => response.json())
            .then((response) => {
                if (response.success) {
                    setReload(!reload);
                    setOpen(false);
                }
                else {
                    toast.error("Could not delete the webhook!")
                }
                setLoading(false);  
            })
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Move &apos;{webhook.name}&apos; to the bin?</DialogTitle>
                    <DialogDescription>
                        Are you sure you want to delete the webhook, this can not be undone
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