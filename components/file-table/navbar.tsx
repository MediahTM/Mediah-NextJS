"use client"
import React, { useEffect, useState } from 'react'
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbSeparator } from '../ui/breadcrumb'
import { useFileTable } from './table-context';

const FileTableNavbar = () => {
    // Location state is created and updated from grid API rather than directly reading from tableInfo to prevent the navbar from updating before the table
    const { tableInfo, setTableInfo } = useFileTable();

    const [locationState, setLocationState] = useState(tableInfo.viewingLocation);

    useEffect(() => {
        if (tableInfo.gridRef?.current && tableInfo.gridReady) tableInfo.gridRef.current.api.setGridOption("onModelUpdated", () => {
            setLocationState(tableInfo.viewingLocation);
        })
    }, [tableInfo.gridReady, tableInfo.gridRef, tableInfo.viewingLocation])

    return (
        <Breadcrumb className='pt-2 pb-3'>
            <BreadcrumbList>
                <BreadcrumbItem onClick={() => setTableInfo(pre => ({ ...pre, viewingLocation: "/" }))} className='hover:cursor-pointer hover:text-primary transition-all'>
                    Home
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
    )
}

export default FileTableNavbar