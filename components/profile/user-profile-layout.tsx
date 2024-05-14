"use client"

import { AspectRatio } from "@/components/ui/aspect-ratio"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { api } from "@/convex/_generated/api"
import { createInitials } from "@/lib/create-initials"
import { useQuery } from "convex/react"
import { Link as LucideLink, MapPin } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { notFound, useRouter } from "next/navigation"

export const UserProfileLayout = ({
  params,
}: {
  params: { username: string }
}) => {
  const router = useRouter()

  const userProfile = useQuery(api.users.getUserProfile, {
    username: params.username,
  })

  console.log(userProfile)

  if (userProfile === undefined) {
    return (
      <main className="flex h-full min-h-screen w-[50%] flex-col border-l border-r border-muted max-lg:w-[80%]">
        <div className="mt-8 flex items-center justify-center border-t border-muted">
          <div className="mt-16 h-full text-center text-xl text-muted-foreground">
            Loading...
          </div>
        </div>
      </main>
    )
  }

  if (userProfile === null) notFound()

  return (
    <main className="flex h-full min-h-screen w-[50%] flex-col border-l border-r border-muted max-lg:w-[80%]">
      <h1 className="sticky top-0 z-20 border-b border-muted p-4 text-2xl font-bold backdrop-blur">
        {userProfile?.name}
      </h1>

      <div className="relative">
        <div>
          <AspectRatio ratio={3 / 1} className="bg-muted">
            <Image
              className="object-cover"
              src={
                (userProfile?.imageBanner as string) ||
                "https://images.unsplash.com/photo-1588345921523-c2dcdb7f1dcd?w=800&dpr=2&q=80"
              }
              alt={userProfile?.name as string}
              fill
            />
          </AspectRatio>
        </div>
        <div className="absolute -bottom-[65px] left-5">
          <Dialog>
            <DialogTrigger asChild>
              <Avatar className="size-36 cursor-pointer border-4 border-accent object-none object-center">
                <AvatarImage
                  src={userProfile?.image}
                  className="object-cover"
                />
                <AvatarFallback>
                  {createInitials(userProfile?.name)}
                </AvatarFallback>
              </Avatar>
            </DialogTrigger>
            <DialogContent className="h-full max-w-[1000px] overflow-auto border-none bg-transparent sm:rounded-none">
              <Image
                src={userProfile?.image}
                alt={userProfile?.name}
                fill
                placeholder="blur"
                blurDataURL={userProfile?.image}
                className="mx-auto h-full w-auto object-contain"
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="mt-[72px] px-4">
        <div className="text-2xl font-bold">{userProfile?.name}</div>
        <div className="text-muted-foreground">@{userProfile?.username}</div>

        <div className="mt-3">{userProfile?.bio}</div>
        <div className="-ml-0.5 flex items-center gap-1 text-muted-foreground">
          <MapPin size={18} />
          {userProfile?.location}
        </div>

        {userProfile?.socials?.map((url) => (
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

      <div className="mt-8 flex items-center justify-center border-t border-muted">
        <div className="mt-16 h-full text-center text-xl text-muted-foreground">
          Pas de posts pour le moment
        </div>
      </div>
    </main>
  )
}
// <div>My Page: {params.username} </div>
