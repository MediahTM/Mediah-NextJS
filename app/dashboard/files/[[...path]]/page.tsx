import type { Metadata } from 'next/types'
import FilesView from '../view'

export const metadata: Metadata = {
    title: "Files"
}

const FilesPage = () => {
    return (
        <FilesView />
    )
}

export default FilesPage