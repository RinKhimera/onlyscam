import "@/app/globals.css"
import { Toaster } from "@/components/ui/sonner"
import { EdgeStoreProvider } from "@/lib/edgestore"
import { cn } from "@/lib/utils"
import ConvexClientProvider from "@/providers/convex-client-provider"
import TanstackClientProvider from "@/providers/tanstack-provider"
import { ThemeProvider } from "@/providers/theme-provider"
import type { Metadata } from "next"
import { Open_Sans as FontSans } from "next/font/google"

const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
})

export const metadata: Metadata = {
  title: "OnlyScam",
  description: "Le réseau social des créateurs de contenus",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="fr">
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          fontSans.variable,
        )}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <ConvexClientProvider>
            <EdgeStoreProvider>
              <TanstackClientProvider>{children}</TanstackClientProvider>
            </EdgeStoreProvider>
          </ConvexClientProvider>
        </ThemeProvider>
        <Toaster richColors />
      </body>
    </html>
  )
}
