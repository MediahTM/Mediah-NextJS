import { Metadata } from 'next'
import React from 'react'
import BinView from './view'

export const metadata: Metadata = {
    title: "Bin"
}

const Page = () => {
    return (
        <BinView />
    )
}

export default Page