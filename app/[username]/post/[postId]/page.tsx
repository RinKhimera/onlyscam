"use client"

import { PostLayout } from "@/components/post/post-layout"
import { LeftSidebar } from "@/components/shared/left-sidebar"
import { SubscriptionSidebar } from "@/components/shared/subscription-sidebar"
import { api } from "@/convex/_generated/api"
import { Id } from "@/convex/_generated/dataModel"
import { useConvexAuth, useQuery } from "convex/react"
import { Loader } from "lucide-react"
import { notFound } from "next/navigation"

const PostDetailsPage = ({
  params,
}: {
  params: { username: string; postId: Id<"posts"> }
}) => {
  const { isAuthenticated } = useConvexAuth()

  const currentUser = useQuery(
    api.users.getCurrentUser,
    isAuthenticated ? undefined : "skip",
  )

  const post = useQuery(api.posts.getPost, {
    postId: params.postId,
    username: params.username,
  })

  // const postAuthor = useQuery(api.users.getUserProfile, {
  //   username: params.username,
  // })

  return (
    <div className="relative flex h-full w-full items-center justify-center">
      <div className="relative flex h-full w-full max-w-screen-xl">
        <LeftSidebar />
        <PostLayout
          currentUser={currentUser}
          post={post}
          // postAuthor={postAuthor}
        />
        <SubscriptionSidebar
          params={params}
          currentUser={currentUser}
          userProfile={post?.author}
        />
      </div>
    </div>
  )
}

export default PostDetailsPage
