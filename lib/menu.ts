import { FilesIcon, LayoutDashboard, PlugIcon, ShoppingCart, TrashIcon, WebhookIcon, SettingsIcon, UsersIcon, KeyIcon } from "lucide-react";

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
            {
                title: "Manage Webhooks",
                icon: WebhookIcon,
                url: "/webhooks",
            },
        ],
    }
]