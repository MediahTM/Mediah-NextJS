import { CheckIcon } from "lucide-react";

const Features = () => {
    return (
        <div id="features" className="md:px-4 px-8 border-t bg-muted/5">
            <div className="max-w-6xl w-full py-12 md:py-24 lg:py-32 mx-auto">
                <div className="flex flex-col gap-8 items-center">
                    <div className="flex flex-col items-center gap-2">
                        <div className="inline-flex items-center gap-1.5 mb-2 rounded-lg bg-muted px-3 py-1 text-sm">
                            Secure and Free
                            <CheckIcon width={20} height={20} />
                        </div>
                        <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Protect Your Files with Ease</h2>
                        <p className="max-w-[900px] text-muted-foreground">What we have to offer for free, why free? well we needed this ourselves so enjoy lol.</p>
                    </div>
                    <div className="mx-auto text-center grid items-start gap-8 sm:max-w-4xl sm:grid-cols-2 md:gap-12 lg:max-w-5xl lg:grid-cols-3">
                        <div className="grid gap-1">
                            <h3 className="text-xl font-bold">100% Free</h3>
                            <p className="text-base text-muted-foreground">No telemetry, no ads, no tracking. You literally just get free storage because it isn't ours in the first place.</p>
                        </div>
                        <div className="grid gap-1">
                            <h3 className="text-xl font-bold">Share with Ease</h3>
                            <p className="text-base text-muted-foreground">Folders and files can be shared with the click of a button, and you choose when the links expire.</p>
                        </div>
                        <div className="grid gap-1">
                            <h3 className="text-xl font-bold">500GB Storage</h3>
                            <p className="text-base text-muted-foreground">To prevent abuse, we have placed a 500GB storage limit on accounts by default. If you store more than that, you're genuinely insane, but drop me a message and I'll be happy to upgrade your account.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Features