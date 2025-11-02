import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useWebhooks } from '@/utils/webhooks-context';
import axios from 'axios';
import { LoaderCircleIcon } from 'lucide-react';
import React, { useState } from 'react'
import { toast } from 'sonner';

const UnknownWebhookDialog = ({ open, setOpen, webhook }: { open: boolean, setOpen: React.Dispatch<React.SetStateAction<boolean>>, webhook: string }) => {
    const { webhooks, setWebhooks } = useWebhooks();
    const [loading, setLoading] = useState<boolean>(false);
    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Webhook was not found</DialogTitle>
                    <DialogDescription>It may have been deleted or expired.</DialogDescription>
                </DialogHeader>
                <p>The webhook you selected did not return a valid response. We recommend deleting this webhook and using a new one.</p>
                <div className="flex w-full gap-2">
                    <Button className='w-full' onClick={async () => {
                        setLoading(true);
                        const webhookId = webhooks.find(w => w.url === webhook)?.id;
                        const response = await axios.delete(`/api/webhooks?id=${webhookId}`);
                        if (!response.data.success) {
                            toast.error("Could not delete the webhook!");
                        } else {
                            setWebhooks(prev => prev.filter(webhook => webhook.id !== response.data.data.id));
                            toast.success("Successfully deleted the webhook!");
                        }
                        setLoading(false);
                        setOpen(false);
                    }}>
                        {loading ? <LoaderCircleIcon className='animate-spin' /> : "Delete Webhook"}
                    </Button>
                    <Button variant="outline" className='w-full' onClick={() => setOpen(false)}>
                        Close
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}

export default UnknownWebhookDialog