"use client";

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Webhook } from '@prisma/client';
import { Button } from '@/components/ui/button';
import { Loader2Icon } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import axios from 'axios';
import { useWebhooks } from '@/utils/webhooks-context';

const DeleteDialog = ({ open, setOpen, webhook }: { open: boolean, setOpen: (open: boolean) => void, webhook: Webhook }) => {
    const { setWebhooks } = useWebhooks();
    const [loading, setLoading] = useState<boolean>(false);

    const handleDelete = async () => {
        setLoading(true);
        const response = await axios.delete(`/api/webhooks?id=${webhook.id}`, {
            data: {
                webhookId: webhook.id
            }
        });
        if (!response.data.success) {
            toast.error("Could not delete the webhook!")
        } else {
            setWebhooks(prev => prev.filter(webhook => webhook.id !== response.data.data.id));
            toast.success("Successfully deleted the webhook!");
        };
        setLoading(false);
        setOpen(false);
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Permenantly delete &apos;{webhook.name}&apos;?</DialogTitle>
                    <DialogDescription>
                        Are you sure you want to delete the webhook? This action cannot be undone.
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