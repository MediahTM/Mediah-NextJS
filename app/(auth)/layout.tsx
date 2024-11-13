import Navbar from '@/components/ui/navbar'
import React from 'react'

const AuthLayout = ({ children }: { children: React.ReactNode }) => {
    return (
        <div className="min-h-screen h-full w-full flex flex-col">
            <Navbar />
            <div className="h-full w-full flex flex-1 items-center justify-center">
                {children}
            </div>
        </div>
    )
}

export default AuthLayout