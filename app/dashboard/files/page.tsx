"use client";

import { Button } from '@/components/ui/button';
import Container from '@/components/ui/container'
import PageTitle from '@/components/ui/page-title'
import { formatBytes, formatRelativeTime } from '@/lib/helpers';
import { ArrowUpDown, EllipsisVerticalIcon, Settings } from 'lucide-react';
import React, { useEffect, useState } from 'react'
import ShareDialog from './share-dialog';
import { File } from '@prisma/client';
import { ColumnDef } from '@tanstack/react-table';
import { Checkbox } from '@/components/ui/checkbox';
import { DataTable } from '@/components/ui/data-table';
import { Switch } from '@/components/ui/switch';
import { toast } from '@/hooks/use-toast';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import ExportDialog from './export-dialog';
import RenameDialog from './rename-dialog';
import DeleteDialog from './delete-dialog';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';

const FilesPage = () => {
    const [files, setFiles] = useState<[] | File[]>([]);
    const [reload, setReload] = useState<boolean>(false);

    useEffect(() => {
        fetch(`/api/file?isActive=true`, {
            method: "GET"
        })
            .then((response) => response.json())
            .then((response) => {
                if (response.success) {
                    setFiles(response.data)
                }
                else {
                    toast({
                        title: "Fetch Error",
                        description: "Could not fetch user files!"
                    })
                }
            })
    }, [reload])

    const columns: ColumnDef<File>[] = [
        {
            id: "select",
            header: ({ table }) => (
                <div className='w-full h-full flex items-center justify-start'>
                    <Checkbox
                        checked={
                            table.getIsAllPageRowsSelected() ||
                            (table.getIsSomePageRowsSelected() && "indeterminate")
                        }
                        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                        aria-label="Select all"
                    />
                </div>
            ),
            cell: ({ row }) => (
                <Checkbox
                    checked={row.getIsSelected()}
                    onCheckedChange={(value) => row.toggleSelected(!!value)}
                    aria-label="Select row"
                />
            ),
            enableSorting: false,
            enableHiding: false,
        },
        {
            accessorKey: "filename",
            header: ({ column }) => {
                return (
                    <Button
                        variant="ghost"
                        className='-ml-1'
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    >
                        Filename
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                )
            },
            cell: ({ row }) => {
                return (
                    <p className='ml-3'>{row.original.filename}</p>
                )
            },
            enableHiding: false
        },
        {
            meta: "File Size",
            accessorKey: "uploadedsize",
            header: ({ column }) => {
                return (
                    <Button
                        variant="ghost"
                        className='-ml-4'
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    >
                        File Size
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                )
            },
            cell: ({ row }) => {
                return (
                    <p>{formatBytes(row.original.uploadedSize)}</p>
                )
            }
        },
        {
            meta: "Parts",
            accessorKey: "parts",
            header: "Parts",
            cell: ({ row }) => {
                return (
                    <p>{Object.values(row.original.parts || []).length}</p>
                )
            }
        },
        {
            accessorKey: "neverExpire",
            header: ({ column }) => {
                return (
                    <Button
                        variant="ghost"
                        className='-ml-4'
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    >
                        Shared
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                )
            },
            cell: ({ row }) => {
                const { endDate } = row.original;
                const [useOpen, setUseOpen] = useState<boolean>(false);
                const [isUpdate, setIsUpdate] = useState<boolean>(false);

                const checked = Boolean(
                    row.original.neverExpire ||
                    (row.original.shareDate && row.original.endDate) ||
                    endDate != null ||
                    useOpen
                )

                const handleSwitchChange = (checked: boolean) => {
                    if (checked) {
                        setIsUpdate(false)
                        setUseOpen(checked);
                    }
                    else {
                        const file = files.find((file) => file.id === row.original.id);

                        if (!file) {
                            toast({
                                title: "File Not Found",
                                description: "Unable to locate the file for update.",
                            });

                            return;
                        }

                        fetch(`/api/file`, {
                            method: "PUT",
                            body: JSON.stringify({
                                ...file,
                                neverExpire: false,
                                shareDate: null,
                                endDate: null
                            })
                        })
                            .then((response) => response.json())
                            .then((response) => {
                                if (response.success) {
                                    setReload(!reload);
                                }
                                else {
                                    toast({
                                        title: "Update Error",
                                        description: response.message || "Could not update file!"
                                    })
                                }
                            })
                    }
                };

                return (
                    <div className="flex items-center gap-2 h-8">
                        <Switch
                            checked={checked}
                            onCheckedChange={handleSwitchChange}
                        />

                        <ShareDialog
                            open={useOpen}
                            setOpen={setUseOpen}
                            file={row.original}
                            update={isUpdate}
                            setReload={setReload}
                            reload={reload}
                        />

                        {checked && (
                            <Button
                                onClick={() => {
                                    setIsUpdate(true)
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
            enableHiding: false
        },
        {
            meta: "Updated At",
            accessorKey: "updatedAt",
            header: ({ column }) => {
                return (
                    <Button
                        variant="ghost"
                        className='-ml-4'
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    >
                        Updated At
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                )
            },
            cell: ({ row }) => {
                const [updatedAt, setUpdatedAt] = useState<string>(formatRelativeTime(new Date(row.original.updatedAt.toString())));

                setInterval(() => {
                    setUpdatedAt(formatRelativeTime(new Date(row.original.updatedAt.toString())))
                }, 1000);

                return (
                    <p>{updatedAt}</p>
                )
            }
        },
        {
            header: " ",
            cell: ({ row }) => {
                const [exportDialog, setExportDialog] = useState<boolean>(false);
                const [renameDialog, setRenameDialog] = useState<boolean>(false);
                const [deleteDialog, setDeleteDialog] = useState<boolean>(false);

                return (
                    <div className="flex justify-end">
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
                                <DropdownMenuItem>Download</DropdownMenuItem>
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
                            file={row.original}
                        />

                        <RenameDialog
                            open={renameDialog}
                            setOpen={setRenameDialog}
                            file={row.original}
                            setReload={setReload}
                            reload={reload}
                        />

                        <DeleteDialog
                            open={deleteDialog}
                            setOpen={setDeleteDialog}
                            file={row.original}
                            setReload={setReload}
                            reload={reload}
                        />

                    </div>
                )
            },
            enableHiding: false
        }
    ]

    return (
        <Container>
            <PageTitle title="My Files" />
            <div className="space-y-4">
                <ScrollArea className='w-full'>
                    <DataTable filterBy='filename' columns={columns} data={files} />
                    <ScrollBar orientation='horizontal' />
                </ScrollArea>
            </div>
        </Container>
    )
}

export default FilesPage