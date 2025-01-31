import { ThemeProvider } from "@/providers/theme-provider";
import SessionWrapper from "@/providers/session-provider";
import { getServerSession } from "next-auth";
import { Inter } from 'next/font/google'
import type { Metadata } from "next";
import "./globals.css";
import { authOptions } from "@/utils/auth-options";
import { Toaster } from "@/components/ui/sonner"

const inter = Inter({ subsets: ['latin'] })

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
            url: "https://avatars.githubusercontent.com/u/165603488?s=200&v=4",
            sizes: "32x32",
        }
    ]
};

export default async function RootLayout({ children, }: Readonly<{ children: React.ReactNode; }>) {
    const session = await getServerSession(authOptions);

    return (
        <html lang="en" suppressHydrationWarning>
            <body
                className={`${inter.className} antialiased`}
            >
                <ThemeProvider
                    attribute="class"
                    defaultTheme="dark"
                    enableSystem
                    disableTransitionOnChange
                >
                    <SessionWrapper session={session}>
                        {children}
                    </SessionWrapper>
                    <Toaster />
                </ThemeProvider>
            </body>
        </html>
    );
}