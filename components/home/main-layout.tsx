import { CreatePost } from "@/components/home/create-post"
import { NewsFeed } from "@/components/home/news-feed"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Bookmark, Dot, Heart, MessageCircle } from "lucide-react"

export const MainLayout = () => {
  return (
    <main className="flex h-full min-h-screen w-[50%] flex-col border-l border-r border-muted max-lg:w-[80%]">
      <h1 className="sticky top-0 z-20 border-b border-muted p-4 text-2xl font-bold backdrop-blur">
        Accueil
      </h1>
      <CreatePost />
      <NewsFeed />
    </main>
  )
}
