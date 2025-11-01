import { File } from '@prisma/client'
import { Folder } from '@/types/folder'
import React, { useEffect, useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { getFileType } from '@/utils/file-types'
import { formatBytes, isFolder } from '@/lib/helpers'
import { FolderIcon } from 'lucide-react'
import { FileIcon } from '@/utils/file-types'
import { useFiles } from '@/utils/files-context'
import { Input } from '@/components/ui/input'

type StatType = {
    title: string,
    inputInterface?: boolean,
    resolveValue: (items: (File | Folder)[]) => string | undefined
}


const InfoDialog = ({ items, open, setOpen }: { items: (File | Folder)[], open: boolean, setOpen: React.Dispatch<React.SetStateAction<boolean>> }) => {
    const [type, setType] = useState("");
    const { files } = useFiles();

    const stats: StatType[] = [
        {
            title: "Size",
            resolveValue: (items) => {
                let totalSize = 0;
                for (const item of items) {
                    if (isFolder(item)) {
                        totalSize += files.filter(f => f.path.startsWith(item.path)).reduce((acc, f) => acc + f.uploadedSize, 0);
                    } else {
                        totalSize += item.uploadedSize;
                    }
                }
                return formatBytes(totalSize);
            }
        },
        {
            title: "Uploaded at",
            resolveValue: (items) => {
                if (items.length === 1) {
                    const item = items[0];
                    if (!isFolder(item)) {
                        return new Date((item as File).uploadedAt).toLocaleDateString("en-US", { month: "2-digit", day: "2-digit", year: "2-digit" });
                    }
                }
            }
        },
        {
            title: "Updated at",
            resolveValue: (items) => {
                if (items.length === 1) {
                    const item = items[0];
                    return new Date(item.updatedAt).toLocaleDateString("en-US", { month: "2-digit", day: "2-digit", year: "2-digit" });
                }
            }
        },
        {
            title: "Location",
            inputInterface: true,
            resolveValue: (items) => {
                if (items.length > 0) {
                    const item = items[0];
                    if (isFolder(item)) {
                        return (item as Folder).path.substring(0, item.path.lastIndexOf("/")) || "/";
                    } else {
                        return (item as File).path;
                    }
                }
            }
        }
    ]

    useEffect(() => {
        if (items.length === 0) return;
        if (items.length === 1) {
            const item = items[0];
            if (isFolder(item)) {
                setType("Folder");
            } else {
                setType(`${getFileType((item as File).filename) ?? ""} File`.trim());
            }
        } else {
            if (items.every(item => isFolder(item))) {
                setType(`${items.length} Folders`);
            } else if (items.every(item => !isFolder(item))) {
                setType(`${items.length} Files`);
            } else {
                setType(`${items.length} Items`);
            }
        }
    }, [items])

    return (
        <Dialog onOpenChange={setOpen} open={open}>
            <DialogContent className='max-w-xl md:w-fit'>
                <DialogHeader className='pr-4 max-w-full overflow-hidden'>
                    <DialogTitle className='flex gap-2 text-nowrap truncate overflow-hidden max-w-full'>
                        {type.includes("Folder") ? <FolderIcon className='stroke-primary shrink-0' /> : <FileIcon className='stroke-muted-foreground shrink-0' filename={items.length === 1 ? (items[0] as File).filename : "fallback"} />}
                        <span className='truncate'>{items.length === 1 ? (isFolder(items[0]) ? (items[0] as Folder).name : (items[0] as File).filename) : type}</span>
                    </DialogTitle>
                    {items.length === 1 && <DialogDescription className='capitalize'>{type}</DialogDescription>}
                </DialogHeader>
                <div className='flex flex-col  divide-y w-full'>
                    {stats.map((stat) => (
                        <React.Fragment key={stat.title}>
                            {stat.resolveValue(items) && <div className="grid grid-cols-2 w-full p-2 gap-4">
                                <p className="font-bold">{stat.title}</p>
                                {stat.inputInterface ?
                                    <Input
                                        className='w-full'
                                        type="text"
                                        value={stat.resolveValue(items) ?? ""}
                                        readOnly
                                        onClick={(e) => {
                                            e.currentTarget.select();
                                            navigator.clipboard.writeText(e.currentTarget.value);
                                        }}
                                    /> : <p>{stat.resolveValue(items)}</p>}
                            </div>}
                        </React.Fragment>
                    ))}
                </div>
            </DialogContent>
        </Dialog>
    )
}

export default InfoDialog