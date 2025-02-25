import Link from 'next/link';
import React from 'react';
import { ArrowRightIcon } from 'lucide-react';

const NotFound = () => {
    return (
        <div className="w-full h-full flex flex-1 flex-col gap-6 items-center justify-center">
            <h1 className='text-3xl font-black'>Not Found</h1>
            <Link href='/dashboard' className='border-b flex items-center gap-2'>Dashboard <ArrowRightIcon className='size-4' /></Link>
        </div>
    )
}

export default NotFound