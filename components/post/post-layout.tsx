"use client"

import { PostCard } from "@/components/shared/post-card"
import { api } from "@/convex/_generated/api"
import { Id } from "@/convex/_generated/dataModel"
import { useConvexAuth, useQuery } from "convex/react"
import { Loader } from "lucide-react"
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

      <PostCard post={post} currentUser={currentUser} />

      <CreateComment currentUser={currentUser} postId={post._id} />
      <CommentFeed postId={post._id} />
    </main>
  )
}
