import { File } from "@prisma/client";


export type Dropdown = {
    files: File[],
    position: { x: number, y: number },
    open: boolean
    exportDialogOpen: boolean,
    deleteDialogOpen: boolean,
    renameDialogOpen: boolean
}