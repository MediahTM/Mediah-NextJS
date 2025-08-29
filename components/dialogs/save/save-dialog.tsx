import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { useForm } from 'react-hook-form'
import z from "zod"
import React, { useEffect, useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { parsePath, replaceIllegalCharacters, serializeBigInt } from '@/lib/helpers'
import { Button } from '@/components/ui/button'
import { uploadFileToDatabase } from '@/utils/api-actions'
import { FileWithShareInfo } from '../../../app/share/[id]/view'
import { toast } from 'sonner'
import UploadPathDialog from '../upload/upload-path'
import { File } from '@prisma/client'

const saveSchema = z.object({
    location: z.preprocess(
        (val) => typeof val === 'string' ? val : parsePath(val as string),
        z.string().min(1, 'File path is required')
    ),
    name: z.preprocess(
        (val) => typeof val === 'string' ? val : replaceIllegalCharacters(val as string, "filename"),
        z.string({ message: "File name is required!" }).min(1, 'File name is required!').max(255, 'File name is too long!')
    ),
})

z.coerce.string()

// TODO: Validate no duplicate files

// .refine((data) => {
//     return containsIllegalCharacters(data.name, "filename");
// }, {
//     message: 'Exactly one of "endDate" or "neverExpire" must be provided',
//     path: ['endDate', 'neverExpire']
// });

type FormData = z.infer<typeof saveSchema>

const SaveDialog = ({ file, openSaveDialog, setOpenSaveDialog }: { file?: File | FileWithShareInfo, openSaveDialog: boolean, setOpenSaveDialog: React.Dispatch<React.SetStateAction<boolean>> }) => {
    const { register, handleSubmit, setValue, setError, watch, trigger, formState: { errors } } = useForm({
        resolver: zodResolver(saveSchema),
        defaultValues: {
            location: '/',
            name: file ? file.filename : 'File',
        }
    })

    useEffect(() => {
        file && setValue('name', file.filename);
    }, [file])

    const [loading, setLoading] = useState(false);

    return (
        <Dialog open={openSaveDialog} onOpenChange={setOpenSaveDialog}>
            <DialogContent>
                <DialogTitle>
                    Save to Mediah
                </DialogTitle>
                <form onSubmit={handleSubmit(async (data) => {
                    const isValid = await trigger();
                    if (!isValid || !file) return;
                    setLoading(true);
                    const response = await uploadFileToDatabase(serializeBigInt({
                        ...file,
                        filename: data.name,
                        path: data.location
                    }));
                    setLoading(false);
                    if (!response.success) return setError('location', { message: response.message });
                    setOpenSaveDialog(false);
                    toast.success('File saved successfully!');
                })}>
                    <div className="space-y-2">
                        <Label htmlFor="location">Save Location</Label>
                        <div className="flex items-center justify-center gap-2">
                            <Input value={watch('location') as FormData['location']} {...register('location')} placeholder='Enter save location' onChange={(e) => setValue('location', e.target.value)} autoComplete="off" />
                            <UploadPathDialog setPath={(path) => { setValue('location', parsePath(path)) }} />
                        </div>
                        {errors.location && (
                            <p className="text-destructive font-semibold text-sm">{errors.location.message}</p>
                        )}
                    </div>
                    <div className="space-y-2 mb-4">
                        <Label htmlFor="name">File name</Label>
                        <div className="flex items-center justify-center gap-2">
                            <Input value={watch('name') as FormData['name']} {...register('name')} placeholder='Enter filename' onChange={(e) => setValue('name', e.target.value)} autoComplete="off" />
                        </div>
                        {errors.name && (
                            <p className="text-destructive font-semibold text-sm">{errors.name.message}</p>
                        )}
                    </div>
                    <Button type='submit' className='w-full' disabled={loading}>
                        Save
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    )
}

export default SaveDialog