"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { File } from '@prisma/client'
import { SubmitEvent, useState } from 'react'
import { Button } from "@/components/ui/button";
import saveAs from "file-saver";

const ExportView = ({ file, setOpen }: { file: File, setOpen: (open: boolean) => void }) => {
    const [fileName, setFileName] = useState(file.filename)
    const [fileFormat, setFileFormat] = useState("json")

    const handleSubmit = (event: SubmitEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (fileFormat === "json") {
            const fieldsToDelete: (keyof File)[] = ["id", "userId", "expiresAt", "isActive", "path"]
            let newFile = file;
            for (const field of fieldsToDelete) {
                delete newFile[field];
            }
            const jsonData = JSON.stringify(newFile, null, 4);
            exportFile(jsonData, `${fileName}.json`, "application/json");
        }
        else if (fileFormat === "csv") {
            const csvData = objectCSV(file);
            exportFile(csvData, `${fileName}.csv`, "text/csv");
        }

        setOpen(false);
    }

    const objectCSV = (data: File): string => {
        const headers = [
            "filename",
            "uploadedSize",
            "uploadedAt",
            "updatedAt",
            "encryptedFilename",
            "channelID",
            "chunkSize",
            "parts"
        ];

        const row = [
            data.filename,
            data.uploadedSize,
            data.uploadedAt,
            data.updatedAt,
            data.encryptedFilename,
            data.channelID,
            data.chunkSize,
            data.parts.join(";")
        ];

        return `${headers.join(",")}\n${row.map(value => `"${value}"`).join(",")}`;
    }

    const exportFile = (data: string, filename: string, type: string) => {
        const blob = new Blob([data], { type });
        saveAs(blob, filename);
    };

    return (
        <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="fileName" className="text-right">
                        File name
                    </Label>
                    <Input
                        id="fileName"
                        value={fileName}
                        onChange={(event) => setFileName(event.target.value)}
                        className="col-span-3"
                    />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="fileFormat" className="text-right">
                        Format
                    </Label>
                    <Select
                        value={fileFormat}
                        onValueChange={setFileFormat}
                    >
                        <SelectTrigger className="col-span-3">
                            <SelectValue placeholder="Select format" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="json">JSON</SelectItem>
                            <SelectItem value="csv">CSV</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>
            <div className="flex items-center mt-2 justify-end gap-2">
                <Button type="submit">
                    Export
                </Button>
                <Button
                    variant="secondary"
                    onClick={(event) => {
                        event.preventDefault();
                        setOpen(false);
                    }}
                >
                    Cancel
                </Button>
            </div>
        </form>
    )
}

export default ExportView