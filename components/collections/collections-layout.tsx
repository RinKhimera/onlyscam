"use client"

import { Loader } from "lucide-react"
import { UserCollections } from "@/components/collections/user-collections"
import { useCurrentUser } from "@/hooks/useCurrentUser"

export const CollectionsLayout = () => {
  const { currentUser } = useCurrentUser()

  if (!currentUser)
    return (
      <main className="flex h-full min-h-screen w-[50%] flex-col border-l border-r border-muted max-lg:w-[80%] max-sm:w-full max-[500px]:pb-16">
        <h1 className="sticky top-0 z-20 border-b border-muted p-4 text-2xl font-bold backdrop-blur-sm">
          Collections
        </h1>

        <div className="flex flex-1 flex-col items-center justify-center">
          <Loader className="animate-spin text-primary" size={60} />
        </div>
      </main>
    )

  return (
    <main className="flex h-full min-h-screen w-[50%] flex-col border-l border-r border-muted max-lg:w-[80%] max-sm:w-full max-[500px]:pb-16">
      <h1 className="sticky top-0 z-20 border-b border-muted p-4 text-2xl font-bold backdrop-blur-sm">
        Collections
      </h1>

      <UserCollections currentUser={currentUser} />
    </main>
  )
}
