"use client";

import CopyLink from '@/components/ui/copy-link';
import ShareForm from './share-form';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { File, Share } from '@prisma/client';
import { GeneralProps } from '@/types/general-props';
import { Folder } from '@/types/folder';

const ShareDialog = ({ open, setOpen, item, shares, setShares }: Pick<GeneralProps, "shares" | "setShares"> & { open: boolean, setOpen: (open: boolean) => void, item?: File | Folder }) => {
    const isFolder = item && "isFolder" in item && item.isFolder;
    const existingShare: Share | null = item && shares.find((share) => isFolder ? share.key === (item as Folder).path && share.type === "folder" : share.key === (item as File).id && share.type === "file") || null;
    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Share &apos;{item && (isFolder ? (item as Folder).name : (item as File).filename)}&apos;</DialogTitle>
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
    )
}

export default ShareDialog