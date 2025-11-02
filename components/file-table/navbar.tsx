"use client"
import React, { useEffect, useState } from 'react'
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbSeparator } from '../ui/breadcrumb'
import { useFileTable } from './table-context';
import { ScrollArea, ScrollBar } from '../ui/scroll-area';

const FileTableNavbar = ({ homeName = "Home" }: { homeName?: string }) => {
    // Location state is created and updated from grid API rather than directly reading from tableInfo to prevent the navbar from updating before the table
    const { tableInfo, setTableInfo } = useFileTable();

    const [locationState, setLocationState] = useState(tableInfo.viewingLocation);

    useEffect(() => {
        if (tableInfo.gridRef?.current && tableInfo.gridReady) tableInfo.gridRef.current.api.setGridOption("onModelUpdated", () => {
            setLocationState(tableInfo.viewingLocation);
        })
    }, [tableInfo.gridReady, tableInfo.gridRef, tableInfo.viewingLocation])

    return (
        <div className='max-h-full'>
            <ScrollArea className='flex md:pb-3 pb-2 mb-1'>
                <Breadcrumb>
                    <BreadcrumbList className='flex-nowrap'>
                        <BreadcrumbItem onClick={() => setTableInfo(pre => ({ ...pre, viewingLocation: "/" }))} className='hover:cursor-pointer hover:text-primary transition-all'>
                            {homeName}
                        </BreadcrumbItem>
                        {locationState !== "/" && locationState.split("/").slice(1).map((location, index) => (
                            <React.Fragment key={index}>
                                <BreadcrumbSeparator />
                                <BreadcrumbItem key={index} onClick={() => setTableInfo(prev => ({ ...prev, viewingLocation: prev.viewingLocation.split("/").slice(0, index + 2).join("/") }))} className='hover:cursor-pointer hover:text-primary transition-all'>
                                    {location}
                                </BreadcrumbItem>
                            </React.Fragment>
                        ))}
                    </BreadcrumbList>
                </Breadcrumb>
                <ScrollBar orientation='horizontal' />
            </ScrollArea>
        </div>
    )
}

export default FileTableNavbar