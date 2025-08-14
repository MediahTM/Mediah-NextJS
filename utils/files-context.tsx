import axios from 'axios';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { File, Share } from '@prisma/client';
import { toast } from 'sonner';
import { useSession } from 'next-auth/react';
import { GeneralProps } from '@/types/general-props';

const FilesContext = createContext<{
    loading: boolean,
    fetchFiles: () => Promise<void>;
} & Pick<GeneralProps, "files" | "setFiles" | "shares" | "setShares" | "binFiles" | "setBinFiles"> | undefined>(undefined);

export const FilesProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [files, setFiles] = useState<File[]>([]);
    const [binFiles, setBinFiles] = useState<File[]>([]);
    const [shares, setShares] = useState<Share[]>([]);
    const [loading, setLoading] = useState(true);

    const session = useSession();

    const fetchFiles = async () => {
        setLoading(true);
        const fileResponse = await axios.get("/api/file?isActive=true");
        if (fileResponse.data.success) setFiles(fileResponse.data.data);
        else toast.error("Could not fetch user files!");

        const binFileResponse = await axios.get("/api/file?isActive=false");
        if (binFileResponse.data.success) setBinFiles(binFileResponse.data.data);
        else toast.error("Could not fetch user bin files!");

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
        <FilesContext.Provider value={{ files, setFiles, binFiles, setBinFiles, loading, fetchFiles, shares, setShares }}>
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