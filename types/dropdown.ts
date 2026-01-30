import { File } from "@prisma/client";
import { Folder } from "./folder";


export type Dropdown = {
    items: (File | Folder)[],
    position: { x: number, y: number },
    open: boolean,
    dialogs: { [key in "export" | "delete" | "rename" | "info" | "move"]: boolean }
}

export const defaultDropdown: Dropdown = {
    items: [],
    position: { x: 0, y: 0 },
    open: false,
    dialogs: { export: false, delete: false, rename: false, info: false, move: false },
}