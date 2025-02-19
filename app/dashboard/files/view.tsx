"use client";

import { Button } from '@/components/ui/button';
import Container from '@/components/ui/container'
import PageTitle from '@/components/ui/page-title'
import { formatBytes, formatRelativeTime } from '@/lib/helpers';
import { EllipsisVerticalIcon, Settings } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react'
import ShareDialog from './share-dialog';
import { Switch } from '@/components/ui/switch';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import ExportDialog from './export-dialog';
import RenameDialog from './rename-dialog';
import DeleteDialog from './delete-dialog';
import { toast } from 'sonner';
import { AgGridReact, CustomCellRendererProps } from 'ag-grid-react';
import { AllCommunityModule, ColDef, ModuleRegistry, themeQuartz } from 'ag-grid-community';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { downloadFiles } from '@/utils/file-store/download';
import { useStatusBar } from '@/utils/status-bar-context';
import { fetchFiles, useFiles } from '@/utils/files-context';
import axios from 'axios';

const FilesView = () => {
    const { files, setFiles } = useFiles();
    const [gridReady, setGridReady] = useState<boolean>(false);
    const gridRef = useRef<AgGridReact>(null);

    const { setStatusBar } = useStatusBar();

    const pageSizes: number[] = [10, 20, 30, 40, 50, 100];
    const pageSize: number = pageSizes[1];

    useEffect(() => {
        setTimeout(() => {       
            if (gridRef?.current?.api) {
                gridRef.current.api.redrawRows();
                gridRef.current.api.refreshCells();
                gridRef.current.api.refreshHeader();
            }
        }, 100)
    }, [gridReady])

    useEffect(() => {
        fetchFiles(setFiles);
    }, [])

    ModuleRegistry.registerModules([AllCommunityModule]);

    const theme = themeQuartz.withParams({
        backgroundColor: 'hsl(var(--background))',
        foregroundColor: 'hsl(var(--foreground))',
        headerTextColor: 'hsl(var(--foreground))',
        borderColor: 'hsl(var(--border))',
        oddRowBackgroundColor: 'rgb(0, 0, 0, 0.03)',
        rowHoverColor: 'rgb(255, 255, 255, 0.01)',
        headerColumnResizeHandleColor: 'hsl(var(--border))',
        rangeSelectionBorderColor: 'hsl(var(--primary))',
        inputFocusBorder: '1px solid hsl(var(--border))',
        focusShadow: '0px 0px 0px 3px color-mix(in srgb, transparent, hsl(var(--border)) 50%)',
        headerFontWeight: 700,
        checkboxCheckedBackgroundColor: 'hsl(var(--primary))',
        checkboxCheckedBorderColor: 'hsl(var(--primary))',
        menuBorder: '1px solid hsl(var(--border))',
        accentColor: 'hsl(var(--primary))',
    });

    const [columnsDefs] = useState<ColDef[]>([
        {
            field: "filename",
            headerName: "Filename",
            flex: 1,
            filter: true,
            filterParams: {
                filterOptions: ['contains', 'notContains', 'startsWith', 'endsWith'],
            }
        },
        {
            field: "uploadedSize",
            headerName: "File Size",
            cellRenderer: ({ data }: CustomCellRendererProps) => {
                return (
                    <p>{formatBytes(data.uploadedSize)}</p>
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
            field: "neverExpire",
            headerName: "Shared",
            cellRenderer: ({ data }: CustomCellRendererProps) => {
                const [useOpen, setUseOpen] = useState<boolean>(false);

                const checked = Boolean(
                    data.neverExpire ||
                    (data.shareDate && data.endDate) ||
                    data.endDate != null ||
                    useOpen
                )

                const handleSwitchChange = async (checked: boolean) => {
                    const file = files.find((file) => file.id === data.id);

                    if (checked) {
                        setUseOpen(true);
                        return;
                    }

                    if (!file) {
                        toast.error("Unable to locate the file for update.");
                        return;
                    }

                    const response = await axios.put(`/api/file`, {
                        ...file,
                        neverExpire: false,
                        shareDate: null,
                        endDate: null
                    })

                    if (response.data.success) {
                        setFiles(files => files.map((file) => {
                            if (file.id === data.id) {
                                return {
                                    ...file,
                                    updatedAt: new Date(new Date().getTime() - 1 * 1000),
                                    neverExpire: false,
                                    shareDate: null,
                                    endDate: null
                                };
                            }
                            return file;
                       }))
                    }
                };

                return (
                    <div className="flex items-center gap-2 h-full">
                        <Switch
                            checked={checked}
                            onCheckedChange={handleSwitchChange}
                        />

                        <ShareDialog
                            open={useOpen}
                            setOpen={setUseOpen}
                            file={data}
                            setFiles={setFiles}
                        />

                        {checked && (
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
            },
            comparator: (valueA, valueB, nodeA, nodeB, isDescending) => {
                const aChecked = Boolean(
                    nodeA.data.neverExpire ||
                    (nodeA.data.shareDate && nodeA.data.endDate) ||
                    nodeA.data.endDate != null
                );
                const bChecked = Boolean(
                    nodeB.data.neverExpire ||
                    (nodeB.data.shareDate && nodeB.data.endDate) ||
                    nodeB.data.endDate != null
                );
                return aChecked === bChecked ? 0 : aChecked ? 1 : -1;
            },
        },
        {
            headerName: "Updated At",
            field: "updatedAt",
            filter: true,
            filterParams: {
                filterOptions: ['inRange'],
            },
            cellRenderer: ({ data }: CustomCellRendererProps) => {
                const [updatedAt, setUpdatedAt] = useState<string>(formatRelativeTime(new Date(data.updatedAt.toString())));

                setInterval(() => {
                    setUpdatedAt(formatRelativeTime(new Date(data.updatedAt.toString())))
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
            sortable: false,
            cellRenderer: ({ data }: CustomCellRendererProps) => {
                const [exportDialog, setExportDialog] = useState<boolean>(false);
                const [renameDialog, setRenameDialog] = useState<boolean>(false);
                const [deleteDialog, setDeleteDialog] = useState<boolean>(false);

                return (
                    <div className="flex justify-end h-full items-center">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    size={"icon"}
                                    variant={"ghost"}
                                >
                                    <EllipsisVerticalIcon />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align='end'>
                                <DropdownMenuItem onClick={() => downloadFiles([data], setStatusBar)}>Download</DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => setExportDialog(true)}>Export</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setRenameDialog(true)}>Rename</DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => setDeleteDialog(true)}>Delete</DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>

                        <ExportDialog
                            open={exportDialog}
                            setOpen={setExportDialog}
                            file={data}
                        />

                        <RenameDialog
                            open={renameDialog}
                            setOpen={setRenameDialog}
                            file={data}
                            setFiles={setFiles}
                        />

                        <DeleteDialog
                            open={deleteDialog}
                            setOpen={setDeleteDialog}
                            file={data}
                            setFiles={setFiles}
                        />

                    </div>
                )
            }
        }
    ]);

    return (
        <Container className="h-full flex flex-col">
            <PageTitle title="My Files" />
            <div className="flex-1 flex flex-col h-full">
                <div className="h-full flex flex-col">
                    {!gridReady && (
                        <div className="h-full border divide-y rounded-lg flex flex-col">
                            <div className="grid bg-border/15 grid-cols-5 gap-4 p-4 h-[48px]">
                                {Array.from({ length: columnsDefs.length }).map((_, index) => (
                                    <div key={index} className="flex items-center gap-2 justify-between">
                                        <Skeleton className="h-[19px] w-4/6" />
                                        <div className="h-[14px] w-[2px] bg-border" />
                                    </div>
                                ))}
                            </div>
                            <div className="flex flex-col flex-[1_1_0] overflow-hidden">
                                <div className="flex-1 flex flex-col overflow-y-auto">
                                    {Array.from({ length: pageSize }).map((_, rowIndex) => (
                                        <div
                                            key={rowIndex}
                                            className="grid bg-border/15 grid-cols-5 gap-4 p-4 h-[48px]"
                                        >
                                            {Array.from({ length: columnsDefs.length }).map((_, colIndex) => (
                                                <div key={colIndex} className="flex items-center gap-2 justify-between">
                                                    <Skeleton className="h-[19px] w-full" />
                                                </div>
                                            ))}
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="h-[42px] px-1 border-t flex items-center justify-end">
                                <Skeleton className="md:w-[38%] w-full h-[32px]" />
                            </div>
                        </div>
                    )}
                    <div className={cn(!gridReady && 'hidden', "flex-1 overflow-hidden")}>
                        {(files && files.length > 0) && (
                            <AgGridReact
                                columnDefs={columnsDefs}
                                rowData={files || []}
                                className="ag-theme h-full"
                                theme={theme}
                                pagination={true}
                                paginationPageSize={pageSize}
                                ref={gridRef}
                                onGridReady={() => {
                                    setGridReady(true);
                                }}
                            />
                        )}
                    </div>
                </div>
            </div>
        </Container>
    )
}

export default FilesView