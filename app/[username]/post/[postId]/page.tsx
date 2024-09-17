import { getAuthToken } from "@/app/auth"
import { PostLayout } from "@/components/post/post-layout"
import { LeftSidebar } from "@/components/shared/left-sidebar"
import { SubscriptionSidebar } from "@/components/shared/subscription-sidebar"
import { SuggestionSidebar } from "@/components/shared/suggestion-sidebar"
import { api } from "@/convex/_generated/api"
import { Id } from "@/convex/_generated/dataModel"
import { fetchQuery } from "convex/nextjs"
import { notFound, redirect } from "next/navigation"

const PostDetailsPage = async ({
  params,
}: {
  params: { username: string; postId: Id<"posts"> }
}) => {
  const token = await getAuthToken()
  const currentUser = await fetchQuery(api.users.getCurrentUser, undefined, {
    token,
  })

  if (!currentUser?.username) redirect("/onboarding")

  const userProfile = await fetchQuery(api.users.getUserProfile, {
    username: params.username,
  })

  if (userProfile === null) notFound()

  const post = await fetchQuery(api.posts.getPost, {
    postId: params.postId,
    username: params.username,
  })

  const subscriptionStatus = await fetchQuery(
    api.subscriptions.getFollowSubscription,
    {
      creatorId: userProfile._id,
      subscriberId: currentUser._id,
    },
  )

  // const postAuthor = useQuery(api.users.getUserProfile, {
  //   username: params.username,
  // })

  return (
    <div className="relative flex h-full w-full items-center justify-center">
      <div className="relative flex h-full w-full max-w-screen-xl">
        <LeftSidebar currentUser={currentUser} />
        <PostLayout
          currentUser={currentUser}
          post={post}
          // postAuthor={postAuthor}
        />

        <>
          {currentUser.username !== userProfile.username ? (
            <SubscriptionSidebar
              userProfile={userProfile}
              subStatus={subscriptionStatus}
            />
          ) : (
            <SuggestionSidebar authToken={token} />
          )}
        </>
      </div>
    </div>
  )
}

export default PostDetailsPage
