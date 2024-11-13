import { FilesIcon, LayoutDashboard, PlugIcon, ShoppingCart, TrashIcon, WebhookIcon } from "lucide-react";

export const SidebarLinks = [
    {
        title: "General",
        items: [
            {
                title: "Dashboard",
                icon: LayoutDashboard,
                url: "",
            },
            {
                title: "Files",
                icon: FilesIcon,
                url: "/files",
            },
            {
                title: "Bin",
                icon: TrashIcon,
                url: "/bin",
            },
        ],
    },
    {
        title: "Plugins",
        items: [
            {
                title: "Marketplace",
                icon: ShoppingCart,
                url: "/plugins",
            },
            {
                title: "Installed",
                icon: PlugIcon,
                url: "/plugins/installed",
            },
        ],
    },
    {
        title: "Discord",
        items: [
            {
                title: "Webhooks",
                icon: WebhookIcon,
                url: "/webhooks",
            },
        ],
    }
]