"use client";

import * as z from 'zod';
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { File } from '@prisma/client';
import { FolderIcon, Loader2Icon } from 'lucide-react';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { editPath, renameFile } from '@/utils/api-actions';
import { FileIcon } from '@/utils/file-types';
import { Folder } from '@/types/folder';
import { containsIllegalCharacters, getRelativeFolderPath, isFolder, parsePath } from '@/lib/helpers';
import { MAX_FILE_PATH, MAX_FOLDER_NAME_LENGTH } from '@/lib/constants';
import { useFiles } from '@/utils/files-context';

const RenameForm = ({ item, setOpen }: { item: File | Folder, setOpen: (open: boolean) => void }) => {
    const { setFiles, setShares } = useFiles();
    const formSchema = z.object({
        fileName: z
            .string()
            .max(255, "File name is too long!")
            .refine((name) => !containsIllegalCharacters(name, "filename"), "File name cannot contain illegal characters")
            .optional(),
        folderName: z
            .string()
            .max(MAX_FOLDER_NAME_LENGTH, "Folder name is too long!")
            .refine((name) => !containsIllegalCharacters(name, "filename"), "Folder name cannot contain illegal characters")
            .refine((name) => !(parsePath(getRelativeFolderPath(item as Folder) + "/" + name).length > MAX_FILE_PATH), "Folder name exceeds maximum path length!")
            .optional(),
    }).refine((data) => {
        return ((data.fileName && data.fileName.length > 0) || (data.folderName && data.folderName.length > 0));
    }, "Name is required!");

    const [loading, setLoading] = useState<boolean>(false);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            fileName: isFolder(item) ? undefined : (item as File).filename,
            folderName: isFolder(item) ? (item as Folder).name : undefined,
        },
    })

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        if ((!isFolder(item) && (item as File).filename == values.fileName) || (isFolder(item) && (item as Folder).name == values.folderName)) {
            setOpen(false);
            return;
        }

        setLoading(true);

        if (isFolder(item)) {
            const newPath = parsePath(getRelativeFolderPath(item as Folder) + "/" + values.folderName)
            const response = await editPath((item as Folder).path, newPath);
            if (response.success) {
                setFiles((prev) => prev.map((file) => file.path.startsWith((item as Folder).path) ? { ...file, path: parsePath(newPath + "/" + file.path.substring((item as Folder).path.length)) } : file));
                setShares((prev) => prev.map((share) => share.type == "folder" && share.key.startsWith((item as Folder).path) ? { ...share, key: parsePath(newPath + "/" + share.key.substring((item as Folder).path.length)) } : share))
                setOpen(false);
            }
            else {
                toast.success("Could not update the path!")
            }
        } else {
            if (!values.fileName) return;
            const response = await renameFile((item as File).id, values.fileName);
            if (response.success) {
                setFiles((prev) => prev.map((file) => file.id == response.data.id ? { ...response.data, updatedAt: new Date(new Date().getTime() - 1 * 1000) } : file));
                setOpen(false);
            }
            else {
                toast.success("Could not update the file!")
            }
        }
        setLoading(false);
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <div className='flex flex-col gap-1'>
                    {isFolder(item) ?
                        <FormField
                            control={form.control}
                            name="folderName"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Folder name</FormLabel>
                                    <FormControl>
                                        <div className="flex items-center space-x-2.5">
                                            <FolderIcon className='stroke-primary' />
                                            <Input {...field} />
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        /> :
                        <FormField
                            control={form.control}
                            name="fileName"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>File name</FormLabel>
                                    <FormControl>
                                        <div className="flex items-center space-x-2.5">
                                            <FileIcon filename={form.watch("fileName") ?? ""} className="size-5 opacity-50" />
                                            <Input {...field} />
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    }
                    {(["fileName", "folderName", ""] as (keyof typeof form.formState.errors)[]).map((key, i) => (
                        form.formState.errors[key] && <p key={i} className="text-sm text-destructive">{form.formState.errors[key].message}</p>
                    ))}
                </div>
                <div className="flex items-center justify-end gap-2">
                    <Button type="submit">
                        {!loading ? (
                            <>
                                Rename
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
        </Form>
    )
}

export default RenameForm