'use client'

import * as z from 'zod';
import React, { useEffect, useState } from 'react';
import UploadPathDialog from '../select-path/select-path-dialog';
import { Button, buttonVariants } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Share2, ShareIcon, Upload, XIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Controller, FieldErrors, useForm } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { parsePath } from '@/lib/helpers';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { uploadFiles } from '@/utils/file-store/upload';
import { useFiles } from '@/utils/files-context';
import { useStatusBar } from '@/utils/status-bar-context';
import { zodResolver } from '@hookform/resolvers/zod';
import FileList from "@/components/file-list";
import RequestBlockedDialog from '../request-blocked/request-blocked-dialog';
import UnknownWebhookDialog from '../unknown-webhook/unknown-webhook-dialog';
import { useWebhooks } from '@/utils/webhooks-context';
import { createJob } from '@/utils/status-bar-jobs';
import { File as DBFile } from '@prisma/client';
import { shareItem } from '@/utils/api-actions';
import { ShareSuccessDialogProps } from '../share-success/share-success-dialog';
import { useSession } from 'next-auth/react';

const UploadDialogTabs = ({ setOpen, customFiles, setSuccessDialogProps }: { setOpen: React.Dispatch<React.SetStateAction<boolean>>, customFiles?: File[], setSuccessDialogProps: React.Dispatch<React.SetStateAction<ShareSuccessDialogProps>> }) => {
    const { files, setFiles, fetchFiles, setShares } = useFiles();
    const { webhooks, loading } = useWebhooks();
    const { setStatusBar } = useStatusBar();
    const { data: session } = useSession();

    type FormData = z.infer<typeof schema>
    const schema = z.object({
        location: z.preprocess(
            (val) => typeof val === 'string' ? val : parsePath(val as string),
            z.string().min(1, 'File path is required')
        ),
        webhook: z.string().min(1, 'Webhook is required'),
        files: z.array(z.instanceof(File)).nonempty('At least one file is required').refine((files) => files.find(file => file.name.length === 0) === undefined, 'File name is mssing from at least one file.').refine((files) => files.find(file => file.name.length > 255) === undefined, 'File name cannot exceed 255 characters.'),
    }).refine((data) => {
        const duplicateFilesIndexes = data.files.map((_, i) => i).filter(i => files.find(databaseFile => databaseFile.filename === data.files[i].name && databaseFile.path === data.location))
        setErrorFileIndexes(duplicateFilesIndexes);
        return !(duplicateFilesIndexes.length > 0);
    }, {
        path: ["files"],
        message: "Selected path already contains a file with this name!",
    }).refine((data) => {
        return !((data.files.length + files.length) > session!.user!.maxFiles);
    }, {
        path: ["files"],
        message: "You have reached your file limit!",
    }).refine((data) => {
        return !((data.files.reduce((acc, file) => acc + file.size, 0) + files.reduce((acc, file) => acc + file.uploadedSize, 0)) > session!.user!.maxBytes);
    }, {
        path: ["files"],
        message: "You have reached your storage limit!",
    })

    const [activeTab, setActiveTab] = useState('files');
    const [blockedOpen, setBlockedOpen] = useState(false);
    const [unknownOpen, setUnknownOpen] = useState(false);
    const [errorFileIndexes, setErrorFileIndexes] = useState<number[]>([]);

    const { register, handleSubmit, control, setValue, watch, trigger, formState: { errors } } = useForm({
        resolver: zodResolver(schema),
        defaultValues: {
            files: [],
            location: '/',
            webhook: webhooks[0]?.url || ''
        }
    })

    const filesToUpload: FormData['files'] = watch('files')

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault()
        e.stopPropagation()
    }

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault()
        e.stopPropagation()
        const droppedFiles = Array.from(e.dataTransfer.files)
        const filteredFiles = droppedFiles.filter(file => !filesToUpload.some((existingFile) => existingFile.name === file.name && existingFile.size === file.size))
        setValue('files', [...filesToUpload, ...filteredFiles] as [File, ...File[]])
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const selectedFiles = Array.from(e.target.files)
            const filteredFiles = selectedFiles.filter(file => !filesToUpload.some((existingFile) => existingFile.name === file.name && existingFile.size === file.size))
            setValue('files', [...filesToUpload, ...filteredFiles] as [File, ...File[]])
        }
    }

    const handleUpload = async (data: FormData, share: boolean = false) => {
        const isValid = await trigger()

        if (!isValid) {
            return
        }

        const errors = await uploadFiles(data.files, data.webhook, parsePath(data.location), setStatusBar, setFiles);
        if (share) {
            await createJob(setStatusBar, `Create share link for ${data.files[0].name}`, ShareIcon, async () => {
                return new Promise(async (resolve) => {
                    setStatusBar(prev => ({ ...prev, progress: 0, title: `Creating share link for ${data.files[0].name}` }));
                    const newFiles = (await fetchFiles()).data?.files as DBFile[];
                    setStatusBar(prev => ({ ...prev, progress: 50 }));
                    if (newFiles) {
                        const fileToShare = newFiles.find(file => file.filename === data.files[0].name && file.path === data.location);
                        if (fileToShare) {
                            const shareResponse = await shareItem(fileToShare.id, "file", { neverExpire: true });
                            if (shareResponse.success) {
                                setShares(prev => [...prev, shareResponse.data]);
                                setSuccessDialogProps({ open: true, name: data.files[0].name, share: shareResponse.data });
                                setStatusBar(prev => ({ ...prev, progress: 100 }));
                            }
                        }
                    }
                    resolve();
                })
            })
        }
        if (errors) {
            if (errors === "UnknownWebhook") {
                setUnknownOpen(true);
            } else {
                setBlockedOpen(true);
            }
        } else {
            setOpen(false);
        }
    }

    const handleRemove = (index: number) => {
        const updatedFiles = filesToUpload.filter((_, i) => i !== index);
        setValue('files', updatedFiles);
    }

    const handleClear = () => {
        setValue('files', []);
    }

    const onError = (errs: typeof errors) => {
        for (const key in errs) {
            if (key === "webhook" || key === "location") {
                setActiveTab('info');
            }
            setActiveTab(key);
        }
    }

    useEffect(() => {
        if (customFiles) {
            setValue('files', customFiles);
        }
    }, [customFiles])

    return (
        <form className='space-y-6'>
            <Tabs value={activeTab} onValueChange={setActiveTab} className='space-y-6'>
                <TabsList className="md:grid w-full md:grid-cols-3 flex overflow-auto">
                    <TabsTrigger value="files">Select Files</TabsTrigger>
                    <TabsTrigger value="info" disabled={filesToUpload.length <= 0 && activeTab === 'files'}>Details</TabsTrigger>
                    <TabsTrigger value="share" disabled={(filesToUpload.length <= 0 && activeTab === 'files') || !watch("webhook") || !watch("location")}>{filesToUpload.length === 1 ? "Upload & Share" : "Upload"}</TabsTrigger>
                </TabsList>

                <TabsContent value="files">
                    <div
                        className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer"
                        onDragOver={handleDragOver}
                        onDrop={handleDrop}
                    >
                        <Upload className="mx-auto mb-4" />
                        <p>{filesToUpload.length > 0 ? `${filesToUpload.length} ${filesToUpload.length === 1 ? "file" : "files"} selected` : "Select files to upload"}</p>
                        <input
                            type="file"
                            multiple
                            onChange={handleFileChange}
                            className="hidden"
                            id="file-upload"
                        />
                        <label
                            className={cn(buttonVariants({ variant: "outline" }), "mt-4")}
                            htmlFor="file-upload"
                        >
                            Select Files
                        </label>
                    </div>
                    {filesToUpload.length > 0 && (
                        <div className="mt-4">
                            <div className="flex items-center justify-between">
                                <h4 className="font-semibold mb-2">Selected Files:</h4>
                                <Button
                                    className='p-0'
                                    variant='link'
                                    onClick={handleClear}
                                >
                                    Clear All
                                </Button>
                            </div>
                            <FileList
                                filenames={filesToUpload.map(file => file.name)}
                                onNameChange={(oldName, newName) => {
                                    setValue("files", filesToUpload.map((f, i) => f.name === oldName ? new File([f], newName, { type: f.type }) : f) as [File, ...File[]]);
                                }}
                                onRemove={(name) => {
                                    handleRemove(filesToUpload.findIndex(file => file.name === name));
                                }}
                                errorFileIndexes={errorFileIndexes}
                                setErrorFileIndexes={setErrorFileIndexes}
                            />
                        </div>
                    )}
                    {errors.files && (
                        <p className="text-destructive font-semibold text-sm mt-2">{errors.files.message}</p>
                    )}
                </TabsContent>

                <TabsContent value="info" className='p-1'>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="location">Save Location</Label>
                            <div className="flex items-center justify-center gap-2">
                                <Input
                                    id="location"
                                    placeholder="Enter save location"
                                    value={watch('location') as FormData['location']}
                                    className='w-full'
                                    {...register('location')}
                                />
                                <UploadPathDialog setPath={(path) => { setValue('location', parsePath(path)) }} />
                            </div>
                            {errors.location && (
                                <p className="text-destructive font-semibold text-sm">{errors.location.message}</p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="webhook">Webhook</Label>
                            <Controller
                                control={control}
                                name="webhook"
                                render={({ field }) => (
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <SelectTrigger id="webhook">
                                            <SelectValue placeholder={loading ? "Loading..." : "Select Webhook"} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {webhooks.map((webhook, index) => (
                                                <SelectItem key={index} value={webhook.url}>
                                                    {webhook.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            />

                            {errors.webhook && (
                                <p className="text-destructive font-semibold text-sm">{errors.webhook.message}</p>
                            )}
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="share">
                    <div className="space-y-2">
                        <Button type="submit" onClick={handleSubmit(data => handleUpload(data), onError)} className="w-full">
                            <Upload className="mr-2 h-4 w-4" />
                            Upload {filesToUpload.length === 1 ? "File" : "Files"}
                        </Button>
                        {filesToUpload.length === 1 && <Button onClick={handleSubmit(data => handleUpload(data, true), onError)} variant="outline" className="w-full">
                            <Share2 className="mr-2 h-4 w-4" />
                            Share File
                        </Button>}
                    </div>
                </TabsContent>
            </Tabs>

            <div className="flex justify-between">
                <Button
                    type="button"
                    variant="outline"
                    onClick={() => setActiveTab(activeTab === 'upload' ? 'upload' : activeTab === 'info' ? 'upload' : 'info')}
                    disabled={activeTab === 'upload'}
                >
                    <ChevronLeft />
                    Previous
                </Button>
                <Button
                    type="button"
                    onClick={() => setActiveTab(activeTab === 'files' ? 'info' : activeTab === 'info' ? 'share' : 'share')}
                    disabled={activeTab === 'share' || (filesToUpload.length <= 0 && activeTab === 'upload') || ((!watch("webhook") || !watch("location")) && activeTab === 'info')}
                >
                    Next
                    <ChevronRight />
                </Button>
            </div>
            <RequestBlockedDialog open={blockedOpen} setOpen={setBlockedOpen} />
            <UnknownWebhookDialog open={unknownOpen} setOpen={setUnknownOpen} webhook={watch("webhook")} />
        </form>
    )
}

export default UploadDialogTabs