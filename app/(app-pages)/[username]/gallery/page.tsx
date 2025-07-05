import { fetchQuery } from "convex/nextjs"
import { notFound, redirect } from "next/navigation"
import { getAuthToken } from "@/app/auth"
import { UserGalleryLayout } from "@/components/profile/user-gallery-layout"
import { SubscriptionSidebar } from "@/components/shared/subscription-sidebar"
import { SuggestionSidebar } from "@/components/shared/suggestion-sidebar"
import { api } from "@/convex/_generated/api"

const UserGalleryPage = async (props: {
  params: Promise<{ username: string }>
}) => {
  const params = await props.params
  const token = await getAuthToken()
  const currentUser = await fetchQuery(api.users.getCurrentUser, undefined, {
    token,
  })

  if (!currentUser?.username) redirect("/onboarding")

  const userProfile = await fetchQuery(api.users.getUserProfile, {
    username: params.username,
  })

  if (userProfile === null) notFound()

  return (
    <>
      <UserGalleryLayout currentUser={currentUser} userProfile={userProfile} />

      <>
        {currentUser.username !== userProfile.username ? (
          <SubscriptionSidebar
            userProfile={userProfile}
            currentUserId={currentUser._id}
          />
        ) : (
          <SuggestionSidebar />
        )}
      </>
    </>
  )
}

export default UserGalleryPage
