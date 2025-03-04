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