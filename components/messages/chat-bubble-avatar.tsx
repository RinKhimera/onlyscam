import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { MessageProps } from "@/types"

type ChatBubbleAvatarProps = {
  message: MessageProps
  isMember: boolean
  isGroup: boolean | undefined
}

export const ChatBubbleAvatar = ({
  isGroup,
  isMember,
  message,
}: ChatBubbleAvatarProps) => {
  if (!isGroup) return null

  return (
    <Avatar className="relative overflow-visible">
      {message.sender.isOnline && isMember && (
        <div className="absolute right-0 top-0 h-2 w-2 rounded-full border-2 border-foreground bg-green-500" />
      )}
      <AvatarImage
        src={message.sender?.image}
        className="h-8 w-8 rounded-full object-cover"
      />
      <AvatarFallback className="h-8 w-8 ">
        <div className="animate-pulse rounded-full bg-gray-500"></div>
      </AvatarFallback>
    </Avatar>
  )
}
