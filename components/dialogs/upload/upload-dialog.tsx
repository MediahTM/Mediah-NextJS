import React, { useEffect, useState } from 'react';
import UploadDialogTabs from './upload-tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import NoWebhooksDialog from '../no-webhooks/no-webhooks-dialog';
import { useWebhooks } from '@/utils/webhooks-context';
import ShareSuccessDialog, { ShareSuccessDialogProps } from '../share-success/share-success-dialog';

const UploadDialog = ({ open, setOpen, customFiles }: { open: boolean, setOpen: React.Dispatch<React.SetStateAction<boolean>>, customFiles?: File[] }) => {
    const [noWebhooksOpen, setNoWebhooksOpen] = useState(false);
    const { webhooks, fetching } = useWebhooks();
    const [successDialogProps, setSuccessDialogProps] = useState<ShareSuccessDialogProps>({ open: false });
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
                        <UploadDialogTabs setOpen={setOpen} customFiles={customFiles} setSuccessDialogProps={setSuccessDialogProps} />
                    </div>
                </DialogContent>
            </Dialog>
            <NoWebhooksDialog open={noWebhooksOpen} setOpen={setNoWebhooksOpen} />
            <ShareSuccessDialog props={successDialogProps} setProps={setSuccessDialogProps} />
        </>
    )
}

export default UploadDialog