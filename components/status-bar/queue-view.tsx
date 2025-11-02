import React, { useEffect, useState } from 'react'
import type { QueueProps } from './status-bar'
import { Card, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { X } from 'lucide-react'
import { Input } from '../ui/input'
import { useStatusBar } from '@/utils/status-bar-context'
import { ScrollArea } from '../ui/scroll-area'
import { cn } from '@/lib/utils'
import { ActivityIcon } from 'lucide-react'
import { Progress } from '../ui/progress'

const QueueView = ({ queueItems }: { queueItems: QueueProps[] }) => {
    const { statusBar, setStatusBar } = useStatusBar();
    const [items, setItems] = useState<QueueProps[]>(queueItems)
    const [search, setSearch] = useState<string>('')

    useEffect(() => {
        const filteredItems = queueItems.filter((item) =>
            item.title.toLowerCase().includes(search.toLowerCase())
        );
        setItems(filteredItems);
    }, [search, queueItems]);

    return (
        <div className="space-y-4 max-w-full overflow-hidden">
            <div className='p-[1px]'>
                <Input
                    placeholder="Search..."
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                />
            </div>
            <div className='space-y-2'>
                <ScrollArea className={cn('max-w-full overflow-x-clip')}>
                    <div className="max-w-full flex flex-col gap-1 max-h-[500px]">
                        {statusBar.processing &&
                            (
                                <Card className='bg-muted/60 w-full pr-0'>
                                    <CardHeader className='flex p-3 w-full flex-col space-y-0 items-center justify-between overflow-hidden gap-2'>
                                        <CardTitle className='flex items-center gap-2 leading-snug w-full'>
                                            {statusBar.icon ? <statusBar.icon className='size-5 shrink-0 aspect-square' /> : <ActivityIcon className='size-5 shrink-0 aspect-square' />}
                                            <div className="flex items-center gap-2 flex-col justify-center truncate text-nowrap w-full overflow-hidden">
                                                <span className='max-w-full overflow-hidden truncate'>{statusBar.title}</span>
                                            </div>
                                            <Button size="icon" variant="outline" className='size-6 bg-muted/10 hover:bg-muted shrink-0 aspect-square' onClick={statusBar.onCancel}>
                                                <X className="size-4 shrink-0 aspect-square" />
                                            </Button>
                                        </CardTitle>
                                        <Progress value={statusBar.progress} className='w-full' />
                                    </CardHeader>
                                </Card>
                            )}
                        {items.map((item, index) => (
                            <Card key={index}>
                                <CardHeader className='flex p-3 flex-row space-y-0 items-center justify-between'>
                                    <CardTitle className='flex items-center gap-2 leading-snug w-full overflow-hidden text-nowrap mr-[2px]'>
                                        {item.icon != undefined && (
                                            <item.icon className='size-5 shrink-0 aspect-square' />
                                        )}
                                        <span className='max-w-full overflow-hidden truncate'>{item.title}</span>
                                    </CardTitle>
                                    <Button
                                        onClick={() => {
                                            if (item.remove) {
                                                item.remove();
                                            }
                                            setItems(prevItems => prevItems.filter((_, i) => i !== index));
                                            setStatusBar(prevItems => { return { ...prevItems, queue: prevItems.queue?.filter((_, i) => i !== index) } });
                                        }
                                        }
                                        size="icon"
                                        variant="outline"
                                        className="size-6 aspect-square shrink-0"
                                    >
                                        <X className="size-4 shrink-0 aspect-square" />
                                    </Button>
                                </CardHeader>
                            </Card>
                        ))}
                    </div>
                </ScrollArea>

                {(items.length === 0 && !statusBar.processing) && (
                    <div className='p-4 py-6 border-2 border-dashed text-center flex items-center justify-center rounded-lg'>
                        <p className="text-muted-foreground text-sm">No items found.</p>
                    </div>
                )}
            </div>
        </div>
    )
}

export default QueueView