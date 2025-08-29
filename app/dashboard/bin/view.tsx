"use client";
import Container from '@/components/ui/container';
import PageTitle from '@/components/ui/page-title';
import React, { useEffect } from 'react';
import FileTable from '@/components/file-table/table';
import { FileTableNavbar, FileTablePageNavigation, FileTableProvider, useFileTable } from '@/components/file-table';
import { useFiles } from '@/utils/files-context';
import { defaultOptions } from '@/components/file-dropdown/default-dropdown-options';
import { FileDropdownItem } from '@/components/file-dropdown/file-dropdown';
import { FileOutputIcon, TrashIcon } from 'lucide-react';

const BinView = () => {
    const { binFiles, setBinFiles } = useFiles();

    const fileDropdownOptions: FileDropdownItem[] = [
        ...defaultOptions.filter(option => !("key" in option && ["rename"].includes(option.key))),
        {
            separator: true,
            dependencies: []
        },
        {
            key: "restore",
            label: () => "Restore",
            icon: () => <FileOutputIcon />,
            enabled: () => true,
            onClick: () => {
                console.log("PLACEHOLDER")
            }
        },
        {
            key: "delete",
            label: () => "Delete Forever",
            icon: () => <TrashIcon />,
            enabled: () => true,
            onClick: () => {
                console.log("PLACEHOLDER")
            }
        }
    ];

    return (
        <Container className="h-full flex flex-col">
            <PageTitle title="My Bin" description="Binned files are permanently deleted after 30 days" />
            <div className="flex-1 flex flex-col h-full">
                <FileTableProvider customFilesProps={{ files: binFiles, setFiles: setBinFiles }}>
                    <FileTableNavbar />
                    <FileTable fileDropdownOptions={fileDropdownOptions} />
                    <FileTablePageNavigation />
                </FileTableProvider>
            </div>
        </Container>
    )
}


export default BinView