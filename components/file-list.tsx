import { cn } from '@/lib/utils';
import { XIcon } from 'lucide-react';
import React from 'react'
import { Button } from './ui/button';
import { FileIcon } from '@/utils/file-types';
import { Input } from './ui/input';
import { replaceIllegalCharacters } from '@/lib/helpers';
import { ScrollArea, ScrollBar } from './ui/scroll-area';

const FileList = ({ filenames, onNameChange, onRemove }: { filenames: string[], onNameChange: (oldName: string, newName: string) => void, onRemove: (name: string) => void }) => {
    return (
        <ScrollArea className={cn('max-w-full mt-2 overflow-y-auto overflow-x-clip', filenames.length >= 6 && 'h-[200px]')}>
            <div className="max-w-full flex flex-col gap-1">
                {filenames.map((filename, index) => (
                    <div key={index} className="flex flex-1 gap-4 items-center justify-between overflow-hidden max-w-full">
                        <div className="flex items-center gap-2 overflow-hidden w-full">
                            <FileIcon filename={filename} className='size-5 shrink-0 aspect-square' />
                            <Input
                                className="bg-transparent border-none outline-none select-none focus-visible:ring-0 w-full underline underline-offset-2 decoration-[0.05rem] decoration-primary/50"
                                placeholder={filename}
                                defaultValue={filename}
                                onFocus={(event) => {
                                    event.currentTarget.setSelectionRange(0, event.currentTarget.value.lastIndexOf('.'));
                                }}
                                onKeyDown={(event) => {
                                    if (event.key === 'Enter') event.preventDefault();
                                }}
                                maxLength={255}
                                onChange={(event) => {
                                    const newName = replaceIllegalCharacters(event.target.value.trim() as string, "filename")
                                    onNameChange(filename, newName);
                                    const currentPlace = event.target.selectionStart as number;
                                    event.target.value = newName;
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
                ))}
            </div>
            <ScrollBar orientation="horizontal" />
        </ScrollArea>
    )
}

export default FileList