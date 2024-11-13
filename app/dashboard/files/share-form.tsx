"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { File } from "@prisma/client";

const FormSchema = z.object({
    end_date: z.date({
        required_error: "An end date is required.",
    }),
});

const ShareForm = ({ open, setOpen, file }: { open: boolean, setOpen: (open: boolean) => void, file: File }) => {
    const form = useForm<z.infer<typeof FormSchema>>({
        resolver: zodResolver(FormSchema),
    });

    const onSubmit = async (data: z.infer<typeof FormSchema>) => {
        console.log(data.end_date)
        console.log(file)
    }

    const handleClose = () => {
        setOpen(!open)
        form.reset();
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                    control={form.control}
                    name="end_date"
                    render={({ field }) => (
                        <FormItem className="flex flex-col">
                            <FormLabel>End Date</FormLabel>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <FormControl>
                                        <Button
                                            variant={"outline"}
                                            className={cn(
                                                "w-[240px] pl-3 text-left font-normal",
                                                !field.value && "text-muted-foreground"
                                            )}
                                        >
                                            {field.value ? (
                                                format(field.value, "PPP")
                                            ) : (
                                                <span>Pick a date</span>
                                            )}
                                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                        </Button>
                                    </FormControl>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar
                                        className="pointer-events-auto"
                                        mode="single"
                                        selected={field.value}
                                        onSelect={field.onChange}
                                        disabled={(date) =>
                                            date < new Date() || date < new Date("1900-01-01")
                                        }
                                        initialFocus
                                    />
                                </PopoverContent>
                            </Popover>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <div className="flex items-center gap-2">
                    <Button
                        type="submit"
                    >
                        Share
                    </Button>
                    <Button
                        variant={"secondary"}
                        onClick={(event) => {
                            event.preventDefault();
                            handleClose()
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