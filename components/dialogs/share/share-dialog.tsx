"use client";

import CopyLink from '@/components/ui/copy-link';
import ShareForm from './share-form';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { File, Share } from '@prisma/client';
import { GeneralProps } from '@/types/general-props';
import { Folder } from '@/types/folder';
import { isFolder } from '@/lib/helpers';
import { useState } from 'react';
import ShareSuccessDialog, { ShareSuccessDialogProps } from '../share-success/share-success-dialog';

const ShareDialog = ({ open, setOpen, item, shares, setShares }: Pick<GeneralProps, "shares" | "setShares"> & { open: boolean, setOpen: React.Dispatch<React.SetStateAction<boolean>>, item?: File | Folder }) => {
    const existingShare: Share | null = item && shares.find((share) => isFolder(item) ? share.key === (item as Folder).path && share.type === "folder" : share.key === (item as File).id && share.type === "file") || null;
    const [successDialogProps, setSuccessDialogProps] = useState<ShareSuccessDialogProps>({ open: false });
    return (
        <>
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Share &apos;{item && (isFolder(item) ? (item as Folder).name : (item as File).filename)}&apos;</DialogTitle>
                        <DialogDescription>
                            Select the duration to share your file for and copy a public link to access it
                        </DialogDescription>
                    </DialogHeader>
                    {item && <>
                        <ShareForm
                            item={item}
                            open={open}
                            setOpen={setOpen}
                            shares={shares}
                            setShares={setShares}
                            setSuccessDialogProps={setSuccessDialogProps}
                        />
                        {existingShare &&
                            <>
                                <Separator />
                                <div className='flex flex-col gap-1'>
                                    <p className='font-bold'>Your Public Link</p>
                                    <CopyLink link={`${process.env.NEXT_PUBLIC_BASE_URL}/share/${existingShare.id}`} />
                                </div>
                            </>}
                    </>}
                </DialogContent>
            </Dialog>
            <ShareSuccessDialog props={successDialogProps} setProps={setSuccessDialogProps} />
        </>
    )
}

export default ShareDialog