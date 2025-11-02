"use client";

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ArrowUpRightIcon, LoaderCircleIcon, PlusIcon } from 'lucide-react'
import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { DISCORD_WEBHOOK_REGEX } from '@/lib/constants';
import { toast } from 'sonner';
import axios from 'axios';
import { useWebhooks } from '@/utils/webhooks-context';
import { testNetwork } from '@/utils/file-store/upload';
import RequestBlockedDialog from '../../../components/dialogs/request-blocked/request-blocked-dialog';

const NewWebhook = () => {
    const { webhooks, setWebhooks } = useWebhooks();

    const [networkErrorDialogOpen, setNetworkErrorDialogOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    const webhookSchema = z.object({
        name: z.string().min(1, { message: 'Webhook name is required' }),
        url: z
            .url({ message: 'Invalid URL format' })
            .regex(DISCORD_WEBHOOK_REGEX, {
                message: 'Must be a valid Discord webhook URL',
            })
            .refine((val) => {
                if (webhooks.some(webhook => webhook.url === val)) {
                    return false;
                }
                return true;
            }, { message: 'Webhook already exists', abort: true })
            .refine(async (val) => {
                const errors = await testNetwork(val);
                if (errors === "UnknownWebhook") {
                    return false;
                } else if (errors === "RequestFailed") {
                    setNetworkErrorDialogOpen(true);
                    return false;
                }
                return true;
            }, { message: 'Could not connect to webhook' }),
    })
    type WebhookFormData = z.infer<typeof webhookSchema>

    const { register, handleSubmit, reset, formState: { errors } } = useForm<WebhookFormData>({
        resolver: zodResolver(webhookSchema),
        reValidateMode: "onSubmit",
    })

    const onSubmit = async (data: WebhookFormData) => {
        setLoading(true);
        const webhooksResponse = await axios.post("/api/webhooks", data);
        if (!webhooksResponse.data.success) {
            toast.error(`Could not create webhook: '${webhooksResponse.data.message}'`);
        } else {
            toast.success("Successfully created a webhook!");
            setWebhooks(prev => [...prev, webhooksResponse.data.data]);
            reset();
        }
        setLoading(false);
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>New Webhook</CardTitle>
                    <CardDescription className='hidden lg:block'>Enter the details to create a new file endpoint</CardDescription>
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
                            <a href="https://www.geeksforgeeks.org/websites-apps/how-to-make-a-webhook-in-discord/" target="_blank" rel="noopener noreferrer" className="text-sm text-muted-foreground flex gap-1 items-center hover:underline">Learn how to create a webhook <ArrowUpRightIcon className="max-h-full p-[4px]" /></a>
                            {errors.url && <p className="text-destructive text-sm">{errors.url.message}</p>}
                        </div>
                    </div>
                </CardContent>
                <CardFooter>
                    <Button
                        variant='secondary'
                        className="flex items-center gap-2"
                        type="submit"
                        disabled={loading}
                    >
                        {loading ? <LoaderCircleIcon className='animate-spin' /> : <PlusIcon />}
                        Add Webhook
                    </Button>
                </CardFooter>
            </Card>
            <RequestBlockedDialog open={networkErrorDialogOpen} setOpen={setNetworkErrorDialogOpen} description="To validate your webhook, you need to allow network access to discord.com" />
        </form >
    )
}

export default NewWebhook