"use client";

import axios from 'axios';
import { arrayBufferToBase64, formatBytes, sleep } from '@/lib/helpers';
import { createJob } from '../status-bar-jobs';
import { StatusBarProps } from '@/components/status-bar/status-bar';
import { Upload } from 'lucide-react';
import { File as MediahFile } from '@prisma/client';
import { uploadFileToDatabase } from '../api-actions';

export const uploadFiles = async (files: File[], webhook: string, location: string = "/", setStatusBar: React.Dispatch<React.SetStateAction<StatusBarProps>>, setFiles: React.Dispatch<React.SetStateAction<MediahFile[]>>) => {
    const MAX_RETRIES = 3;
    const RETRY_DELAY = 5000;
    const CHUNK_SIZE = 1024 * 1024 * 3;

    for (const file of files) {
        if (file) {
            await createJob(setStatusBar, file.name, Upload, async () => {
                return new Promise((resolve) => {
                    const controller = new AbortController();
                    const signal = controller.signal;
                    console.log(`Uploading ${file.name}`);
                    setStatusBar(prev => ({
                        ...prev, title: "Uploading " + file.name, progress: 0, onCancel: () => {
                            controller.abort();
                        }
                    }));
                    const encryptedFileName: string = btoa(file.name.replace(/[^A-Za-z0-9+/=]/g, "_").substring(0, file.name.lastIndexOf('.'))).slice(0, 56) + ".mediah"; // might change this later

                    let offset: number = 0;
                    let currentChunk: number = 0;
                    const parts: string[] = [];
                    let totalBytesUploaded: number = 0;
                    const reader: FileReader = new FileReader();
                    reader.onload = async () => {
                        currentChunk += 1
                        const chunk: string = arrayBufferToBase64(reader.result as ArrayBuffer);
                        const numChunks: number = Math.ceil(file.size / CHUNK_SIZE);
                        const formData: FormData = new FormData();
                        formData.append("file[0]", new Blob([chunk]), encryptedFileName);
                        let retries = 0;
                        while (retries < MAX_RETRIES) {
                            try {
                                const request = await axios.post(webhook, formData, {
                                    headers: {
                                        'Content-Type': 'multipart/form-data',
                                    },
                                    onUploadProgress: (progressEvent) => { setStatusBar(statusBar => ({ ...statusBar, progress: Math.floor((totalBytesUploaded + (progressEvent.loaded * 3) / 4) / file.size * 100), description: `${formatBytes(totalBytesUploaded + (progressEvent.loaded * 3) / 4)} / ${formatBytes(file.size)}` })) },
                                    signal
                                })
                                if (request.status >= 200 && request.status < 300) {
                                    const responseJSON: any = request.data;
                                    const attachmentURL: string = responseJSON.attachments[0].url.split("?")[0];
                                    parts.push(attachmentURL.split("/").at(-2)!);
                                    totalBytesUploaded += (chunk.length * 3) / 4;
                                    console.log(`Uploaded ${file.name} (${currentChunk}/${numChunks})`);
                                    offset += CHUNK_SIZE;
                                    if (offset / CHUNK_SIZE < numChunks) {
                                        reader.readAsArrayBuffer(file.slice(offset, offset + CHUNK_SIZE));
                                    } else {
                                        setStatusBar(prev => ({ ...prev, description: "Uploading to database..." }));
                                        const response = await uploadFileToDatabase({
                                            parts,
                                            filename: file.name,
                                            encryptedFilename: attachmentURL.split("/").at(-1)!,
                                            channelID: attachmentURL.split("/").at(-3)!,
                                            uploadedSize: file.size,
                                            chunkSize: CHUNK_SIZE,
                                            path: location
                                        }, { signal });
                                        setFiles(prev => [...prev, response.data.data]);
                                        resolve();
                                    }
                                    break;
                                }
                            } catch (e: any) {
                                if (e.name === "CanceledError") {
                                    resolve();
                                    break;
                                }
                            }
                            retries += 1;
                            await sleep(RETRY_DELAY);
                        }
                    }
                    reader.readAsArrayBuffer(file.slice(0, CHUNK_SIZE));
                }
                );
            })
        }
    };
}