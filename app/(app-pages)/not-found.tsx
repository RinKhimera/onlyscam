"use client"

import { ArrowLeft, Home, UserX } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <div className="flex h-full min-h-screen w-[50%] flex-col border-l border-r border-muted max-lg:w-[80%] max-sm:w-full max-[500px]:pb-16">
      <div className="sticky top-0 z-20 border-b border-muted bg-background/95 p-4 backdrop-blur">
        <Link
          href="/"
          className="flex items-center gap-2 text-lg text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-6" />
          Retour à l&apos;accueil
        </Link>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center px-6 py-12">
        <div className="mb-8 flex h-24 w-24 items-center justify-center rounded-full bg-muted">
          <UserX className="h-12 w-12 text-muted-foreground" />
        </div>

        <div className="mb-8 text-center">
          <h1 className="mb-2 text-6xl font-bold text-primary">404</h1>
          <h2 className="mb-4 text-2xl font-semibold text-foreground">
            Profil introuvable
          </h2>
          <p className="max-w-md text-muted-foreground">
            Le profil que vous recherchez n&apos;existe pas ou a été supprimé.
            Vérifiez le nom d&apos;utilisateur ou explorez d&apos;autres
            profils.
          </p>
        </div>

        <div>
          <Button asChild size="lg" className="gap-2">
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
