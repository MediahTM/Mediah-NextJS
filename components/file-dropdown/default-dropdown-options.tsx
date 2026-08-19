import { DownloadIcon, InfoIcon, PencilIcon, TableIcon, UserRoundCogIcon, UserRoundPlusIcon } from "lucide-react";
import { FileDropdownItem } from "./file-dropdown";
import { saveItems } from "@/utils/file-store/download";
import { File } from "@prisma/client";
import { isFolder } from "@/lib/helpers";
import { Folder } from "@/types/folder";
export const defaultOptions: FileDropdownItem[] = [
    {
        key: "download",
        label: ({ items }) => items.every(f => isFolder(f)) ? "Download ZIP" : "Download",
        icon: () => <DownloadIcon />,
        // enabled: ({ items }) => !items.some(f => isFolder(f)),
        enabled: () => true,
        onClick: async ({ items, setStatusBar, gridRef, files }) => {
            await saveItems(items, files, setStatusBar);
            gridRef?.current?.api.deselectAll();
        }
    },
    {
        separator: true,
        dependencies: ["download"]
    },
    {
        key: "info",
        label: () => "Info",
        icon: () => <InfoIcon />,
        enabled: () => true,
        onClick: ({ setDropdown }) => {
            setDropdown(menu => ({ ...menu, dialogs: { ...menu.dialogs, info: true } }));
        }
    },
    {
        key: "export",
        label: () => "Export",
        icon: () => <TableIcon />,
        enabled: ({ items }) => !items.some(f => isFolder(f)),
        onClick: ({ setDropdown }) => {
            setDropdown(menu => ({ ...menu, dialogs: { ...menu.dialogs, export: true } }));
        }
    },
    {
        key: "rename",
        label: () => "Rename",
        icon: () => <PencilIcon />,
        enabled: () => true,
        onClick: ({ setDropdown }) => {
            setDropdown(menu => ({ ...menu, dialogs: { ...menu.dialogs, rename: true } }));
        }
    }
]