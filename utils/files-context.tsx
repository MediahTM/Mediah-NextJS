import axios from 'axios';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { File, Share } from '@prisma/client';
import { toast } from 'sonner';
import { useSession } from 'next-auth/react';

const FilesContext = createContext<{
    files: File[];
    setFiles: React.Dispatch<React.SetStateAction<File[]>>;
    loading: boolean,
    fetchFiles: () => Promise<void>;
    shares: Share[];
    setShares: React.Dispatch<React.SetStateAction<Share[]>>
} | undefined>(undefined);

export const FilesProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [files, setFiles] = useState<File[]>([]);
    const [shares, setShares] = useState<Share[]>([]);
    const [loading, setLoading] = useState(true);

    const session = useSession();

    const fetchFiles = async () => {
        setLoading(true);
        const fileResponse = await axios.get("/api/file?isActive=true");
        if (fileResponse.data.success) setFiles(fileResponse.data.data);
        else toast.error("Could not fetch user files!");
        
        const shareResponse = await axios.get("/api/file/share");
        if (shareResponse.data.success) setShares(shareResponse.data.data);
        else toast.error("Could not fetch shared files!");

        setLoading(false);
    }

    useEffect(() => {
        if (session.status !== "authenticated") return;
        fetchFiles();
    }, []);

    return (
        <FilesContext.Provider value={{ files, setFiles, loading, fetchFiles, shares, setShares }}>
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