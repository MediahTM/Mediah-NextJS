"use client";
import Container from '@/components/ui/container';
import PageTitle from '@/components/ui/page-title';
import React, { useEffect, useState } from 'react';
import FileTable from '@/components/file-table/table';
import { FileTableNavbar, FileTablePageNavigation, FileTableProvider } from '@/components/file-table';
import { defaultOptions } from '@/components/file-dropdown/default-dropdown-options';
import { ArrowLeftRightIcon, FolderOpenIcon, TrashIcon, UploadIcon, UserRoundCogIcon, UserRoundPlusIcon } from 'lucide-react';
import { FileDropdownItem } from '@/components/file-dropdown/file-dropdown';
import { useFiles } from '@/utils/files-context';
import { File, Share } from '@prisma/client';
import DeleteDialog from '@/components/dialogs/delete-file/delete-dialog';
import ShareDialog from '@/components/dialogs/share/share-dialog';
import { Folder } from '@/types/folder';
import ShareCell from './share-cell';
import { convertToFileList, isFolder } from '@/lib/helpers';
import { useStatusBar } from '@/utils/status-bar-context';
import UploadDialog from '@/components/dialogs/upload/upload-dialog';
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty';
import { Button } from '@/components/ui/button';
import RefreshSpinner from '@/components/ui/refresh-spinner';
import { getColumnDefs } from '@/components/file-table/column-defs';
import { useParams } from "next/navigation";
import { useFileTable } from '@/components/file-table/table-context';

const FilesView = () => {
    const { setStatusBar } = useStatusBar();
    const { shares, setShares, setFiles, setBinFiles, files } = useFiles();
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [itemsToDelete, setItemsToDelete] = useState<File[]>([]);
    const [shareDialogOpen, setShareDialogOpen] = useState(false);
    const [selectedShareItem, setSelectedShareItem] = useState<File | Folder | undefined>(undefined);
    const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
    const [path, setPath] = useState<string>("/");

    const params = useParams();

    useEffect(() => {
        if (params.path) {
            const path = decodeURIComponent("/" + (params.path as string[]).join("/"))
            if (path) {
                setPath(path);
            }
        }
    }, [])

    useEffect(() => {
        const newURLPath = `${window.location.origin}/dashboard/files${path}`;
        window.history.pushState(null, "", newURLPath);
    }, [path])


    const fileDropdownOptions: FileDropdownItem[] = [
        ...defaultOptions.slice(0, defaultOptions.findIndex(option => "key" in option && option.key === "export")),
        {
            key: "share",
            label: (props) => {
                if (props) {
                    const { items } = props;
                    const item = items[0];
                    if (!item) return "Share";
                    const existingShare: Share | null = shares.find((share) => isFolder(item) ? share.key === (item as Folder).path && share.type === "folder" : share.key === (item as File).id && share.type === "file") || null;
                    return existingShare ? "Edit Share" : "Share";
                }
                return "Share";
            },
            icon: (props) => {
                if (props) {
                    const { items } = props;
                    const item = items[0];
                    if (!item) return "Share";
                    const existingShare = Boolean(shares.some((share) => isFolder(item) ? share.key === (item as Folder).path && share.type === "folder" : share.key === (item as File).id && share.type === "file"));
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
        {
            key: "move",
            label: () => "Move",
            icon: () => <ArrowLeftRightIcon />,
            enabled: ({ items }) => items.length > 0,
            onClick: ({ setDropdown }) => {
                setDropdown(menu => ({ ...menu, dialogs: { ...menu.dialogs, move: true } }));
            }
        },
        ...defaultOptions.slice(defaultOptions.findIndex(option => "key" in option && option.key === "export")),
        {
            separator: true,
            dependencies: ["bin"]
        },
        {
            key: "bin",
            label: () => "Move to bin",
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
            <UploadDialog open={uploadDialogOpen} setOpen={setUploadDialogOpen} />
            <div className="flex-1 flex flex-col h-full md:pb-0 pb-4">
                <FileTableProvider>
                    <PathSwitcher path={path} setPath={setPath} />
                    <FileTableNavbar />
                    <FileTable
                        fileDropdownOptions={fileDropdownOptions}
                        colDefs={(setTableInfo) => {
                            const defaultColumns = getColumnDefs(setTableInfo);
                            return [
                                ...defaultColumns.slice(0, defaultColumns.length - 1),
                                {
                                    field: "shared",
                                    headerName: "Shared",
                                    suppressMovable: true,
                                    resizable: false,
                                    width: 100,
                                    cellRenderer: ShareCell,
                                    comparator: (valueA, valueB, nodeA, nodeB, isDescending) => {
                                        const aChecked = Boolean(
                                            shares.some((share) => isFolder(nodeA.data) ? share.key === (nodeA.data as Folder).path && share.type === "folder" : share.key === (nodeA.data as File).id && share.type === "file")
                                        );
                                        const bChecked = Boolean(
                                            shares.some((share) => isFolder(nodeB.data) ? share.key === (nodeB.data as Folder).path && share.type === "folder" : share.key === (nodeB.data as File).id && share.type === "file")
                                        );
                                        return aChecked === bChecked ? 0 : aChecked ? 1 : -1;
                                    },
                                },
                                ...defaultColumns.slice(defaultColumns.length - 1)
                            ]
                        }}
                        noRowsOverlay={
                            () => <Empty>
                                <EmptyHeader>
                                    <EmptyMedia variant="icon">
                                        <FolderOpenIcon />
                                    </EmptyMedia>
                                    <EmptyTitle>No Files Found</EmptyTitle>
                                    <EmptyDescription>
                                        You haven&apos;t saved any files yet.
                                        <br></br>
                                        Get started by uploading your first file.
                                    </EmptyDescription>
                                </EmptyHeader>
                                <EmptyContent>
                                    <div className="flex gap-2 pointer-events-auto">
                                        <Button onClick={() => {
                                            setUploadDialogOpen(true);
                                        }}>
                                            <UploadIcon />
                                            Upload Files
                                        </Button>
                                        <ReloadButton />
                                    </div>
                                </EmptyContent>
                            </Empty>
                        } />
                    <FileTablePageNavigation />
                    <DeleteDialog open={deleteDialogOpen} setOpen={setDeleteDialogOpen} items={itemsToDelete} setStatusBar={setStatusBar} setFiles={setFiles} setBinFiles={setBinFiles} type="bin" />
                    <ShareDialog open={shareDialogOpen} setOpen={setShareDialogOpen} item={selectedShareItem} shares={shares} setShares={setShares} />
                </FileTableProvider>
            </div>
        </Container>
    )
}

const ReloadButton = () => {
    const { fetching, fetchFiles, loading, refetching } = useFiles();
    return (
        <Button variant="outline" onClick={fetchFiles} disabled={fetching}>
            <RefreshSpinner loading={loading} refetching={refetching} />
            Refresh
        </Button>
    )
}

const PathSwitcher = ({ path, setPath }: { path: string, setPath: React.Dispatch<React.SetStateAction<string>> }) => {
    const { setTableInfo, tableInfo } = useFileTable();
    useEffect(() => {
        setTableInfo(pre => ({
            ...pre,
            viewingLocation: path
        }))
    }, [path]);

    useEffect(() => {
        if (tableInfo.viewingLocation !== path) {
            setPath(tableInfo.viewingLocation);
        }
    }, [tableInfo.viewingLocation])
    return <></>
}

export default FilesView