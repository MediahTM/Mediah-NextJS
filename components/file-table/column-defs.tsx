import ShareCell from "@/app/dashboard/files/share-cell";
import { formatBytes, formatRelativeTime } from "@/lib/helpers";
import { getFileIcon } from "@/utils/file-types";
import { Share, File } from "@prisma/client";
import { ColDef } from "ag-grid-community";
import { AgGridReact, CustomCellRendererProps } from "ag-grid-react";
import { EllipsisVerticalIcon, FolderIcon } from "lucide-react";
import { useState } from "react";
import FileDropdown, { FileDropdownItem } from "../file-dropdown/file-dropdown";
import { Button } from "../ui/button";
import { StatusBarProps } from "../status-bar/status-bar";
import { defaultDropdown, Dropdown } from "@/types/dropdown";
import DropdownDialogs from "../file-dropdown/dropdown-dialogs";

export const getColumnDefs = (shares: Share[], setShares: React.Dispatch<React.SetStateAction<Share[]>>, setFiles: React.Dispatch<React.SetStateAction<File[]>>, setStatusBar: React.Dispatch<React.SetStateAction<StatusBarProps>>, gridRef: React.RefObject<AgGridReact>, fileContextOptions?: FileDropdownItem[]): ColDef[] => [
    {
        field: "filename",
        headerName: "Filename",
        flex: 1,
        suppressMovable: true,
        filter: true,
        filterParams: {
            filterOptions: ['contains', 'notContains', 'startsWith', 'endsWith'],
        },
        cellRenderer: ({ data }: CustomCellRendererProps) => {
            return (
                <div className='flex items-center gap-2'>
                    {data.isFolder ? <FolderIcon className='size-5 shrink-0 stroke-primary' /> : getFileIcon(data.filename, { className: 'size-5 shrink-0', stroke: 'gray' })}
                    <p className='truncate'>{data.isFolder ? data.name : data.filename}</p>
                </div>
            )
        }
    },
    {
        field: "uploadedSize",
        headerName: "Size",
        suppressMovable: true,
        width: 140,
        cellRenderer: ({ data }: CustomCellRendererProps) => {
            return (
                <p>{formatBytes(data.uploadedSize ?? 0)}</p>
            )
        },
        filter: true,
        filterParams: {
            allowedCharPattern: /^\d+(?:\.\d+)?(?:\s*\w+)?$/i,
            numberParser: (text: string | null) => {
                if (!text) return null;
                text = text.trim();
                if (/^[+-]?\d+(\.\d+)?$/.test(text)) return Math.round(Number(text));
                const units = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
                const regex = /([0-9.]+)\s*([a-zA-Z]+)/;
                const match = text.match(regex);

                if (!match) return null;

                const size = Number(match[1]);
                const unit = match[2];
                const unitIndex = units.findIndex(u => u.toLowerCase() === unit.toLowerCase());

                if (unitIndex === -1) return null;

                return size * Math.pow(1024, unitIndex);
            },
            numberFormatter: (value: number) => {
                if (value === null) return '';
                return formatBytes(value);
            },
            filterOptions: ['lessThan', 'greaterThan', 'inRange'],
        },
    },
    {
        headerName: "Updated At",
        field: "updatedAt",
        suppressMovable: true,
        filter: true,
        width: 150,
        filterParams: {
            filterOptions: ['inRange'],
        },
        cellRenderer: ({ data }: CustomCellRendererProps) => {
            const [updatedAt, setUpdatedAt] = useState<string>(formatRelativeTime(data.updatedAt ? new Date(data.updatedAt.toString()) : new Date()));
            setInterval(() => {
                setUpdatedAt(formatRelativeTime(data.updatedAt ? new Date(data.updatedAt.toString()) : new Date()));
            }, 1000);

            return (
                <p>{updatedAt[0].toUpperCase() + updatedAt.slice(1)}</p>
            )
        },
    },
    {
        field: "shared",
        headerName: "Shared",
        suppressMovable: true,
        resizable: false,
        width: 100,
        cellRenderer: ShareCell,
        comparator: (valueA, valueB, nodeA, nodeB, isDescending) => {
            const aChecked = Boolean(
                shares.some((share) => share.key === nodeA.data.id && share.type === "file")
            );
            const bChecked = Boolean(
                shares.some((share) => share.key === nodeB.data.id && share.type === "file")
            );
            return aChecked === bChecked ? 0 : aChecked ? 1 : -1;
        },
    },
    {
        headerName: " ",
        resizable: false,
        width: 70,
        suppressMovable: true,
        sortable: false,
        cellRenderer: ({ data }: CustomCellRendererProps) => {
            const [dropdown, setDropdown] = useState<Dropdown>({
                ...defaultDropdown,
                items: [data]
            });

            return (
                <div className="flex justify-end h-full items-center">
                    <FileDropdown shares={shares} setShares={setShares} customOptions={fileContextOptions} items={[data]} dropdown={dropdown} setDropdown={setDropdown} setStatusBar={setStatusBar} setFiles={setFiles} gridRef={gridRef}>
                        <Button
                            size={"icon"}
                            variant={"ghost"}
                        >
                            <EllipsisVerticalIcon />
                        </Button>
                    </FileDropdown>

                    <DropdownDialogs dropdown={dropdown} setDropdown={setDropdown} setFiles={setFiles} setShares={setShares} shares={shares} />
                </div>
            )
        }
    }
]