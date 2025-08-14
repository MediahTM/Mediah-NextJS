import React from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Button } from '../ui/button';
import { ChevronFirstIcon, ChevronLastIcon, ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';
import { useFileTable } from './table-context';
import { PAGE_SIZES } from '@/lib/constants';

const FileTablePageNavigation = () => {
    const { files, tableInfo, setTableInfo } = useFileTable();
    return (
        (files && files.length > 0) && tableInfo.pageSize && tableInfo.gridReady && (
            <div className="flex items-center justify-between p-2">
                <div className="flex items-center justify-center gap-2">
                    <p className='text-sm text-nowrap'>Page Size:</p>
                    <Select value={tableInfo.fitPage ? 'Fit' : tableInfo.pageSize.toString()} onValueChange={(value) => {
                        if (value === 'Fit') setTableInfo(pre => ({ ...pre, fitPage: true }));
                        else {
                            setTableInfo(pre => ({ ...pre, fitPage: false, pageSize: Number(value) }));
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
                            {PAGE_SIZES.map((size) => (
                                <SelectItem key={size} value={size.toString()} className="text-sm">
                                    {size}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <p className='text-sm text-nowrap md:block hidden'>Page {tableInfo.currentPage + 1}/{tableInfo.totalPages}</p>
                <div className="flex items-center justify-center gap-2">
                    <Button size="icon" variant="outline" onClick={() => tableInfo.gridRef?.current?.api.paginationGoToFirstPage()} disabled={tableInfo.currentPage <= 0 || tableInfo.totalPages <= 1}>
                        <ChevronFirstIcon className="size-4" />
                    </Button>
                    <Button size="icon" variant="outline" onClick={() => tableInfo.gridRef?.current?.api.paginationGoToPreviousPage()} disabled={tableInfo.currentPage <= 0 || tableInfo.totalPages <= 1}>
                        <ChevronLeftIcon className="size-4" />
                    </Button>
                    <Button size="icon" variant="outline" onClick={() => tableInfo.gridRef?.current?.api.paginationGoToNextPage()} disabled={tableInfo.currentPage >= (tableInfo.totalPages - 1) || tableInfo.totalPages <= 1}>
                        <ChevronRightIcon className="size-4" />
                    </Button>
                    <Button size="icon" variant="outline" onClick={() => tableInfo.gridRef?.current?.api.paginationGoToLastPage()} disabled={tableInfo.currentPage >= (tableInfo.totalPages - 1) || tableInfo.totalPages <= 1}>
                        <ChevronLastIcon className="size-4" />
                    </Button>
                </div>
            </div>
        )
    )
}

export default FileTablePageNavigation