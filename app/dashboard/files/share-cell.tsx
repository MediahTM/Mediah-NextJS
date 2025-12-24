import { useFiles } from '@/utils/files-context';
import { CustomCellRendererProps } from 'ag-grid-react';
import React, { useState } from 'react'
import { toast } from 'sonner';
import ShareDialog from '../../../components/dialogs/share/share-dialog';
import { Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { unshareItem } from '@/utils/api-actions';
import { Share } from '@prisma/client';
import { Folder } from '@/types/folder';
import { File } from '@prisma/client';
import { isFolder } from '@/lib/helpers';

const ShareCell = ({ data }: CustomCellRendererProps) => {
    const { shares, setShares } = useFiles();
    const [open, setOpen] = useState<boolean>(false);

    const handleSwitchChange = async (checked: boolean) => {
        if (checked) {
            setOpen(true);
            return;
        }

        if (!data) {
            toast.error("Unable to locate the file for update.");
            return;
        }

        const key = isFolder(data) ? (data as Folder).path : (data as File).id;
        const type = isFolder(data) ? "folder" : "file";
        const response = await unshareItem(key, type);
        if (!response.success) {
            toast.error("Could not unshare file!");
        } else {
            setShares((shares) => shares.filter((share) => !(share.key === key && share.type === type)));
        }
    };

    const existingShare: Share | null = shares.find((share) => isFolder(data) ? share.key === (data as Folder).path && share.type === "folder" : share.key === (data as File).id && share.type === "file") || null;

    return (
        <div className="flex items-center gap-2 h-full">
            <Switch
                checked={open || Boolean(existingShare)}
                onCheckedChange={handleSwitchChange}
            />

            <ShareDialog
                open={open}
                setOpen={setOpen}
                item={data}
                shares={shares}
                setShares={setShares}
            />

            {existingShare && (
                <Button
                    onClick={() => {
                        setOpen(true)
                    }}
                    variant="ghost"
                    size="sm"
                    className="w-8"
                >
                    <Settings />
                </Button>
            )}
        </div>
    );
}

export default ShareCell