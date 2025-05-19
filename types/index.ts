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
      lastActivityTime: number
      hasUnreadMessages: boolean
      unreadCount: number
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
      username?: string
      email: string
      image?: string
      imageBanner?: string
      bio?: string
      location?: string
      socials?: string[] | []
      following?: string[] | undefined
      followers?: string[] | undefined
      accountType: string
      isOnline: boolean
      tokenIdentifier: string
      externalId?: string
    }
  | undefined

export type MessageProps = {
  _id: string
  content: string
  _creationTime: number
  messageType: "text" | "image" | "video"
  read: boolean
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

export type PaymentStatus = {
  depositId: string
  status: string
  requestedAmount: string
  depositedAmount: string
  currency: string
  country: string
  payer: {
    type: string
    address: {
      value: string
    }
  }
  correspondent: string
  statementDescription: string
  customerTimestamp: string
  created: string
  respondedByPayer: string
  correspondentIds: {
    [key: string]: string
  }
  metadata: {
    // [key: string]: string
    creatorId: Id<"users">
    creatorUsername: string
  }
}

export type CinetPayResponse = {
  code: string
  message: string
  data: {
    amount: string
    currency: string
    status: string
    payment_method: string
    description: string
    metadata: any | null
    operator_id: string | null
    payment_date: string
    fund_availability_date: string
  }
  api_response_id: string
}
