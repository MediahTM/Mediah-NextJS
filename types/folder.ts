import { TreeViewElement } from '@/components/magicui/file-tree';

export type Folder = {
    path: string,
    name: string,
    isFolder: true,
    updatedAt: string,
    uploadedSize: number
};

export type FolderTree = Omit<TreeViewElement, "children"> & {
    path: string,
    children: FolderTree[]
};

export type NewFolderType = TreeViewElement & {
    children: []
    id: string
    path: string
    name: string
    isNewFolder: true
};