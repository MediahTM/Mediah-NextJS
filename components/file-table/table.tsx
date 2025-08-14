import { PAGE_SIZES } from '@/lib/constants';
import { File } from '@prisma/client';
import { AllCommunityModule, ModuleRegistry } from 'ag-grid-community';
import { AgGridReact } from 'ag-grid-react';
import React, { useEffect, useRef, useState } from 'react'
import { theme } from './theme';
import { getColumnDefs } from './column-defs';
import { useStatusBar } from '@/utils/status-bar-context';
import { cn } from '@/lib/utils';
import { getFilesInPath } from '@/lib/helpers';
import { Folder } from '@/types/folder';
import { Dropdown } from '@/types/dropdown';
import FileDropdown, { FileDropdownItem } from '../file-dropdown/file-dropdown';
import SkeletonTable from './skeleton-table';
import { useFileTable } from './table-context';
import DropdownDialogs from '../file-dropdown/dropdown-dialogs';

const FileTable = ({ fileDropdownOptions }: { fileDropdownOptions?: FileDropdownItem[] }) => {
    const { files, setFiles, shares, setShares, tableInfo, setTableInfo } = useFileTable();
    const { setStatusBar } = useStatusBar();

    const gridRef = useRef<AgGridReact>(null);
    useEffect(() => {
        setTableInfo(pre => ({ ...pre, gridRef, columnDefs: getColumnDefs(shares, setShares, setFiles, setStatusBar, gridRef, fileDropdownOptions) }));
    }, [gridRef, setTableInfo]);

    useEffect(() => {
        setTimeout(() => {
            if (gridRef?.current?.api) {
                gridRef.current.api.redrawRows();
                gridRef.current.api.refreshCells();
                gridRef.current.api.refreshHeader();
            }
        }, 100)
    }, [tableInfo.gridReady, shares])

    ModuleRegistry.registerModules([AllCommunityModule]);

    function toggleColumns() {
        gridRef.current?.api.setColumnsVisible(['updatedAt', 'uploadedSize', 'neverExpire'], !(window.innerWidth < 1024)); // lg
    }

    if (typeof window !== 'undefined') {
        window.addEventListener('resize', toggleColumns)
    };

    const [renderedResults, setRenderedResults] = useState<(File | Folder)[]>([]);

    useEffect(() => {
        if (gridRef?.current && tableInfo.gridReady) gridRef.current?.api.paginationGoToPage(0);
    }, [tableInfo.viewingLocation, tableInfo.gridReady]);

    useEffect(() => {
        if (files.length > 1) {
            const filesToRender = getFilesInPath(tableInfo.viewingLocation, files);
            setRenderedResults([...filesToRender.filesInPath, ...filesToRender.foldersInPath]);
        }
    }, [files, tableInfo.viewingLocation]);

    return <>
        <div className="h-full flex flex-col">
            {!tableInfo.gridReady && tableInfo.pageSize && (
                <SkeletonTable columns={tableInfo.columnDefs.length - 1} pageSize={tableInfo.pageSize} />
            )}
            <div className={cn(!tableInfo.gridReady && 'hidden', "flex-1 overflow-hidden")}>
                {(files && files.length > 0) && tableInfo.pageSize && (
                    <AgGridReact
                        columnDefs={tableInfo.columnDefs}
                        rowData={renderedResults || []}
                        className="ag-theme h-full"
                        theme={theme}
                        animateRows={false}
                        paginationPageSizeSelector={PAGE_SIZES}
                        pagination={true}
                        paginationPageSize={tableInfo.pageSize}
                        paginationAutoPageSize={tableInfo.fitPage}
                        suppressPaginationPanel={true}
                        suppressCellFocus={true}
                        rowClass={"opacity-100 will-change-[opacity] transition-all duration-500"}
                        rowSelection={{
                            mode: 'multiRow',
                            checkboxes: true,
                            enableClickSelection: true
                        }}
                        onPaginationChanged={(event) => {
                            setTableInfo(pre => ({ ...pre, currentPage: event.api.paginationGetCurrentPage(), totalPages: event.api.paginationGetTotalPages() }));
                            if (event.newPage && !event.newData) setFiles(files => files.map((file, index) => {
                                if ((file as any).previousFile) delete (file as any).previousFile
                                return file;
                            }));
                        }}
                        ref={gridRef}
                        onGridReady={() => {
                            toggleColumns();
                            setTableInfo(pre => ({ ...pre, gridReady: true, currentPage: gridRef.current?.api.paginationGetCurrentPage() || 0, totalPages: gridRef.current?.api.paginationGetTotalPages() || 0 }));
                        }}
                        onCellContextMenu={(event) => {
                            setTableInfo(pre => ({ ...pre, dropdown: { ...pre.dropdown, open: false } }));
                            if (!event.node.isSelected()) {
                                (event.event?.target as HTMLElement)?.click()
                            }
                            setTableInfo(pre => ({
                                ...pre,
                                dropdown: {
                                    ...pre.dropdown,
                                    open: true,
                                    position: {
                                        x: (event.event as MouseEvent)?.clientX,
                                        y: (event.event as MouseEvent)?.clientY
                                    },
                                    items: event.api.getSelectedNodes().map(file => file.data)
                                }
                            }));
                        }}
                        preventDefaultOnContextMenu={true}
                        onCellDoubleClicked={(event) => {
                            if (event.node.data.isFolder) {
                                setTableInfo(pre => ({ ...pre, viewingLocation: event.node.data.path }));
                            }
                        }}
                    />
                )}
            </div>
        </div>
        <div>
            <DropdownDialogs
                dropdown={tableInfo.dropdown}
                setDropdown={(value) => {
                    setTableInfo(prev => ({
                        ...prev,
                        dropdown: typeof value === 'function'
                            ? (value as (prev: Dropdown) => Dropdown)(prev.dropdown)
                            : value
                    }));
                }}
                setFiles={setFiles}
                setShares={setShares}
                shares={shares}
            />
        </div>
        {tableInfo.dropdown.open && <div className='flex items-center z-[-1] justify-center fixed' style={{ top: tableInfo.dropdown.position.y, left: tableInfo.dropdown.position.x }}>
            <FileDropdown
                setShares={setShares}
                shares={shares}
                customOptions={fileDropdownOptions}
                open={tableInfo.dropdown.open}
                onOpenChange={() => setTableInfo(pre => ({ ...pre, dropdown: { ...pre.dropdown, open: false } }))}
                setStatusBar={setStatusBar}
                setFiles={setFiles}
                gridRef={gridRef}
                items={tableInfo.dropdown.items}
                dropdown={tableInfo.dropdown}
                setDropdown={(value) => {
                    setTableInfo(prev => ({
                        ...prev,
                        dropdown: typeof value === 'function'
                            ? (value as (prev: Dropdown) => Dropdown)(prev.dropdown)
                            : value
                    }));
                }}
            />
        </div>}
    </>
}

export default FileTable