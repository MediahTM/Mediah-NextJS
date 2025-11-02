import React, { useEffect, useState } from 'react';
import UploadDialogTabs from './upload-tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import NoWebhooksDialog from '../no-webhooks/no-webhooks-dialog';
import { useWebhooks } from '@/utils/webhooks-context';

const UploadDialog = ({ open, setOpen }: { open: boolean, setOpen: React.Dispatch<React.SetStateAction<boolean>> }) => {
    const [noWebhooksOpen, setNoWebhooksOpen] = useState(false);
    const { webhooks, fetching } = useWebhooks();
    useEffect(() => {
        if (open && !fetching && webhooks.length === 0) {
            setNoWebhooksOpen(true);
            setOpen(false);
        }
    }, [open, webhooks, fetching]);
    return (
        <>
            <Dialog onOpenChange={setOpen} open={open}>
                <DialogContent className='max-w-xl md:w-full w-[95vw]'>
                    <DialogHeader>
                        <DialogTitle>Upload Files</DialogTitle>
                        <DialogDescription>Add files, edit and upload to Mediah</DialogDescription>
                    </DialogHeader>
                    <div className='max-w-xl overflow-hidden'>
                        <UploadDialogTabs setOpen={setOpen} />
                    </div>
                </DialogContent>
            </Dialog>
            <NoWebhooksDialog open={noWebhooksOpen} setOpen={setNoWebhooksOpen} />
        </>
    )
}

export default UploadDialog