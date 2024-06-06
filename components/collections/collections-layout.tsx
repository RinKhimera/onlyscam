"use client"

import { UserCollections } from "@/components/collections/user-collections"
import { api } from "@/convex/_generated/api"
import { useConvexAuth, useQuery } from "convex/react"
import { Loader } from "lucide-react"

export const CollectionsLayout = () => {
  const { isAuthenticated } = useConvexAuth()

  const currentUser = useQuery(
    api.users.getCurrentUser,
    isAuthenticated ? undefined : "skip",
  )

  if (currentUser === undefined)
    return (
      <main className="flex h-full min-h-screen w-[50%] flex-col border-l border-r border-muted max-lg:w-[80%]">
        <h1 className="sticky top-0 z-20 border-b border-muted p-4 text-2xl font-bold backdrop-blur">
          Collections
        </h1>

        <div className="flex flex-1 flex-col items-center justify-center">
          <Loader className="animate-spin text-primary" size={60} />
        </div>
      </main>
    )

  return (
    <main className="flex h-full min-h-screen w-[50%] flex-col border-l border-r border-muted max-lg:w-[80%]">
      <h1 className="sticky top-0 z-20 border-b border-muted p-4 text-2xl font-bold backdrop-blur">
        Collections
      </h1>

      <UserCollections currentUser={currentUser} />
    </main>
  )
}
