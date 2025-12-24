import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import React from 'react'
import { Share } from '@prisma/client'
import CopyLink from '@/components/ui/copy-link'

export type ShareSuccessDialogProps = {
    open: boolean,
    name?: string,
    share?: Share
}

const ShareSuccessDialog = ({ props, setProps }: { props: ShareSuccessDialogProps, setProps: React.Dispatch<React.SetStateAction<ShareSuccessDialogProps>> }) => {
    return (
        <Dialog open={props.open} onOpenChange={(open: boolean) => setProps({ ...props, open })}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Successfully shared &apos;{props.name}&apos;</DialogTitle>
                    <DialogDescription>Using the link below, anyone can view your {props.share?.type || "item"}. Make sure to only send it to people you trust.</DialogDescription>
                </DialogHeader>
                <CopyLink link={`${process.env.NEXT_PUBLIC_BASE_URL}/share/${props.share?.id || ""}`} />
            </DialogContent>
        </Dialog>
    )
}

export default ShareSuccessDialog