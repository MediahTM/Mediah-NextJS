"use client";

import React from "react";
import { FileAudio, FileVideo, FileBox, FileImage, FileChartLine, Database, FileTerminal, Gamepad, FileCode, FileType, FileArchive, File } from "lucide-react";

export const fileTypes = {
    audio: ["mp3", "ogg", "wav", "m4a", "wma", "mid", "flac", "alac", "aiff", "pcm"],
    video: ["mp4", "mkv", "avi", "wmv", "flv", "mov", "3gp", "webm", "asf", "m4v", "mpg", "srt", "swf", "vob", "ts"],
    "3d": ["3dm", "3ds", "blend", "dae", "fbx", "max", "obj", "stl", "x3d", "ply"],
    image: ["bmp", "dcm", "dds", "djvu", "gif", "heic", "jpg", "jpeg", "png", "psd", "tga", "tif", "ai", "ccdr", "emf", "eps", "ps", "sketch", "svg", "vsdx", "webp", "ico"],
    spreadhseet: ["numbers", "ods", "xlr", "xls", "xlsx"],
    database: ["accdb", "crypt14", "db", "mdb", "odb", "pdb", "sql", "sqllite", "sqllitedb", "sqllite3", "sdf"],
    executatble: ['exe', 'ps1', 'bat', 'cmd', 'sh', 'bash', 'git', 'msi', 'apk', 'bin', 'com', 'gadget', 'jar', 'wsf', 'vbs', 'py', 'rb', 'pl', 'dll', 'sys', 'scr', 'cpl', 'msp', 'osx', 'run', 'ksh', 'zsh', 'csh', 'deb', 'rpm', 'dmg', 'app', 'iso', 'xpi', 'lua', 'ps1xml', 'psd1', 'psm1'],
    game: ["rom", "gam", "pak", "sav", "nes"],
    code: ["html", "xhtml", "js", "php", "csharp", "c", "blazor", "jsx", "tsx", "cpp", "json", "py", "pyw", "asp", "aspx", "jsp", "css", "rs", "htm", "crx"],
    text: ["txt", "md", "wpd", "doc", "docx", "pdf", "eml", "pages", "odt", "tex", "pptx", "pptm"],
    archive: ['zip', 'rar', '7z', 'tar', 'gz', 'bz2', 'xz', 'lz', 'cab', 'tgz', 'tbz2']
}

export const fileIcons: { [key: string]: (props: React.SVGProps<SVGSVGElement>) => JSX.Element } = {
    audio: (props) => <FileAudio {...props} />,
    video: (props) => <FileVideo {...props} />,
    "3d": (props) => <FileBox {...props} />,
    image: (props) => <FileImage {...props} />,
    spreadhseet: (props) => <FileChartLine {...props} />,
    database: (props) => <Database {...props} />,
    executatble: (props) => <FileTerminal {...props} />,
    game: (props) => <Gamepad {...props} />,
    code: (props) => <FileCode {...props} />,
    text: (props) => <FileType {...props} />,
    archive: (props) => <FileArchive {...props} />,
    fallback: (props) => <File {...props} />
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

export const getFileIcon = (filename: string, iconProps: React.SVGProps<SVGSVGElement> = {}) => {
    const extension = getFileExtension(filename).toLowerCase().trim();
    const type = getFileType(extension.toLowerCase());
    if (type && Object.keys(fileIcons).includes(type)) {
        return fileIcons[type](iconProps);
    }
    return fileIcons["fallback"](iconProps);
}

export const getFileExtension = (filename: string) => {
    return filename.replace(filename.substring(0, filename.lastIndexOf(".") + 1), "");
}