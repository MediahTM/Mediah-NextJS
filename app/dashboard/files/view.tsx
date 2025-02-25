"use client";

import axios from 'axios';
import Container from '@/components/ui/container';
import DeleteDialog from './delete-dialog';
import ExportDialog from './export-dialog';
import PageTitle from '@/components/ui/page-title';
import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import RenameDialog from './rename-dialog';
import ShareDialog from './share-dialog';
import { AgGridReact, CustomCellRendererProps } from 'ag-grid-react';
import { AllCommunityModule, ColDef, ModuleRegistry, themeQuartz } from 'ag-grid-community';
import { Button } from '@/components/ui/button';
import { ChevronFirstIcon, ChevronLastIcon, ChevronLeft, ChevronLeftIcon, ChevronRight, ChevronRightIcon, EllipsisVerticalIcon, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';
import { DEFAULT_PAGE_SIZE, PAGE_SIZES } from '@/lib/constants';
import { downloadFiles } from '@/utils/file-store/download';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { formatBytes, formatRelativeTime } from '@/lib/helpers';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { useFiles } from '@/utils/files-context';
import { useStatusBar } from '@/utils/status-bar-context';

const FilesView = () => {
    const { files, setFiles, fetchFiles } = useFiles();
    const [gridReady, setGridReady] = useState<boolean>(false);
    const gridRef = useRef<AgGridReact>(null);

    const { setStatusBar } = useStatusBar();

    const [pageSize, setPageSize] = useState<number | null>(null);

    const [fitPage, setFitPage] = useState(true);

    useEffect(() => {
        if (fitPage) localStorage.setItem("pageSize", "Fit");
    }, [fitPage])

    useEffect(() => {
        if (localStorage.getItem("pageSize") !== "Fit") setFitPage(false);
        setPageSize(Number(localStorage.getItem("pageSize")) || DEFAULT_PAGE_SIZE);
        fetchFiles();
    }, [])

    const pageSizes: number[] = PAGE_SIZES;

    useEffect(() => {
        setTimeout(() => {
            if (gridRef?.current?.api) {
                gridRef.current.api.redrawRows();
                gridRef.current.api.refreshCells();
                gridRef.current.api.refreshHeader();
            }
        }, 100)
    }, [gridReady])

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
            suppressMovable: true,
            filter: true,
            filterParams: {
                filterOptions: ['contains', 'notContains', 'startsWith', 'endsWith'],
            }
        },
        {
            field: "uploadedSize",
            headerName: "File Size",
            suppressMovable: true,
            width: 140,
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
            headerName: "Updated At",
            field: "updatedAt",
            suppressMovable: true,
            filter: true,
            width: 150,
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
            field: "neverExpire",
            headerName: "Shared",
            suppressMovable: true,
            resizable: false,
            width: 100,
            cellRenderer: ({ data }: CustomCellRendererProps) => {
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

                    let previousFiles;

                    setFiles((files) => {
                        previousFiles = files;
                        return files.map((file) => {
                            if (file.id === data.id) {
                                return {
                                    ...file,
                                    updatedAt: new Date(new Date().getTime() - 1 * 1000),
                                    neverExpire: false,
                                    shareDate: null,
                                    endDate: null,
                                    previousFile: file
                                };
                            }
                            if ((file as any).previousFile) delete (file as any).previousFile;
                            return file;
                        })
                    })

                    const response = await axios.put(`/api/file`, {
                        ...data,
                        neverExpire: false,
                        shareDate: null,
                        endDate: null
                    })

                    if (!response.data.success && previousFiles) {
                        toast.error("Could not update file!");
                        setFiles(previousFiles);
                    }
                };

                const [fileState, setFileState] = useState(data.previousFile || data);

                useLayoutEffect(() => {
                    if (data.previousFile) setTimeout(() => setFileState(data), 100);
                }, [])

                return (
                    <div className="flex items-center gap-2 h-full">
                        <Switch
                            checked={fileState.neverExpire ||
                                (fileState.shareData && fileState.endDate) ||
                                fileState.endDate != null || useOpen}
                            onCheckedChange={handleSwitchChange}
                        />

                        <ShareDialog
                            open={useOpen}
                            setOpen={setUseOpen}
                            file={data}
                            setFiles={setFiles}
                        />

                        {(fileState.neverExpire ||
                            (fileState.shareData && fileState.endDate) ||
                            fileState.endDate != null || useOpen) && (
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
            headerName: " ",
            resizable: false,
            width: 70,
            suppressMovable: true,
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


    function toggleColumns() {
        gridRef.current?.api.setColumnsVisible(['updatedAt', 'uploadedSize', 'neverExpire'], !(window.innerWidth < 1024)); // lg
    }

    if (typeof window !== 'undefined') {
        window.addEventListener('resize', toggleColumns)
    };

    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

    return (
        <Container className="h-full flex flex-col">
            <PageTitle title="My Files" />
            <div className="flex-1 flex flex-col h-full">
                <div className="h-full flex flex-col">
                    {!gridReady && pageSize && (
                        <div className="h-full border divide-y rounded-lg flex flex-col">
                            <div style={{ gridTemplateColumns: `repeat(${columnsDefs.length - (window.innerWidth < 1024 ? 4 : 1)}, minmax(0, 1fr))` }} className="grid bg-border/15 grid-cols-5 gap-4 p-4 h-[48px]">
                                {Array.from({ length: columnsDefs.length - (window.innerWidth < 1024 ? 4 : 1) }).map((_, index) => (
                                    <div key={index} className="flex items-center gap-2 justify-between">
                                        <Skeleton className="h-[19px] w-4/6" />
                                        <div className="h-[14px] w-[2px] bg-border" />
                                    </div>
                                ))}
                            </div>
                            <div className="flex flex-col flex-[1_1_0] overflow-hidden">
                                <div className="flex-1 flex flex-col overflow-y-auto">
                                    {Array.from({ length: Number(pageSize) }).map((_, rowIndex) => (
                                        <div
                                            key={rowIndex}
                                            style={{ gridTemplateColumns: `repeat(${columnsDefs.length - (window.innerWidth < 1024 ? 4 : 1)}, minmax(0, 1fr))` }}
                                            className="grid bg-border/15 gap-4 px-4 shrink-0 border-b h-[41px]"
                                        >
                                            {Array.from({ length: columnsDefs.length - (window.innerWidth < 1024 ? 4 : 1) }).map((_, colIndex) => (
                                                <div key={colIndex} className="flex items-center gap-2 justify-between">
                                                    <Skeleton className="h-[19px] w-full" />
                                                </div>
                                            ))}
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="h-[41px] px-1 border-t flex items-center justify-end">
                                <Skeleton className="md:w-[38%] w-full h-[32px]" />
                            </div>
                        </div>
                    )}
                    <div className={cn(!gridReady && 'hidden', "flex-1 overflow-hidden")}>
                        {(files && files.length > 0) && pageSize && (
                            <AgGridReact
                                columnDefs={columnsDefs}
                                rowData={files || []}
                                className="ag-theme h-full"
                                theme={theme}
                                animateRows={false}
                                paginationPageSizeSelector={pageSizes}
                                pagination={true}
                                paginationPageSize={pageSize}
                                paginationAutoPageSize={fitPage}
                                suppressPaginationPanel={true}
                                onPaginationChanged={(event) => {
                                    const pageSize = Number(event.api.paginationGetPageSize());
                                    window.localStorage.setItem('pageSize', String(pageSize));
                                    setCurrentPage(event.api.paginationGetCurrentPage());
                                    setTotalPages(event.api.paginationGetTotalPages());
                                }}
                                ref={gridRef}
                                onGridReady={() => {
                                    toggleColumns();
                                    setGridReady(true);
                                    setCurrentPage(gridRef.current?.api.paginationGetCurrentPage() || 0);
                                    setTotalPages(gridRef.current?.api.paginationGetTotalPages() || 0);
                                }}
                            />
                        )}
                    </div>
                    {(files && files.length > 0) && pageSize && gridReady && (
                        <div className="flex items-center justify-between p-2">
                            <div className="flex items-center justify-center gap-2">
                                <p className='text-sm text-nowrap'>Page size:</p>
                                <Select value={fitPage ? 'Fit' : pageSize.toString()} onValueChange={(value) => {
                                    if (value === 'Fit') setFitPage(true)
                                    else {
                                        setFitPage(false)
                                        setPageSize(Number(value))
                                    }
                                }
                                }>
                                    <SelectTrigger>
                                        <SelectValue className="text-sm" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Fit" className="text-sm">
                                            <span className='pr-1.5'>Fit</span>
                                        </SelectItem>
                                        {pageSizes.map((size) => (
                                            <SelectItem key={size} value={size.toString()} className="text-sm">
                                                {size}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <p className='text-sm text-nowrap md:block hidden'>Page {currentPage + 1}/{totalPages}</p>
                            <div className="flex items-center justify-center gap-2">
                                <Button size="icon" variant="outline" onClick={() => gridRef.current?.api.paginationGoToFirstPage()} disabled={currentPage <= 0 || totalPages <= 1}>
                                    <ChevronFirstIcon className="size-4" />
                                </Button>
                                <Button size="icon" variant="outline" onClick={() => gridRef.current?.api.paginationGoToPreviousPage()} disabled={currentPage <= 0 || totalPages <= 1}>
                                    <ChevronLeftIcon className="size-4" />
                                </Button>
                                <Button size="icon" variant="outline" onClick={() => gridRef.current?.api.paginationGoToNextPage()} disabled={currentPage >= (totalPages - 1) || totalPages <= 1}>
                                    <ChevronRightIcon className="size-4" />
                                </Button>
                                <Button size="icon" variant="outline" onClick={() => gridRef.current?.api.paginationGoToLastPage()} disabled={currentPage >= (totalPages - 1) || totalPages <= 1}>
                                    <ChevronLastIcon className="size-4" />
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </Container>
    )
}

export default FilesView