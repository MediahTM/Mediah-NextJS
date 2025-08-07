import { File } from "@prisma/client";
import { Folder } from "./folder";


export type Dropdown = {
    items: (File | Folder)[],
    position: { x: number, y: number },
    open: boolean
    exportDialogOpen: boolean,
    deleteDialogOpen: boolean,
    renameDialogOpen: boolean
}