import "@/app/globals.css"
import { cn } from "@/lib/utils"
import ConvexClientProvider from "@/providers/convex-client-provider"
import { ThemeProvider } from "@/providers/theme-provider"
import type { Metadata } from "next"
import { Open_Sans as FontSans } from "next/font/google"

const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
})

export const metadata: Metadata = {
  title: "OnlyScam",
  description: "Le réseau social des créateurs de contenu",
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
          <ConvexClientProvider>{children}</ConvexClientProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
