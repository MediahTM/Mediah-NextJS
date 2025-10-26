import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { useForm } from 'react-hook-form'
import z from "zod"
import React, { useEffect, useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { parsePath, serializeBigInt } from '@/lib/helpers'
import { Button } from '@/components/ui/button'
import { uploadFileToDatabase } from '@/utils/api-actions'
import { FileWithShareInfo } from '../../../app/share/[id]/view'
import { toast } from 'sonner'
import UploadPathDialog from '../select-path/select-path-dialog'
import { File } from '@prisma/client'
import { useFiles } from '@/utils/files-context'
import FileList from '@/components/file-list'
import { createJob } from '@/utils/status-bar-jobs'
import { useStatusBar } from '@/utils/status-bar-context'
import { SaveIcon } from 'lucide-react'

const SaveDialog = ({ filesToSave, open, setOpen }: { filesToSave?: (File | FileWithShareInfo)[], open: boolean, setOpen: React.Dispatch<React.SetStateAction<boolean>> }) => {
    const { files, setFiles } = useFiles();
    const { setStatusBar } = useStatusBar();
    const saveSchema = z.object({
        location: z.preprocess(
            (val) => typeof val === 'string' ? val : parsePath(val as string),
            z.string().min(1, 'File path is required')
        ),
        filesToSave: z.array(z.any()).nonempty('At least one file is required')
    }).refine((data) => {
        const duplicateFile = data.filesToSave.find(file => files.find(databaseFile => databaseFile.filename === file.filename && databaseFile.path === data.location));
        return !duplicateFile
    }, {
        path: ["location"],
        message: "Selected path already contains a file with this name!",
    });

    type FormData = z.infer<typeof saveSchema>
    const { register, handleSubmit, setValue, setError, watch, trigger, formState: { errors }, getValues } = useForm({
        resolver: zodResolver(saveSchema),
        defaultValues: {
            location: '/',
            filesToSave: []
        }
    })

    const [editedFiles, setEditedFiles] = useState<(File | FileWithShareInfo)[]>([]);

    useEffect(() => {
        filesToSave && setEditedFiles(filesToSave);
    }, [filesToSave])

    useEffect(() => {
        setValue('filesToSave', editedFiles);
    }, [editedFiles])

    useEffect(() => {
        if (!open) return
        setValue('location', '/');
        setError('location', { message: '' });
    }, [open])

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent>
                <DialogTitle>
                    Save to Mediah
                </DialogTitle>
                <form onSubmit={handleSubmit(async (data) => {
                    const isValid = await trigger();
                    if (!isValid || !filesToSave) return;
                    setOpen(false);
                    await createJob(setStatusBar, `Save ${editedFiles.length} ${editedFiles.length === 1 ? " file" : " files"} to '${data.location}'`, SaveIcon, async () => {
                        setStatusBar(statusBar => ({ ...statusBar, title: `Saving ${editedFiles.length} ${editedFiles.length === 1 ? " file" : " files"}`, progress: 0 }));
                        for (const file of editedFiles) {
                            const response = await uploadFileToDatabase(serializeBigInt({
                                ...file,
                                path: data.location
                            }));
                            if (!response.success) return setError('location', { message: response.message });
                            setFiles(prev => [...prev, response.data]);
                            setStatusBar(statusBar => ({ ...statusBar, progress: ((editedFiles.indexOf(file) + 1) / editedFiles.length) * 100 }));
                        }
                        toast.success(`${editedFiles.length > 1 ? "Files" : "File"} saved successfully!`);
                    })
                })}>
                    <div className="space-y-2">
                        <Label htmlFor="location">Save Location</Label>
                        <div className="flex items-center justify-center gap-2">
                            <Input value={watch('location') as FormData['location']} {...register('location')} placeholder='Enter save location' onChange={(e) => setValue('location', e.target.value)} autoComplete="off" />
                            <UploadPathDialog setPath={(path) => { setValue('location', parsePath(path)) }} description='Choose the place to save your files' />
                        </div>
                        {errors.location && (
                            <p className="text-destructive font-semibold text-sm">{errors.location.message}</p>
                        )}
                    </div>
                    {filesToSave && <div className="space-y-2 mb-4">
                        <Label htmlFor="filesToSave">Selected Files:</Label>
                        <FileList
                            filenames={editedFiles.map(file => file.filename)}
                            onNameChange={(oldName, newName) => {
                                setEditedFiles(prev => prev.map(file => file.filename === oldName ? { ...file, filename: newName } : file));
                            }}
                            onRemove={(name) => {
                                const newFiles = editedFiles.filter(file => file.filename !== name);
                                setEditedFiles(newFiles);
                                newFiles.length === 0 && setOpen(false);
                            }}
                        />
                        {errors.filesToSave && (
                            <p className="text-destructive font-semibold text-sm">{errors.filesToSave.message}</p>
                        )}
                    </div>}
                    <Button type='submit' className='w-full'>
                        Save
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    )
}

export default SaveDialog