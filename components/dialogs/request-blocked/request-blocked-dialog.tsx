import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import React from 'react'

const RequestBlockedDialog = ({ open, setOpen, description = "To upload your file through Discord, you need to allow network access to discord.com" }: { open: boolean, setOpen: React.Dispatch<React.SetStateAction<boolean>>, description?: string }) => {
    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Our request to Discord was blocked.</DialogTitle>
                    <DialogDescription>{description}</DialogDescription>
                </DialogHeader>
                <h1 className='font-bold text-lg'>Potential fixes</h1>
                <ul className='list-disc list-inside text-foreground/80'>
                    <li>Disable Privacy Badger and reload the site.</li>
                    <li>Check your ISP isn't blocking access to discord.com.</li>
                    <li>Try using a VPN or proxy.</li>
                </ul>
                <Button onClick={() => setOpen(false)}>
                    Okay, I'll try again
                </Button>
            </DialogContent>
        </Dialog>
    )
}

export default RequestBlockedDialog