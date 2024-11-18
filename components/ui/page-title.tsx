import React from 'react'

const PageTitle = ({ title, description }: { title: string, description?: string }) => {
    return (
        <div className="space-y-1 py-6">
            <h1 className='font-black text-3xl'>
                {title}
            </h1>
            {description && (
                <p className='text-muted-foreground text-sm font-medium'>{description}</p>
            )}
        </div>
    )
}

export default PageTitle