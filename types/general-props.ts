import { StatusBarProps } from "@/components/status-bar/status-bar"
import { Folder } from "./folder"
import { File, Share } from "@prisma/client"
import { Dropdown } from "./dropdown"

export type GeneralProps = {
    items: (File | Folder)[],
    files: File[],
    setFiles: React.Dispatch<React.SetStateAction<File[]>>,
    shares: Share[],
    setShares: React.Dispatch<React.SetStateAction<Share[]>>,
    statusBar: StatusBarProps,
    setStatusBar: React.Dispatch<React.SetStateAction<StatusBarProps>>,
    dropdown: Dropdown,
    setDropdown: React.Dispatch<React.SetStateAction<Dropdown>>,
    binFiles: File[],
    setBinFiles: React.Dispatch<React.SetStateAction<File[]>>
}