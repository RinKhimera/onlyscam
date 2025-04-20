import { getAuthToken } from "@/app/auth"
import { EditProfileLayout } from "@/components/profile/edit-profile-layout"
import { LeftSidebar } from "@/components/shared/left-sidebar"
import { SubscriptionSidebar } from "@/components/shared/subscription-sidebar"
import { SuggestionSidebar } from "@/components/shared/suggestion-sidebar"
import { api } from "@/convex/_generated/api"
import { fetchQuery } from "convex/nextjs"
import { notFound, redirect } from "next/navigation"

const EditProfile = async ({ params }: { params: { username: string } }) => {
  const token = await getAuthToken()
  const currentUser = await fetchQuery(api.users.getCurrentUser, undefined, {
    token,
  })

  if (!currentUser?.username) redirect("/onboarding")

  const userProfile = await fetchQuery(api.users.getUserProfile, {
    username: params.username,
  })

  if (userProfile === null) notFound()

  const subscriptionStatus = await fetchQuery(
    api.subscriptions.getFollowSubscription,
    {
      creatorId: userProfile._id,
      subscriberId: currentUser._id,
    },
  )

  return (
    <div className="relative flex h-full w-full items-center justify-center">
      <div className="relative flex h-full w-full max-w-screen-xl">
        <LeftSidebar currentUser={currentUser} />
        <EditProfileLayout
          currentUser={currentUser}
          userProfile={userProfile}
          subStatus={subscriptionStatus}
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

export default EditProfile
