"use client";

import axios, { AxiosResponse } from 'axios';
import { createJob } from '../status-bar-jobs';
import { DownloadIcon } from 'lucide-react';
import { File } from '@prisma/client';
import { formatBytes } from '@/lib/helpers';
import { saveAs } from 'file-saver';
import { StatusBarProps } from '@/components/status-bar/status-bar';

type DownloadOptions = {
    onJobComplete?: (file: File) => void,
    onCancel?: () => void
}

export const downloadFiles = async (files: File[], setStatusBar: React.Dispatch<React.SetStateAction<StatusBarProps>>, downloadOptions: DownloadOptions = {}) => {
    for (const file of files) {
        if (file) {
            await createJob(setStatusBar, file.filename, DownloadIcon, async () => {
                return new Promise(async (resolve) => {
                    const controller = new AbortController();
                    const signal = controller.signal;
                    setStatusBar(prev => ({
                        ...prev, title: "Downloading " + file.filename, description: "Renewing URLs...", progress: 0, onCancel: () => {
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
                    if (!signal.aborted) setStatusBar(prev => ({ ...prev, progress: 0, description: "Downloading..." }));
                    let fileData: Uint8Array[] = [];
                    let totalBytesDownloaded: number = 0;
                    for (let i = 0; i < Math.ceil(renewedURLs.length / 10); i++) {
                        fileData = fileData.concat(await Promise.all(renewedURLs.slice(i * 10, (i + 1) * 10).map(async (link, index) => {
                            let request: AxiosResponse<ArrayBuffer>;
                            try {
                                let requestBytesDownloaded: number = 0;
                                request = await axios.get("https://api.codetabs.com/v1/proxy/?quest=" + encodeURIComponent(link), {
                                    responseType: "arraybuffer", signal, onDownloadProgress: (progressEvent) => {
                                        totalBytesDownloaded += (((progressEvent.loaded * 3) / 4) - requestBytesDownloaded);
                                        requestBytesDownloaded = (progressEvent.loaded * 3) / 4;
                                        if (!signal.aborted) setStatusBar(prev => ({ ...prev, progress: (totalBytesDownloaded / file.uploadedSize * 100), description: `${formatBytes(totalBytesDownloaded)} / ${formatBytes(file.uploadedSize)}` }));
                                    }
                                });
                                totalBytesDownloaded += ((request.data.byteLength * 3) / 4) - requestBytesDownloaded;
                                if (!signal.aborted) setStatusBar(prev => ({ ...prev, progress: ((totalBytesDownloaded / file.uploadedSize) * 100), description: `${formatBytes(totalBytesDownloaded)} / ${formatBytes(file.uploadedSize)}` }));
                                const binaryString = window.atob(new TextDecoder("utf-8").decode(request.data));
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
                    const url = URL.createObjectURL(blob);
                    saveAs(url, file.filename);
                    URL.revokeObjectURL(url);
                    if (downloadOptions.onJobComplete) downloadOptions.onJobComplete(file);
                    resolve();
                })
            })
        }
    }
}