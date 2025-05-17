"use client"

import { GroupMembersDialog } from "@/components/messages/group-members-dialog"
import { MessageForm } from "@/components/messages/message-form"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { api } from "@/convex/_generated/api"
import { ConversationProps } from "@/types"
import { useConvexAuth, useQuery } from "convex/react"
import { Video, X } from "lucide-react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { MessagesList } from "./messages-list"
import { useEffect } from "react"

export const ConversationContent = () => {
  const { isAuthenticated } = useConvexAuth()

  const params = useParams()
  const router = useRouter()

  const conversations = useQuery(
    api.conversations.getMyConversations,
    isAuthenticated ? undefined : "skip",
  )

  const currentUser = useQuery(
    api.users.getCurrentUser,
    isAuthenticated ? undefined : "skip",
  )

  const currentConversation: ConversationProps | undefined =
    conversations?.find((conversation) => conversation._id === params.id)

  // Utiliser useEffect pour la redirection au lieu de le faire pendant le rendu
  useEffect(() => {
    if (conversations && !currentConversation) {
      router.push("/messages")
    }
  }, [conversations, currentConversation, router])

  // Si les données ne sont pas encore chargées ou si la conversation n'existe pas, afficher un indicateur de chargement
  if (!conversations || !currentUser || !currentConversation) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        Chargement...
      </div>
    )
  }

  return (
    <div className="flex h-full w-full flex-col lg:w-3/5">
      <div className="sticky top-0 z-10 w-full">
        {/* Header */}
        <div className="flex justify-between bg-muted/50 p-3">
          <div className="flex items-center gap-3">
            <Avatar className="relative overflow-visible border border-gray-900">
              {currentConversation.isOnline && (
                <div className="absolute right-0 top-0 h-2.5 w-2.5 rounded-full border-2 border-foreground bg-green-500" />
              )}
              <AvatarImage
                src={
                  currentConversation.groupImage || currentConversation.image
                }
                className="rounded-full object-cover"
              />
              <AvatarFallback>
                <div className="h-full w-full animate-pulse rounded-full"></div>
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <p>{currentConversation.groupName || currentConversation.name}</p>
              {currentConversation.isGroup && (
                <GroupMembersDialog conversation={currentConversation} />
              )}
            </div>
          </div>

          <div className="mr-5 flex items-center gap-7">
            <div>
              <Video size={23} />
            </div>

            <button onClick={() => router.push("/messages")}>
              <X size={16} className="cursor-pointer" />
            </button>
          </div>
        </div>
      </div>

      <MessagesList
        conversation={currentConversation}
        currentUser={currentUser}
      />

      <MessageForm
        currentUser={currentUser}
        conversation={currentConversation}
      />
    </div>
  )
}
