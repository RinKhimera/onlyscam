import { MessageBox } from "@/components/messages/message-box"
import { api } from "@/convex/_generated/api"
import { ConversationProps, UserProps } from "@/types"
import { useQuery } from "convex/react"
import { useEffect, useRef } from "react"

type MessagesListProps = {
  conversation: ConversationProps
  currentUser: UserProps
}

export const MessagesList = ({
  conversation,
  currentUser,
}: MessagesListProps) => {
  const messages = useQuery(api.messages.getMessages, {
    conversation: conversation!._id,
  })

  const messagesEndRef = useRef<null | HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(scrollToBottom, [messages])

  return (
    <div className="relative h-full flex-1 overflow-auto pt-3">
      <div className="mx-5 flex flex-col gap-3">
        {messages?.map((message, index) => (
          <div key={message._id}>
            <MessageBox
              currentUser={currentUser}
              message={message}
              conversation={conversation}
            />
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
    </div>
  )
}
