import axios, { AxiosRequestConfig } from "axios"
import { File } from "@prisma/client"

export async function deleteFile(id: string, config?: AxiosRequestConfig) {
    const response = await axios.delete(`/api/file/${id}`, config);
    return response.data;
}

export async function patchFile(id: string, data: Partial<File>, config?: AxiosRequestConfig) {
    const response = await axios.patch(`/api/file/${id}`, data, config);
    return response.data;
}

export async function renameFile(id: string, name: string, config?: AxiosRequestConfig) {
    return await patchFile(id, { filename: name }, config);
}

export async function shareFile(key: string, type: "file" | "folder", data: {
    neverExpire?: boolean,
    endDate?: Date
}, config?: AxiosRequestConfig) {
    const response = await axios.post("/api/file/share", { ...data, key, type }, config);
    return response.data;
}

export async function unshareFile(key: string, type: "file" | "folder", config?: AxiosRequestConfig) {
    const response = await axios.delete(`/api/file/share/`, { ...config, data: { key, type } });
    return response.data;
}

export async function getSharedFile(key: string, config?: AxiosRequestConfig) {
    const response = await axios.get(`/api/file/get-shared-file/${key}`, config);
    return {
        ...response.data,
        data: {
            ...response.data.data,
            endDate: response.data.data.endDate ? new Date(response.data.data.endDate) : null,
            shareDate: response.data.data.shareDate ? new Date(response.data.data.shareDate) : null
        }
    };
}

export async function getUser(id: string, config?: AxiosRequestConfig) {
    const response = await axios.get(`/api/get-user/${id}`, config);
    return response.data;
}

export async function uploadFileToDatabase(file: Omit<File, "parts" | "channelID" | "id" | "uploadedAt" | "updatedAt" | "isActive" | "userId"> & { parts: string[], channelID: string }, config?: AxiosRequestConfig) {
    const response = await axios.post("/api/upload", file, {
        ...config,
        headers: {
            "Content-Type": "application/json"
        }
    });
    return response.data;
}