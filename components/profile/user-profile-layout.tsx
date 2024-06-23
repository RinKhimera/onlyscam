"use client"

import { SubscribeDialog } from "@/components/profile/subscribe-dialog"
import { UnsubscribeDialog } from "@/components/profile/unsubscribe-dialog"
import { UpdateProfileDialog } from "@/components/profile/update-profile"
import { UserPosts } from "@/components/profile/user-posts"
import { AspectRatio } from "@/components/ui/aspect-ratio"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { Skeleton } from "@/components/ui/skeleton"
import { api } from "@/convex/_generated/api"
import { useConvexAuth, useQuery } from "convex/react"
import { Link as LucideLink, MapPin } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"

export const UserProfileLayout = ({
  params,
}: {
  params: { username: string }
}) => {
  const { isAuthenticated } = useConvexAuth()

  const userProfile = useQuery(api.users.getUserProfile, {
    username: params.username,
  })

  const currentUser = useQuery(
    api.users.getCurrentUser,
    isAuthenticated ? undefined : "skip",
  )

  if (userProfile === undefined || currentUser === undefined) {
    return <ProfileLayoutSkeleton />
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
        <div className="absolute -bottom-[65px] left-5 max-sm:-bottom-[38px]">
          <Dialog>
            <DialogTrigger asChild>
              <Avatar className="size-36 cursor-pointer border-4 border-accent object-none object-center max-sm:size-24">
                <AvatarImage
                  src={userProfile?.image}
                  className="object-cover"
                />
                <AvatarFallback className="size-11">
                  <div className="animate-pulse rounded-full bg-gray-500"></div>
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

      <>
        {currentUser?.username === params.username ? (
          <div className="mr-5 mt-4 flex justify-end">
            <UpdateProfileDialog currentUser={currentUser} />
          </div>
        ) : (
          <div className="mt-[68px]"></div>
        )}
      </>

      <div className="border-b border-muted px-4 py-4">
        <div className="text-2xl font-bold">{userProfile?.name}</div>
        <div className="text-muted-foreground">@{userProfile?.username}</div>

        <div className="mt-3">{userProfile?.bio}</div>
        <div className="-ml-0.5 flex items-center gap-1 text-muted-foreground">
          <MapPin size={18} />
          {userProfile?.location}
        </div>

        <>
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
        </>
      </div>

      <>
        {currentUser?.username !== params.username && (
          <div className="border-b border-muted px-4 py-4">
            <div className="text-2xl font-semibold leading-none tracking-tight">
              Abonnement
            </div>
            <div className="mb-1">
              {userProfile.followers?.includes(currentUser._id) ? (
                <UnsubscribeDialog userProfile={userProfile} />
              ) : (
                <SubscribeDialog userProfile={userProfile} />
              )}
            </div>
          </div>
        )}
      </>

      <UserPosts username={params.username} currentUser={currentUser} />
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
            <Skeleton className="size-full rounded-none" />
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
