import { cn } from '@/lib/utils';
import { XIcon } from 'lucide-react';
import React, { useEffect, useState } from 'react'
import { Button } from './ui/button';
import { FileIcon } from '@/utils/file-types';
import { Input } from './ui/input';
import { replaceIllegalCharacters } from '@/lib/helpers';
import { ScrollArea, ScrollBar } from './ui/scroll-area';

const FileList = ({ filenames, onNameChange, onRemove, errorFileIndexes, setErrorFileIndexes }: { filenames: string[], onNameChange: (oldName: string, newName: string) => void, onRemove: (name: string) => void, errorFileIndexes?: number[], setErrorFileIndexes?: React.Dispatch<React.SetStateAction<number[]>> }) => {
    const [editedNames, setEditedNames] = useState<string[]>(filenames);
    useEffect(() => {
        setEditedNames(filenames);
    }, [filenames]);
    return (
        <ScrollArea className={cn('max-w-full mt-2 overflow-y-auto overflow-x-clip', filenames.length >= 6 && 'h-[200px]')}>
            <div className="max-w-full flex flex-col gap-1">
                {filenames.map((filename, index) => {
                    return (
                        <div key={index} className="flex flex-1 gap-4 items-center justify-between overflow-hidden max-w-full">
                            <div className="flex items-center gap-2 overflow-hidden w-full">
                                <FileIcon filename={filename} className='size-5 shrink-0 aspect-square' />
                                <Input
                                    className={cn("bg-transparent border-none outline-none select-none focus-visible:ring-0 w-full underline underline-offset-2 decoration-[0.05rem] decoration-primary/50", errorFileIndexes?.includes(index) && 'text-destructive')}
                                    value={editedNames[index] ?? filename}
                                    placeholder={filename}
                                    onFocus={(event) => {
                                        event.currentTarget.setSelectionRange(0, event.currentTarget.value.lastIndexOf('.'));
                                    }}
                                    onKeyDown={(event) => {
                                        if (event.key === 'Enter') event.preventDefault();
                                    }}
                                    maxLength={255}
                                    onChange={(event) => {
                                        setErrorFileIndexes && setErrorFileIndexes(prev => prev.filter(i => i !== index));
                                        const newName = replaceIllegalCharacters(event.target.value.trim() as string, "filename")
                                        setEditedNames(prev => [...prev.slice(0, index), newName, ...prev.slice(index + 1)]);
                                        onNameChange(filename, newName);
                                        const currentPlace = event.target.selectionStart as number;
                                        event.target.setSelectionRange(currentPlace, currentPlace);
                                    }}
                                />
                            </div>
                            <Button
                                type='button'
                                onClick={() => onRemove(filename)}
                                variant='outline'
                                size='icon'
                                className='ml-auto size-8 aspect-square shrink-0 min-w-8'
                            >
                                <XIcon />
                            </Button>
                        </div>
                    )
                })}
            </div>
            <ScrollBar orientation="horizontal" />
        </ScrollArea>
    )
}

export default FileList