"use client"

import { AlertTriangle, ArrowLeft, Home, RefreshCw } from "lucide-react"
import Link from "next/link"
import { useEffect } from "react"
import { Button } from "@/components/ui/button"

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log l'erreur pour le debug
    console.error("Application error:", error)
  }, [error])

  return (
    <div className="flex h-full min-h-screen w-[50%] flex-col border-l border-r border-muted max-lg:w-[80%] max-sm:w-full max-[500px]:pb-16">
      <div className="sticky top-0 z-20 border-b border-muted bg-background/95 p-4 backdrop-blur-sm">
        <Link
          href="/"
          className="flex items-center gap-2 text-lg text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-6" />
          Retour à l&apos;accueil
        </Link>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center px-6 py-12">
        <div className="mb-8 flex h-24 w-24 items-center justify-center rounded-full bg-destructive/10">
          <AlertTriangle className="h-12 w-12 text-destructive" />
        </div>

        <div className="mb-8 text-center">
          <h1 className="mb-2 text-6xl font-bold text-destructive">Oops!</h1>
          <h2 className="mb-4 text-2xl font-semibold text-foreground">
            Une erreur est survenue
          </h2>
          <p className="max-w-md text-muted-foreground">
            Quelque chose s&apos;est mal passé. Cela peut être temporaire,
            essayez de rafraîchir la page ou revenez à l&apos;accueil.
          </p>
          {process.env.NODE_ENV === "development" && (
            <details className="mt-4 max-w-md rounded-lg bg-muted p-4 text-left text-sm">
              <summary className="cursor-pointer font-medium text-destructive">
                Détails de l&apos;erreur pour les développeurs
              </summary>
              <pre className="mt-2 whitespace-pre-wrap break-words text-xs">
                {error.message}
              </pre>
            </details>
          )}
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Button onClick={reset} size="lg" className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Réessayer
          </Button>
          <Button asChild variant="outline" size="lg" className="gap-2">
            <Link href="/">
              <Home className="h-4 w-4" />
              Retour à l&apos;accueil
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
