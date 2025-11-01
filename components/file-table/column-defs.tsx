import { formatBytes, formatRelativeTime } from "@/lib/helpers";
import { FileIcon } from "@/utils/file-types";
import { ColDef } from "ag-grid-community";
import { CustomCellRendererProps } from "ag-grid-react";
import { EllipsisVerticalIcon, FolderIcon } from "lucide-react";
import { useState } from "react";
import { Button } from "../ui/button";
import { TableInfo } from "./table-context";

export const getColumnDefs = (setTableInfo: React.Dispatch<React.SetStateAction<TableInfo>>): ColDef[] => [
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
                    {data.isFolder ? <FolderIcon className='size-5 shrink-0 stroke-primary' /> : <FileIcon filename={data.filename} className='size-5 shrink-0 stroke-muted-foreground' />}
                    <p className='truncate'>{data.isFolder ? data.name : data.filename}</p>
                </div>
            )
        },
        comparator: (valueA, valueB, nodeA, nodeB, isDescending) => {
            const a = nodeA.data.isFolder ? nodeA.data.name : nodeA.data.filename;
            const b = nodeB.data.isFolder ? nodeB.data.name : nodeB.data.filename;
            return a.localeCompare(b);
        },
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
        headerName: " ",
        resizable: false,
        width: 70,
        suppressMovable: true,
        sortable: false,
        cellRenderer: ({ data }: CustomCellRendererProps) => {
            return (
                <div className="flex justify-end h-full items-center">
                    <Button
                        size={"icon"}
                        variant={"ghost"}
                        onClick={(event) => {
                            const rect = event.currentTarget.getBoundingClientRect();
                            setTableInfo(pre => ({ ...pre, dropdown: { ...pre.dropdown, open: true, position: { x: rect.left + 30, y: rect.top + 30 }, items: [data] } }))
                        }}
                    >
                        <EllipsisVerticalIcon />
                    </Button>

                </div>
            )
        }
    }
]