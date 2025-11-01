import React, { useEffect, useState } from 'react'
import { FolderIcon } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { FolderTree, NewFolderType } from '@/types/folder';
import { containsIllegalCharacters, parsePath } from '@/lib/helpers';

const NewFolder = ({ elements, setElements, path, setSelectedPathId, setSelectedPath, children }: { elements: (FolderTree | NewFolderType)[], setElements: React.Dispatch<React.SetStateAction<(FolderTree | NewFolderType)[]>>, path: string, setSelectedPathId: React.Dispatch<React.SetStateAction<number | null>>, setSelectedPath: React.Dispatch<React.SetStateAction<string>>, children: React.ReactNode }) => {
    const [open, setOpen] = useState(false);

    const formSchema = z.object({
        folderName: z
            .string()
            .trim()
            .min(1, "Folder name is required!")
            .max(255, "Folder name is too long!")
            .refine((name) => !containsIllegalCharacters(name, "filename"), "Folder name cannot contain illegal characters")
            .refine((name) => !elements.find(folder => folder.name === name && (("isNewFolder" in folder && folder.isNewFolder) ? folder.path : parsePath(folder.path + "/" + folder.name)) === path), "Folder already exists"),
    })

    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            folderName: "",
        },
    })

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        const highestId = (folders: FolderTree[]): number => folders.reduce((max, folder) => Math.max(max, Number(folder.id), ...folder.children.map(child => highestId([child as FolderTree]))), -Infinity);
        const id = (highestId(elements) + 1);
        setElements(elements => [...elements, { path: path, id: id.toString(), name: values.folderName, children: [], isNewFolder: true }]);
        setSelectedPathId(id);
        setSelectedPath(parsePath(path + "/" + values.folderName));
        setOpen(false);
    }

    useEffect(() => {
        form.reset();
    }, [open])

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent className='sm:max-w-[425px] overflow-hidden'>
                <DialogHeader>
                    <DialogTitle>Enter folder name</DialogTitle>
                    <DialogDescription>Enter the name of your new folder</DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={(e) => {
                        e.stopPropagation();
                        form.handleSubmit(onSubmit)(e);
                    }} className="space-y-8">
                        <FormField
                            control={form.control}
                            name="folderName"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Folder name</FormLabel>
                                    <FormControl>
                                        <div className="flex items-center space-x-2.5">
                                            <FolderIcon className="size-5 opacity-50" />
                                            <Input {...field} />
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <div className="flex items-center justify-end gap-2">
                            <Button type="submit" disabled={!form.formState.isValid}>
                                Create
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
            </DialogContent>
        </Dialog>
    )
}

export default NewFolder