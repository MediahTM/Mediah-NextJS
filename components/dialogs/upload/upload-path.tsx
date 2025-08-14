import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Folder, Tree } from '@/components/magicui/file-tree';
import { FolderTree, NewFolderType } from '@/types/folder';
import { formatBytes, getFilesInPath, getFoldersMap, parsePath } from '@/lib/helpers';
import { useFiles } from '@/utils/files-context';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { getFileIcon } from '@/utils/file-types';
import { Input } from '@/components/ui/input';
import NewFolder from '../new-folder';

const UploadPathDialog = ({ setPath }: { setPath: (path: string) => void }) => {
    const { files, loading } = useFiles();
    const [open, setOpen] = useState<boolean>(false);
    const [selectedPathId, setSelectedPathId] = useState<number | null>(1);
    const [selectedPath, setSelectedPath] = useState<string>("/");
    const [elements, setElements] = useState<(FolderTree | NewFolderType)[]>([]);

    useEffect(() => {
        if (open) {
            setSelectedPathId(1);
            setSelectedPath("/");
        }
    }, [open])

    useEffect(() => {
        if (!loading) {
            const foldersMap = getFoldersMap(files);
            setElements(foldersMap);
        }
    }, [files, loading])

    const RenderTreeChildren = (children: (FolderTree | NewFolderType)[]) => {
        return (
            <>
                {children.filter(newChild => ("isNewFolder" in newChild ? !newChild.isNewFolder : true)).map((child) => {
                    const containsNewFolder = elements.filter(newChild => ("isNewFolder" in newChild ? newChild.isNewFolder : false) && newChild.path === child.path).length > 0 ? true : false;
                    return (
                        <Folder
                            key={child.id}
                            element={child.name}
                            value={child.id}
                            isSelect={selectedPathId === Number(child.id)}
                            isCollapsable={(child.path !== "/" && child.children.length !== 0) || containsNewFolder}
                            initallyExpanded={containsNewFolder}
                            className='w-fit text-nowrap'
                            onClick={(event) => {
                                event.stopPropagation();
                                event.preventDefault();
                                setSelectedPathId(Number(child.id));
                                setSelectedPath(child.path);
                            }}
                        >
                            {child.children.length > 0 && RenderTreeChildren(child.children)}
                            {elements.filter(newChild => ("isNewFolder" in newChild ? newChild.isNewFolder : false) && newChild.path === child.path).map((child) => {
                                return (
                                    <Folder
                                        key={child.id}
                                        element={child.name}
                                        value={child.id}
                                        isSelect={selectedPathId === Number(child.id)}
                                        isCollapsable={child.path !== "/" && child.children.length !== 0}
                                        className='w-fit text-nowrap'
                                        onClick={(event) => {
                                            event.stopPropagation();
                                            event.preventDefault();
                                            setSelectedPathId(Number(child.id));
                                            setSelectedPath(parsePath(child.path + "/" + child.name));
                                        }}
                                    />
                                )
                            })}
                        </Folder>
                    )
                })}
            </>
        )
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button
                    variant='outline'
                    className='shrink-0 px-6'
                >
                    Browse
                </Button>
            </DialogTrigger>
            <DialogContent className='max-w-[900px] w-5/6 sm:w-[70vw] 2xl:w-[45vw] overflow-hidden'>
                <DialogHeader>
                    <DialogTitle>Select a path</DialogTitle>
                    <DialogDescription>Choose the place to upload your files</DialogDescription>
                </DialogHeader>
                <NewFolder elements={elements} setElements={setElements} path={selectedPath} setSelectedPathId={setSelectedPathId} setSelectedPath={setSelectedPath}/>
                <div className='grid xl:grid-cols-12 grid-rows-1 w-full gap-2 min-h-[40vh] max-h-[40vh] overflow-hidden'>
                    <div className="w-full flex flex-col col-span-5 overflow-hidden">
                        <ScrollArea className='w-full max-w-full overflow-auto h-full'>
                            <Tree
                                className="rounded-md bg-background p-2 w-full min-h-full"
                                initialExpandedItems={["1"]}
                                initialSelectedId="1"
                                elements={elements}
                            >
                                {RenderTreeChildren(elements)}
                            </Tree>
                            <ScrollBar orientation="horizontal" />
                        </ScrollArea>
                        <div className="flex flex-1 w-full justify-center items-center xl:hidden gap-4">
                            <div className='w-full sm:flex flex-1 items-center justify-center gap-2 whitespace-nowrap hidden'>
                                <p className='font-medium'>Selected Path:</p>
                                <Input readOnly value={selectedPath} />
                            </div>
                            <div className="flex items-center gap-4">
                                <Button
                                    variant='outline'
                                    className='shrink-0'
                                    onClick={() => setOpen(false)}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    variant='default'
                                    className='shrink-0'
                                    onClick={() => {
                                        setPath(selectedPath);
                                        setOpen(false)
                                    }}
                                    disabled={selectedPathId === null}
                                >
                                    Select Path
                                </Button>
                            </div>
                        </div>
                    </div>
                    <div className="w-full col-span-7 max-h-full overflow-hidden gap-3 xl:flex hidden">
                        <Separator orientation='vertical' />
                        <div className='flex flex-col w-full justify-between max-h-full overflow-hidden'>
                            <ScrollArea className="h-full overflow-x-hidden max-w-full">
                                <Table className="w-full table-fixed">
                                    <TableHeader className="bg-background w-full">
                                        <TableRow className="w-full">
                                            <TableHead className="w-3/4 truncate">Filename</TableHead>
                                            <TableHead className="w-1/4 truncate">Size</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {getFilesInPath(selectedPath, files).filesInPath.map((file, index) => (
                                            <TableRow key={index} className="w-full">
                                                <TableCell className="w-full flex items-center gap-2 min-w-0">
                                                    {getFileIcon(file.filename, { className: "size-5 shrink-0", stroke: "gray" })}
                                                    <div className="truncate w-full">{file.filename}</div>
                                                </TableCell>
                                                <TableCell className="w-1/4 truncate">{formatBytes(file.uploadedSize)}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </ScrollArea>
                            <div className='w-full flex pt-2 items-center justify-center gap-2 whitespace-nowrap'>
                                <p className='font-medium text-sm'>Selected Path:</p>
                                <Input readOnly value={selectedPath} />
                            </div>
                            <div className="flex items-center justify-end gap-4 mt-6">
                                <Button
                                    variant='outline'
                                    className='shrink-0'
                                    onClick={() => setOpen(false)}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    variant='default'
                                    className='shrink-0'
                                    onClick={() => {
                                        setPath(selectedPath);
                                        setOpen(false)
                                    }}
                                    disabled={selectedPathId === null}
                                >
                                    Select Path
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}

export default UploadPathDialog