import type { Metadata } from 'next/types'
import React from 'react'
import FilesView from './view'

export const metadata: Metadata = {
    title: "Files"
}

const FilesPage = () => {
    return (
        <FilesView />
    )
}

export default FilesPage