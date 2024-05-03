"use client"

import { GroupMembersDialog } from "@/components/messages/group-members-dialog"
import { MessageForm } from "@/components/messages/message-form"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { api } from "@/convex/_generated/api"
import { ConversationProps } from "@/types"
import { useConvexAuth, useQuery } from "convex/react"
import { Video, X } from "lucide-react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { MessagesList } from "./messages-list"

export const ConversationContent = () => {
  const { isAuthenticated } = useConvexAuth()

  const params = useParams()
  const router = useRouter()

  const conversations = useQuery(
    api.conversations.getMyConversations,
    isAuthenticated ? undefined : "skip",
  )

  const currentUser = useQuery(
    api.users.getCurrentUser,
    isAuthenticated ? undefined : "skip",
  )

  const currentConversation: ConversationProps = conversations?.find(
    (conversation) => conversation._id === params.id,
  )

  if (!currentConversation) router.push("/messages")

  return (
    <div className="flex h-full w-3/5 flex-col">
      <div className="sticky top-0 z-10 w-full">
        {/* Header */}
        <div className="flex justify-between bg-muted/50 p-3">
          <div className="flex items-center gap-3">
            <Avatar className="relative overflow-visible border border-gray-900">
              {currentConversation?.isOnline && (
                <div className="absolute right-0 top-0 h-2.5 w-2.5 rounded-full border-2 border-foreground bg-green-500" />
              )}
              <AvatarImage
                src={
                  currentConversation?.groupImage || currentConversation?.image
                }
                className="rounded-full object-cover"
              />
              <AvatarFallback>
                <div className="h-full w-full animate-pulse rounded-full"></div>
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <p>
                {currentConversation?.groupName || currentConversation?.name}
              </p>
              {currentConversation?.isGroup && (
                <GroupMembersDialog conversation={currentConversation} />
              )}
            </div>
          </div>

          <div className="mr-5 flex items-center gap-7">
            <Link href="/video-call" target="_blank">
              <Video size={23} />
            </Link>

            <button onClick={() => router.push("/messages")}>
              <X size={16} className="cursor-pointer" />
            </button>
          </div>
        </div>
      </div>

      <MessagesList
        conversation={currentConversation}
        currentUser={currentUser}
      />
      {/* <div className="flex-1 overflow-auto pb-20">
        Lorem ipsum dolor sit, amet consectetur adipisicing elit. Amet,
        Repellendus dolor hic architecto sint. Laudantium, blanditiis autem
        labore ea sit numquam enim dignissimos nisi rem. Libero sapiente error
        cumque, repellendus ducimus ad maxime consequatur, commodi sed nam
        blanditiis atque! Esse possimus necessitatibus nulla illo ducimus
        asperiores eius omnis maiores quae sit ad ab, repellendus corporis vel
        explicabo aspernatur ut sed amet unde, minima at, mollitia alias quos.
        Quisquam, laborum. Amet vero accusantium voluptatibus fuga excepturi sed
        magnam nisi esse, quam ipsam consequuntur nulla sapiente nesciunt ut
        vitae inventore saepe nam dignissimos? Laborum nisi rem cum dolore
        consequatur explicabo atque? Voluptatum consequuntur id quibusdam beatae
        inventore. Animi, itaque dolorum hic quos consectetur obcaecati ab, nam
        assumenda iusto, porro amet ut. Molestias repellat voluptates ut
        consectetur rem tempora quidem, labore libero? periores eius omnis
        maiores quae sit ad ab, repellendus corporis vel explicabo aspernatur ut
        sed amet unde, minima at, mollitia alias quos. Quisquam, laborum. Amet
        vero accusantium voluptatibus fuga excepturi sed magnam nisi esse, quam
        ipsam consequuntur nulla sapiente nesciunt ut vitae inventore saepe nam
        dignissimos? Laborum nisi rem cum dolore consequatur explicabo atque?
        Voluptatum consequuntur id quibusdam beatae inventore. Animi, itaque
        Lorem ipsum dolor sit, amet consectetur adipisicing elit. Amet,
        Repellendus dolor hic architecto sint. Laudantium, blanditiis autem
        labore ea sit numquam enim dignissimos nisi rem. Libero sapiente error
        cumque, repellendus ducimus ad maxime consequatur, commodi sed nam
        blanditiis atque! Esse possimus necessitatibus nulla illo ducimus
        asperiores eius omnis maiores quae sit ad ab, repellendus corporis vel
        explicabo aspernatur ut sed amet unde, minima at, mollitia alias quos.
        Quisquam, laborum. Amet vero accusantium voluptatibus fuga excepturi sed
        magnam nisi esse, quam ipsam consequuntur nulla sapiente nesciunt ut
        vitae inventore saepe nam dignissimos? Laborum nisi rem cum dolore
        consequatur explicabo atque? Voluptatum consequuntur id quibusdam beatae
        inventore. Animi, itaque dolorum hic quos consectetur obcaecati ab, nam
        assumenda iusto, porro amet ut. Molestias repellat voluptates ut
        consectetur rem tempora quidem, labore libero? periores eius omnis
        maiores quae sit ad ab, repellendus corporis vel explicabo aspernatur ut
        sed amet unde, minima at, mollitia alias quos. Quisquam, laborum. Amet
        vero accusantium voluptatibus fuga excepturi sed magnam nisi esse, quam
        ipsam consequuntur nulla sapiente nesciunt ut vitae inventore saepe nam
        dignissimos? Laborum nisi rem cum dolore consequatur explicabo atque?
        Voluptatum consequuntur id quibusdam beatae inventore. Animi, itaque
        Lorem ipsum dolor sit, amet consectetur adipisicing elit. Amet,
        Repellendus dolor hic architecto sint. Laudantium, blanditiis autem
        labore ea sit numquam enim dignissimos nisi rem. Libero sapiente error
        cumque, repellendus ducimus ad maxime consequatur, commodi sed nam
        blanditiis atque! Esse possimus necessitatibus nulla illo ducimus
        asperiores eius omnis maiores quae sit ad ab, repellendus corporis vel
        explicabo aspernatur ut sed amet unde, minima at, mollitia alias quos.
        Quisquam, laborum. Amet vero accusantium voluptatibus fuga excepturi sed
        magnam nisi esse, quam ipsam consequuntur nulla sapiente nesciunt ut
        vitae inventore saepe nam dignissimos? Laborum nisi rem cum dolore
        consequatur explicabo atque? Voluptatum consequuntur id quibusdam beatae
        inventore. Animi, itaque dolorum hic quos consectetur obcaecati ab, nam
        assumenda iusto, porro amet ut. Molestias repellat voluptates ut
        consectetur rem tempora quidem, labore libero? periores eius omnis
        maiores quae sit ad ab, repellendus corporis vel explicabo aspernatur ut
        sed amet unde, minima at, mollitia alias quos. Quisquam, laborum. Amet
        vero accusantium voluptatibus fuga excepturi sed magnam nisi esse, quam
        ipsam consequuntur nulla sapiente nesciunt ut vitae inventore saepe nam
        dignissimos? Laborum nisi rem cum dolore consequatur explicabo atque?
        Voluptatum consequuntur id quibusdam beatae inventore. Animi, itaque
      </div> */}

      <MessageForm currentUser={currentUser} />
    </div>
  )
}
