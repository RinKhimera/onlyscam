"use client"

import { CreatePost } from "@/components/home/create-post"
import { NewsFeed } from "@/components/home/news-feed"
import { useCurrentUser } from "@/hooks/useCurrentUser"

export const MainLayout = () => {
  const currentUser = useCurrentUser()
  const user = currentUser ?? undefined

  return (
    <main className="flex h-full min-h-screen w-[50%] flex-col border-l border-r border-muted max-lg:w-[80%] max-sm:w-full max-[500px]:pb-16">
      <h1 className="sticky top-0 z-20 border-b border-muted p-4 text-2xl font-bold backdrop-blur">
        Accueil
      </h1>
      <CreatePost currentUser={user} />
      <NewsFeed currentUser={user} />
    </main>
  )
}
