'use client'

import * as z from 'zod';
import React, { useEffect, useState } from 'react';
import { Button, buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Controller, useForm } from 'react-hook-form';
import { getFileIcon } from '@/utils/file-types';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Share2, Upload, XIcon } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { uploadFiles } from '@/utils/file-store/upload';
import { useStatusBar } from '@/utils/status-bar-context';
import { Webhook } from '@prisma/client';
import { zodResolver } from '@hookform/resolvers/zod';
import { useFiles } from '@/utils/files-context';

const schema = z.object({
    location: z.string().min(1, 'Save Location is required'),
    webhook: z.string().min(1, 'Webhook is required'),
    files: z.array(z.instanceof(File)).nonempty('At least one file is required')
})

type FormData = z.infer<typeof schema>

const UploadDialogTabs = ({ open, setOpen }: { open: boolean, setOpen: React.Dispatch<React.SetStateAction<boolean>> }) => {
    const { setFiles } = useFiles();
    const { statusBar, setStatusBar } = useStatusBar();
    const [activeTab, setActiveTab] = useState('upload')
    const [webhooks, setWebhooks] = useState<Webhook[]>([]);

    const { register, handleSubmit, control, setValue, watch, trigger, formState: { errors } } = useForm<FormData>({
        resolver: zodResolver(schema),
        defaultValues: {
            files: [],
            location: '/',
            webhook: ''
        }
    })

    useEffect(() => {
        if (open) {
            fetch(`/api/webhooks`, {
                method: "GET"
            })
                .then((response) => response.json())
                .then((response) => {
                    if (response.success) {
                        setWebhooks(response.data)
                        setValue('webhook', response.data[0].url)
                    } else {
                        toast.error("Could not fetch user webhooks!")
                    }
                })
                .catch(() => {
                    toast.error("Could not fetch the data!")
                })
        }
    }, [open])

    const files = watch('files')

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault()
        e.stopPropagation()
    }

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault()
        e.stopPropagation()
        const droppedFiles = Array.from(e.dataTransfer.files)
        const filteredFiles = droppedFiles.filter(file => !files.some((existingFile) => existingFile.name === file.name && existingFile.size === file.size))
        setValue('files', [...files, ...filteredFiles] as [File, ...File[]])
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const selectedFiles = Array.from(e.target.files)
            const filteredFiles = selectedFiles.filter(file => !files.some((existingFile) => existingFile.name === file.name && existingFile.size === file.size))
            setValue('files', [...files, ...filteredFiles] as [File, ...File[]])
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
        uploadFiles(data.files, data.webhook, data.location, setStatusBar, setFiles);
    }

    const handleShare = () => {
        console.log('Sharing files:', files)
    }

    const handleRemove = (index: number) => {
        const updatedFiles = files.filter((_, i) => i !== index);
        setValue('files', updatedFiles as [File, ...File[]]);
    }

    const handleClear = () => {
        // @ts-ignore
        setValue('files', [] as [File, ...File[]]);
    }

    return (
        <form onSubmit={handleSubmit(handleUpload)} className='space-y-6'>
            <Tabs value={activeTab} onValueChange={setActiveTab} className='space-y-6'>
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="upload">Upload Files</TabsTrigger>
                    <TabsTrigger value="info" disabled={files.length <= 0 && activeTab === 'upload'}>File Information</TabsTrigger>
                    <TabsTrigger value="share" disabled={(files.length <= 0 && activeTab === 'upload') || !watch("webhook") || !watch("location")}>Upload & Share</TabsTrigger>
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
                    {files.length > 0 && (
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
                            <ScrollArea className={cn('max-w-full overflow-y-auto overflow-x-clip pr-4', files.length >= 6 && 'h-[200px]')}>
                                <div className="max-w-full pl-5 flex flex-col gap-1">
                                    {files.map((file, index) => (
                                        <div key={index} className="flex max-w-xl flex-1 gap-4 items-center justify-between overflow-hidden">
                                            <div className="flex items-center gap-2 overflow-hidden">
                                                {getFileIcon(file.name, { className: 'size-5 shrink-0 aspect-square' })}
                                                <p className='truncate'>{file.name}</p>
                                            </div>
                                            <Button
                                                type='button'
                                                onClick={() => handleRemove(index)}
                                                variant='outline'
                                                size='icon'
                                                className='ml-auto size-8 aspect-square'
                                            >
                                                <XIcon />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            </ScrollArea>
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="info" className='p-1'>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="location">Save Location</Label>
                            <Input
                                id="location"
                                placeholder="Enter save location"
                                value={"/"}
                                disabled
                                {...register('location')}
                            />
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
                                        <SelectTrigger id='webhook' value='placeholder'>
                                            <SelectValue placeholder='Select Webhook' defaultValue={webhooks.length > 0 ? webhooks[0].name : ''} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {webhooks.map((webhook, index) => (
                                                <SelectItem key={index} value={webhook.url}>{webhook.name}</SelectItem>
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
                    Previous
                </Button>
                <Button
                    type="button"
                    onClick={() => setActiveTab(activeTab === 'upload' ? 'info' : activeTab === 'info' ? 'share' : 'share')}
                    disabled={activeTab === 'share' || (files.length <= 0 && activeTab === 'upload') || ((!watch("webhook") || !watch("location")) && activeTab === 'info')}
                >
                    Next
                </Button>
            </div>
        </form>
    )
}

export default UploadDialogTabs