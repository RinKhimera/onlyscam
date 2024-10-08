"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Skeleton } from "@/components/ui/skeleton"
import { Doc } from "@/convex/_generated/dataModel"
import { SignOutButton, SignedIn, UserButton } from "@clerk/nextjs"
import { EllipsisVertical } from "lucide-react"
import { useRouter } from "next/navigation"

export const UserInfoPopover = ({
  currentUser,
}: {
  currentUser: Doc<"users"> | undefined
}) => {
  const router = useRouter()

  if (currentUser === undefined) {
    return <UserInfoSkeleton />
  }

  if (!currentUser?.username) router.push("/onboarding")

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button className="mb-4 flex w-full items-center justify-between rounded-full p-2 transition duration-200 hover:bg-foreground/10 max-lg:w-fit max-lg:justify-center">
          <div className="flex items-center space-x-2">
            <Avatar>
              <AvatarImage
                src={currentUser?.image}
                alt={currentUser?.username}
              />
              <AvatarFallback className="size-11">
                <div className="animate-pulse rounded-full bg-gray-500"></div>
              </AvatarFallback>
            </Avatar>
            <div className="text-left text-sm max-lg:hidden">
              <div className="truncate">{currentUser?.name}</div>
              <div className="text-muted-foreground">
                @{currentUser?.username}
              </div>
            </div>
          </div>
          <div className="max-lg:hidden">
            <EllipsisVertical />
          </div>
        </button>
      </PopoverTrigger>
      <PopoverContent side="top" className="max-w-60">
        <div className="flex flex-col items-center gap-2">
          <SignedIn>
            {/* Mount the UserButton component */}
            <UserButton />
          </SignedIn>

          <SignedIn>
            <SignOutButton>Se déconnecter</SignOutButton>
          </SignedIn>
        </div>
      </PopoverContent>
    </Popover>
  )
}

const UserInfoSkeleton = () => {
  return (
    <button className="mb-4 flex w-full items-center justify-between rounded-full p-2 transition duration-200 hover:bg-foreground/10 max-lg:w-fit max-lg:justify-center">
      <div className="flex items-center space-x-2">
        <Skeleton className="size-11 rounded-full" />
        <div className="space-y-2 max-lg:hidden">
          <Skeleton className="h-4 w-[120px]" />
          <Skeleton className="h-4 w-[120px]" />
        </div>
      </div>
    </button>
  )
}
