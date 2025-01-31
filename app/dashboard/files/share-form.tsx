"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { CalendarIcon, Loader2Icon } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { File } from "@prisma/client";
import { Checkbox } from "@/components/ui/checkbox";
import { useEffect, useState } from "react";
import { toast } from "sonner";

const ShareForm = ({ open, setOpen, file, update, setReload, reload }: { open: boolean; setOpen: (open: boolean) => void; file: File, update?: boolean, setReload: (open: boolean) => void, reload: boolean }) => {
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
                end_date: file.endDate ? new Date(file.endDate) : null,
                never_expire: file.neverExpire
            })
        }
    }, [open, file.endDate, file.neverExpire, form])

    const [loading, setLoading] = useState<boolean>(false);
    const { watch, setValue } = form;

    const endDate = watch("end_date");
    const neverExpireChecked = watch("never_expire");

    const onSubmit = async (data: z.infer<typeof DynamicFormSchema>) => {
        file.neverExpire = data.never_expire
        file.endDate = data.end_date as Date

        setLoading(true);

        fetch(`/api/file`, {
            method: "PUT",
            body: JSON.stringify({
                ...file,
                shareDate: file.endDate ? new Date() : null
            })
        })
            .then((response) => response.json())
            .then((response) => {
                if (response.success) {
                    setReload(!reload);
                    setOpen(false);
                }
                else {
                    toast.error("Could not update file!");
                }
                setLoading(false);
            })
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
                                                disabled={(date) => date < new Date() || date < new Date("1900-01-01")}
                                                initialFocus
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
                                {update ? 'Update' : 'Share'}
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