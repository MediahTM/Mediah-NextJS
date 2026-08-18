import { cn } from '@/lib/utils';
import { useEffect, useRef, useState } from 'react'
import { CloudUploadIcon } from 'lucide-react';
import UploadDialog from './dialogs/upload/upload-dialog';

const FileDragDrop = () => {
    const [showUI, setShowUI] = useState(false);
    const [glowingBox, setGlowingBox] = useState(false);
    const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
    const [customFiles, setCustomFiles] = useState<File[]>([]);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        let dragCounter = 0;
        const isFileDrag = (event: DragEvent) => event.dataTransfer?.types.includes("Files");
        const dragOverEvent = (event: DragEvent) => {
            isFileDrag(event) && event.preventDefault();
        };
        const dragEnterEvent = (event: DragEvent) => {
            if (!isFileDrag(event)) return;
            event.preventDefault();
            dragCounter++;
            if (dragCounter === 1) setShowUI(true);
        }
        const dragLeaveEvent = (event: DragEvent) => {
            if (!isFileDrag(event)) return;
            event.preventDefault();
            dragCounter--;
            if (dragCounter === 0) setShowUI(false);
        }
        const dropEvent = (event: DragEvent) => {
            if (!isFileDrag(event)) return;
            event.preventDefault();
            setShowUI(false);
            dragCounter = 0;
            const files = event.dataTransfer!.files;
            setCustomFiles(Array.from(files));
            setUploadDialogOpen(true);
        }

        document.addEventListener("dragover", dragOverEvent);
        document.addEventListener("dragenter", dragEnterEvent);
        document.addEventListener("dragleave", dragLeaveEvent);
        document.addEventListener("drop", dropEvent);

        let boxDragCounter = 0;
        if (containerRef.current) {
            containerRef.current.addEventListener("dragover", (event) => event.preventDefault());
            containerRef.current.addEventListener("dragenter", (event) => {
                event.preventDefault();
                boxDragCounter++;
                if (boxDragCounter === 1) setGlowingBox(true);
            });
            containerRef.current.addEventListener("dragleave", (event) => {
                event.preventDefault();
                boxDragCounter--;
                if (boxDragCounter === 0) setGlowingBox(false);
            });
            containerRef.current.addEventListener("drop", (event) => {
                event.preventDefault();
                setGlowingBox(false);
                boxDragCounter = 0;
            });
        }

        return () => {
            document.removeEventListener("dragover", dragOverEvent);
            document.removeEventListener("dragenter", dragEnterEvent);
            document.removeEventListener("dragleave", dragLeaveEvent);
            document.removeEventListener("drop", dropEvent);
        }
    }, [])

    return (
        <div className='fixed h-screen w-screen z-[100] pointer-events-none'>
            <div className={cn("h-full w-full flex items-center justify-center bg-black/50 opacity-0 transition-all duration-300 p-2", showUI && "opacity-100")}>
                <div className={cn("bg-background p-2 max-w-full", showUI && "pointer-events-auto")} ref={containerRef}>
                    <div className={cn("border-dashed border-2 py-2 px-4 flex flex-col items-center gap-2 p-20", glowingBox && "border-primary")}>
                        <CloudUploadIcon className='size-10 stroke-muted-foreground animate-pulse' />
                        <div className="flex flex-col items-center text-center">
                            <h1 className='font-semibold'>Drag & drop here to upload your files</h1>
                            <p className='text-muted-foreground text-sm'>All file types accepted</p>
                        </div>
                    </div>
                </div>
            </div>
            <UploadDialog open={uploadDialogOpen} setOpen={setUploadDialogOpen} customFiles={customFiles} />
        </div>
    )
}

export default FileDragDrop