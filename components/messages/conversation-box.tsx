import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { api } from "@/convex/_generated/api"
import { formatDate } from "@/lib/dates"
import { MessageSeenSvg } from "@/lib/svgs"
import { ConversationProps } from "@/types"
import { useQuery } from "convex/react"
import { ImageIcon, Users, VideoIcon } from "lucide-react"
import { useParams, useRouter } from "next/navigation"

export const ConversationBox = ({
  conversation,
}: {
  conversation: ConversationProps
}) => {
  const params = useParams()
  const router = useRouter()

  const conversationImage = conversation?.groupImage || conversation?.image
  const conversationName = conversation?.groupName || conversation?.name
  const lastMessage = conversation?.lastMessage
  const lastMessageType = lastMessage?.messageType

  const currentUser = useQuery(api.users.getCurrentUser)

  return (
    <>
      <div
        onClick={() => router.push(`/messages/${conversation?._id}`)}
        className={`flex cursor-pointer items-center gap-2 border-b p-3 transition hover:bg-muted/60 ${conversation?._id === params.id ? "bg-muted" : ""}`}
      >
        <Avatar className="relative overflow-visible border border-gray-900">
          {conversation?.isOnline && (
            <div className="absolute right-0 top-0 h-2.5 w-2.5 rounded-full border-2 border-foreground bg-green-500" />
          )}
          <AvatarImage
            src={conversationImage}
            className="rounded-full object-cover"
          />
          <AvatarFallback>
            <div className="h-full w-full animate-pulse rounded-full"></div>
          </AvatarFallback>
        </Avatar>

        <div className="w-full">
          <div className="flex items-center">
            <h3 className="text-sm font-medium lg:text-sm">
              {conversationName}
            </h3>
            <span className="ml-auto text-xs text-muted-foreground lg:text-sm">
              {formatDate(
                lastMessage?._creationTime || conversation?._creationTime!,
              )}
            </span>
          </div>
          <p className="mt-0.5 flex items-center gap-1 text-sm text-muted-foreground">
            {lastMessage?.sender === currentUser?._id ? <MessageSeenSvg /> : ""}
            {conversation?.isGroup && <Users size={16} />}
            {!lastMessage && "Démarrer une conversation"}
            {lastMessageType === "text" ? (
              (lastMessage?.content as string)?.length > 30 ? (
                <span className="text-sm">
                  {(lastMessage?.content as string)?.slice(0, 30)}...
                </span>
              ) : (
                <span className="text-sm">{lastMessage?.content}</span>
              )
            ) : null}
            {lastMessageType === "image" && <ImageIcon size={16} />}
            {lastMessageType === "video" && <VideoIcon size={16} />}
          </p>
        </div>
      </div>
    </>
  )
}
