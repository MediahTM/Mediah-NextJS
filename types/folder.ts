import { TreeViewElement } from '@/components/magicui/file-tree';

export type Folder = {
    path: string,
    name: string,
    isFolder: true,
    updatedAt: string,
    uploadedSize: number
};

export type FolderTree = TreeViewElement & {
    path: string,
    children: FolderTree[]
}