import { DEFAULT_PAGE_SETTING, DEFAULT_PAGE_SIZE } from '@/lib/constants';
import { useFiles } from '@/utils/files-context';
import { AgGridReact } from 'ag-grid-react';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { ColDef } from "ag-grid-community";
import { GeneralProps } from '@/types/general-props';
import { defaultDropdown, Dropdown } from '@/types/dropdown';

export type TableInfo = {
    columnDefs: ColDef[],
    dropdown: Dropdown,
    pageSize: number,
    fitPage: boolean,
    currentPage: number,
    totalPages: number,
    viewingLocation: string,
    gridReady: boolean,
    gridRef?: React.RefObject<AgGridReact | null>
}

export type FileTableProps = Pick<GeneralProps, "files" | "setFiles"> & {
    loading: boolean,
    tableInfo: TableInfo,
    setTableInfo: React.Dispatch<React.SetStateAction<TableInfo>>
}

const FileTableContext = createContext<FileTableProps | undefined>(undefined);

export const FileTableProvider = ({ children, customFilesProps = undefined }: {
    children: React.ReactNode, customFilesProps?: Pick<GeneralProps, "files" | "setFiles"> & { loading: boolean }
}) => {
    const [tableInfo, setTableInfo] = useState<TableInfo>({
        columnDefs: [],
        dropdown: defaultDropdown,
        pageSize: DEFAULT_PAGE_SIZE,
        fitPage: true,
        currentPage: 0,
        totalPages: 0,
        viewingLocation: "/",
        gridReady: false
    });

    const [processedSavedSettings, setProcessedSavedSettings] = useState(false);

    useEffect(() => {
        if (processedSavedSettings) {
            if (tableInfo.fitPage) localStorage.setItem("pageSize", "Fit");
            else localStorage.setItem("pageSize", tableInfo.pageSize.toString());
        }
    }, [tableInfo.fitPage, tableInfo.pageSize])

    useEffect(() => {
        const pageSize = localStorage.getItem("pageSize");
        if (!pageSize) {
            if (DEFAULT_PAGE_SETTING === "Fit") setTableInfo(pre => ({ ...pre, fitPage: true }));
            else setTableInfo(pre => ({ ...pre, pageSize: Number(DEFAULT_PAGE_SETTING) || DEFAULT_PAGE_SIZE }));
        } else {
            if (pageSize === "Fit") setTableInfo(pre => ({ ...pre, fitPage: true }));
            else setTableInfo(pre => ({ ...pre, pageSize: Number(pageSize) || DEFAULT_PAGE_SIZE, fitPage: false }));
        }
        setProcessedSavedSettings(true);
    }, [])

    const fileTableInfo = {
        ...(customFilesProps || useFiles()),
        tableInfo,
        setTableInfo
    };

    return (
        <FileTableContext.Provider value={fileTableInfo}>
            {children}
        </FileTableContext.Provider>
    );
};

export const useFileTable = () => {
    const ctx = useContext(FileTableContext);
    if (!ctx) throw new Error("useFileTable must be used inside FileTableProvider");
    return ctx;
};