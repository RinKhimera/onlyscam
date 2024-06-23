import { PostCard } from "@/components/shared/post-card"
import { api } from "@/convex/_generated/api"
import { Doc } from "@/convex/_generated/dataModel"
import { useQuery } from "convex/react"

export const UserCollections = ({
  currentUser,
}: {
  currentUser: Doc<"users">
}) => {
  const userBookmarks = useQuery(api.posts.getUserBookmark)

  const filteredUserBookmarks = userBookmarks?.filter(
    (bookmark) => bookmark !== null,
  )

  return (
    <>
      {filteredUserBookmarks?.length === 0 ? (
        <div className="mt-16 h-full px-4 text-center text-xl text-muted-foreground">
          Aucune collection trouvée. Ajoutez des collections en cliquant sur le
          bouton de signet pour les retrouver ici.
        </div>
      ) : (
        <div className="flex flex-col">
          {filteredUserBookmarks?.map(
            (post) =>
              post && (
                <PostCard
                  post={post}
                  currentUser={currentUser}
                  key={post._id}
                />
              ),
          )}
        </div>
      )}
    </>
  )
}
