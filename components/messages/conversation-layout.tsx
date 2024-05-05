import { ConversationsList } from "./conversations-list"
import { EmptyConversation } from "./empty-conversation"
import { UserListDialog } from "./user-list-dialog"

export const ConversationLayout = () => {
  return (
    <main className="flex h-screen w-[80%] flex-col border-l border-r border-muted">
      <h1 className="sticky top-0 z-20 border-b border-muted p-4 text-2xl font-bold backdrop-blur">
        Messages
      </h1>

      <div className="flex h-full">
        <div className="w-2/5 border-r border-muted max-lg:w-full">
          <div className="flex items-center justify-between border-b border-muted p-4 text-lg font-bold">
            <div>Mes conversations</div>
            <UserListDialog />
          </div>

          <ConversationsList />
        </div>

        <EmptyConversation />
      </div>
    </main>
  )
}
