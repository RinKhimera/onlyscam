"use client"

import { CreatePost } from "@/components/home/create-post"
import { NewsFeed } from "@/components/home/news-feed"
import { api } from "@/convex/_generated/api"
import { useConvexAuth, useQuery } from "convex/react"
import { Loader } from "lucide-react"

export const MainLayout = () => {
  const { isAuthenticated } = useConvexAuth()

  const currentUser = useQuery(
    api.users.getCurrentUser,
    isAuthenticated ? undefined : "skip",
  )

  if (currentUser === undefined)
    return (
      <main className="flex h-full min-h-screen w-[50%] flex-col items-center justify-center border-l border-r border-muted max-lg:w-[80%]">
        <Loader className="animate-spin text-primary" size={60} />
      </main>
    )

  return (
    <main className="flex h-full min-h-screen w-[50%] flex-col border-l border-r border-muted max-lg:w-[80%]">
      <h1 className="sticky top-0 z-20 border-b border-muted p-4 text-2xl font-bold backdrop-blur">
        Accueil
      </h1>
      <CreatePost currentUser={currentUser} />
      <NewsFeed currentUser={currentUser} />
    </main>
  )
}
