import { PostCard } from "@/components/shared/post-card"
import { api } from "@/convex/_generated/api"
import { Doc } from "@/convex/_generated/dataModel"
import { useQuery } from "convex/react"

export const UserPosts = ({
  username,
  currentUser,
}: {
  username: string
  currentUser: Doc<"users">
}) => {
  const userPosts = useQuery(api.posts.getUserPosts, { username })

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
