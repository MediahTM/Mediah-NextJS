"use client"
import React, { useEffect, useState } from 'react'
import { Skeleton } from '../ui/skeleton'

const SkeletonTable = ({ columns, pageSize }: { columns: number, pageSize: number }) => {
    const [colCount, setColCount] = useState(columns);

    useEffect(() => {
        setColCount(window.innerWidth < 1024 ? 1 : columns);
    }, [columns]);

    return (
        <div className="h-full border divide-y flex flex-col">
            <div style={{ gridTemplateColumns: `repeat(${colCount}, minmax(0, 1fr))` }} className="grid bg-border/15 grid-cols-5 gap-4 p-4 h-[48px]">
                {Array.from({ length: colCount }).map((_, index) => (
                    <div key={index} className="flex items-center gap-2 justify-between">
                        <Skeleton className="h-[19px] w-4/6" />
                        <div className="h-[14px] w-[2px] bg-border" />
                    </div>
                ))}
            </div>
            <div className="flex flex-col flex-[1_1_0] overflow-hidden">
                <div className="flex-1 flex flex-col overflow-y-auto">
                    {Array.from({ length: Number(pageSize) }).map((_, rowIndex) => (
                        <div
                            key={rowIndex}
                            style={{ gridTemplateColumns: `repeat(${colCount}, minmax(0, 1fr))` }}
                            className="grid bg-border/15 gap-4 px-4 shrink-0 border-b h-[41px]"
                        >
                            {Array.from({ length: colCount }).map((_, colIndex) => (
                                <div key={colIndex} className="flex items-center gap-2 justify-between">
                                    <Skeleton className="h-[19px] w-full" />
                                </div>
                            ))}
                        </div>
                    ))}
                </div>
            </div>
            <div className="h-[41px] px-1 border-t flex items-center justify-end">
                <Skeleton className="md:w-[38%] w-full h-[32px]" />
            </div>
        </div>
    )
}

export default SkeletonTable