"use client";

import * as z from 'zod';
import axios from 'axios';
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { File } from '@prisma/client';
import { FileIcon, Loader2Icon } from 'lucide-react';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { renameFile } from '@/utils/api-actions';
import { getFileIcon } from '@/utils/file-types';

const RenameForm = ({ file, setOpen, setFiles }: { file: File, setOpen: (open: boolean) => void, setFiles: React.Dispatch<React.SetStateAction<File[]>> }) => {
    const formSchema = z.object({
        fileName: z
            .string()
            .min(1, "File name is required!")
            .max(255, "File name is too long!")
            .refine((name) => !name.includes("/") && !name.includes("\\"), "File name cannot contain '/' or '\\'"),
    })

    const [loading, setLoading] = useState<boolean>(false);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            fileName: file.filename,
        },
    })

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        if (file.filename == values.fileName) {
            setOpen(false);

            return;
        }

        setLoading(true);

        const response = await renameFile(file.id, values.fileName);
        if (response.success) {
            setFiles((prev) => prev.map((file) => file.id == response.data.id ? { ...response.data, updatedAt: new Date(new Date().getTime() - 1 * 1000) } : file));
            setOpen(false);
        }
        else {
            toast.success("Could not update the file!")
        }
        setLoading(false);
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <FormField
                    control={form.control}
                    name="fileName"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>File name</FormLabel>
                            <FormControl>
                                <div className="flex items-center space-x-2.5">
                                    {getFileIcon(form.watch("fileName"), { className: "size-5 opacity-50" })}
                                    <Input {...field} />
                                </div>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
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