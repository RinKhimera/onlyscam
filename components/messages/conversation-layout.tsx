import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Bookmark, Dot, Heart, MessageCircle } from "lucide-react"
import { EmptyConversation } from "./empty-conversation"

export const ConversationLayout = () => {
  return (
    <main className="flex h-screen w-[80%] flex-col border-l border-r border-muted">
      <h1 className="sticky top-0 z-20 border-b border-muted p-4 text-2xl font-bold backdrop-blur">
        Messages
      </h1>

      <div className="flex h-full">
        <div className="w-2/5 border-r border-muted">gauche</div>

        <EmptyConversation />
      </div>
    </main>
  )
}
