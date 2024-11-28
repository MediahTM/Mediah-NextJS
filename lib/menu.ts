import { FilesIcon, LayoutDashboard, PlugIcon, ShoppingCart, TrashIcon, WebhookIcon, SettingsIcon, UsersIcon } from "lucide-react";

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
    },
    {
        title: "Other",
        items: [
            {
                title: "Settings",
                icon: SettingsIcon,
                url: "/settings",
            },
            {
                title: "Referrals",
                icon: UsersIcon,
                url: "/referrals",
            }
        ],
    }
]