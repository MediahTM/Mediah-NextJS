'use client'

import { useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button, buttonVariants } from "@/components/ui/button"
import { Upload, Share2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'

const schema = z.object({
    location: z.string().min(1, 'Save Location is required'),
    webhook: z.string().min(1, 'Webhook is required'),
    files: z.array(z.instanceof(File)).nonempty('At least one file is required'),
})

type FormData = z.infer<typeof schema>

const UploadDialogTabs = () => {
    const [activeTab, setActiveTab] = useState('upload')

    const {
        register,
        handleSubmit,
        control,
        setValue,
        watch,
        trigger,
        formState: { errors }
    } = useForm<FormData>({
        resolver: zodResolver(schema),
        defaultValues: {
            files: [],
            location: '',
            webhook: ''
        }
    })

    const files = watch('files')

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault()
        e.stopPropagation()
    }

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault()
        e.stopPropagation()
        const droppedFiles = Array.from(e.dataTransfer.files)
        setValue('files', [...files, ...droppedFiles])
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const selectedFiles = Array.from(e.target.files)
            setValue('files', [...files, ...selectedFiles])
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
        // Run validation before submission
        const isValid = await trigger()

        if (!isValid) {
            goToFirstErrorTab()
            return
        }

        console.log('Uploading files:', data.files)
        console.log('Save location:', data.location)
        console.log('Webhook:', data.webhook)
    }

    const handleShare = () => {
        console.log('Sharing files:', files)
    }

    return (
        <form onSubmit={handleSubmit(handleUpload)} className='space-y-6'>
            <Tabs value={activeTab} onValueChange={setActiveTab} className='space-y-6'>
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="upload">Upload Files</TabsTrigger>
                    <TabsTrigger value="info">File Information</TabsTrigger>
                    <TabsTrigger value="share">Upload & Share</TabsTrigger>
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
                        <p className="text-red-500 text-sm mt-2">{errors.files.message}</p>
                    )}
                    {files.length > 0 && (
                        <div className="mt-4">
                            <h4 className="font-semibold mb-2">Selected Files:</h4>
                            <ul className="list-disc pl-5">
                                {files.map((file, index) => (
                                    <li key={index}>{file.name}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="info">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="location">Save Location</Label>
                            <Input
                                id="location"
                                placeholder="Enter save location"
                                {...register('location')}
                            />
                            {errors.location && (
                                <p className="text-red-500 text-sm">{errors.location.message}</p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="webhook">Webhook</Label>
                            <Controller
                                control={control}
                                name="webhook"
                                render={({ field }) => (
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <SelectTrigger id='webhook'>
                                            <SelectValue placeholder='Select webhook' />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value='discord.com'>Discord</SelectItem>
                                            <SelectItem value='slack.com'>Slack</SelectItem>
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                            {errors.webhook && (
                                <p className="text-red-500 text-sm">{errors.webhook.message}</p>
                            )}
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="share">
                    <div className="space-y-2">
                        <Button type="submit" onClick={() => goToFirstErrorTab()} className="w-full">
                            <Upload className="mr-2 h-4 w-4" /> Upload Files
                        </Button>
                        <Button onClick={handleShare} variant="outline" className="w-full">
                            <Share2 className="mr-2 h-4 w-4" /> Share Files
                        </Button>
                    </div>
                </TabsContent>
            </Tabs>

            <div className="flex justify-between">
                <Button
                    variant="outline"
                    onClick={() => setActiveTab(activeTab === 'upload' ? 'upload' : activeTab === 'info' ? 'upload' : 'info')}
                    disabled={activeTab === 'upload'}
                >
                    Previous
                </Button>
                <Button
                    onClick={() => setActiveTab(activeTab === 'upload' ? 'info' : activeTab === 'info' ? 'share' : 'share')}
                    disabled={activeTab === 'share'}
                >
                    Next
                </Button>
            </div>
        </form>
    )
}

export default UploadDialogTabs
