"use client";
import Container from '@/components/ui/container';
import PageTitle from '@/components/ui/page-title';
import React, { useEffect, useState } from 'react';
import FileTable from '@/components/file-table/table';
import { FileTableNavbar, FileTablePageNavigation, FileTableProvider, useFileTable } from '@/components/file-table';
import { defaultOptions } from '@/components/file-dropdown/default-dropdown-options';
import { TrashIcon, UserRoundCogIcon, UserRoundPlusIcon } from 'lucide-react';
import { FileDropdownItem } from '@/components/file-dropdown/file-dropdown';
import { useFiles } from '@/utils/files-context';
import { File, Share } from '@prisma/client';
import DeleteDialog from '@/components/dialogs/delete-file/delete-dialog';
import ShareDialog from '@/components/dialogs/share/share-dialog';
import { Folder } from '@/types/folder';
import ShareCell from './share-cell';
import { convertToFileList } from '@/lib/helpers';
import { useStatusBar } from '@/utils/status-bar-context';

const FilesView = () => {
    const { setStatusBar } = useStatusBar();
    const { shares, setShares, setFiles, setBinFiles, files } = useFiles();
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [itemsToDelete, setItemsToDelete] = useState<File[]>([]);
    const [shareDialogOpen, setShareDialogOpen] = useState(false);
    const [selectedShareItem, setSelectedShareItem] = useState<File | Folder | undefined>(undefined);

    const fileDropdownOptions: FileDropdownItem[] = [
        ...defaultOptions.slice(0, defaultOptions.findIndex(option => "key" in option && option.key === "export")),
        {
            key: "share",
            label: (props) => {
                if (props) {
                    const { items } = props;
                    const item = items[0];
                    if (!item) return "Share";
                    const isFolder = "isFolder" in item && item.isFolder;
                    const existingShare: Share | null = shares.find((share) => isFolder ? share.key === (item as Folder).path && share.type === "folder" : share.key === (item as File).id && share.type === "file") || null;
                    return existingShare ? "Edit Share" : "Share";
                }
                return "Share";
            },
            icon: (props) => {
                if (props) {
                    const { items } = props;
                    const item = items[0];
                    if (!item) return "Share";
                    const isFolder = "isFolder" in item && item.isFolder;
                    const existingShare: Share | null = shares.find((share) => isFolder ? share.key === (item as Folder).path && share.type === "folder" : share.key === (item as File).id && share.type === "file") || null;
                    return existingShare ? <UserRoundCogIcon /> : <UserRoundPlusIcon />;
                }
                return <UserRoundPlusIcon />;
            },
            enabled: ({ items }) => items.length === 1,
            onClick: ({ items }) => {
                if (items.length === 1) {
                    setSelectedShareItem(items[0]);
                    setShareDialogOpen(true);
                }
            }
        },
        ...defaultOptions.slice(defaultOptions.findIndex(option => "key" in option && option.key === "export")),
        {
            separator: true,
            dependencies: ["bin"]
        },
        {
            key: "bin",
            label: () => "Move to Bin",
            icon: () => <TrashIcon />,
            enabled: () => true,
            onClick: async ({ items }) => {
                const filesToDelete: File[] = convertToFileList(items, files);
                setDeleteDialogOpen(true);
                setItemsToDelete(filesToDelete);
            }
        }
    ]

    return (
        <Container className="h-full flex flex-col">
            <PageTitle title="My Files" />
            <div className="flex-1 flex flex-col h-full">
                <FileTableProvider>
                    <FileTableNavbar />
                    <FileTable fileDropdownOptions={fileDropdownOptions} />
                    <FileTablePageNavigation />
                    <DeleteDialog open={deleteDialogOpen} setOpen={setDeleteDialogOpen} items={itemsToDelete} setStatusBar={setStatusBar} setFiles={setFiles} setBinFiles={setBinFiles} type="bin" />
                    <AddSharedColumn />
                    <ShareDialog open={shareDialogOpen} setOpen={setShareDialogOpen} item={selectedShareItem} shares={shares} setShares={setShares} />
                </FileTableProvider>
            </div>
        </Container>
    )
}

const AddSharedColumn = () => {
    const { shares, loading } = useFiles();
    const { tableInfo, setTableInfo } = useFileTable();
    useEffect(() => {
        if (tableInfo.columnDefs.find(col => col.field === 'shared')) return;
        else if (tableInfo.columnDefs.length > 0 && !loading) {
            setTableInfo(pre => ({
                ...pre,
                columnDefs: [
                    ...pre.columnDefs.slice(0, pre.columnDefs.length - 1),
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
                    ...pre.columnDefs.slice(pre.columnDefs.length - 1)
                ]
            }));
        }
    }, [tableInfo.columnDefs, loading])
    return null;
}

export default FilesView