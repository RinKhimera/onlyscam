import { ConversationLayout } from "@/components/messages/conversation-layout"
import { LeftSidebar } from "@/components/shared/left-sidebar"

const ConversationsPage = () => {
  return (
    <div className="relative flex h-full w-full items-center justify-center">
      <div className="relative flex h-full w-full max-w-screen-xl">
        <LeftSidebar />
        <ConversationLayout />
      </div>
    </div>
  )
}

export default ConversationsPage
