import axios from 'axios';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { File, Share } from '@prisma/client';
import { toast } from 'sonner';
import { useSession } from 'next-auth/react';
import { GeneralProps } from '@/types/general-props';
import { useQuery } from '@tanstack/react-query';

const FilesContext = createContext<{
    loading: boolean,
    fetching: boolean,
    refetching: boolean,
    fetchFiles: () => void;
} & Pick<GeneralProps, "files" | "setFiles" | "shares" | "setShares" | "binFiles" | "setBinFiles"> | undefined>(undefined);

export const FilesProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [files, setFiles] = useState<File[]>([]);
    const [binFiles, setBinFiles] = useState<File[]>([]);
    const [shares, setShares] = useState<Share[]>([]);

    const session = useSession();

    const { data, isLoading: loading, refetch: fetchFiles, isFetching: fetching, isRefetching: refetching } = useQuery({
        queryKey: ["files"],
        enabled: true,
        queryFn: async () => {
            if (session.status !== "authenticated") return;
            const fileResponse = await axios.get("/api/file");
            if (!fileResponse.data.success) {
                toast.error(`Could not fetch user files: '${fileResponse.data.message}'`);
                return {
                    files: [],
                    shares: []
                };
            }

            const shareResponse = await axios.get("/api/file/share");
            if (!shareResponse.data.success) {
                toast.error(`Could not fetch shared files: '${shareResponse.data.message}'`);
                return {
                    files: fileResponse.data.data,
                    shares: []
                }
            }

            return {
                files: fileResponse.data.data,
                shares: shareResponse.data.data
            }
        }
    });

    useEffect(() => {
        if (data) {
            if (data.files.length > 0) {
                setFiles(data.files.filter((file: File) => file.isActive));
                setBinFiles(data.files.filter((file: File) => !file.isActive));
            }
            if (data.shares.length > 0) setShares(data.shares);
        }
    }, [data]);

    return (
        <FilesContext.Provider value={{ files, setFiles, binFiles, setBinFiles, loading, fetching, refetching, fetchFiles, shares, setShares }}>
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