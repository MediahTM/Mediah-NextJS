import React, { useState } from 'react'
import { File } from '@prisma/client'
import { UserProps } from '@/app/api/get-user/[id]/route'
import { FileTable, FileTableNavbar, FileTablePageNavigation, FileTableProvider } from '@/components/file-table'
import { defaultOptions } from '@/components/file-dropdown/default-dropdown-options'
import { isFolder, parsePath } from '@/lib/helpers'
import SaveDialog from '@/components/dialogs/save/save-files-dialog'
import { FolderDownIcon, SaveIcon, UserRoundPlusIcon } from 'lucide-react'
import { FileDropdownItem } from '@/components/file-dropdown/file-dropdown'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import SaveFolderDialog from '@/components/dialogs/save/save-folder-dialog'
import { Folder } from '@/types/folder'
import AvatarBlock from '@/components/avatar-block'
import { Button } from '@/components/ui/button'
import { saveFolder } from '@/utils/file-store/download'
import { useStatusBar } from '@/utils/status-bar-context'

const SharedFolder = ({ files, user, path }: { files: File[], user: UserProps, path: string }) => {
    const router = useRouter();
    const session = useSession();
    const [saveDialogOpen, setSaveDialogOpen] = useState(false);
    const [saveFolderDialogOpen, setSaveFolderDialogOpen] = useState(false);
    const [selectedFolderInfo, setSelectedFolderInfo] = useState<Folder | null>(null);
    const [selectedItems, setSelectedItems] = useState<File[] | null>(null);
    const [tableFiles, setTableFiles] = useState(files.map(file => ({ ...file, path: parsePath(file.path.replace(path, "/")) })));
    const { setStatusBar } = useStatusBar();

    const fileDropdownOptions: FileDropdownItem[] = [
        ...defaultOptions.filter(option => !("key" in option && ["rename"].includes(option.key))),
        {
            key: "save",
            label: () => session.status === "authenticated" ? "Save to Mediah" : "Login to Save",
            icon: () => session.status === "authenticated" ? <SaveIcon /> : <UserRoundPlusIcon />,
            enabled: ({ items }) => (items.length === 1 && items.some(f => isFolder(f))) || (items.length >= 1 && !items.some(f => isFolder(f))),
            onClick: ({ items }) => {
                const containsFolder = items.some(f => isFolder(f));
                if (session.status === "authenticated") {
                    if (containsFolder) {
                        const folder = items[0] as Folder;
                        setSelectedFolderInfo(folder);
                        setSaveFolderDialogOpen(true);
                    }
                    else {
                        setSelectedItems(items as File[]);
                        setSaveDialogOpen(true);
                    }
                } else router.push("/");
            }
        }
    ]
    return (
        <div className="flex-1 flex flex-col h-full max-w-[1500px] w-full py-8 px-4">
            <FileTableProvider customFilesProps={{
                files: tableFiles,
                setFiles: setTableFiles,
                loading: false
            }}>
                <FileTableNavbar homeName={path.split("/").pop()}>
                    <Button onClick={() => {
                        // 'updatedAt' is redundant here, so it's set to a dummy value
                        const folder: Folder = {
                            path: "/",
                            name: path.split("/").pop()!,
                            isFolder: true,
                            updatedAt: new Date().toString(),
                            uploadedSize: tableFiles.reduce((acc, file) => acc + file.uploadedSize, 0)
                        }
                        saveFolder(folder, tableFiles, setStatusBar);
                    }}>
                        <span className='hidden md:block'>Download as ZIP</span>
                        <FolderDownIcon />
                    </Button>
                </FileTableNavbar>
                <FileTable fileDropdownOptions={fileDropdownOptions} />
                <FileTablePageNavigation />
                <SaveDialog open={saveDialogOpen} setOpen={setSaveDialogOpen} filesToSave={selectedItems ?? undefined} />
                <SaveFolderDialog open={saveFolderDialogOpen} setOpen={setSaveFolderDialogOpen} folder={selectedFolderInfo ?? undefined} sharedFiles={tableFiles} />
            </FileTableProvider>
            <div className='font-semibold text-muted-foreground flex gap-2 w-full items-center justify-center'>
                <p>Shared by</p>
                <AvatarBlock account={user} className="rounded-[3px] text-primary" imageClassName="w-[30px] h-[30px]" />
            </div>
        </div>
    )
}

export default SharedFolder