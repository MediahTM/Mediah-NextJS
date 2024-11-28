import { ThemeProvider } from "@/providers/theme-provider";
import SessionWrapper from "@/providers/session-provider";
import { Toaster } from "@/components/ui/toaster";
import { getServerSession } from "next-auth";
import { Inter } from 'next/font/google'
import type { Metadata } from "next";
import "./globals.css";
import { authOptions } from "@/utils/authOptions";

const inter = Inter({ subsets: ['latin'] })

const description: string = "A modern Discord based file Uploader and Sharer for your everyday needs.";

export const metadata: Metadata = {
  title: {
    template: "Mediah - %s",
    default: `Mediah - ${description}`
  },
  description: description,
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