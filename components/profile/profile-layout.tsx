"use client"

import { AspectRatio } from "@/components/ui/aspect-ratio"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { api } from "@/convex/_generated/api"
import { createInitials } from "@/lib/create-initials"
import { useConvexAuth, useQuery } from "convex/react"
import { MapPin } from "lucide-react"
import Image from "next/image"

export const ProfileLayout = () => {
  const { isAuthenticated } = useConvexAuth()

  const currentUser = useQuery(
    api.users.getCurrentUser,
    isAuthenticated ? undefined : "skip",
  )

  // console.log(createInitials(currentUser?.name))

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
          <Avatar className="size-36 border-4 border-accent">
            <AvatarImage src={currentUser?.image} />
            <AvatarFallback>{createInitials(currentUser?.name)}</AvatarFallback>
          </Avatar>
        </div>
      </div>

      <div className="mr-5 mt-4 flex justify-end">
        <Button variant={"outline"} className="rounded-3xl border-2">
          Modifier le profil
        </Button>
      </div>

      <div className="mt-4 px-4">
        <div className="text-2xl font-bold">{currentUser?.name}</div>
        <div className="text-muted-foreground">@{currentUser?.username}</div>

        <div className="mt-3">{currentUser?.bio}</div>
        <div className="-ml-0.5 flex items-center gap-1 text-muted-foreground">
          <MapPin size={18} />
          Littoral, Cameroon
        </div>
      </div>
    </main>
  )
}
