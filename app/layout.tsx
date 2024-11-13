import { ThemeProvider } from "@/providers/theme-provider";
import SessionWrapper from "@/providers/session-provider";
import { Toaster } from "@/components/ui/toaster";
import { getServerSession } from "next-auth";
import { Inter } from 'next/font/google'
import type { Metadata } from "next";
import "./globals.css";

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: "Mediah",
  description: "A modern Discord based file Uploader and Sharer for your everyday needs.",
};

export default async function RootLayout({ children, }: Readonly<{ children: React.ReactNode; }>) {
  const session = await getServerSession();

  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.className} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
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