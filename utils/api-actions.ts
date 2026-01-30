import axios, { AxiosRequestConfig } from "axios"
import { File } from "@prisma/client"

export async function deleteFile(id: string, config?: AxiosRequestConfig) {
    const response = await axios.delete(`${process.env.NEXT_PUBLIC_BASE_URL}/api/file/${id}`, config);
    return response.data;
}

export async function deleteFiles(ids: string[], config?: AxiosRequestConfig) {
    if (ids.length === 1) return await deleteFile(ids[0], config);
    const response = await axios.delete(`${process.env.NEXT_PUBLIC_BASE_URL}/api/file/many`, { ...config, data: { ids } });
    return response.data;
}

export async function patchFile(id: string, data: Partial<File>, config?: AxiosRequestConfig) {
    const response = await axios.patch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/file/${id}`, data, config);
    return response.data;
}

export async function patchFiles(ids: string[], data: Partial<File>, config?: AxiosRequestConfig) {
    if (ids.length === 1) return await patchFile(ids[0], data, config);
    const response = await axios.patch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/file/many`, {
        ids,
        ...data
    }, config);
    return response.data;
}

export async function renameFile(id: string, name: string, config?: AxiosRequestConfig) {
    return await patchFile(id, { filename: name }, config);
}

export async function shareItem(key: string, type: "file" | "folder", data: {
    neverExpire?: boolean,
    endDate?: Date
}, config?: AxiosRequestConfig) {
    const response = await axios.post(`${process.env.NEXT_PUBLIC_BASE_URL}/api/file/share`, { ...data, key, type }, config);
    return response.data;
}

export async function unshareItem(key: string, type: "file" | "folder", config?: AxiosRequestConfig) {
    const response = await axios.delete(`${process.env.NEXT_PUBLIC_BASE_URL}/api/file/share/`, { ...config, data: { key, type } });
    return response.data;
}

export async function getSharedItem(key: string, config?: AxiosRequestConfig) {
    const response = await axios.get(`${process.env.NEXT_PUBLIC_BASE_URL}/api/file/get-shared-item/${key}`, config);
    return response.data.success ? {
        ...response.data,
        data: Array.isArray(response.data.data) ? response.data.data : {
            ...response.data.data,
            endDate: response.data.data.endDate ? new Date(response.data.data.endDate) : null,
            shareDate: response.data.data.shareDate ? new Date(response.data.data.shareDate) : null
        }
    } : null;
}

export async function getUser(id: string, config?: AxiosRequestConfig) {
    const response = await axios.get(`${process.env.NEXT_PUBLIC_BASE_URL}/api/get-user/${id}`, config);
    return response.data;
}

export async function uploadFileToDatabase(file: Omit<File, "parts" | "channelID" | "id" | "uploadedAt" | "updatedAt" | "isActive" | "userId" | "expiresAt"> & { parts: string[], channelID: string }, config?: AxiosRequestConfig) {
    const response = await axios.post(`${process.env.NEXT_PUBLIC_BASE_URL}/api/upload`, file, {
        ...config,
        headers: {
            "Content-Type": "application/json"
        }
    });
    return response.data;
}

export async function editPath(oldPath: string, newPath: string, config?: AxiosRequestConfig) {
    const response = await axios.post(`${process.env.NEXT_PUBLIC_BASE_URL}/api/edit-path`, { old: oldPath, new: newPath }, config);
    return response.data;
}