"use client";

import React from "react";
import { FileAudio, FileVideo, FileBox, FileImage, FileChartLine, Database, FileTerminal, Gamepad, FileCode, FileType, FileArchive, File, LucideIcon } from "lucide-react";

export const fileTypes = {
    audio: ["mp3", "ogg", "wav", "m4a", "wma", "mid", "flac", "alac", "aiff", "pcm", "aac", "opus"],
    video: ["mp4", "mkv", "avi", "wmv", "flv", "mov", "3gp", "webm", "asf", "m4v", "mpg", "srt", "swf", "vob", "ts"],
    "3D": ["3dm", "3ds", "blend", "dae", "fbx", "max", "obj", "stl", "x3d", "ply"],
    image: ["bmp", "dcm", "dds", "djvu", "gif", "heic", "jpg", "jpeg", "png", "psd", "tga", "tif", "ai", "ccdr", "emf", "eps", "ps", "sketch", "svg", "vsdx", "webp", "ico"],
    spreadhseet: ["numbers", "ods", "xlr", "xls", "xlsx"],
    database: ["accdb", "crypt14", "db", "mdb", "odb", "pdb", "sql", "sqllite", "sqllitedb", "sqllite3", "sdf"],
    executatble: ['exe', 'ps1', 'bat', 'cmd', 'sh', 'bash', 'git', 'msi', 'apk', 'bin', 'com', 'gadget', 'jar', 'wsf', 'vbs', 'py', 'rb', 'pl', 'dll', 'sys', 'scr', 'cpl', 'msp', 'osx', 'run', 'ksh', 'zsh', 'csh', 'deb', 'rpm', 'dmg', 'app', 'iso', 'xpi', 'lua', 'ps1xml', 'psd1', 'psm1'],
    game: ["rom", "gam", "pak", "sav", "nes", "3dsx", "cia", "fei"],
    code: ["html", "xhtml", "js", "php", "csharp", "c", "blazor", "jsx", "tsx", "cpp", "json", "py", "pyw", "asp", "aspx", "jsp", "css", "rs", "htm", "crx"],
    text: ["txt", "md", "wpd", "doc", "docx", "pdf", "eml", "pages", "odt", "tex", "pptx", "pptm"],
    archive: ['zip', 'rar', '7z', 'tar', 'gz', 'bz2', 'xz', 'lz', 'cab', 'tgz', 'tbz2']
}

export const fileIcons: { [key: string]: LucideIcon } = {
    audio: FileAudio,
    video: FileVideo,
    "3D": FileBox,
    image: FileImage,
    spreadhseet: FileChartLine,
    database: Database,
    executatble: FileTerminal,
    game: Gamepad,
    code: FileCode,
    text: FileType,
    archive: FileArchive,
    fallback: File
}

export const getFileType = (filename: string) => {
    const extension = getFileExtension(filename).toLowerCase().trim();
    for (const [type, extensions] of Object.entries(fileTypes)) {
        if (extensions.includes(extension.toLowerCase().trim())) {
            return type;
        }
    }
    return null;
}

export const FileIcon = React.forwardRef((props: React.SVGProps<SVGSVGElement> & { filename: string }, ref: React.Ref<SVGSVGElement>) => {
    const type = getFileType(props.filename);
    if (type && Object.keys(fileIcons).includes(type)) {
        const Icon = fileIcons[type];
        return <Icon {...props} ref={ref} />
    }
    const Icon = fileIcons["fallback"];
    return <Icon {...props} ref={ref} />
})

export const getFileExtension = (filename: string): string => {
    const lastDot = filename.lastIndexOf(".");
    if (lastDot === -1 || lastDot === 0) return "";
    return filename.slice(lastDot + 1);
};

export const getFileName = (filename: string): string => {
    const lastDot = filename.lastIndexOf(".");
    if (lastDot === -1 || lastDot === 0) return filename;
    return filename.slice(0, lastDot);
};