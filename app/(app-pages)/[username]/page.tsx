"use client"

import { useQuery } from "convex/react"
import { notFound } from "next/navigation"
import { use } from "react"
import { UserProfileLayout } from "@/components/profile/user-profile-layout"
import { SubscriptionSidebar } from "@/components/shared/subscription-sidebar"
import { SuggestionSidebar } from "@/components/shared/suggestion-sidebar"
import { api } from "@/convex/_generated/api"
import { useCurrentUser } from "@/hooks/useCurrentUser"

const UserProfilePage = ({
  params,
}: {
  params: Promise<{ username: string }>
}) => {
  const { username } = use(params)
  const { currentUser } = useCurrentUser()

  const userProfile = useQuery(api.users.getUserProfile, {
    username: username,
  })

  if (userProfile === undefined) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
          <p className="text-muted-foreground">Chargement du profil...</p>
        </div>
      </div>
    )
  }

  if (userProfile === null) {
    notFound()
  }

  const canSubscribe =
    userProfile.accountType === "CREATOR" ||
    userProfile.accountType === "SUPERUSER"

  return (
    <>
      <UserProfileLayout currentUser={currentUser!} userProfile={userProfile} />

      <>
        {currentUser?.username !== userProfile.username && canSubscribe ? (
          <SubscriptionSidebar
            userProfile={userProfile}
            currentUserId={currentUser?._id}
          />
        ) : (
          <SuggestionSidebar />
        )}
      </>
    </>
  )
}

export default UserProfilePage
