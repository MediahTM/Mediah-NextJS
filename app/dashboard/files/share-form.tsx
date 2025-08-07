"use client";

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon, Loader2Icon } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import { File, Share } from '@prisma/client';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { format } from 'date-fns';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { toast } from 'sonner';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { shareFile } from '@/utils/api-actions';

const ShareForm = ({ open, setOpen, file, shares, setShares }: { open: boolean; setOpen: (open: boolean) => void; file: File, shares: Share[], setShares: React.Dispatch<React.SetStateAction<Share[]>> }) => {
    const DynamicFormSchema = z.object({
        never_expire: z.boolean(),
        end_date: z.date().nullable().optional(),
    }).refine(
        (data) => data.never_expire || data.end_date !== null,
        {
            message: "Please select an end date or check 'Never Expire'.",
            path: ["end_date"],
        }
    );

    const existingShare: Share | null = shares.find((share) => share.key === file.id && share.type === "file") || null;

    const form = useForm<z.infer<typeof DynamicFormSchema>>({
        resolver: zodResolver(DynamicFormSchema),
        defaultValues: {
            end_date: null,
            never_expire: false,
        },
    });

    useEffect(() => {
        form.reset();

        if (open) {
            form.reset({
                end_date: existingShare && existingShare.endDate ? new Date(existingShare.endDate) : null,
                never_expire: existingShare?.neverExpire || false
            })
        }
    }, [open, existingShare, form])

    const [loading, setLoading] = useState<boolean>(false);
    const { watch, setValue } = form;

    const endDate = watch("end_date");
    const neverExpireChecked = watch("never_expire");

    const onSubmit = async (data: z.infer<typeof DynamicFormSchema>) => {
        setLoading(true);

        const response = await shareFile(file.id, "file", {
            ...(data.never_expire ? { neverExpire: data.never_expire } : {}),
            ...(data.end_date ? { endDate: data.end_date as Date } : {})
        })

        if (response.success) {
            setShares((shares) => [...shares.filter((share) => !(share.key === file.id && share.type === "file")), response.data]);
            toast.success(existingShare ? 'Updated share expiration successfully!' : 'Shared file successfully!');
        }
        else {
            toast.error("Could not share file!");
        }

        setLoading(false);
        setOpen(false);
    };

    const handleClose = () => {
        setOpen(!open);
        form.reset();
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                    control={form.control}
                    name="end_date"
                    render={({ field }) => (
                        <FormItem className="flex flex-col">
                            <div className="flex flex-col gap-5">
                                <div className="flex flex-col gap-1.5">
                                    <FormLabel>End Date</FormLabel>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <FormControl>
                                                <Button
                                                    variant="outline"
                                                    className={cn(
                                                        "w-full pl-3 text-left font-normal",
                                                        !field.value && "text-muted-foreground"
                                                    )}
                                                    disabled={neverExpireChecked}
                                                >
                                                    {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                </Button>
                                            </FormControl>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0" align="start">
                                            <Calendar
                                                className="pointer-events-auto"
                                                mode="single"
                                                selected={field.value as Date}
                                                onSelect={(date) => {
                                                    field.onChange(date);
                                                    if (date) {
                                                        setValue("never_expire", false);
                                                    }
                                                }}
                                                disabled={(date) => date < new Date(new Date().getTime() - 1 * 1000) || date < new Date("1900-01-01")}
                                            />
                                        </PopoverContent>
                                    </Popover>
                                </div>
                                <FormMessage />
                            </div>
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="never_expire"
                    render={({ field }) => (
                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="never-expire"
                                checked={field.value}
                                disabled={Boolean(endDate)}
                                onCheckedChange={(checked) => {
                                    field.onChange(checked);
                                    if (checked) {
                                        setValue("end_date", null);
                                    }
                                }}
                            />
                            <label
                                htmlFor="never-expire"
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                                Never expire
                            </label>
                        </div>
                    )}
                />

                <div className="flex items-center gap-2">
                    <Button type="submit">
                        {!loading ? (
                            <>
                                {existingShare ? 'Update' : 'Share'}
                            </>
                        ) : (
                            <Loader2Icon className="animate-spin relative size-5" />
                        )}
                    </Button>
                    <Button
                        variant="secondary"
                        onClick={(event) => {
                            event.preventDefault();
                            handleClose();
                        }}
                    >
                        Cancel
                    </Button>
                </div>
            </form>
        </Form>
    );
};

export default ShareForm;