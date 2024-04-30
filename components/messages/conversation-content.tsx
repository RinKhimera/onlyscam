"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { api } from "@/convex/_generated/api"
import { ConversationProps } from "@/types"
import { useConvexAuth, useQuery } from "convex/react"
import { Video, X } from "lucide-react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { MessageForm } from "./message-form"

export const ConversationContent = () => {
  const { isAuthenticated } = useConvexAuth()

  const params = useParams()
  const conversationName = "John Doe"
  const router = useRouter()

  const conversations = useQuery(
    api.conversations.getMyConversations,
    isAuthenticated ? undefined : "skip",
  )

  // filter the conversation by id from the params.id
  const currentConversation: ConversationProps = conversations?.find(
    (conversation) => conversation._id === params.id,
  )

  if (!currentConversation) router.push("/messages")

  return (
    <div className="flex h-full w-3/5 flex-col">
      <div className="sticky top-0 z-50 w-full">
        {/* Header */}
        <div className="flex justify-between bg-muted/50 p-3">
          <div className="flex items-center gap-3">
            <Avatar className="relative overflow-visible border border-gray-900">
              {currentConversation?.isOnline && (
                <div className="absolute right-0 top-0 h-2.5 w-2.5 rounded-full border-2 border-foreground bg-green-500" />
              )}
              <AvatarImage
                src={
                  currentConversation?.groupImage || currentConversation?.image
                }
                className="rounded-full object-cover"
              />
              <AvatarFallback>
                <div className="h-full w-full animate-pulse rounded-full"></div>
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <p>
                {currentConversation?.groupName || currentConversation?.name}
              </p>
              {/* {isGroup && <GroupMembersDialog />} */}
            </div>
          </div>

          <div className="mr-5 flex items-center gap-7">
            <Link href="/video-call" target="_blank">
              <Video size={23} />
            </Link>

            <button onClick={() => router.push("/messages")}>
              <X size={16} className="cursor-pointer" />
            </button>
          </div>
        </div>
      </div>

      <div className="relative h-full flex-1 overflow-auto p-3"></div>
      <MessageForm />
    </div>
  )
}
