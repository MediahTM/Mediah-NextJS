'use client'

import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Upload, Share2 } from 'lucide-react'

const UploadDialogTabs = () => {
    const [files, setFiles] = useState<File[]>([])
    const [location, setLocation] = useState('')
    const [filename, setFilename] = useState('')
    const [activeTab, setActiveTab] = useState('upload')

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault()
        e.stopPropagation()
    }

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault()
        e.stopPropagation()
        const droppedFiles = Array.from(e.dataTransfer.files)
        setFiles(prevFiles => [...prevFiles, ...droppedFiles])
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const selectedFiles = Array.from(e.target.files)
            setFiles(prevFiles => [...prevFiles, ...selectedFiles])
        }
    }

    const handleUpload = () => {
        console.log('Uploading files:', files)
        console.log('Save location:', location)
        console.log('Filename:', filename)
    }

    const handleShare = () => {
        console.log('Sharing files:', files)
    }

    return (
        <div className='space-y-6'>
            <div>
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
                            <label htmlFor="file-upload">
                                <Button variant="outline" className="mt-4">Select Files</Button>
                            </label>
                        </div>
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
                                    value={location}
                                    onChange={(e) => setLocation(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="filename">Filename</Label>
                                <Input
                                    id="filename"
                                    placeholder="Enter filename"
                                    value={filename}
                                    onChange={(e) => setFilename(e.target.value)}
                                />
                            </div>
                        </div>
                    </TabsContent>
                    <TabsContent value="share">
                        <div className="space-y-2">
                            <Button onClick={handleUpload} className="w-full">
                                <Upload className="mr-2 h-4 w-4" /> Upload Files
                            </Button>
                            <Button onClick={handleShare} variant="outline" className="w-full">
                                <Share2 className="mr-2 h-4 w-4" /> Share Files
                            </Button>
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
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
        </div>
    )
}

export default UploadDialogTabs