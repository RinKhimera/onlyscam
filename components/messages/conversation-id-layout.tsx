import { ConversationContent } from "./conversation-content"
import { ConversationsList } from "./conversations-list"
import { UserListDialog } from "./user-list-dialog"

export const ConversationIdLayout = () => {
  return (
    <main className="flex h-screen w-[80%] flex-col border-l border-r border-muted max-sm:w-full max-[500px]:pb-16">
      <h1 className="sticky top-0 z-20 border-b border-muted p-4 text-2xl font-bold backdrop-blur">
        Messages
      </h1>

      <div className="flex flex-1 overflow-auto">
        <div className="hidden h-full w-2/5 flex-col border-r border-muted lg:flex">
          <div className="flex items-center justify-between border-b border-muted p-4 text-lg font-bold">
            <div>Mes conversations</div>
            <UserListDialog />
          </div>

          <div className="flex-1 overflow-auto">
            <ConversationsList />
          </div>
        </div>

        <ConversationContent />
      </div>
    </main>
  )
}
