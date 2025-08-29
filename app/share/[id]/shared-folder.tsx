import React, { useState } from 'react'
import { File } from '@prisma/client'
import { UserProps } from '@/app/api/get-user/[id]/route'
import { FileTable, FileTableNavbar, FileTablePageNavigation, FileTableProvider } from '@/components/file-table'
import { defaultOptions } from '@/components/file-dropdown/default-dropdown-options'
import { parsePath } from '@/lib/helpers'
import SaveDialog from '@/components/dialogs/save/save-dialog'
import { SaveIcon, UserRoundPlusIcon } from 'lucide-react'
import { FileDropdownItem } from '@/components/file-dropdown/file-dropdown'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

const SharedFolder = ({ files, user, path }: { files: File[], user: UserProps, path: string }) => {
    const router = useRouter();
    const session = useSession();
    const [saveDialogOpen, setSaveDialogOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState<File | null>(null);
    const [tableFiles, setTableFiles] = useState(files.map(file => ({ ...file, path: parsePath(file.path.replace(path, "/")) })));

    // TODO: Make this work with folders/multiple files
    const fileDropdownOptions: FileDropdownItem[] = [
        ...defaultOptions.filter(option => !("key" in option && ["rename"].includes(option.key))),
        {
            key: "save",
            label: () => session.status === "authenticated" ? "Save to Mediah" : "Login to Save",
            icon: () => session.status === "authenticated" ? <SaveIcon /> : <UserRoundPlusIcon />,
            enabled: ({ items }) => !items.some(f => "isFolder" in f && f.isFolder) && items.length === 1,
            onClick: ({ items }) => {
                if (session.status === "authenticated") {
                    const item: File = items[0] as File;
                    setSelectedItem(item);
                    setSaveDialogOpen(true);
                } else router.push("/login?callbackUrl=" + window.location.href);
            }
        }
    ]
    return (
        <div className="flex-1 flex flex-col h-full max-w-[1500px] w-full py-8">
            <FileTableProvider customFilesProps={{
                files: tableFiles,
                setFiles: setTableFiles
            }}>
                <FileTableNavbar homeName={path.split("/").pop()} />
                <FileTable fileDropdownOptions={fileDropdownOptions} />
                <FileTablePageNavigation />
                <SaveDialog openSaveDialog={saveDialogOpen} setOpenSaveDialog={setSaveDialogOpen} file={selectedItem ?? undefined} />
            </FileTableProvider>
            <div className='font-semibold text-muted-foreground flex gap-2 w-full flex items-center justify-center'>
                <p>Shared by</p>
                <span className='flex text-primary'>
                    <img src={user.image} alt={user.name} className='w-6 h-6 rounded-[3px] mr-2' />
                    {user.name}
                </span>
            </div>
        </div>
    )
}

export default SharedFolder