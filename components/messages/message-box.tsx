import { MessageSeenSvg } from "@/lib/svgs"
import { ConversationProps, MessageProps, UserProps } from "@/types"
import Link from "next/link"

type MessageBoxProps = {
  conversation: ConversationProps
  message: MessageProps
  currentUser: UserProps
}

export const MessageBox = ({
  currentUser,
  message,
  conversation,
}: MessageBoxProps) => {
  const date = new Date(message._creationTime)
  const hour = date.getHours().toString().padStart(2, "0")
  const minute = date.getMinutes().toString().padStart(2, "0")
  const time = `${hour}:${minute}`

  const isMember = conversation!.participants.includes(message.sender._id)
  const isGroup = conversation?.isGroup
  const isFromCurrentUser = message.sender._id === currentUser?._id

  if (!isFromCurrentUser) {
    return (
      <>
        <div className="flex w-2/3 gap-1">
          <div className="relative z-20 flex max-w-fit flex-col rounded-3xl rounded-bl-md bg-accent px-4 py-2 shadow-md">
            <TextMessage message={message} />
            <MessageTime time={time} isFromCurrentUser={isFromCurrentUser} />
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <div className="ml-auto flex w-2/3 gap-1">
        <div className="relative z-20 ml-auto flex max-w-fit flex-col rounded-3xl rounded-br-md bg-sky-500 px-4 py-1.5 shadow-md">
          <TextMessage message={message} />
          <MessageTime time={time} isFromCurrentUser={isFromCurrentUser} />
        </div>
      </div>
    </>
  )
}

const TextMessage = ({ message }: { message: MessageProps }) => {
  const isLink = /^(ftp|http|https):\/\/[^ "]+$/.test(message.content) // Check if the content is a URL

  return (
    <div>
      {isLink ? (
        <Link
          href={message.content}
          target="_blank"
          rel="noopener noreferrer"
          className={`mr-2 text-blue-400 underline`}
        >
          {message.content}
        </Link>
      ) : (
        <p className={`mr-2`}>{message.content}</p>
      )}
    </div>
  )
}

const MessageTime = ({
  time,
  isFromCurrentUser,
}: {
  time: string
  isFromCurrentUser: boolean
}) => {
  return <p className="mt-1 flex items-center self-end text-[12px]">{time}</p>
}
