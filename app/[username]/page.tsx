"use client"

import { UserProfileLayout } from "@/components/profile/user-profile-layout"
import { LeftSidebar } from "@/components/shared/left-sidebar"
import { SubscriptionSidebar } from "@/components/shared/subscription-sidebar"
import { api } from "@/convex/_generated/api"
import { useConvexAuth, useQuery } from "convex/react"

const UserProfilePage = ({ params }: { params: { username: string } }) => {
  const { isAuthenticated } = useConvexAuth()

  const currentUser = useQuery(
    api.users.getCurrentUser,
    isAuthenticated ? undefined : "skip",
  )

  const userProfile = useQuery(api.users.getUserProfile, {
    username: params.username,
  })

  return (
    <div className="relative flex h-full w-full items-center justify-center">
      <div className="relative flex h-full w-full max-w-screen-xl">
        <LeftSidebar currentUser={currentUser} />
        <UserProfileLayout
          params={params}
          currentUser={currentUser}
          userProfile={userProfile}
        />
        <SubscriptionSidebar
          params={params}
          currentUser={currentUser}
          userProfile={userProfile}
        />
      </div>
    </div>
  )
}

export default UserProfilePage
