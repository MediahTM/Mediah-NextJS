'use client'

import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Webhook } from '@prisma/client'
import { toast } from '@/hooks/use-toast'
import { Loader2Icon } from 'lucide-react'

const webhookSchema = z.object({
    name: z.string().min(1, { message: 'Name is required' }).max(50, { message: 'Name cannot exceed 50 characters' }),
    url: z
        .string()
        .url({ message: 'Invalid URL format' })
        .regex(/^https:\/\/discord\.com\/api\/webhooks\/\d+\/[\w-]+$/, {
            message: 'Must be a valid Discord webhook URL',
        }),
})

type WebhookFormData = z.infer<typeof webhookSchema>

const EditWebhook = ({ open, setOpen, webhook, reload, setReload }: { open: boolean; setOpen: (open: boolean) => void, webhook: Webhook, reload: boolean, setReload: (open: boolean) => void }) => {
    const { register, handleSubmit, reset, formState: { errors } } = useForm<WebhookFormData>({
        resolver: zodResolver(webhookSchema),
        defaultValues: {
            name: webhook.name,
            url: webhook.url,
        },
    })

    const [loading, setLoading] = useState<boolean>(false);

    const onSubmit = (data: WebhookFormData) => {
        setLoading(true)

        fetch(`/api/webhooks`, {
            method: "PUT",
            body: JSON.stringify({
                ...webhook,
                name: data.name,
                url: data.url
            })
        })
            .then((response) => response.json())
            .then((response) => {
                if (response.success) {
                    setReload(!reload)
                    setOpen(false);
                }
                else {
                    toast({
                        title: "Update Error",
                        description: response.message || "Could not update the webhook!"
                    })
                }

                setLoading(false)
            })

        setOpen(false)
        reset();
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Edit Webhook</DialogTitle>
                    <DialogDescription>Update details about your webhook</DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Name</Label>
                        <Input
                            id="name"
                            placeholder="Enter webhook name"
                            {...register('name')}
                        />
                        {errors.name && (
                            <p className="text-destructive text-sm">{errors.name.message}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="url">Webhook URL</Label>
                        <Input
                            id="url"
                            placeholder="https://discord.com/api/webhooks/..."
                            {...register('url')}
                        />
                        {errors.url && (
                            <p className="text-destructive text-sm">{errors.url.message}</p>
                        )}
                    </div>

                    <Button type="submit" className="w-full">
                        {!loading ? (
                            <>
                                Update Webhook
                            </>
                        ) : (
                            <Loader2Icon className="animate-spin relative size-6" />
                        )}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    )
}

export default EditWebhook