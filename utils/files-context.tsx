import React, { createContext, useContext, useState, ReactNode } from 'react';
import { File } from '@prisma/client';
import axios from 'axios';
import { toast } from 'sonner';

const FilesContext = createContext<{
    files: File[];
    setFiles: React.Dispatch<React.SetStateAction<File[]>>;
} | undefined>(undefined);

export const FilesProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [files, setFiles] = useState<File[]>([]);

    return (
        <FilesContext.Provider value={{ files, setFiles }}>
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

export const fetchFiles = async (setFiles: React.Dispatch<React.SetStateAction<File[]>>) => {
    let resolve = false;
    setFiles(files => {
        if (files.length > 0) resolve = true;
        return files
    })
    if (resolve) return;
    const response = await axios.get("/api/file?isActive=true");
    
    if (response.data.success) setFiles(response.data.data);
    else toast.error("Could not fetch user files!");
}