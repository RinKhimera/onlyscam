import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { api } from "@/convex/_generated/api"
import { formatDate } from "@/lib/dates"
import { MessageSeenSvg } from "@/lib/svgs"
import { Conversation } from "@/types"
import { useQuery } from "convex/react"
import { ImageIcon, Users, VideoIcon } from "lucide-react"
import { useRouter } from "next/navigation"

export const ConversationBox = ({
  conversation,
}: {
  conversation: Conversation
}) => {
  const router = useRouter()

  const conversationImage = conversation.groupImage || conversation.image
  const conversationName = conversation.groupName || conversation.name
  const lastMessage = conversation.lastMessage
  const lastMessageType = lastMessage?.messageType

  const currentUser = useQuery(api.users.getCurrentUser)

  return (
    <>
      <div
        onClick={() => router.push(`/messages/${conversation._id}`)}
        className={`hover:bg-chat-hover flex cursor-pointer items-center gap-2 p-3 `}
      >
        <Avatar className="relative overflow-visible border border-gray-900">
          {conversation.isOnline && (
            <div className="absolute right-0 top-0 h-2.5 w-2.5 rounded-full border-2 border-foreground bg-green-500" />
          )}
          <AvatarImage
            src={conversationImage || "/placeholder.png"}
            className="rounded-full object-cover"
          />
          <AvatarFallback>
            <div className="h-full w-full animate-pulse rounded-full"></div>
          </AvatarFallback>
        </Avatar>
        <div className="w-full">
          <div className="flex items-center">
            <h3 className="text-xs font-medium lg:text-sm">
              {conversationName}
            </h3>
            <span className="ml-auto text-[10px] text-muted-foreground lg:text-xs">
              {formatDate(
                lastMessage?._creationTime || conversation._creationTime,
              )}
            </span>
          </div>
          <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
            {lastMessage?.sender === currentUser?._id ? <MessageSeenSvg /> : ""}
            {conversation.isGroup && <Users size={16} />}
            {!lastMessage && "Démarrer une conversation"}
            {lastMessageType === "text" ? (
              (lastMessage?.content as string)?.length > 30 ? (
                <span className="text-xs">
                  {(lastMessage?.content as string)?.slice(0, 30)}...
                </span>
              ) : (
                <span className="text-xs">{lastMessage?.content}</span>
              )
            ) : null}
            {lastMessageType === "image" && <ImageIcon size={16} />}
            {lastMessageType === "video" && <VideoIcon size={16} />}
          </p>
        </div>
      </div>
      <hr className="bg-gray-primary mx-10 h-[1px]" />
    </>
  )
}
