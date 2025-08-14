import { DownloadIcon, InfoIcon, PencilIcon, TableIcon, UserRoundCogIcon, UserRoundPlusIcon } from "lucide-react";
import { FileDropdownItem } from "./file-dropdown";
import { downloadFiles } from "@/utils/file-store/download";
import { File } from "@prisma/client";
import { toast } from 'sonner';
export const defaultOptions: FileDropdownItem[] = [
    {
        label: () => "Download",
        icon: () => <DownloadIcon />,
        enabled: ({ items }) => !items.some(f => "isFolder" in f),
        onClick: async ({ items, setStatusBar, gridRef }) => {
            await downloadFiles(items as File[], setStatusBar)
            gridRef?.current?.api.deselectAll();
        }
    },
    {
        separator: true,
        dependencies: ["Download"]
    },
    {
        label: () => "Info",
        icon: () => <InfoIcon />,
        enabled: () => true,
        onClick: () => {
            toast.success('Bind me')
        }
    },
    {
        label: (props) => {
            if (props) {
                const { shares, items } = props
                const isShared = shares.some((share) => share.type === "file" && !("isFolder" in items[0]) && share.key === items[0].id);
                return isShared ? "Edit Share" : "Share";
            }
            return "Share";
        },
        icon: (props) => {
            if (props) {
                const { shares, items } = props
                const isShared = shares.some((share) => share.type === "file" && !("isFolder" in items[0]) && share.key === items[0].id);
                return isShared ? <UserRoundCogIcon /> : <UserRoundPlusIcon />;
            }
            return <UserRoundPlusIcon />;
        },
        enabled: ({ items }) => items.length === 1,
        onClick: ({ setDropdown }) => {
            setDropdown(menu => ({ ...menu, dialogs: { ...menu.dialogs, share: true } }));
        }
    },
    {
        label: () => "Export",
        icon: () => <TableIcon />,
        enabled: ({ items }) => !items.some(f => "isFolder" in f && f.isFolder),
        onClick: ({ setDropdown }) => {
            setDropdown(menu => ({ ...menu, dialogs: { ...menu.dialogs, export: true } }));
        }
    },
    {
        label: () => "Rename",
        icon: () => <PencilIcon />,
        enabled: () => true,
        onClick: ({ setDropdown }) => {
            setDropdown(menu => ({ ...menu, dialogs: { ...menu.dialogs, rename: true } }));
        }
    }
]