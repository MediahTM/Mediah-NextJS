'use client'

import * as z from 'zod';
import React, { useEffect, useState } from 'react';
import UploadPathDialog from '../select-path/select-path-dialog';
import { Button, buttonVariants } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Share2, Upload, XIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Controller, useForm } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { parsePath } from '@/lib/helpers';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { uploadFiles } from '@/utils/file-store/upload';
import { useFiles } from '@/utils/files-context';
import { useStatusBar } from '@/utils/status-bar-context';
import { Webhook } from '@prisma/client';
import { zodResolver } from '@hookform/resolvers/zod';
import axios from 'axios';
import FileList from "@/components/file-list";

const UploadDialogTabs = ({ open, setOpen }: { open: boolean, setOpen: React.Dispatch<React.SetStateAction<boolean>> }) => {
    const { files, setFiles } = useFiles();
    type FormData = z.infer<typeof schema>
    const schema = z.object({
        location: z.preprocess(
            (val) => typeof val === 'string' ? val : parsePath(val as string),
            z.string().min(1, 'File path is required')
        ),
        webhook: z.string().min(1, 'Webhook is required'),
        files: z.array(z.instanceof(File)).nonempty('At least one file is required').refine((files) => files.find(file => file.name.length === 0) === undefined, 'File name is mssing from at least one file.').refine((files) => files.find(file => file.name.length > 255) === undefined, 'File name cannot exceed 255 characters.'),
    }).refine((data) => {
        const duplicateFile = data.files.find(file => files.find(databaseFile => databaseFile.filename === file.name && databaseFile.path === data.location));
        return !duplicateFile
    }, {
        path: ["location"],
        message: "Selected path already contains a file with this name!",
    })

    const { setStatusBar } = useStatusBar();
    const [activeTab, setActiveTab] = useState('upload')
    const [webhooks, setWebhooks] = useState<Webhook[]>([]);

    const { register, handleSubmit, control, setValue, watch, trigger, formState: { errors } } = useForm({
        resolver: zodResolver(schema),
        defaultValues: {
            files: [],
            location: '/',
            webhook: ''
        }
    })

    useEffect(() => {
        if (open) {
            axios.get("/api/webhooks").then((response) => {
                if (response.data.success) {
                    setWebhooks(response.data.data)
                    setValue('webhook', response.data.data[0].url)
                } else {
                    toast.error("Could not fetch user webhooks!")
                }
            }).catch(() => {
                toast.error("Could not fetch the data!")
            })
        }
    }, [open])

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

    const goToFirstErrorTab = async () => {
        const uploadErrors = await trigger(['files'])
        if (!uploadErrors) {
            setActiveTab('upload')
            return
        }

        const infoErrors = await trigger(['location', 'webhook'])
        if (!infoErrors) {
            setActiveTab('info')
        }
    }

    const handleUpload = async (data: FormData) => {
        const isValid = await trigger()

        if (!isValid) {
            goToFirstErrorTab()
            return
        }

        setOpen(false);
        uploadFiles(data.files, data.webhook, parsePath(data.location), setStatusBar, setFiles);
    }

    const handleShare = () => {
        console.log('Sharing files:', filesToUpload)
    }

    const handleRemove = (index: number) => {
        const updatedFiles = filesToUpload.filter((_, i) => i !== index);
        setValue('files', updatedFiles as [File, ...File[]]);
    }

    const handleClear = () => {
        //@ts-ignore
        setValue('files', [] as [File, ...File[]]);
    }

    return (
        <form onSubmit={handleSubmit(handleUpload)} className='space-y-6'>
            <Tabs value={activeTab} onValueChange={setActiveTab} className='space-y-6'>
                <TabsList className="md:grid w-full md:grid-cols-3 flex overflow-auto">
                    <TabsTrigger value="upload">Upload Files</TabsTrigger>
                    <TabsTrigger value="info" disabled={filesToUpload.length <= 0 && activeTab === 'upload'}>File Information</TabsTrigger>
                    <TabsTrigger value="share" disabled={(filesToUpload.length <= 0 && activeTab === 'upload') || !watch("webhook") || !watch("location")}>Upload & Share</TabsTrigger>
                </TabsList>

                <TabsContent value="upload">
                    <div
                        className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer"
                        onDragOver={handleDragOver}
                        onDrop={handleDrop}
                    >
                        <Upload className="mx-auto mb-4" />
                        <p>Drag and drop files here, or click to select files</p>
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
                    {errors.files && (
                        <p className="text-destructive font-semibold text-sm mt-2">{errors.files.message}</p>
                    )}
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
                            />
                        </div>
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
                                            <SelectValue placeholder="Select Webhook" />
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
                        <Button type="submit" onClick={() => goToFirstErrorTab()} className="w-full">
                            <Upload className="mr-2 h-4 w-4" />
                            Upload Files
                        </Button>
                        <Button onClick={handleShare} variant="outline" className="w-full">
                            <Share2 className="mr-2 h-4 w-4" />
                            Share Files
                        </Button>
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
                    onClick={() => setActiveTab(activeTab === 'upload' ? 'info' : activeTab === 'info' ? 'share' : 'share')}
                    disabled={activeTab === 'share' || (filesToUpload.length <= 0 && activeTab === 'upload') || ((!watch("webhook") || !watch("location")) && activeTab === 'info')}
                >
                    Next
                    <ChevronRight />
                </Button>
            </div>
        </form>
    )
}

export default UploadDialogTabs