import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useRouter } from 'next/navigation';
import React from 'react'

const NoWebhooksDialog = ({ open, setOpen }: { open: boolean, setOpen: React.Dispatch<React.SetStateAction<boolean>> }) => {
    const router = useRouter();
    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>You don&apos;t have any webhooks!</DialogTitle>
                    <DialogDescription>Before you can upload files, you need a webhook to upload them to.</DialogDescription>
                </DialogHeader>
                <Button onClick={() => {
                    router.push("/dashboard/webhooks");
                    setOpen(false);
                }}>Go to Webhooks</Button>
            </DialogContent>
        </Dialog>
    )
}

export default NoWebhooksDialog