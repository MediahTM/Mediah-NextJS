import SessionWrapper from '@/providers/session-provider';
import { authOptions } from '@/utils/auth-options';
import { getServerSession } from 'next-auth';
import { DM_Sans } from 'next/font/google';
import type { Metadata } from 'next';
import { ThemeProvider } from '@/providers/theme-provider';
import { Toaster } from '@/components/ui/sonner';
import './globals.css';
import { getSiteLogo } from '@/lib/helpers';
import { QueryProvider } from '@/providers/query-provider';

const dmSans = DM_Sans({ subsets: ['latin'] })

const description: string = "A modern Discord based file Uploader and Sharer for your everyday needs.";

export const metadata: Metadata = {
    title: {
        template: "Mediah - %s",
        default: `Mediah - ${description}`
    },
    description: description,
    icons: [
        {
            rel: "icon",
            type: "image/x-icon",
            url: getSiteLogo(32),
            sizes: "32x32",
        },
        {
            rel: "icon",
            type: "image/x-icon",
            url: getSiteLogo(64),
            sizes: "64x64",
        },
        {
            rel: "icon",
            type: "image/x-icon",
            url: getSiteLogo(128),
            sizes: "128x128",
        }
    ],
    keywords: [
        "cloud",
        "mediah",
        "files",
        "upload",
        "share",
        "discord",
        "discord webhook",
        "file sharing"
    ]
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode; }>) {
    const session = await getServerSession(authOptions);

    return (
        <html lang="en" suppressHydrationWarning>
            <body
                className={`${dmSans.className} antialiased`}
            >
                <ThemeProvider
                    attribute="class"
                    defaultTheme="dark"
                    enableSystem
                    disableTransitionOnChange
                >
                    <SessionWrapper session={session}>
                        <QueryProvider>
                            {children}
                        </QueryProvider>
                    </SessionWrapper>
                    <Toaster />
                </ThemeProvider>
            </body>
        </html>
    );
}