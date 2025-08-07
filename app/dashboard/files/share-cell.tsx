import { useFiles } from '@/utils/files-context';
import { CustomCellRendererProps } from 'ag-grid-react';
import React, { useState } from 'react'
import { toast } from 'sonner';
import ShareDialog from './share-dialog';
import { Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { unshareFile } from '@/utils/api-actions';

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

        const response = await unshareFile(data.id, "file");
        if (!response.success) {
            toast.error("Could not unshare file!");
        } else {
            setShares((shares) => shares.filter((share) => !(share.key === data.id && share.type === "file")));
        }
    };

    
    const fileShared = shares.some((share) => share.key === data.id && share.type === "file");

    return (
        <div className="flex items-center gap-2 h-full">
            <Switch
                checked={useOpen || fileShared}
                onCheckedChange={handleSwitchChange}
            />

            <ShareDialog
                open={useOpen}
                setOpen={setUseOpen}
                file={data}
                shares={shares}
                setShares={setShares}
            />

            {fileShared && (
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