"use client"

import { PostCard } from "@/components/shared/post-card"
import { api } from "@/convex/_generated/api"
import { Doc } from "@/convex/_generated/dataModel"
import { useQuery } from "convex/react"

export const NewsFeed = ({ currentUser }: { currentUser: Doc<"users"> }) => {
  const getPosts = useQuery(api.posts.getAllPosts)

  return (
    <div className="flex flex-col">
      {getPosts?.map((post) => (
        <PostCard post={post} currentUser={currentUser} key={post._id} />
      ))}
    </div>
  )
}
