"use client";
import axios from "axios";
import { arrayBufferToBase64, formatBytes, sleep } from "@/lib/helpers";
import { StatusBarProps } from "@/components/status-bar/status-bar";
import { createJob } from "../status-bar-jobs";
import { Upload } from "lucide-react";

export const uploadFiles = async (files: File[], webhook: string, location: string = "/", statusBar: StatusBarProps, setStatusBar: React.Dispatch<React.SetStateAction<StatusBarProps>>) => {
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
                    setStatusBar(prev => ({ ...prev, title: "Uploading " + file.name, progress: 0, onCancel: () => {
                        controller.abort();
                    } }));
                    const encryptedFileName: string = btoa(file.name.substring(0, file.name.lastIndexOf('.'))).slice(0, 56) + ".mediah"; // might change this later

                    let offset: number = 0;
                    let currentChunk: number = 0;
                    const parts: { url: string, size: number }[] = [];
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
                                    parts.push({ url: attachmentURL, size: chunk.length });
                                    totalBytesUploaded += (chunk.length * 3) / 4;
                                    console.log(`Uploaded ${file.name} (${currentChunk}/${numChunks})`);
                                    offset += CHUNK_SIZE;
                                    if (offset / CHUNK_SIZE < numChunks) {
                                        reader.readAsArrayBuffer(file.slice(offset, offset + CHUNK_SIZE));
                                    } else {
                                        setStatusBar(prev => ({...prev, description: "Uploading to database..." }));
                                        await axios.post("/api/upload", { 
                                            parts,
                                            filename: file.name,
                                            uploadedSize: file.size,
                                            path: location
                                        }, { headers: { 'Content-Type': 'application/json' }, signal });
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