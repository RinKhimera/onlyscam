"use client"

import { Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { useCurrentUser } from "@/hooks/useCurrentUser"

export default function SuperuserLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { currentUser, isLoading } = useCurrentUser()
  const router = useRouter()

  // Redirection si l'utilisateur n'est pas superuser
  useEffect(() => {
    if (!isLoading && currentUser && currentUser.accountType !== "SUPERUSER") {
      router.push("/")
    }
  }, [currentUser, isLoading, router])

  // État de chargement
  if (isLoading || currentUser === undefined) {
    return (
      <div className="flex h-full min-h-screen w-full items-center justify-center border-l border-r border-muted sm:w-[80%] lg:w-[60%]">
        <div className="text-center">
          <Loader2 className="mx-auto mb-4 h-12 w-12 animate-spin text-primary" />
          <p className="text-lg text-muted-foreground">
            Vérification des permissions...
          </p>
        </div>
      </div>
    )
  }

  // Redirection en cours pour les utilisateurs non autorisés
  if (!currentUser || currentUser.accountType !== "SUPERUSER") {
    return (
      <div className="flex h-full min-h-screen w-full items-center justify-center border-l border-r border-muted sm:w-[80%] lg:w-[60%]">
        <div className="text-center">
          <Loader2 className="mx-auto mb-4 h-12 w-12 animate-spin text-primary" />
          <p className="text-lg text-muted-foreground">
            Redirection en cours...
          </p>
        </div>
      </div>
    )
  }

  // Rendu des pages superuser si les permissions sont OK
  return <>{children}</>
}
