import { File } from '@prisma/client';
import { Folder, FolderTree } from '@/types/folder';

export const getInitials = (text: string): string => {
    if (!text) return "";

    const matches = text.match(/\b\w/g);
    if (!matches) return "";

    return matches.slice(0, 2).join("").toUpperCase();
};

export const formatBytes = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";

    const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB"];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));

    const sizeInUnit = bytes / Math.pow(1024, i);

    const formattedSize = new Intl.NumberFormat("en-US", {
        maximumFractionDigits: i >= 3 ? 2 : 0,
    }).format(sizeInUnit);

    return `${formattedSize} ${sizes[i]}`;
};

export const formatTime = (unixTimestamp: number) => {
    const currentTime = Date.now();
    const elapsedTimeInSeconds = Math.floor((currentTime - unixTimestamp) / 1000);

    if (elapsedTimeInSeconds < 60) {
        return `${elapsedTimeInSeconds} second${elapsedTimeInSeconds !== 1 ? 's' : ''} ago`;
    }
    else if (elapsedTimeInSeconds < 3600) {
        const minutes = Math.floor(elapsedTimeInSeconds / 60);
        return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
    }
    else if (elapsedTimeInSeconds < 86400) {
        const hours = Math.floor(elapsedTimeInSeconds / 3600);
        return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
    }
    else if (elapsedTimeInSeconds < 2592000) {
        const days = Math.floor(elapsedTimeInSeconds / 86400);
        return `${days} day${days !== 1 ? 's' : ''} ago`;
    }
    else if (elapsedTimeInSeconds < 31536000) {
        const months = Math.floor(elapsedTimeInSeconds / 2592000);
        return `${months} month${months !== 1 ? 's' : ''} ago`;
    }
    else {
        const years = Math.floor(elapsedTimeInSeconds / 31536000);
        return `${years} year${years !== 1 ? 's' : ''} ago`;
    }
}

export function toUnixTimestamp(date: Date = new Date(), inSeconds: boolean = true): number {
    const timestamp = date.getTime();
    return inSeconds ? Math.floor(timestamp / 1000) : timestamp;
}

export function formatRelativeTime(date: Date): string {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });

    if (diffInSeconds < 60) {
        return rtf.format(-diffInSeconds, 'second');
    }

    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
        return rtf.format(-diffInMinutes, 'minute');
    }

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
        return rtf.format(-diffInHours, 'hour');
    }

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 30) {
        return rtf.format(-diffInDays, 'day');
    }

    const diffInMonths = Math.floor(diffInDays / 30);
    if (diffInMonths < 12) {
        return rtf.format(-diffInMonths, 'month');
    }

    const diffInYears = Math.floor(diffInMonths / 12);
    return rtf.format(-diffInYears, 'year');
}

export function arrayBufferToBase64(buffer: ArrayBuffer): string {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
}

export function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export const getFilePartUrl = (channelID: string, messageID: string, encryptedFileName: string): string => `https://cdn.discordapp.com/attachments/${channelID}/${messageID}/${encryptedFileName}`

export const parsePath = (path: string): string => {
    if (!path) return "/"
    path = `/${path.replace(/^\/+|\/+$/g, '').replace(/\/+/g, '/')}`
    if (path.length > 1) {
        if (path.endsWith("/")) path = path.slice(0, -1);
        if (path.endsWith("/")) return parsePath(path);
        return path
    } else return path
}

export function getFilesInPath(path: string = "/", files: File[]): { filesInPath: File[], foldersInPath: Folder[] } {
    path = parsePath(path);
    const filesInPath: File[] = [];
    const folderMap: Map<string, Folder> = new Map();

    for (const file of files) {
        if (file.path === path) {
            filesInPath.push(file);
        } else if (file.path.startsWith(path) && file.path !== path) {
            const subPath = file.path.slice(path.length).split("/").filter(Boolean)[0];
            if (subPath) {
                const folderPath = path === "/" ? `/${subPath}` : `${path}/${subPath}`;
                if (!folderMap.has(folderPath)) {
                    folderMap.set(folderPath, {
                        path: folderPath,
                        name: subPath,
                        isFolder: true,
                        updatedAt: file.updatedAt.toString(),
                        uploadedSize: file.uploadedSize,
                    });
                } else {
                    const folder = folderMap.get(folderPath)!;
                    folder.uploadedSize += file.uploadedSize;
                    folder.updatedAt = new Date(Math.max(new Date(folder.updatedAt).getTime(), new Date(file.updatedAt).getTime())).toString();
                }
            }
        }
    }

    return { filesInPath, foldersInPath: Array.from(folderMap.values()) };
}

export function getFoldersMap(files: File[]): FolderTree[] {
    let totalID = 1;
    const foldersArray: FolderTree[] = [
        {
            id: totalID.toString(),
            path: "/",
            name: "Home",
            isSelectable: true,
            children: []
        }
    ];
    files = files.sort(file => 0 - parsePath(file.path).split("/").length)
    for (const file of files) {
        if (file.path.length > 1) {
            let pathParts = file.path.split("/").filter(Boolean);
            pathParts = ["Home", ...pathParts.slice(0, pathParts.length - 1)];
            const node = pathParts.reduce((acc: FolderTree | undefined, name: string) => acc?.children && acc.children.find((child: FolderTree) => child.name === name), { children: foldersArray } as FolderTree) as FolderTree;
            if (node) {
                if (!node.children.find((child: any) => child.name === file.path.split("/").pop())) {
                    totalID++;
                    node.children.push({
                        id: totalID.toString(),
                        path: parsePath(file.path),
                        name: file.path.split("/").pop() || '',
                        isSelectable: true,
                        children: []
                    })
                }
            }

        }
    }
    return foldersArray;
}

export function serializeBigInt(obj: any): any {
    if (typeof obj === 'bigint') {
        return obj.toString();
    } else if (obj instanceof Date) {
        return obj;
    } else if (Array.isArray(obj)) {
        return obj.map(serializeBigInt);
    } else if (obj !== null && typeof obj === 'object') {
        const res: any = {};
        for (const key in obj) {
            res[key] = serializeBigInt(obj[key]);
        }
        return res;
    }
    return obj;
}

export const getSiteLogo = (size: number = 400) => {
    return `https://avatars.githubusercontent.com/u/165603488?s=${size}&v=4`
}