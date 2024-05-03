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

export type UserProps =
  | {
      _id: Id<"users">
      _creationTime: number
      name?: string
      email: string
      image: string
      tokenIdentifier: string
      isOnline: boolean
    }
  | undefined

export type MessageProps = {
  _id: string
  content: string
  _creationTime: number
  messageType: "text" | "image" | "video"
  sender: {
    _id: Id<"users">
    image: string
    name?: string
    tokenIdentifier: string
    email: string
    _creationTime: number
    isOnline: boolean
  }
}
