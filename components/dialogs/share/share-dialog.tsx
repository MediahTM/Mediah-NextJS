"use client";

import CopyLink from '@/components/ui/copy-link';
import ShareForm from './share-form';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { File, Share } from '@prisma/client';
import { GeneralProps } from '@/types/general-props';

const ShareDialog = ({ open, setOpen, file, shares, setShares }: Pick<GeneralProps, "shares" | "setShares"> & { open: boolean, setOpen: (open: boolean) => void, file?: File }) => {
    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Share &apos;{file ? file.filename : 'File'}&apos;</DialogTitle>
                    <DialogDescription>
                        Select the duration to share your file for and copy a public link to access it
                    </DialogDescription>
                </DialogHeader>
                {file && <>
                    <ShareForm
                        file={file}
                        open={open}
                        setOpen={setOpen}
                        shares={shares}
                        setShares={setShares}
                    />
                    {shares.some((share) => share.key === file.id && share.type === "file") &&
                        <>
                            <Separator />
                            <div className='flex flex-col gap-1'>
                                <p className='font-bold'>Your Public Link</p>
                                <CopyLink link={`${process.env.NEXT_PUBLIC_BASE_URL}/share/${shares.find((share) => share.key === file.id && share.type === "file")!.id}`} />
                            </div>
                        </>}
                </>}
            </DialogContent>
        </Dialog>
    )
}

export default ShareDialog