import { PostCard } from "@/components/shared/post-card"
import { api } from "@/convex/_generated/api"
import { Doc } from "@/convex/_generated/dataModel"
import { fetchQuery } from "convex/nextjs"

export const NewsFeed = async ({
  currentUser,
}: {
  currentUser: Doc<"users">
}) => {
  const getPosts = await fetchQuery(api.posts.getAllPosts)

  return (
    <div className="flex flex-col">
      {getPosts?.map((post) => (
        <PostCard post={post} currentUser={currentUser} key={post._id} />
      ))}
    </div>
  )
}
