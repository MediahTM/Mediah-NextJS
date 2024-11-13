import Link from "next/link";

const Footer = () => {
    const links = [
        {
            name: "GitHub",
            href: "https://github.com/MediahTM/"
        },
        {
            name: "Discord",
            href: "https://discord.gg/3fdeqQn7VN"
        }
    ]

    return (
        <footer className="border-t py-6">
            <div className="container mx-auto px-4 flex items-center justify-between">
                <p className="text-muted-foreground text-sm">
                    © {new Date().getFullYear()} Mediah. All rights reserved.
                </p>
                <div className="flex items-center gap-4">
                    {links.map((link) => (
                        <Link key={link.href} href={link.href} className="text-sm font-medium hover:underline text-muted-foreground sm:flex hidden hover:text-foreground transition-all underline-offset-4" target="_blank">
                            {link.name}
                        </Link>
                    ))}
                </div>
            </div>
        </footer>
    )
}

export default Footer