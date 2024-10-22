"use client"

import { PostCard } from "@/components/shared/post-card"
import { api } from "@/convex/_generated/api"
import { Doc, Id } from "@/convex/_generated/dataModel"
import { useQuery } from "convex/react"

export const UserPosts = ({
  authorId,
  currentUser,
}: {
  authorId: Id<"users">
  currentUser: Doc<"users">
}) => {
  const userPosts = useQuery(api.posts.getUserPosts, { authorId })

  return (
    <>
      {userPosts?.length === 0 ? (
        <div className="mt-16 h-full px-4 text-center text-xl text-muted-foreground">
          Pas de posts pour le moment
        </div>
      ) : (
        <div className="flex flex-col">
          {userPosts?.map((post) => (
            <PostCard post={post} currentUser={currentUser} key={post._id} />
          ))}
        </div>
      )}
    </>
  )
}
