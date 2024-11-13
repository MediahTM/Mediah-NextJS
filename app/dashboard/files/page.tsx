"use client";

import { Button } from '@/components/ui/button';
import Container from '@/components/ui/container'
import PageTitle from '@/components/ui/page-title'
import { formatBytes, formatRelativeTime } from '@/lib/helpers';
import { ArrowUpDown, Settings } from 'lucide-react';
import React, { useEffect, useState } from 'react'
import ShareDialog from './share-dialog';
import { File } from '@prisma/client';
import { ColumnDef } from '@tanstack/react-table';
import { Checkbox } from '@/components/ui/checkbox';
import { DataTable } from '@/components/ui/data-table';
import { Switch } from '@/components/ui/switch';
import { toast } from '@/hooks/use-toast';

const FilesPage = () => {
    const [files, setFiles] = useState<[] | File[]>([]);

    useEffect(() => {
        fetch(`/api/file`, {
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
    }, [])

    const columns: ColumnDef<File>[] = [
        {
            id: "select",
            header: ({ table }) => (
                <Checkbox
                    checked={
                        table.getIsAllPageRowsSelected() ||
                        (table.getIsSomePageRowsSelected() && "indeterminate")
                    }
                    onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                    aria-label="Select all"
                />
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
            accessorKey: "parts",
            header: "Parts",
            cell: ({ row }) => {
                return (
                    <p>{Object.values(row.original.parts || []).length}</p>
                )
            }
        },
        {
            accessorKey: "globalexpiry",
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

                const handleSwitchChange = (checked: boolean) => {
                    setUseOpen(checked);
                };

                return (
                    <div className="flex items-center gap-2 h-8">
                        <Switch
                            defaultChecked={Boolean(endDate != null)}
                            onCheckedChange={handleSwitchChange}
                        />

                        <ShareDialog
                            open={useOpen}
                            setOpen={setUseOpen}
                            file={row.original}
                        />

                        {Boolean(row.original.endDate != null) && (
                            <Button variant="ghost" size="sm" className="w-8">
                                <Settings />
                            </Button>
                        )}
                    </div>
                );
            },
            enableHiding: false
        },
        {
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
                const [uploadedAt, setUploadedAt] = useState<string>(formatRelativeTime(new Date(row.original.uploadedAt.toString())));

                setInterval(() => {
                    setUploadedAt(formatRelativeTime(new Date(row.original.uploadedAt.toString())))
                }, 1000);

                return (
                    <p>{uploadedAt}</p>
                )
            }
        }
    ]

    return (
        <Container>
            <PageTitle title="My Files" />
            <div className="space-y-4">
                <DataTable filterBy='filename' columns={columns} data={files} />
            </div>
        </Container>
    )
}

export default FilesPage