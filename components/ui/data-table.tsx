"use client"

import { ColumnDef, flexRender, getCoreRowModel, getFilteredRowModel, getPaginationRowModel, getSortedRowModel, useReactTable } from "@tanstack/react-table"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "./button"
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuGroup, DropdownMenuSeparator, DropdownMenuTrigger } from "./dropdown-menu"
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Settings2 } from "lucide-react"
import { Input } from "./input"
import { DropdownMenuLabel } from "@radix-ui/react-dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./select"
import { DEFAULT_PAGE_SIZE, PAGE_SIZES } from "@/lib/constants"

interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[]
    data: TData[]
}

export function DataTable<TData, TValue>({
    filterBy,
    columns,
    data,
}: { filterBy: string } & DataTableProps<TData, TValue>) {
    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        initialState: {
            pagination: {
                pageSize: Number(localStorage.getItem("pageSize") || DEFAULT_PAGE_SIZE)
            }
        }
    })

    return (
        <div>
            <div className="flex items-center gap-4 py-4">
                <Input
                    placeholder={`Filter ${filterBy[0].toUpperCase() + filterBy.slice(1, filterBy.length)}...`}
                    value={(table.getColumn(filterBy)?.getFilterValue() as string) ?? ""}
                    onChange={(event) =>
                        table.getColumn(filterBy)?.setFilterValue(event.target.value)
                    }
                    className="max-w-sm"
                />
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button size={"sm"} variant="outline" className="ml-auto">
                            <Settings2 />
                            View
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-38">
                        <DropdownMenuLabel className="text-xs font-bold px-2 py-1">Toggle Columns</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuGroup>
                            {table
                                .getAllColumns()
                                .filter((column) => column.getCanHide())
                                .map((column) => {
                                    return (
                                        <DropdownMenuCheckboxItem
                                            key={column.id}
                                            className="capitalize"
                                            checked={column.getIsVisible()}
                                            onCheckedChange={(value) =>
                                                column.toggleVisibility(!!value)
                                            }
                                        >
                                            {column.id}
                                        </DropdownMenuCheckboxItem>
                                    )
                                })}
                        </DropdownMenuGroup>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => {
                                    return (
                                        <TableHead key={header.id}>
                                            {header.isPlaceholder
                                                ? null
                                                : flexRender(
                                                    header.column.columnDef.header,
                                                    header.getContext()
                                                )}
                                        </TableHead>
                                    )
                                })}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow
                                    key={row.id}
                                    data-state={row.getIsSelected() && "selected"}
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id}>
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="h-24 text-center">
                                    No results.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
            <div className="flex items-center justify-end space-x-2 py-4">
                <div className="flex-1 text-sm text-muted-foreground">
                    {table.getFilteredSelectedRowModel().rows.length} of{" "}
                    {table.getFilteredRowModel().rows.length} row(s) selected.
                </div>
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-4">
                        <div className="flex-1 text-sm text-muted-foreground">
                            {"Page"}{" "}{table.getState().pagination.pageIndex + 1} of{" "}
                            {table.getPageCount().toLocaleString()}
                        </div>
                        <Select
                            value={`${table.getState().pagination.pageSize}`}
                            onValueChange={(value) => {
                                table.setPageSize(Number(value))
                                localStorage.setItem("pageSize", String(value))
                            }}
                        >
                            <SelectTrigger className="w-[75px]">
                                <SelectValue placeholder={table.getState().pagination.pageSize} />
                            </SelectTrigger>
                            <SelectContent className="w-[75px] min-w-[unset]">
                                {PAGE_SIZES.map((pageSize: number) => (
                                    <SelectItem key={pageSize} value={`${pageSize}`}>
                                        {pageSize}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() => table.setPageIndex(0)}
                            disabled={!table.getCanPreviousPage()}
                        >
                            <ChevronsLeft />
                        </Button>

                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() => table.previousPage()}
                            disabled={!table.getCanPreviousPage()}
                        >
                            <ChevronLeft />
                        </Button>

                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() => table.nextPage()}
                            disabled={!table.getCanNextPage()}
                        >
                            <ChevronRight />
                        </Button>

                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                            disabled={!table.getCanNextPage()}
                        >
                            <ChevronsRight />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}