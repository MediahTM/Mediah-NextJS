import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import ImportView from './import-view';

const ImportDialog = ({ open, setOpen }: { open: boolean, setOpen: (open: boolean) => void }) => {
    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Import files from JSON/CSV</DialogTitle>
                    <DialogDescription>
                        If you've exported your files to a JSON or CSV file, you can import them here.
                    </DialogDescription>
                </DialogHeader>
                <ImportView setOpen={setOpen} />
            </DialogContent>
        </Dialog>
    )
}

export default ImportDialog