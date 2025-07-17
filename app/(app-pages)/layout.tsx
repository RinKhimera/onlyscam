"use client"

import { Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { LeftSidebar } from "@/components/shared/left-sidebar"
import { useCurrentUser } from "@/hooks/useCurrentUser"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const { currentUser, isLoading } = useCurrentUser()

  // État de chargement pendant l'auth ou le chargement de l'utilisateur
  if (isLoading || currentUser === undefined) {
    return (
      <section>
        <div className="flex h-screen w-full items-center justify-center">
          <div className="text-center">
            <Loader2 className="mx-auto mb-4 h-12 w-12 animate-spin text-primary" />
            <p className="text-lg text-muted-foreground">Chargement...</p>
          </div>
        </div>
      </section>
    )
  }

  // Redirection vers l'onboarding si pas de username (profil incomplet)
  if (!currentUser?.username) {
    router.push("/onboarding")
    return null
  }

  // Si currentUser est null après le chargement, erreur
  if (!currentUser) {
    return (
      <section>
        <div className="flex h-screen w-full items-center justify-center">
          <div className="text-center">
            <Loader2 className="mx-auto mb-4 h-12 w-12 animate-spin text-primary" />
            <p className="text-lg text-muted-foreground">
              Erreur de chargement du profil...
            </p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section>
      <div className="relative flex h-full w-full items-center justify-center">
        <div className="relative flex h-full w-full max-w-screen-xl">
          <LeftSidebar currentUser={currentUser} />
          {children}
        </div>
      </div>
    </section>
  )
}
