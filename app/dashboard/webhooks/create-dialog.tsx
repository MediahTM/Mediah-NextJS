"use client";

import { buttonVariants } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { PlusIcon } from 'lucide-react'
import React from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { motion } from 'framer-motion';
import { toast } from '@/hooks/use-toast';

const webhookSchema = z.object({
    name: z.string().min(1, { message: 'Webhook name is required' }),
    url: z.string().url({ message: 'Please enter a valid URL' }).min(1, { message: 'Webhook URL is required' })
})

type WebhookFormData = z.infer<typeof webhookSchema>

const NewWebhook = ({ reload, setReload }: { reload: boolean, setReload: (open: boolean) => void }) => {
    const { register, handleSubmit, reset, formState: { errors } } = useForm<WebhookFormData>({
        resolver: zodResolver(webhookSchema)
    })

    const onSubmit = (data: WebhookFormData) => {
        fetch(`/api/webhooks`, {
            method: "POST",
            body: JSON.stringify(data)
        })
            .then((response) => response.json())
            .then((response) => {
                if (response.success) {
                    toast({
                        title: "Webhook Created!",
                        description: response.message || "Successfully created a webhook!"
                    })

                    reset();

                    setReload(!reload);
                }
                else {
                    toast({
                        title: "Webhook Error",
                        description: response.message || "Could not create a webhook!"
                    })
                }
            })
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>New Webhook</CardTitle>
                    <CardDescription>Enter the details to create a new file endpoint</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid sm:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label>Name</Label>
                            <Input
                                placeholder="Webhook Name"
                                {...register('name')}
                            />
                            {errors.name && <p className="text-destructive text-sm">{errors.name.message}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label>Webhook URL</Label>
                            <Input
                                placeholder="https://discord.com/api/webhooks/..."
                                {...register('url')}
                            />
                            {errors.url && <p className="text-destructive text-sm">{errors.url.message}</p>}
                        </div>
                    </div>
                </CardContent>
                <CardFooter>
                    <motion.button
                        className={buttonVariants({ variant: "secondary", className: "flex items-center gap-2" })}
                        whileTap={{ scale: 0.95 }}
                        transition={{ type: "spring", stiffness: 400, damping: 10 }}
                    >
                        <PlusIcon />
                        Add Webhook
                    </motion.button>
                </CardFooter>
            </Card>
        </form>
    )
}

export default NewWebhook