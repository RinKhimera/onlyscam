import { ConversationIdLayout } from "@/components/messages/conversation-id-layout"
import { ConversationLayout } from "@/components/messages/conversation-layout"
import { LeftSidebar } from "@/components/shared/left-sidebar"

const ConversationsIdPage = () => {
  return (
    <div className="relative flex h-full w-full items-center justify-center">
      <div className="relative flex h-full w-full max-w-screen-xl">
        <LeftSidebar />
        <ConversationIdLayout />
      </div>
    </div>
  )
}

export default ConversationsIdPage
