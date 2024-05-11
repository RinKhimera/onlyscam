"use client"

import { AspectRatio } from "@/components/ui/aspect-ratio"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Skeleton } from "@/components/ui/skeleton"
import { api } from "@/convex/_generated/api"
import { createInitials } from "@/lib/create-initials"
import { useConvexAuth, useQuery } from "convex/react"
import { Link as LucideLink, MapPin } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { UpdateProfileDialog } from "./update-profile"

export const ProfileLayout = () => {
  const { isAuthenticated } = useConvexAuth()

  const currentUser = useQuery(
    api.users.getCurrentUser,
    isAuthenticated ? undefined : "skip",
  )

  if (!currentUser) {
    return <ProfileLayoutSkeleton />
  }

  return (
    <main className="flex h-full min-h-screen w-[50%] flex-col border-l border-r border-muted max-lg:w-[80%]">
      <h1 className="sticky top-0 z-20 border-b border-muted p-4 text-2xl font-bold backdrop-blur">
        {currentUser?.name}
      </h1>

      <div className="relative">
        <div>
          <AspectRatio ratio={3 / 1} className="bg-muted">
            <Image
              src="https://images.unsplash.com/photo-1588345921523-c2dcdb7f1dcd?w=800&dpr=2&q=80"
              alt="Photo by Drew Beamer"
              fill
              className="object-cover"
            />
          </AspectRatio>
        </div>
        <div className="absolute -bottom-[65px] left-5">
          <Dialog>
            <DialogTrigger asChild>
              <Avatar className="size-36 cursor-pointer border-4 border-accent object-none object-center">
                <AvatarImage
                  src={currentUser?.image}
                  className="object-cover"
                />
                <AvatarFallback>
                  {createInitials(currentUser?.name)}
                </AvatarFallback>
              </Avatar>
            </DialogTrigger>
            <DialogContent className="h-full max-w-[1000px] overflow-auto border-none bg-transparent sm:rounded-none">
              <Image
                src={currentUser?.image}
                alt={currentUser?.name}
                fill
                placeholder="blur"
                blurDataURL={currentUser?.image}
                className="mx-auto h-full w-auto object-contain"
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="mr-5 mt-4 flex justify-end">
        <UpdateProfileDialog currentUser={currentUser} />
      </div>

      <div className="mt-4 px-4">
        <div className="text-2xl font-bold">{currentUser?.name}</div>
        <div className="text-muted-foreground">@{currentUser?.username}</div>

        <div className="mt-3">{currentUser?.bio}</div>
        <div className="-ml-0.5 flex items-center gap-1 text-muted-foreground">
          <MapPin size={18} />
          {currentUser?.location}
        </div>

        {currentUser?.socials?.map((url) => (
          <div
            key={url}
            className="-ml-0.5 flex items-center gap-1 text-muted-foreground"
          >
            <LucideLink size={18} />

            <Link
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-blue-500 hover:underline"
            >
              {url}
            </Link>
          </div>
        ))}
      </div>
    </main>
  )
}

const ProfileLayoutSkeleton = () => {
  return (
    <main className="flex h-full min-h-screen w-[50%] flex-col border-l border-r border-muted max-lg:w-[80%]">
      <h1 className="sticky top-0 z-20 border-b border-muted p-4 text-2xl font-bold backdrop-blur">
        <Skeleton className="h-8 w-[300px]" />
      </h1>

      <div className="relative">
        <div>
          <AspectRatio ratio={3 / 1}>
            <Skeleton className="size-full" />
          </AspectRatio>
        </div>
        <div className="absolute -bottom-[65px] left-5">
          <Skeleton className="size-36 rounded-full" />
        </div>
      </div>

      <div className="mr-5 mt-5 flex justify-end">
        <Skeleton className="h-8 w-[180px]" />
      </div>

      <div className="mt-6 space-y-6 px-4">
        <div className="space-y-2">
          <Skeleton className="h-6 w-[280px]" />
          <Skeleton className="h-4 w-[150px]" />
        </div>

        <div className="space-y-2">
          <Skeleton className="h-4 w-[300px]" />
          <Skeleton className="h-4 w-[200px]" />
        </div>
      </div>
    </main>
  )
}
