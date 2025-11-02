"use client";

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox';
import { DataTable } from '@/components/ui/data-table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { formatRelativeTime } from '@/lib/helpers';
import { Webhook } from '@prisma/client';
import { ColumnDef } from '@tanstack/react-table';
import { ArrowUpDown, EllipsisVerticalIcon, LoaderCircleIcon } from 'lucide-react';
import React, { useState } from 'react'
import EditWebhook from '../../../components/dialogs/edit-webhook/edit-dialog';
import DeleteDialog from '../../../components/dialogs/delete-webhook/delete-dialog';
import { useWebhooks } from '@/utils/webhooks-context';

const WebhooksTable = () => {
    const { webhooks, loading } = useWebhooks();

    const columns: ColumnDef<Webhook>[] = [
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
            accessorKey: "name",
            meta: "Name",
            header: "Name"
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
                const [editWebhook, setEditWebhook] = useState<boolean>(false);
                const [deleteWebhook, setDeleteWebhook] = useState<boolean>(false);

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
                                <DropdownMenuItem onClick={() => setEditWebhook(true)}>Edit</DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => setDeleteWebhook(true)}>Delete</DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>

                        <EditWebhook
                            open={editWebhook}
                            setOpen={setEditWebhook}
                            webhook={row.original}
                        />

                        <DeleteDialog
                            open={deleteWebhook}
                            setOpen={setDeleteWebhook}
                            webhook={row.original}
                        />
                    </div>
                )
            },
            enableHiding: false,
        }
    ]

    return (
        <Card>
            <CardHeader>
                <CardTitle>View Webhooks</CardTitle>
                <CardDescription>View, edit and create new endpoints for your files</CardDescription>
            </CardHeader>
            <CardContent className='max-w-full overflow-hidden'>
                <DataTable columns={columns} data={webhooks || []} noRowsOverlay={() => {
                    if (loading) return (<div className='w-full h-full flex items-center justify-center'>
                        <LoaderCircleIcon className='animate-spin' />
                    </div>)
                    return "No webhooks found. Get started by adding one above.";
                }} />
            </CardContent>
        </Card>
    )
}

export default WebhooksTable