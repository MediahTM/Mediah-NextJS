import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { isFolder, parsePath } from '@/lib/helpers'
import { Folder } from '@/types/folder'
import { zodResolver } from '@hookform/resolvers/zod'
import { File } from '@prisma/client'
import { Loader2Icon } from 'lucide-react'
import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import z from 'zod'
import UploadPathDialog from '../select-path/select-path-dialog'
import { Button } from '@/components/ui/button'
import { pathSchema } from '@/lib/api-schemas'
import { editPath, patchFiles } from '@/utils/api-actions'
import { useFiles } from '@/utils/files-context'

const MoveForm = ({ items, setOpen }: { items: (File | Folder)[], setOpen: React.Dispatch<React.SetStateAction<boolean>> }) => {
    const [loading, setLoading] = useState(false);
    const { setFiles } = useFiles();
    const formSchema = z.object({
        newPath: pathSchema
    });

    type FormData = z.infer<typeof formSchema>

    const { register, watch, setValue, formState: { errors }, handleSubmit } = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            newPath: "/",
        },
    })

    const handleMove = async (data: FormData) => {
        const newPath = data.newPath;
        setLoading(true);
        const files = items.filter(f => !isFolder(f)) as File[];
        const folders = items.filter(f => isFolder(f)) as Folder[];
        if (files.length > 0) {
            await patchFiles(files.map(file => file.id), { path: newPath });
        }
        for (const folder of folders) {
            await editPath(folder.path, newPath + "/" + folder.name);
        }
        setFiles((prev) => {
            const newFiles = prev.map((file) => {
                if (files.find(f => f.id === file.id)) {
                    return { ...file, path: parsePath(newPath), updatedAt: new Date(new Date().getTime() - 1 * 1000) }
                } else {
                    for (const folder of folders) {
                        if (file.path.startsWith(folder.path)) {
                            return { ...file, path: parsePath(newPath + "/" + folder.name) }
                        }
                    }
                    return file
                }
            })
            return newFiles
        });
        setOpen(false);
    }

    return (
        <form className='space-y-4' onSubmit={handleSubmit(handleMove)}>
            <div className="flex flex-col gap-1">
                <Label htmlFor="newPath">New Path</Label>
                <div className="flex items-center justify-center gap-2">
                    <Input
                        id="location"
                        placeholder="Enter save location"
                        value={watch('newPath') as FormData['newPath']}
                        className='w-full'
                        {...register('newPath')}
                    />
                    <UploadPathDialog setPath={(path) => { setValue('newPath', parsePath(path)) }} description={`Choose the place to move your ${items.length > 1 ?
                        (items.every(f => isFolder(f)) ? "folders" : (
                            items.every(f => !isFolder(f)) ? "files" : "items"
                        ))
                        : isFolder(items[0]) ? "folder" : "file"
                        }`} />
                </div>
                {errors.newPath && (
                    <p className="text-destructive font-semibold text-sm">{errors.newPath.message}</p>
                )}
            </div>
            <div className="flex items-center justify-end gap-2">
                <Button type="submit">
                    {!loading ? (
                        <>
                            Move
                        </>
                    ) : (
                        <Loader2Icon className="animate-spin relative size-6" />
                    )}
                </Button>
                <Button
                    variant="secondary"
                    onClick={(event) => {
                        event.preventDefault();
                        setOpen(false);
                    }}
                >
                    Cancel
                </Button>
            </div>
        </form>
    )
}

export default MoveForm