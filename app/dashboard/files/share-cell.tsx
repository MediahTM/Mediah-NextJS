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

const ShareCell = ({ data }: CustomCellRendererProps) => {
    const { shares, setShares } = useFiles();
    const [useOpen, setUseOpen] = useState<boolean>(false);

    const handleSwitchChange = async (checked: boolean) => {
        if (checked) {
            setUseOpen(true);
            return;
        }

        if (!data) {
            toast.error("Unable to locate the file for update.");
            return;
        }

        const response = await unshareItem(data.id, "file");
        if (!response.success) {
            toast.error("Could not unshare file!");
        } else {
            setShares((shares) => shares.filter((share) => !(share.key === data.id && share.type === "file")));
        }
    };

    const isFolder = data && "isFolder" in data && data.isFolder;
    const existingShare: Share | null = shares.find((share) => isFolder ? share.key === (data as Folder).path && share.type === "folder" : share.key === (data as File).id && share.type === "file") || null;

    return (
        <div className="flex items-center gap-2 h-full">
            <Switch
                checked={useOpen || Boolean(existingShare)}
                onCheckedChange={handleSwitchChange}
            />

            <ShareDialog
                open={useOpen}
                setOpen={setUseOpen}
                item={data}
                shares={shares}
                setShares={setShares}
            />

            {existingShare && (
                <Button
                    onClick={() => {
                        setUseOpen(true)
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