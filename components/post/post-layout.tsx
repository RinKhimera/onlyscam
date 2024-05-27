"use client"

import { CommentButton } from "@/components/home/comment-button"
import { LikeButton } from "@/components/home/like-button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { api } from "@/convex/_generated/api"
import { Id } from "@/convex/_generated/dataModel"
import { cn } from "@/lib/utils"
import { useConvexAuth, useQuery } from "convex/react"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import {
  Bookmark,
  Ellipsis,
  Loader,
  Link as LucideLink,
  MapPin,
} from "lucide-react"
import { CldImage } from "next-cloudinary"
import Link from "next/link"
import { notFound, useParams } from "next/navigation"
import React from "react"
import { CommentFeed } from "./comment-feed"
import { CreateComment } from "./create-comment"

export const PostLayout = () => {
  const params = useParams<{ username: string; postId: Id<"posts"> }>()

  const { isAuthenticated } = useConvexAuth()

  const post = useQuery(api.posts.getPost, {
    postId: params.postId,
  })

  const postAuthor = useQuery(api.users.getUserProfile, {
    username: params.username,
  })

  const currentUser = useQuery(
    api.users.getCurrentUser,
    isAuthenticated ? undefined : "skip",
  )

  if (
    post === undefined ||
    postAuthor === undefined ||
    currentUser === undefined
  )
    return (
      <main className="flex h-full min-h-screen w-[50%] flex-col border-l border-r border-muted max-lg:w-[80%]">
        <h1 className="sticky top-0 z-20 border-b border-muted p-4 text-2xl font-bold backdrop-blur">
          Publication
        </h1>

        <div className="flex flex-1 flex-col items-center justify-center">
          <Loader className="animate-spin text-primary" size={60} />
        </div>
      </main>
    )

  if (post === null || postAuthor === null) notFound()

  return (
    <main className="flex h-full min-h-screen w-[50%] flex-col border-l border-r border-muted max-lg:w-[80%]">
      <h1 className="sticky top-0 z-20 border-b border-muted p-4 text-2xl font-bold backdrop-blur">
        Publication
      </h1>

      <div className="flex space-x-4 border-b px-4 pb-2 pt-4">
        <div className="flex w-full flex-col">
          <div className="flex items-center justify-between">
            <Link href={`/${post.author?.username}`}>
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage
                    src={post.author?.image}
                    alt={post.author?.name}
                  />
                  <AvatarFallback className="size-11">
                    <div className="animate-pulse rounded-full bg-gray-500"></div>
                  </AvatarFallback>
                </Avatar>

                <div className="text-left max-sm:text-sm">
                  <div className="font-bold">{post.author?.name}</div>
                  <div className="text-muted-foreground">
                    @{post.author?.username}
                  </div>
                </div>
              </div>
            </Link>

            <div className="flex items-center gap-3 text-muted-foreground">
              <>
                {format(new Date(post._creationTime), "d MMMM", {
                  locale: fr,
                })}
              </>

              <Ellipsis />
            </div>
          </div>

          <div className="mt-1 flex flex-col sm:ml-[52px]">
            <div className="w-full text-base">
              {post.content
                .split("\n")
                .filter((line) => line.trim() !== "")
                .map((line, index) => (
                  <React.Fragment key={index}>
                    {line}
                    <br />
                  </React.Fragment>
                ))}
            </div>

            <>
              {post.medias.map((media) => {
                return (
                  <CldImage
                    key={media}
                    src={media}
                    alt={""}
                    width={500}
                    height={500}
                    // fill
                    // crop={"thumb"}
                    // gravity="center"
                    sizes="(max-width: 768px) 100vw,
                           (max-width: 1200px) 50vw,
                           33vw"
                    loading="lazy"
                    placeholder="data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs="
                    // blurDataURL={base64}
                    className="mt-2 max-h-[550px] rounded-md object-cover"
                  />
                )
              })}
            </>

            <div className="-ml-[5px] mt-2 flex w-full items-center justify-between">
              <div className="flex w-full items-center space-x-2">
                <LikeButton
                  postId={post._id}
                  postLikes={post.likes}
                  currentUserId={currentUser._id}
                />
                <CommentButton postId={post._id} />
              </div>

              <button className="rounded-full p-2 transition hover:bg-blue-600/15 hover:text-blue-500">
                <Bookmark size={20} />
              </button>
            </div>

            {post.likes.length > 0 && (
              <div className="mb-1.5 text-sm font-semibold tracking-tight">
                {post.likes.length} j&apos;aime
              </div>
            )}
          </div>
        </div>
      </div>

      <CreateComment currentUser={currentUser} postId={post._id} />
      <CommentFeed postId={post._id} />
    </main>
  )
}
