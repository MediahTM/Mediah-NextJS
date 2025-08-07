"use client";

import Container from '@/components/ui/container';
import DeleteDialog from './delete-dialog';
import ExportDialog from './export-dialog';
import FileContextMenu from '@/components/file-context-menu';
import PageTitle from '@/components/ui/page-title';
import React, { useEffect, useRef, useState } from 'react';
import RenameDialog from './rename-dialog';
import { AgGridReact, CustomCellRendererProps } from 'ag-grid-react';
import { AllCommunityModule, ColDef, ModuleRegistry, themeQuartz } from 'ag-grid-community';
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import { ChevronFirstIcon, ChevronLastIcon, ChevronLeftIcon, ChevronRightIcon, EllipsisVerticalIcon, FolderIcon, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';
import { DEFAULT_PAGE_SIZE, PAGE_SIZES } from '@/lib/constants';
import { Dropdown } from '@/types/dropdown';
import { File } from '@prisma/client';
import { Folder } from '@/types/folder';
import { formatBytes, formatRelativeTime, getFilesInPath } from '@/lib/helpers';
import { getFileIcon } from '@/utils/file-types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { useFiles } from '@/utils/files-context';
import { useStatusBar } from '@/utils/status-bar-context';
import ShareCell from './share-cell';


const FilesView = () => {
    const { files, setFiles, shares } = useFiles();

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
    }, [gridReady, shares])

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
        borderRadius: 0,
        inputBorderRadius: 0,
        checkboxBorderRadius: 0,
        wrapperBorderRadius: 0
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
            },
            cellRenderer: ({ data }: CustomCellRendererProps) => {
                return (
                    <div className='flex items-center gap-2'>
                        {data.isFolder ? <FolderIcon className='size-5 shrink-0' stroke='orange' /> : getFileIcon(data.filename, { className: 'size-5 shrink-0', stroke: 'gray' })}
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
                const [exportDialog, setExportDialog] = useState<boolean>(false);
                const [renameDialog, setRenameDialog] = useState<boolean>(false);
                const [deleteDialog, setDeleteDialog] = useState<boolean>(false);

                return (
                    <div className="flex justify-end h-full items-center">
                        <FileContextMenu items={[data]} dialogTriggers={{ export: () => setExportDialog(true), rename: () => setRenameDialog(true), delete: () => setDeleteDialog(true) }} setStatusBar={setStatusBar} setFiles={setFiles} gridRef={gridRef}>
                            <Button
                                size={"icon"}
                                variant={"ghost"}
                            >
                                <EllipsisVerticalIcon />
                            </Button>
                        </FileContextMenu>

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

    const [dropdownMenu, setDropdownMenu] = useState<Dropdown>({
        open: false,
        position: { x: 0, y: 0 },
        items: [],
        exportDialogOpen: false,
        renameDialogOpen: false,
        deleteDialogOpen: false
    });

    const [renderedResults, setRenderedResults] = useState<(File | Folder)[]>([]);
    const [pageLocation, setPageLocation] = useState("/");

    useEffect(() => {
        gridRef.current?.api.paginationGoToPage(0);
    }, [pageLocation]);

    useEffect(() => {
        if (files.length > 1) {
            const filesToRender = getFilesInPath(pageLocation, files);
            setRenderedResults([...filesToRender.filesInPath, ...filesToRender.foldersInPath]);
        }
    }, [files, pageLocation]);

    return (
        <Container className="h-full flex flex-col">
            <PageTitle title="My Files" />
            <Breadcrumb className='pt-2 pb-3'>
                <BreadcrumbList>
                    <BreadcrumbItem onClick={() => setPageLocation("/")} className='hover:cursor-pointer hover:text-primary transition-all'>
                        Home
                    </BreadcrumbItem>
                    {pageLocation !== "/" && pageLocation.split("/").slice(1).map((location, index) => (
                        <React.Fragment key={index}>
                            <BreadcrumbSeparator />
                            <BreadcrumbItem key={index} onClick={() => setPageLocation(pageLocation.split("/").slice(0, index + 2).join("/"))} className='hover:cursor-pointer hover:text-primary transition-all'>
                                {location}
                            </BreadcrumbItem>
                        </React.Fragment>
                    ))}
                </BreadcrumbList>
            </Breadcrumb>
            <div className="flex-1 flex flex-col h-full">
                <div className="h-full flex flex-col">
                    {!gridReady && pageSize && (
                        <div className="h-full border divide-y flex flex-col">
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
                                rowData={renderedResults || []}
                                className="ag-theme h-full"
                                theme={theme}
                                animateRows={false}
                                paginationPageSizeSelector={pageSizes}
                                pagination={true}
                                paginationPageSize={pageSize}
                                paginationAutoPageSize={fitPage}
                                suppressPaginationPanel={true}
                                suppressCellFocus={true}
                                rowClass={"opacity-100 will-change-[opacity] transition-all duration-500"}
                                rowSelection={{
                                    mode: 'multiRow',
                                    checkboxes: true,
                                    enableClickSelection: true
                                }}
                                onPaginationChanged={(event) => {
                                    const pageSize = Number(event.api.paginationGetPageSize());
                                    const renderedRows = event.api.getRenderedNodes();
                                    // let animatedRows = 0;
                                    // for (const row of renderedRows) {
                                    //     animatedRows++;           
                                    //     const rowElement = document.querySelector(
                                    //         `.ag-row[row-index="${row.rowIndex}"]`
                                    //     );
                                    //     if (!rowElement) break;
                                    //     setTimeout(() => {
                                    //         rowElement.classList.remove("opacity-0");
                                    //         rowElement.classList.add("opacity-100");
                                    //     }, animatedRows * 5);
                                    // }
                                    window.localStorage.setItem('pageSize', String(pageSize));
                                    setCurrentPage(event.api.paginationGetCurrentPage());
                                    setTotalPages(event.api.paginationGetTotalPages());
                                    if (event.newPage && !event.newData) setFiles(files => files.map((file, index) => {
                                        if ((file as any).previousFile) delete (file as any).previousFile
                                        return file;
                                    }));
                                }}
                                ref={gridRef}
                                onGridReady={() => {
                                    toggleColumns();
                                    setGridReady(true);
                                    setCurrentPage(gridRef.current?.api.paginationGetCurrentPage() || 0);
                                    setTotalPages(gridRef.current?.api.paginationGetTotalPages() || 0);
                                }}
                                onCellContextMenu={(event) => {
                                    setDropdownMenu(menu => ({ ...menu, open: false }));
                                    if (!event.node.isSelected()) {
                                        (event.event?.target as HTMLElement)?.click()
                                    }
                                    setDropdownMenu(menu => ({
                                        ...menu,
                                        open: true,
                                        position: {
                                            x: (event.event as MouseEvent)?.clientX,
                                            y: (event.event as MouseEvent)?.clientY
                                        },
                                        items: event.api.getSelectedNodes().map(file => file.data)
                                    }));
                                }}
                                preventDefaultOnContextMenu={true}
                                onCellDoubleClicked={(event) => {
                                    if (event.node.data.isFolder) {
                                        setPageLocation(event.node.data.path);
                                    }
                                }}
                            />
                        )}
                    </div>
                    {(files && files.length > 0) && pageSize && gridReady && (
                        <div className="flex items-center justify-between p-2">
                            <div className="flex items-center justify-center gap-2">
                                <p className='text-sm text-nowrap'>Page Size:</p>
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
                <div>
                    {dropdownMenu.items[0] && !("isFolder" in dropdownMenu.items[0]) && dropdownMenu.open || dropdownMenu.exportDialogOpen && <ExportDialog
                        open={dropdownMenu.exportDialogOpen}
                        setOpen={(value) => setDropdownMenu(menu => ({ ...menu, exportDialogOpen: value }))}
                        file={dropdownMenu.items[0] as File}
                    />}

                    {dropdownMenu.items[0] && !("isFolder" in dropdownMenu.items[0]) && dropdownMenu.open || dropdownMenu.renameDialogOpen && <RenameDialog
                        open={dropdownMenu.renameDialogOpen}
                        setOpen={(value) => setDropdownMenu(menu => ({ ...menu, renameDialogOpen: value }))}
                        file={dropdownMenu.items[0] as File}
                        setFiles={setFiles}
                    />}

                    {dropdownMenu.items[0] && !("isFolder" in dropdownMenu.items[0]) && dropdownMenu.open || dropdownMenu.deleteDialogOpen && <DeleteDialog
                        open={dropdownMenu.deleteDialogOpen}
                        setOpen={(value) => setDropdownMenu(menu => ({ ...menu, deleteDialogOpen: value }))}
                        file={dropdownMenu.items[0] as File}
                        setFiles={setFiles}
                    />}
                </div>
                {dropdownMenu.open && <div className='flex items-center z-[-1] justify-center fixed' style={{ top: dropdownMenu.position.y, left: dropdownMenu.position.x }}>
                    <FileContextMenu open={dropdownMenu.open} onOpenChange={() => setDropdownMenu(menu => ({ ...menu, open: false }))} setStatusBar={setStatusBar} setFiles={setFiles} gridRef={gridRef} items={dropdownMenu.items} dialogTriggers={{
                        rename: () => setDropdownMenu(menu => ({ ...menu, renameDialogOpen: true, open: false })),
                        delete: () => setDropdownMenu(menu => ({ ...menu, deleteDialogOpen: true, open: false })),
                        export: () => setDropdownMenu(menu => ({ ...menu, exportDialogOpen: true, open: false }))
                    }} />
                </div>}
            </div>
        </Container>
    )
}

export default FilesView