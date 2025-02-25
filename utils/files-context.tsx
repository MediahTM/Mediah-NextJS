import axios from 'axios';
import React, { createContext, ReactNode, useContext, useState } from 'react';
import { File } from '@prisma/client';
import { toast } from 'sonner';

const FilesContext = createContext<{
    files: File[];
    setFiles: React.Dispatch<React.SetStateAction<File[]>>;
    loading: boolean,
    fetchFiles: () => Promise<void>;
} | undefined>(undefined);

export const FilesProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [files, setFiles] = useState<File[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchFiles = async () => {
        if (files.length > 0) return;
        const response = await axios.get("/api/file?isActive=true");
        setLoading(false)

        if (response.data.success) setFiles(response.data.data);
        else toast.error("Could not fetch user files!");
    }

    return (
        <FilesContext.Provider value={{ files, setFiles, loading, fetchFiles }}>
            {children}
        </FilesContext.Provider>
    );
};

export const useFiles = () => {
    const context = useContext(FilesContext);

    if (!context) {
        throw new Error('useFiles must be used within a FilesContext');
    }
    
    return context;
};