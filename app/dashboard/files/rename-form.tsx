"use client";

import { Input } from "@/components/ui/input"
import { File } from '@prisma/client'
import React, { useState } from 'react'
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { FileIcon, Loader2Icon } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "@/hooks/use-toast";

const RenameForm = ({ file, setOpen, setReload, reload }: { file: File, setOpen: (open: boolean) => void, setReload: (open: boolean) => void, reload: boolean }) => {
    const formSchema = z.object({
        fileName: z
            .string()
            .min(1, "File name is required!")
            .max(255, "File name is too long!")
            .refine((name) => !name.includes("/"), "File name cannot contain '/'")
    })

    const [loading, setLoading] = useState<boolean>(false);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            fileName: file.filename,
        },
    })

    const onSubmit = (values: z.infer<typeof formSchema>) => {
        if (file.filename == values.fileName) {
            setOpen(false);

            return;
        }

        setLoading(true);

        fetch(`/api/file`, {
            method: "PUT",
            body: JSON.stringify({
                ...file,
                filename: values.fileName
            })
        })
            .then((response) => response.json())
            .then((response) => {
                if (response.success) {
                    setReload(!reload)
                    setOpen(false);
                }
                else {
                    toast({
                        title: "Update Error",
                        description: response.message || "Could not update the file!"
                    })
                }
                setLoading(false);
            })
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
                                    <FileIcon className="size-5 opacity-50" />
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