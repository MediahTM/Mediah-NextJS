"use client";

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox';
import { DataTable } from '@/components/ui/data-table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { formatRelativeTime } from '@/lib/helpers';
import { Webhook } from '@prisma/client';
import { ColumnDef } from '@tanstack/react-table';
import { ArrowUpDown, EllipsisVerticalIcon } from 'lucide-react';
import React, { useEffect, useState } from 'react'
import EditWebhook from '../../../components/dialogs/edit-webhook/edit-dialog';
import DeleteDialog from '../../../components/dialogs/delete-webhook/delete-dialog';
import { toast } from 'sonner';

const WebhooksTable = ({ reload, setReload }: { reload: boolean, setReload: (open: boolean) => void }) => {
    const [webhooks, setWebhooks] = useState<[] | Webhook[] | null>(null);

    useEffect(() => {
        fetch(`/api/webhooks`, {
            method: "GET"
        })
            .then((response) => response.json())
            .then((response) => {
                if (response.success) {
                    setWebhooks(response.data)
                }
                else {
                    toast.error("Could not fetch user files!")
                }
            })
    }, [reload])

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
            accessorKey: "url",
            meta: "URL",
            header: "URL",
            cell: ({ row }) => {
                return (
                    <p>{row.original.url.substring(0, 40)}...</p>
                )
            }
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
                            setReload={setReload}
                            reload={reload}
                        />

                        <DeleteDialog
                            open={deleteWebhook}
                            setOpen={setDeleteWebhook}
                            webhook={row.original}
                            setReload={setReload}
                            reload={reload}
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
            <CardContent>
                <DataTable filterBy='name' columns={columns} data={webhooks || []} loading={!webhooks} />
            </CardContent>
        </Card>
    )
}

export default WebhooksTable