import React from 'react'

const PageTitle = ({ title }: { title: string }) => {
    return (
        <h1 className='font-black text-3xl py-6'>
            {title}
        </h1>
    )
}

export default PageTitle