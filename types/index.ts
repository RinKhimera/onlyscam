import { Id } from "@/convex/_generated/dataModel"

export type ConversationProps =
  | {
      _id: Id<"conversations">
      image?: string
      participants: Id<"users">[]
      isGroup: boolean
      name?: string
      groupImage?: string
      groupName?: string
      admin?: Id<"users">
      isOnline?: boolean
      _creationTime: number
      lastMessage?: {
        _id: Id<"messages">
        conversation: Id<"conversations">
        content: string
        sender: Id<"users">
        messageType: "text" | "image" | "video"
        _creationTime: number
      }
    }
  | undefined
