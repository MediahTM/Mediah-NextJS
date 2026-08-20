"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { SubmitEvent, useEffect, useState } from 'react'
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { FileUpIcon } from "lucide-react";
import FileList from "@/components/file-list";
import { getMediahFileFromIndexFile, parsePath } from "@/lib/helpers";
import { Separator } from "@/components/ui/separator";
import UploadPathDialog from "../select-path/select-path-dialog";
import z from "zod";
import { importFileSchema, pathSchema } from "@/lib/api-schemas";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { uploadFileToDatabase } from "@/utils/api-actions";
import { createJob } from "@/utils/status-bar-jobs";
import { useStatusBar } from "@/utils/status-bar-context";
import { useFiles } from "@/utils/files-context";

const ImportView = ({ setOpen }: { setOpen: (open: boolean) => void }) => {
    const [indexFiles, setIndexFiles] = useState<File[]>([]);
    const { setStatusBar } = useStatusBar();
    const { setFiles } = useFiles();

    const formSchema = z.object({
        mediahFiles: z.array(importFileSchema),
        path: pathSchema
    });

    type FormData = z.infer<typeof formSchema>

    const { register, watch, control, setValue, formState: { errors }, handleSubmit } = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            mediahFiles: [],
            path: "/"
        },
    })

    const mediahFiles = useWatch({
        control,
        name: "mediahFiles",
        defaultValue: []
    })

    useEffect(() => {
        if (indexFiles.length === mediahFiles.length) return;
        (async () => {
            const readFiles = await Promise.all(
                indexFiles.map(async (indexFile) => getMediahFileFromIndexFile(indexFile))
            );

            const validFiles = readFiles.filter(f => f !== null);
            setValue('mediahFiles', validFiles);

            if (validFiles.length < readFiles.length) {
                toast.error("Some files could not be read");
            }

            const cleanedIndexFiles = indexFiles.filter((f, i) => readFiles[i] !== null);
            setIndexFiles(cleanedIndexFiles);
        })();
    }, [indexFiles])

    const handleImport = async (data: FormData) => {
        await createJob(setStatusBar, `Import ${data.mediahFiles.length} files`, FileUpIcon, async () => {
            return new Promise(async (resolve) => {
                const controller = new AbortController();
                const signal = controller.signal;
                setStatusBar(prev => ({
                    ...prev, progress: 0, title: `Importing ${data.mediahFiles.length} files`, onCancel: () => {
                        controller.abort();
                        resolve();
                    }
                }));
                for (const file of data.mediahFiles) {
                    setStatusBar(prev => ({ ...prev, progress: ((data.mediahFiles.indexOf(file) + 1) / data.mediahFiles.length) * 100, description: file.filename }));
                    try {
                        const response = await uploadFileToDatabase({ ...file, path: data.path }, { signal });
                        if (response.success) {
                            setFiles((prev) => [...prev, response.data]);
                        } else {
                            toast.error(`Could not import ${file.filename}: ${response.message}`);
                        }
                    } catch {
                        resolve();
                    }
                }
                resolve();
            })
        });
        setOpen(false);
    }

    return (
        <form onSubmit={handleSubmit(handleImport)}>
            <div className="grid gap-4 py-4">
                <div>
                    <label htmlFor="index-file" className={cn(buttonVariants({ variant: "default" }), "p-4")}>
                        <FileUpIcon />
                        Import Files
                    </label>
                    <input
                        id="index-file"
                        type="file"
                        multiple
                        accept=".json, .csv"
                        onChange={(event) => {
                            setIndexFiles(prev => [...prev, ...Array.from(event.target.files || [])]);
                        }}
                        className="col-span-3 hidden"
                    />
                </div>
                <div className="flex flex-col">
                    <h2 className="font-semibold text-sm">Imported Files {watch('mediahFiles').length > 0 && `(${watch('mediahFiles').length})`}</h2>
                    <Separator className="my-1" />
                    {watch('mediahFiles').length > 0 && <FileList filenames={watch('mediahFiles').map((f) => f.filename)} writable={false} onRemove={(filename: string) => {
                        const index = watch('mediahFiles').findIndex(f => f.filename === filename);
                        setIndexFiles(prev => prev.filter((f, i) => i !== index));
                    }} />}
                    {watch('mediahFiles').length === 0 && <p className="text-sm text-muted-foreground">No files imported yet</p>}
                </div>
                <div className="flex flex-col gap-2">
                    <h2 className="font-semibold text-sm">Select Path</h2>
                    <div className="flex items-center justify-center gap-2">
                        <Input
                            id="location"
                            placeholder="Enter save location"
                            value={watch('path') as FormData['path']}
                            className='w-full'
                            {...register('path')}
                        />
                        <UploadPathDialog setPath={(path) => { setValue('path', parsePath(path)) }} description={`Choose the place to move your ${watch('mediahFiles').length > 1 ? 'files' : 'file'}`} />
                    </div>
                </div>
            </div>
            <div className="flex items-center mt-2 justify-end gap-2">
                <Button type="submit" disabled={watch('mediahFiles').length === 0}>
                    Import
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

export default ImportView