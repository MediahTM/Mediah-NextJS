import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { parsePath } from '@/lib/helpers';
import { useFiles } from '@/utils/files-context';
import { zodResolver } from '@hookform/resolvers/zod';
import React, { useEffect } from 'react'
import { useForm } from 'react-hook-form';
import z from 'zod';
import UploadPathDialog from '../select-path/select-path-dialog';
import { Button } from '@/components/ui/button';
import { FolderIcon, SaveIcon } from 'lucide-react';
import { Folder } from '@/types/folder';
import { createJob } from '@/utils/status-bar-jobs';
import { useStatusBar } from '@/utils/status-bar-context';
import { FileWithShareInfo } from '@/app/share/[id]/view';
import { File } from '@prisma/client';
import { uploadFileToDatabase } from '@/utils/api-actions';
import { serializeBigInt } from '@/lib/helpers';
import { toast } from 'sonner';

const SaveFolderDialog = ({ open, setOpen, folder, sharedFiles }: { open: boolean, setOpen: React.Dispatch<React.SetStateAction<boolean>>, folder?: Folder, sharedFiles: (File | FileWithShareInfo)[] }) => {
    const { files, setFiles } = useFiles();
    const { setStatusBar } = useStatusBar();
    const saveSchema = z.object({
        location: z.preprocess(
            (val) => typeof val === 'string' ? val : parsePath(val as string),
            z.string().min(1, 'File path is required')
        )
    }).refine((data) => {
        const filesToSave = sharedFiles.filter(file => file.path.startsWith(folder?.path ?? '')) as File[];
        return filesToSave.every(file => files.every(databaseFile => databaseFile.filename !== file.filename || databaseFile.path !== parsePath(data.location + "/" + folder?.name + "/" + file.path.slice(folder?.path.length ?? 0))));
    }, {
        path: ["location"],
        message: "Selected path already contains a file with this name!",
    })

    type FormData = z.infer<typeof saveSchema>

    const form = useForm({
        resolver: zodResolver(saveSchema),
        defaultValues: {
            location: '/'
        }
    })

    const { register, handleSubmit, setValue, watch, trigger, formState: { errors } } = form

    const onSubmit = async (data: z.infer<typeof saveSchema>) => {
        const valid = await trigger();
        if (!valid) return;
        await createJob(setStatusBar, `Save '${folder?.name}' to Mediah`, SaveIcon, async () => {
            setStatusBar(statusBar => ({ ...statusBar, title: `Saving '${folder?.name}' to Mediah`, progress: 0 }));
            const files = sharedFiles.filter(file => file.path.startsWith(folder?.path ?? '')) as File[];
            for (const [index, file] of files.entries()) {
                const response = await uploadFileToDatabase(serializeBigInt({
                    ...file,
                    path: parsePath(data.location + "/" + folder?.name + "/" + file.path.slice(folder?.path.length ?? 0))
                }));
                if (!response.success) return;
                setStatusBar(statusBar => ({ ...statusBar, progress: ((index + 1) / files.length) * 100 }));
                setFiles(files => [...files, response.data]);
            }
            toast.success(`Saved '${folder?.name}' to Mediah`);
        });
        setOpen(false);
    }

    useEffect(() => {
        open && form.reset();
    }, [open])

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent>
                <DialogTitle className='flex gap-2 w-full text-nowrap overflow-hidden pr-4'>Save <FolderIcon className='stroke-primary shrink-0' /> <p className='text-primary truncate'>{folder?.name}</p> to Mediah</DialogTitle>
                <form onSubmit={handleSubmit(onSubmit)}>
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
                    <Button type='submit' className='w-full mt-4'>
                        Save
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    )
}

export default SaveFolderDialog