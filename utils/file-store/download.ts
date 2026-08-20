"use client";

import axios, { AxiosResponse } from 'axios';
import { createJob } from '../status-bar-jobs';
import { DownloadIcon, FolderDownIcon } from 'lucide-react';
import { File } from '@prisma/client';
import { formatBytes, getFilesInPath, isFolder } from '@/lib/helpers';
import { saveAs } from 'file-saver';
import { StatusBarProps } from '@/components/status-bar/status-bar';
import { Folder } from '@/types/folder';
import { Zippable, zipSync } from "fflate";
import parseCorsProxyBody from '../cors-bypass';

type DownloadOptions = {
    onJobComplete?: () => void,
    onCancel?: () => void,
    progressOnly?: boolean
}

export const saveItems = async (items: (File | Folder)[], userFiles: File[], setStatusBar: React.Dispatch<React.SetStateAction<StatusBarProps>>, downloadOptions: DownloadOptions = {}) => {
    for (const item of items) {
        if (isFolder(item)) await saveFolder(item as Folder, userFiles, setStatusBar, downloadOptions);
        else await saveFile(item as File, setStatusBar, downloadOptions);
    }
}

export const saveFile = async (file: File, setStatusBar: React.Dispatch<React.SetStateAction<StatusBarProps>>, downloadOptions: DownloadOptions = {}, totalBytes: number = file.uploadedSize) => {
    if (file) {
        await createJob(setStatusBar, file.filename, DownloadIcon, async () => {
            return new Promise(async (resolve) => {
                const blob = await downloadFile(file, setStatusBar, { onCancel: downloadOptions.onCancel }, totalBytes);
                if (blob) {
                    saveAs(blob, file.filename);
                }
                resolve();
                if (downloadOptions.onJobComplete) downloadOptions.onJobComplete();
            })
        })
    }
}

export const saveFolder = async (folder: Folder, userFiles: File[], setStatusBar: React.Dispatch<React.SetStateAction<StatusBarProps>>, downloadOptions: DownloadOptions = {}) => {
    if (folder) {
        await createJob(setStatusBar, folder.name, FolderDownIcon, async () => {
            return new Promise(async (resolve) => {
                setStatusBar(prev => ({ ...prev, title: "Downloading '" + folder.name + "' to ZIP file", progress: 0 }));
                const folderData = await downloadFolder(folder, userFiles, setStatusBar, { onCancel: downloadOptions.onCancel });
                setStatusBar(prev => ({ ...prev, title: "Zipping " + folder.name, progress: 0 }));
                if (folderData) saveAs(new Blob([zipSync(folderData, { level: 0 })]), folder.name + ".zip");
                if (downloadOptions.onJobComplete) downloadOptions.onJobComplete();
                resolve();
            })
        })
    }
}

export const downloadFolder = async (folder: Folder, userFiles: File[], setStatusBar: React.Dispatch<React.SetStateAction<StatusBarProps>>, downloadOptions: DownloadOptions = {}, totalBytes: number = folder.uploadedSize) => {
    if (folder) {
        let folderData: Zippable = {};
        let cancelled = false;
        const { filesInPath, foldersInPath } = getFilesInPath(folder.path, userFiles);
        for (const file of filesInPath) {
            if (cancelled) return false;
            setStatusBar(prev => ({ ...prev, description: "Downloading " + file.filename }));
            const downloadedFile = await downloadFile(file, setStatusBar, {
                onCancel: () => {
                    cancelled = true;
                    downloadOptions.onCancel?.();
                },
                progressOnly: true
            }, totalBytes);
            if (downloadedFile) {
                folderData[file.filename] = [new Uint8Array(await downloadedFile!.arrayBuffer()), { mtime: new Date(file.updatedAt) }];
            } else return;
        }
        for (const folder of foldersInPath) {
            if (cancelled) return false;
            const downloadedFolder = await downloadFolder(folder, userFiles, setStatusBar, {
                onCancel: () => {
                    cancelled = true;
                    downloadOptions.onCancel
                }
            }, totalBytes);
            if (downloadedFolder == false) return false;
            if (downloadedFolder) folderData[folder.name] = downloadedFolder;
        }
        if (!cancelled) return folderData;
    }
}

export const downloadFile = async (file: File, setStatusBar: React.Dispatch<React.SetStateAction<StatusBarProps>>, downloadOptions: DownloadOptions = {}, totalBytes: number = file.uploadedSize): Promise<Blob | void> => {
    return new Promise(async (resolve) => {
        const controller = new AbortController();
        const signal = controller.signal;
        setStatusBar(prev => ({
            ...prev,
            title: downloadOptions.progressOnly ? prev.title : "Downloading " + file.filename,
            description: downloadOptions.progressOnly ? prev.description : "Renewing URLs...",
            onCancel: () => {
                controller.abort();
                if (downloadOptions.onCancel) downloadOptions.onCancel();
            }
        }));
        let renewedURLs: string[] = [];
        for (let i = 0; i < Math.ceil(file.parts!.length / 50); i++) {
            const messageIDs = file.parts!.slice(i * 50, (i + 1) * 50);
            try {
                const response = await axios.post("/api/renew", { messageIDs, channelID: file.channelID, encryptedFilename: file.encryptedFilename }, { signal });
                if (response.status >= 200 && response.status < 300) {
                    renewedURLs.push(...response.data.hooks);
                } else {
                    resolve();
                }
            } catch {
                resolve();
            }
        }
        if (!signal.aborted) setStatusBar(prev => ({ ...prev, description: downloadOptions.progressOnly ? prev.description : "Downloading..." }));
        let fileData: Uint8Array[] = [];
        let totalBytesDownloaded: number = 0;
        for (let i = 0; i < Math.ceil(renewedURLs.length / 5); i++) {
            fileData = fileData.concat(await Promise.all(renewedURLs.slice(i * 5, (i + 1) * 5).map(async (link, index) => {
                let request: AxiosResponse<ArrayBuffer>;
                try {
                    let requestBytesDownloaded: number = 0;
                    request = await axios.get(process.env.NEXT_PUBLIC_CORS_BYPASS + encodeURIComponent(link), {
                        responseType: "arraybuffer", signal, onDownloadProgress: (progressEvent) => {
                            totalBytesDownloaded += (((progressEvent.loaded * 3) / 4) - requestBytesDownloaded);
                            let totalNewBytes = (progressEvent.loaded * 3) / 4 - requestBytesDownloaded;
                            if (!signal.aborted) setStatusBar(prev => ({ ...prev, progress: prev.progress + ((totalNewBytes / totalBytes) * 100), description: downloadOptions.progressOnly ? prev.description : `${formatBytes(totalBytesDownloaded)} / ${formatBytes(file.uploadedSize)}` }));
                            requestBytesDownloaded += totalNewBytes;
                        }
                    });
                    let totalNewBytes = ((request.data.byteLength * 3) / 4) - requestBytesDownloaded
                    totalBytesDownloaded += totalNewBytes;
                    if (!signal.aborted) setStatusBar(prev => ({ ...prev, progress: prev.progress + ((totalNewBytes / totalBytes) * 100), description: downloadOptions.progressOnly ? prev.description : `${formatBytes(totalBytesDownloaded)} / ${formatBytes(file.uploadedSize)}` }));
                    const binaryString = window.atob(parseCorsProxyBody(new TextDecoder("utf-8").decode(request.data)));
                    const bytes = new Uint8Array(binaryString.length);
                    for (let i = 0; i < binaryString.length; i++) {
                        bytes[i] = binaryString.charCodeAt(i);
                    }
                    return bytes;
                } catch {
                    resolve();
                    return new Uint8Array(0);
                }
            })));
        }
        if (fileData.map(data => data.length).reduce((a, b) => a + b, 0) !== file.uploadedSize) {
            resolve();
            return;
        }
        const blob = new Blob(fileData as BlobPart[]);
        resolve(blob);
        if (downloadOptions.onJobComplete) downloadOptions.onJobComplete();
    })
}